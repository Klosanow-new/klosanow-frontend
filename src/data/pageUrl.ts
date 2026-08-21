// Study chart
export const studyChatPageSlug = "study-chat";
export const studyChatPagePath = `/${studyChatPageSlug}`;
export const createStudyChatSlug = "create";
export const createStudyChatPath = `${studyChatPagePath}/${createStudyChatSlug}`;
export const contactsPageSlug = "contacts";
export const AIStudychat = "ai";
export const contactsPagePath = `${studyChatPagePath}/${contactsPageSlug}`;
// Dashboard routes
export const dashboardPageSlug = "dashboard";
export const dashboardPagePath = `/${dashboardPageSlug}`;

// Create Lesson routes
export const createLessonPageSlug = "lesson";
export const createLessonPagePath = `/${createLessonPageSlug}`;
export const createLessonFormPageSlug = "create";
export const createLessonFormPagePath = `${createLessonPagePath}/${createLessonFormPageSlug}`;
export const allLessonsPageSlug = "all";
export const allLessonsPagePath = `${createLessonPagePath}/${allLessonsPageSlug}`;
export const draftsPageSlug = "drafts";
export const draftsPagePath = `${createLessonPagePath}/${draftsPageSlug}`;

// Shared-lesson viewer. Sharing used to copy the raw video file url, which left
// the recipient at the mercy of their browser's codec support and the stored
// Content-Type. This route renders the app's own player instead.
export const watchLessonPageSlug = "watch";
export const watchLessonPagePath = `/${watchLessonPageSlug}`;
export const watchLessonPageUrl = (lessonId: string) =>
  `${watchLessonPagePath}/${lessonId}`;
export const shareableLessonUrl = (lessonId: string) =>
  `${window.location.origin}${watchLessonPageUrl(lessonId)}`;

// Dev-only slide design gallery. Top-level and unauthenticated on purpose —
// it is a static fixture page with no data dependencies.
export const slideGalleryPageSlug = "slides";
export const slideGalleryPagePath = `/${slideGalleryPageSlug}`;
