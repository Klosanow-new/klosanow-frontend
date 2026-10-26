import React from "react";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  Text,
  useToast,
} from "@chakra-ui/react";
import { MdUploadFile } from "react-icons/md";
import { Slide } from "src/types";
import { colors } from "src/data/colors";
import {
  ACCEPTED_DOCUMENT_TYPES,
  MAX_DOCUMENT_MB,
  checkSlideServiceConnection,
  generateSlidesFromDocument,
} from "src/api-endpoints/lessons";
import {
  describeSlideGenerationFailure,
  SlideGenerationFailure,
  SlideConnectionResult,
} from "src/api-endpoints/lessons/slideConnection";
import {
  TEACHING_CONTEXT_LIMIT,
  TEACHING_AUDIENCES,
  TEACHING_APPROACHES,
  TeachingAudience,
  TeachingApproach,
  buildLessonFocus,
  buildTeachingGuidance,
  parseGeneratedTeachingSlides,
  revealTeachingContent,
} from "./teaching";

interface DocumentUploadProps {
  onGenerated: (slides: Slide[], warnings: string[]) => void;
  /** Passed to the model as context. */
  subject?: string;
  description?: string;
}

/**
 * Generation measured 80-220s on a short document, because adaptive thinking is
 * on by default server-side. Four messages on a 12s rotation ran dry after 48
 * seconds and then sat on "Almost there..." for minutes, which reads as hung.
 * These are keyed to real elapsed seconds instead, and the clock beside them
 * keeps moving for as long as the request does.
 */
const STAGES: Array<{ from: number; label: string }> = [
  { from: 0, label: "Reading the document" },
  { from: 12, label: "Planning the deck" },
  { from: 35, label: "Writing your slides" },
  { from: 110, label: "Still writing — normal for a longer document" },
  { from: 240, label: "Taking longer than usual, but still going" },
];

const stageLabel = (elapsed: number) =>
  STAGES.reduce((best, s) => (elapsed >= s.from ? s : best), STAGES[0]).label;

const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onGenerated,
  subject,
  description,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const toast = useToast();

  const [file, setFile] = React.useState<File | null>(null);
  const [slideCount, setSlideCount] = React.useState(12);
  const [focusOverride, setFocusOverride] = React.useState<string | null>(null);
  const [audience, setAudience] = React.useState<TeachingAudience>("beginners");
  const [approach, setApproach] = React.useState<TeachingApproach>("explain");
  const [revealPoints, setRevealPoints] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);
  const [uploadPercent, setUploadPercent] = React.useState(0);
  const [failure, setFailure] = React.useState<SlideGenerationFailure | null>(null);
  const [checkingConnection, setCheckingConnection] = React.useState(false);
  const [connectionResult, setConnectionResult] = React.useState<SlideConnectionResult | null>(null);
  const lessonFocus = focusOverride ?? buildLessonFocus(subject, description);
  const teachingGuidance = buildTeachingGuidance(audience, approach);

  React.useEffect(() => {
    if (!loading) return;
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [loading]);

  const handlePick = (picked: File | undefined) => {
    if (!picked) return;

    if (picked.size > MAX_DOCUMENT_MB * 1024 * 1024) {
      toast({
        title: `That file is over ${MAX_DOCUMENT_MB}MB`,
        status: "error",
        duration: 4000,
        position: "top-right",
      });
      return;
    }

    setFile(picked);
    setFailure(null);
    setConnectionResult(null);
  };

  const handleCheckConnection = async () => {
    setCheckingConnection(true);
    setConnectionResult(null);
    try {
      setConnectionResult(await checkSlideServiceConnection());
    } finally {
      setCheckingConnection(false);
    }
  };

  const handleGenerate = async () => {
    if (!file || loading || checkingConnection) return;
    setLoading(true);
    setFailure(null);
    setConnectionResult(null);
    setElapsed(0);
    setUploadPercent(0);
    const startedAt = Date.now();
    let uploadComplete = false;
    const requestedCount = Math.min(30, Math.max(3, Math.round(slideCount)));
    setSlideCount(requestedCount);

    try {
      const res = await generateSlidesFromDocument(
        file,
        {
          slideCount: requestedCount,
          subject: lessonFocus.trim() || undefined,
          // Use the existing short context channel; the API has no instructions field.
          gradeLevel: teachingGuidance,
        },
        (percent) => {
          uploadComplete = percent >= 100;
          setUploadPercent(percent);
        }
      );

      const generated = parseGeneratedTeachingSlides(res?.data?.slides);
      const slides = revealPoints ? generated.map(revealTeachingContent) : generated;
      const warnings = [...(res.data.warnings ?? [])];
      const changedLayouts = slides.filter((slide, index) => slide !== generated[index]).length;
      if (changedLayouts) {
        warnings.push(`${changedLayouts} slide layouts adjusted to reveal supporting content. No text or teacher notes were removed.`);
      }
      if (slides.length !== requestedCount) {
        warnings.push(`Requested ${requestedCount} slides; the API returned ${slides.length}. Review coverage before recording.`);
      }
      if (res.data.meta?.condensed) {
        warnings.push("The API condensed this source. Check that important examples and practice questions survived; use a shorter chapter if they did not.");
      }

      onGenerated(slides, [...new Set(warnings)].map((warning) => `${file.name}: ${warning}`));
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (error: unknown) {
      const nextFailure = describeSlideGenerationFailure(error, {
        elapsedSeconds: Math.round((Date.now() - startedAt) / 1000),
        uploadComplete,
        offline: !navigator.onLine,
      });
      setFailure(nextFailure);
      toast({
        title: nextFailure.title,
        description: nextFailure.message,
        status: "error",
        duration: null,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      p="16px 20px"
      border={`1px solid ${colors.primary[5]}`}
      borderRadius="12px"
      bg={colors.primary[5] + "55"}
    >
      <Flex align="center" gap="8px" mb="4px">
        <MdUploadFile color={colors.primary[50]} />
        <Text fontSize="16px" fontWeight="500">
          Build slides from a document
        </Text>
      </Flex>
      <Text fontSize="13px" color="black.30" mb="12px">
        Upload a PDF, Word or PowerPoint file and we will draft the slides for
        you. You can edit everything afterwards. Max {MAX_DOCUMENT_MB}MB, 60
        pages. Writing the slides usually takes one to four minutes.
      </Text>

      <Flex gap="12px" wrap="wrap" mb="12px">
        <FormControl flex="1" minW={{ base: "100%", md: "240px" }}>
          <FormLabel fontSize="13px" htmlFor="slide-lesson-focus">Lesson focus</FormLabel>
          <Input
            id="slide-lesson-focus"
            size="sm"
            bg="white"
            value={lessonFocus}
            maxLength={TEACHING_CONTEXT_LIMIT}
            placeholder="What should students understand or be able to do?"
            onChange={(event) => setFocusOverride(event.target.value)}
            isDisabled={loading}
            aria-describedby="slide-focus-help"
          />
          <Text id="slide-focus-help" fontSize="11px" color="black.30" mt="4px">
            {lessonFocus.length}/{TEACHING_CONTEXT_LIMIT} characters sent to the AI. Edit this short focus to prioritize the learning goal.
          </Text>
        </FormControl>
        <FormControl w={{ base: "100%", md: "160px" }}>
          <FormLabel fontSize="13px" htmlFor="slide-audience">Learners</FormLabel>
          <Select id="slide-audience" size="sm" bg="white" value={audience} onChange={(event) => setAudience(event.target.value as TeachingAudience)} isDisabled={loading}>
            {Object.entries(TEACHING_AUDIENCES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
        </FormControl>
        <FormControl w={{ base: "100%", md: "220px" }}>
          <FormLabel fontSize="13px" htmlFor="slide-approach">Teaching approach</FormLabel>
          <Select id="slide-approach" size="sm" bg="white" value={approach} onChange={(event) => setApproach(event.target.value as TeachingApproach)} isDisabled={loading}>
            {Object.entries(TEACHING_APPROACHES).map(([value, { label }]) => <option key={value} value={value}>{label}</option>)}
          </Select>
        </FormControl>
      </Flex>
      <Box mb="16px">
        <Text fontSize="12px" color="black.30" mb="8px">
          Teaching guidance: {teachingGuidance}. This requests richer teaching; the API still decides the output.
        </Text>
        <Checkbox size="sm" colorScheme="purple" isChecked={revealPoints} onChange={(event) => setRevealPoints(event.target.checked)} isDisabled={loading}>
          Reveal supporting points when a layout would hide them
        </Checkbox>
        <Text fontSize="12px" color="black.30" mt="8px">
          For a teachable lesson, upload a focused chapter with explanations, worked examples, and practice questions, not just a list of topics. Short slide text is supported by detailed teacher notes.
        </Text>
      </Box>

      <Flex gap="12px" align="center" wrap="wrap">
        <Button
          type="button"
          variant="outline"
          borderColor={colors.primary[50]}
          color={colors.primary[50]}
          onClick={() => inputRef.current?.click()}
          isDisabled={loading}
        >
          {file ? "Change file" : "Choose file"}
        </Button>

        <Input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_DOCUMENT_TYPES}
          hidden
          onChange={(e) => handlePick(e.currentTarget.files?.[0])}
        />

        <Flex align="center" gap="6px">
            <Text as="label" htmlFor="slide-count" fontSize="13px" color="black.30">
            Slides
          </Text>
          <NumberInput
            size="sm"
            maxW="72px"
            min={3}
            max={30}
            value={slideCount}
            onChange={(_, n) => setSlideCount(Number.isFinite(n) ? n : 12)}
            isDisabled={loading}
          >
            <NumberInputField id="slide-count" />
          </NumberInput>
        </Flex>

        <Button
          type="button"
          bg={colors.primary[50]}
          color={colors.neutral[10]}
          _hover={{ opacity: 0.9 }}
          isDisabled={!file || loading || checkingConnection}
          isLoading={loading}
          loadingText="Generating"
          onClick={handleGenerate}
        >
          Generate slides
        </Button>
      </Flex>

      {failure && (
        <Box mt="14px" p="12px" bg="white" border={`1px solid ${colors.secondary[80]}`} borderRadius="8px" role="alert">
          <Text fontSize="14px" fontWeight="600">{failure.title}</Text>
          <Text fontSize="13px" mt="4px" color="black.30">{failure.message}</Text>
          <Text fontSize="12px" mt="8px" color="black.30">
            Failed after {clock(failure.elapsedSeconds)} | {failure.uploadComplete ? "Upload finished" : "Upload not confirmed"}
            {failure.status !== undefined ? ` | HTTP ${failure.status}` : ""}
            {failure.code ? ` | ${failure.code}` : ""}
          </Text>
          <Text fontSize="12px" mt="4px" color="black.30">
            Your document and teaching settings are kept. Generation is not automatically retried because the API may have already started the job.
          </Text>
          {failure.canCheckConnection && (
            <Button type="button" size="sm" variant="outline" mt="10px" onClick={handleCheckConnection} isLoading={checkingConnection} loadingText="Checking API">
              Check API connection
            </Button>
          )}
          {connectionResult && (
            <Text fontSize="13px" mt="8px" role="status" color={connectionResult.reachable ? colors.primary[70] : colors.secondary[80]}>
              {connectionResult.message}
            </Text>
          )}
        </Box>
      )}

      {loading && (
        <Flex align="center" gap="8px" mt="12px">
          <Text fontSize="13px" color={colors.primary[70]}>
            {uploadPercent < 100
              ? `Uploading ${uploadPercent}%`
              : stageLabel(elapsed)}
          </Text>
          <Text
            fontSize="13px"
            color="black.20"
            sx={{ fontVariantNumeric: "tabular-nums" }}
          >
            {clock(elapsed)}
          </Text>
        </Flex>
      )}

      {file && !loading && (
        <Text fontSize="13px" mt="10px" color={colors.primary[70]}>
          {file.name} ({(file.size / 1024 / 1024).toFixed(1)}MB)
        </Text>
      )}

    </Box>
  );
};

export default DocumentUpload;
