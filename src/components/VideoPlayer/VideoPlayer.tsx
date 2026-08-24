import React from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Flex,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import {
  MdForward10,
  MdFullscreen,
  MdFullscreenExit,
  MdPause,
  MdPlayArrow,
  MdReplay10,
  MdVolumeOff,
  MdVolumeUp,
} from "react-icons/md";
import {
  PLAYBACK_RATES,
  browserCanPlayWebm,
  formatDuration,
  looksLikeWebm,
  resolveInfiniteDuration,
} from "src/utils/video";

const SKIP_SECONDS = 10;
const CONTROLS_IDLE_MS = 2600;

interface VideoPlayerProps {
  src: string;
  poster?: string;
  /** Caps the video box. Numbers are treated as px. */
  maxHeight?: number | string;
  autoPlay?: boolean;
  borderRadius?: string;
  /**
   * Fires once the real length is known — including for our own recordings,
   * where the browser reports Infinity until forced to resolve it.
   */
  onDurationResolved?: (seconds: number) => void;
  onError?: () => void;
  /**
   * Discourages casual saving of the file: no right-click menu, no
   * picture-in-picture, and `nodownload` on the native control set.
   *
   * It deters, it does not protect. The video lives at a public storage url that
   * anyone can read out of the network panel, so this is a nudge and nothing
   * more. `controlsList` in particular is inert while this player draws its own
   * controls and never sets the `controls` attribute — it is here so the intent
   * survives if that ever changes.
   */
  protected?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  maxHeight = 600,
  autoPlay = false,
  borderRadius = "8px",
  onDurationResolved,
  onError,
  // `protected` is a reserved word under strict mode, which every module is.
  protected: isProtected = false,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const ref = React.useRef<HTMLVideoElement>(null);
  const idleTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [buffered, setBuffered] = React.useState(0);
  const [volume, setVolume] = React.useState(1);
  const [muted, setMuted] = React.useState(false);
  const [rate, setRate] = React.useState(1);
  const [fullscreen, setFullscreen] = React.useState(false);
  const [controlsVisible, setControlsVisible] = React.useState(true);
  const [loadFailed, setLoadFailed] = React.useState(false);

  // Worth saying up front rather than leaving a black player on screen: iOS
  // Safari cannot decode the VP8 WebM these lessons are recorded in.
  const codecUnsupported =
    !!src && looksLikeWebm(src) && !browserCanPlayWebm();

  const seekable = Number.isFinite(duration) && duration > 0;

  const showControls = React.useCallback(() => {
    setControlsVisible(true);

    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      // Never hide them while paused — there is nothing to watch behind them.
      if (!ref.current?.paused) setControlsVisible(false);
    }, CONTROLS_IDLE_MS);
  }, [ref]);

  React.useEffect(
    () => () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    },
    [],
  );

  // A new source invalidates everything measured about the old one.
  React.useEffect(() => {
    setLoadFailed(false);
    setDuration(0);
    setCurrentTime(0);
    setBuffered(0);
    setPlaying(false);
  }, [src]);

  React.useEffect(() => {
    const onFullscreenChange = () =>
      setFullscreen(document.fullscreenElement === containerRef.current);

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const handleLoadedMetadata = () => {
    const video = ref.current;
    if (!video) return;

    resolveInfiniteDuration(video, (value) => {
      setDuration(value);
      if (Number.isFinite(value)) onDurationResolved?.(value);
    });
  };

  const handleTimeUpdate = () => {
    const video = ref.current;
    if (!video) return;

    setCurrentTime(video.currentTime);

    if (video.buffered.length) {
      setBuffered(video.buffered.end(video.buffered.length - 1));
    }
  };

  const togglePlay = () => {
    const video = ref.current;
    if (!video) return;

    if (video.paused) {
      // A rejected play() is a browser autoplay policy decision, not an error
      // the viewer needs to see.
      video.play().catch(() => undefined);
    } else {
      video.pause();
    }
    showControls();
  };

  const seekBy = (seconds: number) => {
    const video = ref.current;
    if (!video) return;

    const limit = seekable ? duration : video.currentTime + seconds;
    video.currentTime = Math.min(Math.max(video.currentTime + seconds, 0), limit);
    showControls();
  };

  const seekTo = (seconds: number) => {
    const video = ref.current;
    if (!video || !seekable) return;

    video.currentTime = Math.min(Math.max(seconds, 0), duration);
    setCurrentTime(video.currentTime);
  };

  const changeVolume = (value: number) => {
    const video = ref.current;
    if (!video) return;

    video.volume = value;
    video.muted = value === 0;
    setVolume(value);
    setMuted(value === 0);
  };

  const toggleMute = () => {
    const video = ref.current;
    if (!video) return;

    video.muted = !video.muted;
    setMuted(video.muted);
    showControls();
  };

  const changeRate = (value: number) => {
    const video = ref.current;
    if (!video) return;

    video.playbackRate = value;
    setRate(value);
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
      return;
    }
    containerRef.current?.requestFullscreen().catch(() => undefined);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // The sliders own the arrow keys while they hold focus.
    if ((event.target as HTMLElement).getAttribute("role") === "slider") return;

    const handlers: Record<string, () => void> = {
      " ": togglePlay,
      k: togglePlay,
      ArrowRight: () => seekBy(5),
      ArrowLeft: () => seekBy(-5),
      l: () => seekBy(SKIP_SECONDS),
      j: () => seekBy(-SKIP_SECONDS),
      m: toggleMute,
      f: toggleFullscreen,
    };

    const handler = handlers[event.key] || handlers[event.key.toLowerCase()];
    if (!handler) return;

    event.preventDefault();
    handler();
  };

  const iconButtonStyles = {
    size: "sm" as const,
    variant: "ghost" as const,
    color: "#fff",
    _hover: { bg: "whiteAlpha.300" },
    _active: { bg: "whiteAlpha.400" },
  };

  return (
    <Box>
      {/*
        Both fallback links below stay put even under `protected`. iPhone Safari
        genuinely cannot decode VP8, so for those students the download link is
        not a convenience — it is the only way to watch the lesson at all.
      */}
      {(codecUnsupported || loadFailed) && (
        <Alert
          status="warning"
          borderRadius="8px"
          mb="12px"
          alignItems="flex-start"
        >
          <AlertIcon />
          <Box>
            <AlertTitle fontSize="14px">
              {codecUnsupported
                ? "This browser can't play the recording"
                : "This recording could not be loaded"}
            </AlertTitle>
            <AlertDescription fontSize="14px" display="block">
              {codecUnsupported ? (
                <>
                  Lessons are recorded as WebM (VP8), which Safari on iPhone and
                  iPad cannot decode. Open the link in Chrome on Android or a
                  computer, or{" "}
                  <Link
                    href={src}
                    isExternal
                    textDecoration="underline"
                    fontWeight="500"
                  >
                    download the video file
                  </Link>{" "}
                  and play it in an app like VLC.
                </>
              ) : (
                <>
                  The file may have been moved or deleted. You can{" "}
                  <Link
                    href={src}
                    isExternal
                    textDecoration="underline"
                    fontWeight="500"
                  >
                    try opening it directly
                  </Link>
                  .
                </>
              )}
            </AlertDescription>
          </Box>
        </Alert>
      )}

      <Box
        ref={containerRef}
        position="relative"
        bg="#000"
        borderRadius={fullscreen ? "0" : borderRadius}
        overflow="hidden"
        tabIndex={0}
        outline="none"
        onKeyDown={handleKeyDown}
        onMouseMove={showControls}
        onTouchStart={showControls}
        sx={{ ":fullscreen": { display: "flex", alignItems: "center" } }}
      >
        <video
          key={src}
          ref={ref}
          src={src}
          poster={poster}
          preload="metadata"
          autoPlay={autoPlay}
          // Without this, iOS hijacks playback into fullscreen.
          playsInline
          controlsList={isProtected ? "nodownload" : undefined}
          disablePictureInPicture={isProtected}
          onContextMenu={
            isProtected ? (event) => event.preventDefault() : undefined
          }
          onClick={togglePlay}
          onLoadedMetadata={handleLoadedMetadata}
          onDurationChange={() => {
            const value = ref.current?.duration;
            if (value && Number.isFinite(value)) setDuration(value);
          }}
          onTimeUpdate={handleTimeUpdate}
          onProgress={handleTimeUpdate}
          onPlay={() => {
            setPlaying(true);
            showControls();
          }}
          onPause={() => {
            setPlaying(false);
            setControlsVisible(true);
          }}
          onEnded={() => {
            setPlaying(false);
            setControlsVisible(true);
          }}
          onError={() => {
            setLoadFailed(true);
            onError?.();
          }}
          style={{
            display: "block",
            width: "100%",
            maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
            cursor: "pointer",
          }}
        />

        {!playing && !loadFailed && (
          <Flex
            position="absolute"
            inset="0"
            align="center"
            justify="center"
            pointerEvents="none"
          >
            <Flex
              align="center"
              justify="center"
              boxSize="56px"
              borderRadius="full"
              bg="blackAlpha.600"
              color="#fff"
              fontSize="30px"
            >
              <MdPlayArrow />
            </Flex>
          </Flex>
        )}

        <Box
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          px="10px"
          pb="6px"
          pt="24px"
          bgGradient="linear(to-t, blackAlpha.800, transparent)"
          opacity={controlsVisible ? 1 : 0}
          pointerEvents={controlsVisible ? "auto" : "none"}
          transition="opacity 150ms ease"
        >
          <Slider
            aria-label="Seek"
            value={currentTime}
            min={0}
            max={seekable ? duration : 1}
            step={0.1}
            isDisabled={!seekable}
            onChange={seekTo}
            focusThumbOnChange={false}
            mb="2px"
          >
            <SliderTrack bg="whiteAlpha.400" h="4px">
              {/* Downloaded-so-far, drawn behind the played portion. */}
              <Box
                position="absolute"
                left="0"
                top="0"
                bottom="0"
                bg="whiteAlpha.600"
                width={
                  seekable ? `${Math.min((buffered / duration) * 100, 100)}%` : "0%"
                }
              />
              <SliderFilledTrack bg="primary.50" />
            </SliderTrack>
            <SliderThumb boxSize="12px" />
          </Slider>

          <Flex align="center" gap="2px" wrap="nowrap">
            <Tooltip label={playing ? "Pause (k)" : "Play (k)"} hasArrow>
              <IconButton
                {...iconButtonStyles}
                aria-label={playing ? "Pause" : "Play"}
                icon={playing ? <MdPause /> : <MdPlayArrow />}
                fontSize="22px"
                onClick={togglePlay}
              />
            </Tooltip>

            <Tooltip label={`Back ${SKIP_SECONDS}s (j)`} hasArrow>
              <IconButton
                {...iconButtonStyles}
                aria-label={`Rewind ${SKIP_SECONDS} seconds`}
                icon={<MdReplay10 />}
                fontSize="20px"
                onClick={() => seekBy(-SKIP_SECONDS)}
              />
            </Tooltip>

            <Tooltip label={`Forward ${SKIP_SECONDS}s (l)`} hasArrow>
              <IconButton
                {...iconButtonStyles}
                aria-label={`Forward ${SKIP_SECONDS} seconds`}
                icon={<MdForward10 />}
                fontSize="20px"
                onClick={() => seekBy(SKIP_SECONDS)}
              />
            </Tooltip>

            <Flex align="center" gap="4px" role="group">
              <Tooltip label={muted ? "Unmute (m)" : "Mute (m)"} hasArrow>
                <IconButton
                  {...iconButtonStyles}
                  aria-label={muted ? "Unmute" : "Mute"}
                  icon={muted ? <MdVolumeOff /> : <MdVolumeUp />}
                  fontSize="20px"
                  onClick={toggleMute}
                />
              </Tooltip>

              <Slider
                aria-label="Volume"
                value={muted ? 0 : volume}
                min={0}
                max={1}
                step={0.05}
                onChange={changeVolume}
                focusThumbOnChange={false}
                w="60px"
                display={{ base: "none", md: "block" }}
              >
                <SliderTrack bg="whiteAlpha.400" h="4px">
                  <SliderFilledTrack bg="#fff" />
                </SliderTrack>
                <SliderThumb boxSize="10px" />
              </Slider>
            </Flex>

            <Text
              color="#fff"
              fontSize="12px"
              ml="6px"
              whiteSpace="nowrap"
              sx={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatDuration(currentTime) || "0:00"}
              {seekable ? ` / ${formatDuration(duration)}` : ""}
            </Text>

            <Box flex="1" />

            <Menu placement="top-end">
              <MenuButton
                as={Box}
                cursor="pointer"
                color="#fff"
                fontSize="12px"
                fontWeight="500"
                px="8px"
                py="4px"
                borderRadius="4px"
                _hover={{ bg: "whiteAlpha.300" }}
              >
                {rate}&times;
              </MenuButton>
              <MenuList minW="90px" zIndex={1600}>
                {PLAYBACK_RATES.map((value) => (
                  <MenuItem
                    key={value}
                    fontSize="13px"
                    fontWeight={value === rate ? "600" : "400"}
                    onClick={() => changeRate(value)}
                  >
                    {value}&times;
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>

            <Tooltip
              label={fullscreen ? "Exit fullscreen (f)" : "Fullscreen (f)"}
              hasArrow
            >
              <IconButton
                {...iconButtonStyles}
                aria-label="Toggle fullscreen"
                icon={fullscreen ? <MdFullscreenExit /> : <MdFullscreen />}
                fontSize="22px"
                onClick={toggleFullscreen}
              />
            </Tooltip>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export default VideoPlayer;
