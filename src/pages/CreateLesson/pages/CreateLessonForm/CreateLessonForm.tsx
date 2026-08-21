import React from "react";
import { useSearchParams } from "react-router-dom";
import {
  CreateLessonFormContext,
  CreateLessonFormDefaultValues,
  DefaultFormValues,
} from "../../context/CreateLessonFormContext";
import { CREATE_LESSON_STEPS } from "../../data";
import { useStoreSelector } from "src/redux/hooks";
import { CreateLessonFormStepsType, LessonTemplateType } from "src/types";
import RecordVideoModal from "../../modals/RecordVideoModal";
import {
  clearDraftId,
  clearFileUrl,
  getDraftId,
  getFileUrl,
} from "src/utils/constant";
import { Box } from "@chakra-ui/react";
import { deletedFile } from "src/utils/file-upload";
import { decodeContent } from "../../slides/slideCodec";

const CreateLessonForm: React.FC = () => {
  const [_, setSearchParams] = useSearchParams();

  const drafts = useStoreSelector((state) => state.lessons["drafts"]);
  const user = useStoreSelector((state) => state.user["data"]);

  const draft_id = getDraftId();

  const draftData = drafts.data.find((item) => item._id === draft_id);

  const decoded = React.useMemo(
    () => decodeContent(draftData?.content),
    [draftData]
  );

  const step = React.useMemo(() => {
    if (draft_id && decoded.items.length !== 0)
      return CreateLessonFormStepsType.Content;
    else if (draft_id) return CreateLessonFormStepsType.FormInfo;
    else return CreateLessonFormStepsType.Template;
  }, [draft_id]);

  const [state, setState] = React.useState<CreateLessonFormDefaultValues>({
    ...DefaultFormValues,
    activeStep: step,
    draft_id: draft_id || "",
    form_info: {
      title: draftData?.title || "",
      description: draftData?.about || "",
      thumbnailUrl: draftData?.thumbnailUrl || "",
      tutor_name: user?.username || "",
      tutor_bio: user?.bio || "",
      thumbnailSize: draftData?.thumbnailSize || 0,
    },
    template: draftData?.template || LessonTemplateType.Scroll,
    content: decoded.items,
    slideStyle: decoded.style,
  });

  const lessonSteps = state.activeStep
    ? CREATE_LESSON_STEPS[state.activeStep]
    : CREATE_LESSON_STEPS.template;

  const handleStateUpdate = (
    newState: Partial<CreateLessonFormDefaultValues>
  ) => setState((state) => ({ ...state, ...newState }));

  const handleDraftId = React.useCallback(() => {
    if (draft_id) {
      handleStateUpdate({ draft_id });
      clearDraftId();
    }
  }, [draft_id]);

  React.useEffect(() => {
    handleDraftId();
  }, [draft_id]);

  React.useEffect(() => {
    setSearchParams({ step: lessonSteps.name });
  }, [state.activeStep]);

  // Orphan sweep: media uploaded during a session that never reached a saved
  // draft or a published lesson. Both keys are cleared the moment a draft or a
  // lesson takes ownership, so whatever is still here on mount is unreferenced.
  //
  // Mount-only, deliberately. Keying this on the localStorage values re-ran it
  // once the current session's own upload landed and deleted the file the form
  // was about to submit. hasFormStarted didn't guard that either: on the
  // draft-resume path the template step that sets it never renders, so it stayed
  // false for the whole session.
  React.useEffect(() => {
    const orphanedThumbnail = getFileUrl("thumbnail_url");
    const orphanedVideo = getFileUrl("video_url");

    if (orphanedThumbnail) {
      deletedFile(orphanedThumbnail);
      clearFileUrl("thumbnail_url");
    }
    if (orphanedVideo) {
      deletedFile(orphanedVideo);
      clearFileUrl("video_url");
    }
  }, []);

  return (
    <CreateLessonFormContext.Provider
      value={{
        ...state,
        updateCreateLessonFormValues: handleStateUpdate,
      }}
    >
      <Box p="10px 30px">
        {lessonSteps.component}
        <RecordVideoModal
          show={state.showRecordLessonModal}
          handleClose={() =>
            handleStateUpdate({ showRecordLessonModal: false })
          }
        />
      </Box>
    </CreateLessonFormContext.Provider>
  );
};

export default CreateLessonForm;
