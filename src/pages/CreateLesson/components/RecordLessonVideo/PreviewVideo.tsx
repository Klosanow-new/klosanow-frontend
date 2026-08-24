import React from "react";
import { Box, Flex, Text, useToast } from "@chakra-ui/react";
import { CreateLessonFormContext } from "../../context/CreateLessonFormContext";
import { DeleteIcon, SaveIcon } from "../../assets/svgs";
import { CreateLessonFormValues, LessonTemplateType } from "src/types";
import { useNavigate } from "react-router-dom";
import { allLessonsPagePath } from "src/data/pageUrl";
import { postLessons } from "src/api-endpoints/lessons";
import { postUser } from "src/api-endpoints/user/user.api";
import { deletedFile, FileUploadResponseStatus } from "src/utils/file-upload";
import OverlayLoader from "src/components/OverlayLoader";
import { VideoPlayer } from "src/components";
import { clearFileUrl } from "src/utils/constant";
import { formatDuration } from "src/utils/video";
import { encodeContent } from "../../slides/slideCodec";

const PreviewVideo = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const initialState = {
    duration: "",
    loading: false,
    message: "",
  };
  const [state, setState] = React.useState(initialState);

  const handleStateUpdate = (newState: Partial<typeof initialState>) =>
    setState((state) => ({ ...state, ...newState }));

  const {
    canUpdate,
    draft_id,
    videoUrl,
    videoSize,
    form_info,
    content,
    template,
    slideStyle,
    updateCreateLessonFormValues,
  } = React.useContext(CreateLessonFormContext);

  const handleSubmit = async () => {
    handleStateUpdate({ loading: true, message: "Submiting" });

    try {
      // Scroll keeps its content shape byte-identical to before; only the slide
      // template carries the design-system meta entry.
      const encodedContent =
        template === LessonTemplateType.Slide
          ? encodeContent(slideStyle, content)
          : content.map((item) =>
              typeof item === "string" ? item : JSON.stringify(item)
            );

      const formData: CreateLessonFormValues = {
        title: form_info.title,
        about: form_info.description,
        thumbnailUrl: form_info.thumbnailUrl,
        thumbnailSize: form_info.thumbnailSize,
        tag: "uncategorized",
        videoSize,
        videoUrl,
        content: encodedContent,
      };

      if (canUpdate) {
        const userData = {
          username: form_info.tutor_name,
          bio: form_info.tutor_bio,
        };

        const storedString = localStorage.getItem("USER_KEY");

        if (!storedString) {
          throw new Error("USER_KEY not found in localstorage");
        }
        let stored;
        try {
          stored = JSON.parse(storedString);
        } catch (e) {
          throw new Error("Failed to parse USER_KEY");
        }

        const userId: string | null = stored?.data?.user?._id;
        console.log("userid", userId);
        const res = await postUser(userData, userId);
        if (!res) throw new Error("Failed to update user details");
        toast({
          title: "User details updated successfully",
          status: "success",
          duration: 2500,
          position: "top-right",
        });
      }

      const postLessonAction = () =>
        draft_id
          ? postLessons({ ...formData, draftId: draft_id })
          : postLessons(formData);

      const res = await postLessonAction();
      if (!res) throw new Error("Failed to save lesson");
      toast({
        title: "User details updated successfully",
        status: "success",
        duration: 2500,
        position: "top-right",
      });
      // Both keys mean "uploaded, not yet owned by a draft or lesson". The saved
      // lesson owns both now, so release both. Leaving thumbnail_url set made the
      // next lesson's orphan sweep delete this lesson's thumbnail out of S3 —
      // the row kept its thumbnailUrl and the dashboard <img> got a 403.
      clearFileUrl("video_url");
      clearFileUrl("thumbnail_url");
      handleStateUpdate(initialState);
      navigate(allLessonsPagePath);
    } catch (error: any) {
      console.error("Full error:", error);
      handleStateUpdate({ loading: false, message: "" });
      toast({
        title: error.message ?? error.response ?? "Something went wrong",
        description: "Try again later",
        status: "error",
        duration: 3000,
        position: "top-right",
      });
    }
  };

  const handleDeleteFile = async () => {
    handleStateUpdate({ loading: true, message: "Deleting recording" });

    try {
      const result = await deletedFile(videoUrl);

      if (!result || result.status !== FileUploadResponseStatus.Success)
        throw new Error("Unable to delete recording");

      handleStateUpdate(initialState);
      if (result.status === FileUploadResponseStatus.Success)
        updateCreateLessonFormValues({
          showPreviewVideo: false,
          videoUrl: "",
          videoSize: 0,
        });
      clearFileUrl("video_url");
    } catch (error: any) {
      handleStateUpdate(initialState);
      toast({
        title: error.message ?? error.response ?? "Something went wrong",
        description: "Try again later",
        status: "error",
        duration: 2500,
        position: "top-right",
      });
    }
  };

  return (
    <Flex flexDir="column" align="center">
      <OverlayLoader loading={state.loading} description={state.message} />

      <Box
        width="full"
        h={{
          base: "max-content",
          md: "600px",
        }}
        position="relative"
      >
        <VideoPlayer
          src={videoUrl}
          onDurationResolved={(seconds) =>
            handleStateUpdate({ duration: formatDuration(seconds) })
          }
        />
      </Box>

      <Flex
        bg="#707070"
        h="70px"
        w="100%"
        maxW="704px"
        mt="30px"
        align="center"
        justify="center"
        gap="32px"
      >
        <Text color="#fff" mr="24px" fontWeight={500}>
          {state?.duration}
        </Text>
        <Flex
          as="button"
          align="center"
          justify="center"
          flexDir="column"
          gap="6px"
          onClick={handleDeleteFile}
        >
          <DeleteIcon />
          <Text fontSize="16px" color="#fff">
            Delete
          </Text>
        </Flex>

        <Flex
          as="button"
          align="center"
          justify="center"
          flexDir="column"
          gap="6px"
          onClick={handleSubmit}
        >
          <SaveIcon />
          <Text fontSize="16px" color="#fff">
            Save
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default PreviewVideo;
