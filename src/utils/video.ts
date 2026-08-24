/**
 * Container and codec knowledge for lesson recordings — both the format we ask
 * the recorder for and the assumptions every playback surface makes about it.
 * Kept in one module so the two cannot drift apart.
 */

/**
 * Candidate recording formats, best first.
 *
 * H.264 in MP4 leads because it is the only combination iPhone Safari can
 * decode, and VP8-in-WebM — what this app recorded for its whole life — is the
 * one format Apple never shipped. Every lesson recorded before this list existed
 * is still VP8 and still unplayable on an iPhone; only a re-encode fixes those.
 *
 * Main profile before Constrained Baseline: Baseline has neither CABAC nor the
 * 8x8 transform, and at 400 kbps over flat-colour slides that difference lands
 * on the readability of text. Nothing is given up by asking for more — iPhones
 * have decoded High 4.1 in hardware since the 5S.
 *
 * Level 31 (3.1), not 1E (3.0): capture is capped at 1280x720, which is past
 * level 3.0's macroblock ceiling.
 *
 * `video/x-matroska;codecs=avc1` is deliberately absent. It is H.264, so it
 * looks like a win, but iOS Safari cannot open .mkv at all — it buys nothing
 * for the one problem this list exists to solve, and `looksLikeWebm` below
 * would flag it as WebM and show the wrong warning.
 */
const RECORDING_MIME_TYPES = [
  'video/mp4;codecs="avc1.4D401F,mp4a.40.2"', // H.264 Main 3.1 + AAC-LC
  'video/mp4;codecs="avc1.42E01F,mp4a.40.2"', // H.264 Constrained Baseline 3.1
  'video/mp4;codecs="avc1,mp4a.40.2"',
  "video/mp4;codecs=avc1",
  "video/mp4", // Safari answers here
  "video/webm;codecs=vp8", // what this app recorded before the probe existed
  "video/webm",
];

/**
 * The best format this browser can actually record, or `undefined` when it
 * cannot be asked — old Safari has MediaRecorder without `isTypeSupported`, and
 * there the browser's own default beats a guess that would throw.
 *
 * Chrome and Edge answer with MP4; Firefox has no MP4 encoder at all and lands
 * on the WebM entries, so lessons recorded there stay iPhone-unplayable.
 */
export const pickRecordingMimeType = (): string | undefined => {
  if (
    typeof MediaRecorder === "undefined" ||
    typeof MediaRecorder.isTypeSupported !== "function"
  ) {
    return undefined;
  }

  return RECORDING_MIME_TYPES.find((type) =>
    MediaRecorder.isTypeSupported(type),
  );
};

/**
 * A url with no video extension is a legacy upload — those were stored without
 * one, so the container can only be assumed. Everything this app recorded back
 * then was WebM/VP8, so assume that unless the name says otherwise.
 */
export const looksLikeWebm = (url: string) =>
  !/\.(mp4|m4v|mov)(\?|#|$)/i.test(url);

export const browserCanPlayWebm = () => {
  const probe = document.createElement("video");
  return Boolean(
    probe.canPlayType('video/webm; codecs="vp8, vorbis"') ||
      probe.canPlayType("video/webm"),
  );
};

/** "9:07" under an hour, "1:09:07" over it. Empty string for an unknown length. */
export const formatDuration = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "";

  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const pad = (value: number) => value.toString().padStart(2, "0");

  return hours
    ? `${hours}:${pad(minutes)}:${pad(secs)}`
    : `${minutes}:${pad(secs)}`;
};

/**
 * WebM out of MediaRecorder has no duration in its header, so the browser
 * reports `Infinity` until the whole file has been read. That leaves the seek bar
 * and the skip buttons inert — which is every lesson recorded before H.264
 * became the preferred format, and every lesson recorded in Firefox after.
 *
 * Seeking far past the end makes the browser walk to the last frame, and that
 * resolves the real duration. Runs at loadedmetadata, before playback, so the
 * jump is invisible.
 *
 * Measured, not assumed: Chrome's MP4 output *does* carry a real duration, so
 * for those recordings the guard below returns immediately and this never runs.
 *
 * Returns a cleanup function for the listener it attaches.
 */
export const resolveInfiniteDuration = (
  video: HTMLVideoElement,
  onResolved: (duration: number) => void,
): (() => void) => {
  if (Number.isFinite(video.duration) && video.duration > 0) {
    onResolved(video.duration);
    return () => undefined;
  }

  const handleSeek = () => {
    video.removeEventListener("timeupdate", handleSeek);
    onResolved(video.duration);
    // Put the playhead back where the viewer expects to find it.
    video.currentTime = 0;
  };

  video.addEventListener("timeupdate", handleSeek);

  try {
    // Any absurd value works — the browser clamps it to the last frame.
    video.currentTime = 1e101;
  } catch (error) {
    video.removeEventListener("timeupdate", handleSeek);
  }

  return () => video.removeEventListener("timeupdate", handleSeek);
};

export const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];
