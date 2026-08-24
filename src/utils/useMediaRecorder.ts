import React from "react";

import RecordRTC, { RecordRTCPromisesHandler } from "recordrtc";

import { pickRecordingMimeType } from "./video";

/** 400 kbps — chosen for slide readability on a constrained connection. */
const VIDEO_BITS_PER_SECOND = 400000;
/** 64 kbps — enough for clear speech. */
const AUDIO_BITS_PER_SECOND = 64000;

interface MediaRecorderState {
  blob: Blob | null;
  status: RecordRTC.State;
  stream: MediaStream | null;
}

const useMediaRecorder = () => {
  const recorderRef = React.useRef<RecordRTCPromisesHandler | null>(null);

  const initialState: MediaRecorderState = {
    blob: null,
    status: "inactive",
    stream: null,
  };

  const [state, setState] = React.useState(initialState);
  const handleStateUpdate = (newState: Partial<MediaRecorderState>) =>
    setState((state) => ({ ...state, ...newState }));

  const startRecording = async () => {
    const screenStream: MediaStream = await (
      navigator as any
    ).mediaDevices.getDisplayMedia({
      video: {
        width: { max: 1280 },
        height: { max: 720 },
        frameRate: { ideal: 15, max: 25 },
      },
      preferCurrentTab: true,
    });

    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        noiseSuppression: true,
        echoCancellation: true,
        sampleRate: 44100,
      },
    });

    const stream = new MediaStream([
      ...screenStream.getTracks(),
      ...audioStream.getTracks(),
    ]);

    // Ask for the best container this browser can record rather than the VP8
    // WebM that was hardcoded here, which iPhone Safari cannot decode. An
    // unsupported mimeType is not a risk: RecordRTC re-checks it against
    // isTypeSupported and falls back to video/webm, and the browser picks for
    // itself when the probe returns nothing.
    //
    // recorderType is pinned because mimeType and both bitrates are
    // MediaRecorder options — RecordRTC's other backends (WhammyRecorder,
    // WebAssemblyRecorder) accept and silently discard all three. Its own
    // backend selection reaches MediaStreamRecorder via a hardcoded
    // isTypeSupported("video/webm") test, which is false on Safari.
    //
    // The cast covers two gaps in @types/recordrtc: mimeType is typed as a
    // closed union with no codec-qualified MP4 entries, and recorderType is
    // typed as a recorder instance rather than a constructor.
    const mimeType = pickRecordingMimeType();
    const options = {
      type: "video",
      recorderType: RecordRTC.MediaStreamRecorder,
      videoBitsPerSecond: VIDEO_BITS_PER_SECOND,
      audioBitsPerSecond: AUDIO_BITS_PER_SECOND,
      ...(mimeType ? { mimeType } : {}),
    } as unknown as RecordRTC.Options;

    recorderRef.current = new RecordRTCPromisesHandler(stream, options);

    await recorderRef.current.startRecording();
    const status = await recorderRef.current.getState();

    handleStateUpdate({ status, stream });
  };

  const pauseRecording = async () => {
    if (!recorderRef.current) return;
    await recorderRef.current.pauseRecording();

    handleStateUpdate({
      status: "paused",
    });
  };
  const resumeRecording = async () => {
    if (!recorderRef.current) return;
    await recorderRef.current.resumeRecording();

    handleStateUpdate({
      status: "recording",
    });
  };

  const stopRecording = async (): Promise<Blob | null> => {
    if (!recorderRef.current) return null;

    await recorderRef.current?.stopRecording();
    state.stream?.getTracks().forEach((track) => track.stop());

    const blob = await recorderRef.current.getBlob();
    handleStateUpdate({
      blob,
      status: "stopped",
    });

    return blob;
  };

  return {
    blob: state.blob,
    mediaStatus: state.status,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  };
};

export default useMediaRecorder;
