import React from "react";
import "./record.css";
import {
  Box,
  // Button,
  Flex,
  IconButton,
  Modal,
  Tooltip,
  ModalBody,
  ModalContent,
  // ModalFooter,
  ModalOverlay,
  Text,
  useToast,
} from "@chakra-ui/react";
import Joyride, { Step } from "react-joyride";
import { capitalize, uniqueId } from "lodash";
import { useMarkerTool } from "./useMarkerTool";
import { FaPen, FaEraser } from "react-icons/fa";
import { MdClear, MdClose } from "react-icons/md";
import {
  MdArrowBackIosNew,
  MdRefresh,
  MdOutlineArrowForwardIos,
} from "react-icons/md";
import Draggable from "react-draggable";
import { GiResize } from "react-icons/gi";
import { RiDragMove2Line } from "react-icons/ri";
import useMediaRecorder from "src/utils/useMediaRecorder";
import { LessonTemplateType, SlideItem } from "src/types";
import { MoveIcon, PauseIcon, RecordIcon, StopRecordIcon } from "../assets";
import { CreateLessonFormContext } from "../context/CreateLessonFormContext";
import SlideRenderer from "../slides/SlideRenderer";
import { buildTitleSlide } from "../slides/buildTitleSlide";
// import { btnStyles } from "../data";
import { PlayIcon } from "src/assets/svgs";
import {
  FileUploadResponseStatus,
  uploadFile,
  getUploadErrorMessage,
  baseMimeType,
  buildMediaFileName,
} from "src/utils/file-upload";
import OverlayLoader from "src/components/OverlayLoader/OverlayLoader";
import { setFileUrl } from "src/utils/constant";

const steps: Step[] = [
  {
    target: ".marker-btn",
    content: "This enables the marker tool so you can draw on your slides.",
    disableBeacon: true,
  },
  {
    target: ".eraser-btn",
    content: "This toggles the eraser when marker is active.",
  },
  {
    target: ".clear-btn",
    content: "Click here to clear the entire canvas.",
  },
  {
    target: ".move-btn",
    content: "This allows you to move or resize the floating box.",
  },
  {
    target: ".record-btn",
    content: "Start recording your lesson here.",
  },
];

interface RecordVideoModalProps {
  show: boolean;
  handleClose: () => void;
}

const RecordVideoModal: React.FC<RecordVideoModalProps> = ({
  show,
  handleClose,
}) => {
  const toast = useToast();

  const initialState = {
    index: 0,
    useMoveTool: false,
    useMarkerTool: false,
    loading: false,
    loadingMessage: "",
    x: 0,
    y: 0,
    width: 320,
    height: 200,
    isRezisable: false,
  };

  const [state, setState] = React.useState(initialState);
  const [hoverErase, setHoverErase] = React.useState(false);
  const [runTour, setRunTour] = React.useState(false);
  const [failedBlob, setFailedBlob] = React.useState<Blob | null>(null);

  React.useEffect(() => {
    if (show) {
      const hasSeenTour = localStorage.getItem("hassSeenRecordingTour");
      if (!hasSeenTour) {
        setRunTour(true);
        localStorage.setItem("hassSeenRecordingTour", "true");
      }
    }
  }, [show]);
  const handleStateUpdate = (newState: Partial<typeof initialState>) =>
    setState((prev) => ({ ...prev, ...newState }));

  const {
    startRecording,
    stopRecording,
    blob,
    mediaStatus,
    pauseRecording,
    resumeRecording,
  } = useMediaRecorder();

  const { clearCanvas } = useMarkerTool(
    state.useMarkerTool,
    "record-slide-container",
    hoverErase,
  );

  const {
    template,
    content,
    form_info,
    slideStyle,
    updateCreateLessonFormValues,
  } = React.useContext(CreateLessonFormContext);

  const isSlideTemplate = template === LessonTemplateType.Slide;

  // Scroll stays on the original markup — it is one long document, not slides.
  const scrollTitle = `
    <p style='font-size: 32px; font-weight: 500'>${capitalize(
      form_info.title,
    )}</p>
    <p style='font-size: 18px; margin-top: 12px'>
      ${form_info.description}
    </p>
    <div class='slide-img-container'>
      <img
        src=${form_info.thumbnailUrl}
        alt=${form_info.title}
        class='slide-img'
      />
    </div>
  `;

  const slides: SlideItem[] = [buildTitleSlide(form_info), ...content];
  const scrollItems = [scrollTitle, ...content];

  const handleStopRecording = async () => {
    handleStateUpdate({
      loading: true,
      loadingMessage: "Uploading...",
    });

    // Call stopRecording directly
    const recordedBlob = await stopRecording(); // ensure stopRecording returns Blob | null

    if (!recordedBlob) {
      toast({
        description: "Recording failed, please try again",
        status: "error",
        duration: 3000,
        position: "top-right",
      });
      handleStateUpdate({ loading: false });
      return;
    }

    handleVideoUpload(recordedBlob);
  };

  const handleVideoUpload = async (blob: Blob) => {
    handleStateUpdate({
      loading: true,
      loadingMessage: "Submitting Preview...",
    });
    try {
      // The stored object's Content-Type is derived from this name, and the
      // resulting url is what gets shared, so it needs an extension and no
      // spaces. blob.type is "video/webm;codecs=vp8"; the codec parameter is
      // dropped so the served Content-Type stays a plain, well-understood type.
      // An untyped blob would fail validateFile, so fall back to what the
      // recorder is configured to produce.
      const type = baseMimeType(blob.type || "video/webm");
      const file = new File(
        [blob],
        buildMediaFileName("vid", form_info.title, type),
        { type },
      );

      const res = await uploadFile(file, (percent, retryMessage) => {
        handleStateUpdate({ loadingMessage: retryMessage || `Uploading... ${percent}%` });
      });

      if (!res || !res.data || res.status !== FileUploadResponseStatus.Success)
        throw new Error("Something went wrong");

      // Verify the uploaded size matches the original file size
      const uploadedSize = res.data.size;
      const originalSize = file.size;
      const tolerance = 0.95; // allow 5% difference max

      if (uploadedSize < originalSize * tolerance) {
        throw new Error(
          "Upload incomplete — file was cut short. Please retry.",
        );
      }

      setFailedBlob(null);
      handleStateUpdate({ loading: false, loadingMessage: "" });
      updateCreateLessonFormValues({
        showPreviewVideo: true,
        videoUrl: res.data?.url,
        showRecordLessonModal: false,
        videoSize: res.data?.size,
      });
      setFileUrl("video_url", res.data?.url);
    } catch (error: any) {
      handleStateUpdate({ loading: false, loadingMessage: "" });
      setFailedBlob(blob);

      const isConnectionIssue =
        !navigator.onLine ||
        error.code === "ERR_NETWORK" ||
        error.message === "Network Error" ||
        error.code === "ECONNABORTED";

      const isStorageIssue =
        error.response?.status === 403 ||
        error.response?.status === 507 ||
        error.response?.status === 500;

      toast({
        description: isConnectionIssue
          ? "Your upload was interrupted. Check your connection and tap Retry."
          : isStorageIssue
            ? "Server storage issue. Please try again later."
            : getUploadErrorMessage(error),
        title: isConnectionIssue
          ? "Connection Problem"
          : isStorageIssue
            ? " Insufficient storage"
            : "Upload Failed",
        duration: null,
        status: "error",
        position: "top-right",
        isClosable: true,
      });

      // updateCreateLessonFormValues({
      //   showPreviewVideo: false,
      //   showRecordLessonModal: false,
      // });
    }
  };

  React.useEffect(() => {
    if (blob) {
      handleStateUpdate({
        useMoveTool: false,
        loadingMessage: "Uploading Video...",
      });
      handleVideoUpload(blob);
    }
  }, [blob]);

  return (
    <>
      <Joyride
        steps={steps}
        run={runTour}
        continuous
        scrollToFirstStep
        showProgress
        showSkipButton
        styles={{
          options: {
            zIndex: 99999,
          },
        }}
      />

      <Modal isOpen={show} onClose={handleClose} size="full">
        <ModalOverlay />
        <ModalContent>
          <OverlayLoader
            loading={state.loading}
            description={state.loadingMessage || "Setting up preview"}
          />
          <ModalBody>
            <Flex
              flexDir="column"
              h="calc(100vh - 40px)"
              w="full"
              bg="#F8F7FE"
              justify="space-between"
              position="relative"
            >
              {state.useMoveTool && (
                <Draggable handle={state.isRezisable ? ".handle" : ""}>
                  <Box
                    w={{ base: "280px", md: "450px" }}
                    h="70px"
                    border="1px solid #ff0000"
                    borderRadius="4px"
                    position="absolute"
                    top="0"
                    left="0"
                    zIndex="10"
                    cursor="pointer"
                    resize="both"
                    overflow="auto"
                  >
                    <Box
                      onClick={() =>
                        handleStateUpdate({ isRezisable: !state.isRezisable })
                      }
                      cursor="pointer"
                      p="0 30px 30px 0"
                      w="max-content"
                    >
                      {state.isRezisable ? <GiResize /> : <RiDragMove2Line />}
                    </Box>
                  </Box>
                </Draggable>
              )}

              {mediaStatus === "paused" && (
                <>
                  <Box
                    width="100vw"
                    h="100vh"
                    bg="#000"
                    opacity="0.6"
                    position="fixed"
                    zIndex="100"
                    top="0"
                    right="0"
                  />
                  <Box
                    as="button"
                    onClick={resumeRecording}
                    position="absolute"
                    top="50%"
                    right="50%"
                    transform="translateX(-50%)"
                    zIndex="200"
                  >
                    <PlayIcon />
                  </Box>
                </>
              )}

              <Box
                id="record-slide-container"
                h="100%"
                padding={isSlideTemplate ? "0" : "24px"}
                overflow={isSlideTemplate ? "hidden" : "scroll"}
                position="relative"
                className="hide-scroll"
              >
                {isSlideTemplate ? (
                  <SlideRenderer
                    item={slides[state.index]}
                    style={slideStyle}
                  />
                ) : (
                  scrollItems.map((item) => (
                    <div
                      key={uniqueId("slide-item")}
                      className="slide"
                      dangerouslySetInnerHTML={{ __html: item as string }}
                    />
                  ))
                )}
              </Box>

              {slides.length - 1 > 1 ? (
                <Flex
                  w="100%"
                  align="center"
                  justify="center"
                  gap="50px"
                  h="60px"
                >
                  {state.index > 0 ? (
                    <IconButton
                      aria-label="delete"
                      bg="transparent"
                      _hover={{ bg: "transparent" }}
                      onClick={() =>
                        handleStateUpdate({ index: state.index - 1 })
                      }
                      icon={<MdArrowBackIosNew />}
                    />
                  ) : (
                    <Box w="40px" />
                  )}

                  <Text>
                    Slide {state.index + 1}/{slides.length}
                  </Text>

                  {state.index < slides.length - 1 ? (
                    <IconButton
                      aria-label="delete"
                      bg="transparent"
                      _hover={{ bg: "transparent" }}
                      onClick={() =>
                        handleStateUpdate({ index: state.index + 1 })
                      }
                      icon={<MdOutlineArrowForwardIos />}
                    />
                  ) : (
                    <Box w="40px" />
                  )}
                </Flex>
              ) : null}
            </Flex>

            <Box position="absolute" right="16px" top="100px" zIndex="99">
              <Flex flexDir="column" gap="8px">
                {/* Marker tools */}
                <Box>
                  <Tooltip
                    label={
                      state.useMarkerTool ? "Disable Marker" : "Enable Marker"
                    }
                    hasArrow
                  >
                    <IconButton
                      className="marker-btn"
                      aria-label="Toggle Marker Tool"
                      icon={<FaPen />}
                      onClick={() =>
                        handleStateUpdate({
                          useMarkerTool: !state.useMarkerTool,
                        })
                      }
                      size="sm"
                      isRound
                      colorScheme={state.useMarkerTool ? "blue" : "gray"}
                    />
                  </Tooltip>
                </Box>

                {/* Eraser Tool */}
                <Tooltip label="Eraser" hasArrow>
                  <IconButton
                    className="eraser-btn"
                    aria-label="Toggle Eraser"
                    icon={<FaEraser />}
                    onClick={() => setHoverErase((prev) => !prev)}
                    isDisabled={!state.useMarkerTool}
                    size="sm"
                    isRound
                    colorScheme={hoverErase ? "red" : "gray"}
                    title={hoverErase ? "Disable Erase" : "Enable Erase"}
                  />
                </Tooltip>

                <Tooltip label="Clear Canvas" hasArrow>
                  <IconButton
                    className="clear-btn"
                    aria-label="Clear Canvas"
                    icon={<MdClear />}
                    onClick={clearCanvas}
                    size="sm"
                    isRound
                    title="Clear Canvas"
                  />
                </Tooltip>

                {/* Move tool */}
                <Tooltip
                  label={
                    state.useMoveTool ? "Disable Move Tool" : "Enable Move Tool"
                  }
                  hasArrow
                >
                  <IconButton
                    className="move-btn"
                    aria-label="Move Tool"
                    icon={<MoveIcon />}
                    onClick={() =>
                      handleStateUpdate({ useMoveTool: !state.useMoveTool })
                    }
                    size="sm"
                    isRound
                    colorScheme={state.useMoveTool ? "purple" : "gray"}
                  />
                </Tooltip>
                {/* 
              start/stop/pause recording */}
                {mediaStatus !== "recording" && mediaStatus !== "paused" && (
                  <Tooltip label="Start Recording" hasArrow>
                    <IconButton
                      className="record-btn"
                      aria-label="Start Recording"
                      icon={<RecordIcon />}
                      onClick={startRecording}
                      size="sm"
                      isRound
                      colorScheme="red"
                    />
                  </Tooltip>
                )}

                {mediaStatus === "recording" && (
                  <>
                    <Tooltip label="Stop Recording" hasArrow>
                      <IconButton
                        aria-label="Stop Recording"
                        icon={<StopRecordIcon />}
                        onClick={handleStopRecording}
                        size="sm"
                        isRound
                        colorScheme="red"
                        isDisabled={state.loading}
                      />
                    </Tooltip>

                    <Tooltip label="Pause Recording" hasArrow>
                      <IconButton
                        aria-label="Pause Recording"
                        icon={<PauseIcon />}
                        onClick={pauseRecording}
                        size="sm"
                        isRound
                        colorScheme="orange"
                      />
                    </Tooltip>
                  </>
                )}

                {mediaStatus !== "recording" && (
                  <Tooltip label="Cancel" hasArrow>
                    <IconButton
                      aria-label="Cancel"
                      icon={<MdClose />} //
                      onClick={() => {
                        setFailedBlob(null);
                        handleClose();
                      }}
                      size="sm"
                      isRound
                      colorScheme="blue"
                    />
                  </Tooltip>
                )}
                {/* Retry upload button — only shows when upload failed */}
                {failedBlob && !state.loading && (
                  <Tooltip label="Retry Upload" hasArrow>
                    <IconButton
                      aria-label="Retry Upload"
                      icon={<MdRefresh />}
                      onClick={() => {
                        const blobToRetry = failedBlob;
                        setFailedBlob(null);
                        handleVideoUpload(blobToRetry);
                      }}
                      size="sm"
                      isRound
                      colorScheme="green"
                    />
                  </Tooltip>
                )}
              </Flex>
            </Box>
          </ModalBody>
        </ModalContent>

        {mediaStatus === "recording" && (
          <Box position="fixed" top="16px" right="16px" zIndex="9999">
            <Flex align="center" gap={2} color="red.500" fontWeight="bold">
              <Box
                w="10px"
                h="10px"
                bg="red.500"
                borderRadius="full"
                animation="blink 1s infinite"
                sx={{
                  "@keyframes blink": {
                    "0%, 100%": { opacity: 1 },
                    "50%": { opacity: 0.2 },
                  },
                }}
              />
              <Text>REC</Text>
            </Flex>
          </Box>
        )}
      </Modal>
    </>
  );
};

export default RecordVideoModal;
