import { draftsRoute, lessonRoute, savedLessonsRoute } from "../../data/apiUrl";
import { Draft, CreateLessonFormValues } from "../../types";
import { AxiosInstance as Axios } from "../../utils/axios";
import { getToken } from "../../utils/constant";
import { GenerateSlidesResponse } from "./interface";

export const ACCEPTED_DOCUMENT_TYPES = ".pdf,.docx,.pptx";
export const MAX_DOCUMENT_MB = 25;

export const generateSlidesFromDocument = async (
  file: File,
  options?: { slideCount?: number; subject?: string; gradeLevel?: string },
  onProgress?: (percent: number) => void,
): Promise<GenerateSlidesResponse> => {
  const token = getToken();
  const form = new FormData();
  form.append("document", file);

  if (options?.slideCount)
    form.append("slideCount", String(options.slideCount));
  if (options?.subject) form.append("subject", options.subject);
  if (options?.gradeLevel) form.append("gradeLevel", options.gradeLevel);

  const { data } = await Axios.post(`${lessonRoute}/generate-slides`, form, {
    headers: {
      Authorization: `Bearer ${token}`,
      // Set explicitly: the shared instance defaults to application/json, and
      // axios v1 quietly JSON-stringifies FormData when that is the content
      // type. The browser overwrites this with the real multipart boundary.
      "Content-Type": "multipart/form-data",
    },
    // Generation runs a large model; a long document can take minutes.
    timeout: 8 * 60 * 1000,
    onUploadProgress: (event) => {
      if (event.total && onProgress)
        onProgress(Math.round((event.loaded * 100) / event.total));
    },
  });

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

// Lessons shared with the user in study chat, kept on their own list.
export const getSavedLessons = async () => {
  const token = getToken();
  const { data } = await Axios.get(savedLessonsRoute, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const saveLesson = async (lessonId: string) => {
  const token = getToken();
  const { data } = await Axios.post(
    savedLessonsRoute,
    { lessonId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
};

export const unsaveLesson = async (lessonId: string) => {
  const token = getToken();
  const { data } = await Axios.delete(`${savedLessonsRoute}/${lessonId}`, {
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
