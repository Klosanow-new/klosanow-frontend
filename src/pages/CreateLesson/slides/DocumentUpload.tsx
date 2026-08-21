import React from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  NumberInput,
  NumberInputField,
  Text,
  useToast,
} from "@chakra-ui/react";
import { MdUploadFile } from "react-icons/md";
import { Slide } from "src/types";
import { colors } from "src/data/colors";
import {
  ACCEPTED_DOCUMENT_TYPES,
  MAX_DOCUMENT_MB,
  generateSlidesFromDocument,
} from "src/api-endpoints/lessons";

interface DocumentUploadProps {
  onGenerated: (slides: Slide[]) => void;
  /** Passed to the model as context. */
  subject?: string;
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
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const toast = useToast();

  const [file, setFile] = React.useState<File | null>(null);
  const [slideCount, setSlideCount] = React.useState(12);
  const [loading, setLoading] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);
  const [uploadPercent, setUploadPercent] = React.useState(0);
  const [warnings, setWarnings] = React.useState<string[]>([]);

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

    setWarnings([]);
    setFile(picked);
  };

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);
    setElapsed(0);
    setUploadPercent(0);
    setWarnings([]);

    try {
      const res = await generateSlidesFromDocument(
        file,
        { slideCount, subject },
        setUploadPercent
      );

      const slides = res?.data?.slides ?? [];
      if (!slides.length) throw new Error("No slides came back. Try again.");

      setWarnings(res.data.warnings ?? []);
      onGenerated(slides);
      setFile(null);

      toast({
        title: `${slides.length} slides generated`,
        description: "Review and edit them before you record.",
        status: "success",
        duration: 5000,
        position: "top-right",
      });
    } catch (error: any) {
      toast({
        title: "Could not generate slides",
        description:
          error?.response?.data?.message ??
          error?.message ??
          "Something went wrong",
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
          <Text fontSize="13px" color="black.30">
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
            <NumberInputField />
          </NumberInput>
        </Flex>

        <Button
          type="button"
          bg={colors.primary[50]}
          color={colors.neutral[10]}
          _hover={{ opacity: 0.9 }}
          isDisabled={!file || loading}
          isLoading={loading}
          loadingText="Generating"
          onClick={handleGenerate}
        >
          Generate slides
        </Button>
      </Flex>

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

      {warnings.length > 0 && (
        <Box mt="12px">
          {warnings.map((warning) => (
            <Text key={warning} fontSize="12px" color={colors.secondary[80]}>
              • {warning}
            </Text>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default DocumentUpload;
