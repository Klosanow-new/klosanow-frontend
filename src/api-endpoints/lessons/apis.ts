import { draftsRoute, lessonRoute } from "../../data/apiUrl";
import { Draft, CreateLessonFormValues } from "../../types";
import { AxiosInstance as Axios } from "../../utils/axios";
import { getToken } from "../../utils/constant";
import RawAxios from "axios";
import { GenerateSlidesResponse } from "./interface";

export const ACCEPTED_DOCUMENT_TYPES = ".pdf,.docx,.pptx";
export const MAX_DOCUMENT_MB = 25;

/**
 * Slide generation runs as its own service (klosanow-slides-api on Render)
 * until the backend team merges it into the main API.
 *
 * Hardcoded so deploying needs no change to the Vercel environment. This
 * deliberately ignores VITE_SLIDES_API_URL — the local .env still points at
 * localhost:4000, and honouring it meant the app kept calling a dev server that
 * is not running. To develop against a local API, edit this constant.
 *
 * Once the endpoint is merged into the main API, delete this and use
 * VITE_APP_BASE_URL_MVP instead.
 */
const SLIDES_API_BASE = "https://klosanowslides.onrender.com";

const slidesApiBase = () => SLIDES_API_BASE;

export const generateSlidesFromDocument = async (
  file: File,
  options?: { slideCount?: number; subject?: string; gradeLevel?: string },
  onProgress?: (percent: number) => void
): Promise<GenerateSlidesResponse> => {
  const token = getToken();
  const form = new FormData();
  form.append("document", file);

  if (options?.slideCount) form.append("slideCount", String(options.slideCount));
  if (options?.subject) form.append("subject", options.subject);
  if (options?.gradeLevel) form.append("gradeLevel", options.gradeLevel);

  const { data } = await RawAxios.post(
    `${slidesApiBase()}/${lessonRoute}/generate-slides`,
    form,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
      // Generation runs a large model; a long document can take minutes.
      timeout: 8 * 60 * 1000,
      onUploadProgress: (event) => {
        if (event.total && onProgress)
          onProgress(Math.round((event.loaded * 100) / event.total));
      },
    }
  );

  return data as GenerateSlidesResponse;
};

export const getLessons = async () => {
  const token = getToken();
  const { data } = await Axios.get(lessonRoute, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

/**
 * Fetches one lesson. Backs the shared-lesson viewer, where the visitor is a
 * signed-in user who does not own the lesson and so cannot resolve it from
 * getLessons (that returns only the caller's own lessons).
 */
export const getLesson = async (id: string) => {
  const token = getToken();
  const { data } = await Axios.get(`${lessonRoute}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const deleteLesson = async (id: string) => {
  const token = getToken();
  const { data } = await Axios.delete(`${lessonRoute}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const postLessons = async (payload: CreateLessonFormValues) => {
  const token = getToken();
  const { data } = await Axios.post(lessonRoute, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const saveToDrafts = async (payload: Partial<Draft>) => {
  const token = getToken();
  const { data } = await Axios.post(draftsRoute, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const getDrafts = async () => {
  const token = getToken();
  const { data } = await Axios.get(draftsRoute, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
};

export const updateDraft = async (id: string, payload: Partial<Draft>) => {
  const token = getToken();
  const { data } = await Axios.put(`${draftsRoute}/${id}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
};

export const deleteDraft = async (id: string) => {
  const token = getToken();
  const { data } = await Axios.delete(`${draftsRoute}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data;
};
