# Lesson access control — backend spec

Written for the backend team. No frontend code depends on any of this yet; nothing here is
implemented. Two separate asks, in priority order.

---

## 1. Real access control for shared lessons

### Where we are

- `GET /lessons/:id` is **authenticated but not authorised**: any signed-in Klosanow account can read
  any lesson by id. This is load-bearing today — it is why a recipient who is not the owner can watch
  a lesson shared with them — so it cannot simply be tightened without the grant model below.
- The video bytes are not protected at all. `lesson.videoUrl` points at a **public storage url**. It
  needs no token, no session, and no referer. Anyone who has the url has the video, forever.
- Lesson ids are Mongo ObjectIds — not guessable at random, but they are not a secret either. They
  travel in chat messages, and any account that sees one can fetch the lesson and therefore the url.

### What the frontend has just shipped, and what it deliberately is not

Shared lessons now render as a playable card inside study chat instead of a bare link. It hides the
url from the message, blocks the context menu, and disables picture-in-picture.

**None of that is access control, and it should not be counted as any.** The file is still at a
public url that anyone can read out of the browser's network panel in about four seconds. It changes
what a casual student bumps into; it changes nothing about who can obtain the file. The change was
made for the UX (no navigating away from the chat) and for durability (the message stores a lesson
id, so a moved or re-encoded file is fixed once in the lesson record instead of being permanently
dead in every old message).

If the product requires that only chat members can watch a lesson, that requirement is entirely
unmet today and can only be met server-side. That is this document.

### The change

Use the study chat as the permission boundary. A lesson is viewable by its owner, plus anyone who is
a member of a chat the lesson was shared into.

**Grant — `POST /lessons/:id/share`**

```
POST /lessons/:id/share
Authorization: Bearer <token>
{ "studyChatId": "<id>" }
```

- 403 unless the caller owns the lesson. Sharing is the owner's decision, not a recipient's — without
  this, one recipient can widen access to every chat they belong to.
- 404 if the lesson or the chat does not exist; 403 if the caller is not a member of that chat.
- Idempotent: re-sharing the same lesson into the same chat is a no-op returning the existing grant.

Grant record:

| field | notes |
|---|---|
| `lessonId` | ref lesson |
| `studyChatId` | ref study chat |
| `sharedBy` | ref user — who granted it, for audit and for revocation |
| `createdAt` | |

Unique compound index on `(lessonId, studyChatId)`.

**Read — `GET /lessons/:id`**

403 unless **either**:

- `lesson.user === caller`, or
- a grant exists for `lesson` whose `studyChatId` is a chat the caller is currently a member of.

One indexed lookup: grants for the lesson, intersected with the caller's chat memberships.

**Revocation.** Two cases worth deciding explicitly rather than discovering later:

- A member leaves or is removed from a chat → they lose access, because membership is evaluated at
  request time. This falls out of the design for free; do not cache the decision per user.
- The owner un-shares → delete the grant. Worth exposing as `DELETE /lessons/:id/share` with the same
  ownership check, otherwise a mis-share is permanent.

**Migration — this is the part that will bite.** Every lesson already shared into a chat has **no
grant record**, so the moment `GET /lessons/:id` starts returning 403, every historical shared lesson
breaks for every non-owner. Two options:

1. **Backfill.** Scan chat messages for `/watch/<id>` urls, resolve each to a lesson, and write a
   grant for `(lessonId, chatId)`. Accurate, and it preserves exactly the access people already have.
   Preferred.
2. **Grandfather by date.** Skip the check for lessons created before the cutover. Simple, but it
   means the old catalogue stays wide open indefinitely — which is most of the catalogue.

If (1) is chosen, it must run *before* the check is enabled, and the check should ship behind a flag
so it can be turned off if the backfill turns out to have missed a message shape.

### Protecting the video bytes

Locking down `GET /lessons/:id` alone accomplishes very little: it stops someone reading the metadata,
but every url already handed out stays live, and the file remains publicly readable to anyone who ever
saw it. **The bytes have to move behind the same check, or the whole exercise is cosmetic.** Two ways.

**Option A — short-lived signed url (~10 minutes)**

`GET /lessons/:id` runs the authorisation check and returns a `videoUrl` that is a signed,
time-limited url instead of the permanent public one. Storage serves the bytes directly.

- Storage serves the file, not us. No app-server connection is held for the length of a lesson, and
  video egress does not cross the application process.
- HTTP range requests keep working natively, which is what makes the seek bar and the ±10s buttons
  work. This matters: our own recordings already have a duration quirk the player has to work around,
  and losing range support on top of that would make long lessons unseekable.
- The url is bearer-ish for its lifetime. Within the window it can be copied and shared. A 10-minute
  expiry bounds that; it does not eliminate it.
- Revocation is not immediate — an issued url stays valid until it expires.
- Each page load needs a fresh url, so an open tab left for hours needs a re-fetch on play. Cheap,
  but the frontend must handle a 403 on retry.

**Option B — stream through the authenticated endpoint**

The app proxies the bytes: `GET /lessons/:id/video` checks authorisation per request and pipes from
storage.

- The storage url never reaches the page at all. This is the strongest version.
- Revocation is immediate and per-request.
- Every concurrent viewer occupies an app-server connection for the duration of the lesson, and all
  video egress goes through the VPS. Production is a **single Ubuntu VPS behind nginx 1.18 with no CDN
  in front of it** — this is the cost that matters, and it scales with concurrent viewers, which is
  precisely when a class is watching.
- Range requests must be implemented and forwarded by hand (`Range` in, `206` + `Content-Range` out),
  and nginx's default `proxy_buffering` / `proxy_max_temp_file_size` will need explicit configuration
  or seeking breaks and large responses spool to disk. We have already been bitten by nginx proxy
  defaults on this box for the slides service, so treat this as a known hazard rather than a detail.

**Recommendation: Option A, short-lived signed urls.** On this infrastructure it gets the security
result without putting video traffic through the single application server, and it keeps range
requests — and therefore seeking — working for free. Option B is the better answer only if immediate
revocation is a hard requirement, or if the storage hostname must never appear in the page.

**One question blocks this choice, and the backend team owns the answer:** can the storage behind
`POST /media` issue signed urls at all?

- S3, GCS, DO Spaces, R2 → yes, presigned GET, straightforward.
- Files on VPS disk served by nginx → needs the `secure_link` module compiled into nginx 1.18. If it
  is not there, Option A is not available without rebuilding nginx or moving the objects.

If the answer is no, go with Option B and budget the range-request work and the nginx configuration
explicitly. Do not ship Option B without range support — it will look like the player is broken.

### Frontend work once this lands

Small, and listed so it can be scheduled alongside:

- `ChatLessonPreview` and `WatchLesson` already surface 403 distinctly from 404 ("You do not have
  access to this lesson" vs "This lesson has been deleted"), so no new states are needed.
- Sharing must call `POST /lessons/:id/share` with the chat id at the point the link is sent into a
  chat. Right now sharing only copies a url to the clipboard
  (`LessonCard.tsx` → `shareableLessonUrl`), which has no chat context at all — so this needs a real
  share-to-chat action, not a clipboard copy. **This is the one part that is a genuine product
  change, not plumbing.**
- Under Option A, the signed url expires; the player needs to re-fetch the lesson and retry once on a
  media error rather than showing "this recording could not be loaded".

---

## 2. Transcode the back catalogue to H.264

Independent of the above, smaller, and it fixes a bug users hit today.

Recordings were made as **VP8 in WebM** for the whole life of the product. VP8-in-WebM is the one
format Apple never shipped, so on iPhone and iPad Safari those lessons do not play — the student gets
a warning and a download link instead of a video. That has been roughly half the student base.

The recorder now probes `MediaRecorder.isTypeSupported` and prefers **H.264/AAC in MP4**, so lessons
recorded in Chrome or Edge from now on play on iPhone. Two things that does *not* fix:

- **Every lesson already recorded stays VP8 and stays unplayable on iOS.** Nothing client-side can
  change that. It needs the stored objects re-encoded.
- Tutors on Firefox still produce VP8, because Firefox's MediaRecorder has no MP4 encoder. If that
  turns out to be a meaningful share of tutors, server-side transcode-on-upload is the only fix.

**Ask:** a batch job over existing lesson video objects — re-encode WebM/VP8 to MP4
(H.264 High or Main, AAC-LC audio), write the new object alongside, update `lesson.videoUrl`, keep the
original until the new one is verified.

Notes that will save a round trip:

- Encode at roughly the source bitrate. These are 400 kbps 1280×720 screen recordings of slides, and
  the low bitrate is deliberate — students are bandwidth-constrained. Do not "improve" it to 2 Mbps.
- Keep the `.mp4` extension on the new object and serve `Content-Type: video/mp4`. The frontend
  decides whether to show the iOS codec warning from the url's extension, so a `.webm` name on H.264
  bytes would still warn.
- Write the new object under a **new unique key**; do not overwrite in place. Non-unique storage keys
  were a real bug here — a later upload overwrote an earlier object, and deleting one lesson 404'd
  another lesson's file months later.
- Faststart / `moov` at the front, please. It makes the duration and the seek bar work immediately
  instead of after the file is fully read.
