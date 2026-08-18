import { mediaRoute } from "src/data/apiUrl";
import { AxiosInstance as Axios } from "./axios";
import { getToken } from "./constant";

interface UploadFileRequest {
  status: string;
  message: string;
  data: {
    url: string;
    size: number;
  } | null;
}
type UploadFileAction = (
  file: File,
  onProgress?: (percent: number, retryMessage?: string) => void,
) => Promise<UploadFileRequest>;

// type UploadFileAction = (file: File) => Promise<UploadFileRequest>;

export enum FileUploadResponseStatus {
  Success = "success",
  Failed = "failed",
  Invalid = "invalid",
}

export const validateFile = (file: File) => {
  const byte = 1024;
  const size = Math.floor(file.size / byte); // size in KB

  const fileSizeLimit = {
    image: 3000, // 3MB
    video: 500000, // 500MB — increase from 20MB
    audio: 5000, // 5MB
  };

  const allowedTypes = ["video", "audio", "image"];
  const fileType = file.type.split("/")[0];

  if (!allowedTypes.includes(fileType)) {
    return {
      status: FileUploadResponseStatus.Invalid,
      message: "Invalid file type",
    };
  }

  const isTooBig =
    (fileType === "video" && size > fileSizeLimit.video) ||
    (fileType === "audio" && size > fileSizeLimit.audio) ||
    (fileType === "image" && size > fileSizeLimit.image);

  if (isTooBig) {
    return {
      status: FileUploadResponseStatus.Failed,
      message: `${file.name.substring(0, 10)} size is too big`,
    };
  }

  return {
    status: FileUploadResponseStatus.Success,
    message: `${file.name.substring(0, 10)} uploaded successfully`,
  };
};

export const uploadFile: UploadFileAction = async (
  mediaFile: File,
  onProgress?: (percent: number, retryMessage?: string) => void, // optional callback
) => {
  const validator = validateFile(mediaFile);
  const token = getToken();

  if (validator.status !== FileUploadResponseStatus.Success) {
    return { ...validator, data: null };
  }

  const formData = new FormData();
  formData.append("mediaFile", mediaFile);

  const maxRetries = 5;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const res = await Axios.post(`${mediaRoute}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            onProgress(percent, undefined);
          }
        },
      });

      if (!res || !res.data) throw new Error("Empty response from server");
      return res.data;
    } catch (error: any) {
      attempt++;

      // Check if it is a transient error: no response (network down/DNS fail) or 5xx server status
      const isNetworkError =
        !error.response ||
        error.code === "ERR_NETWORK" ||
        error.message === "Network Error" ||
        error.code === "ECONNABORTED" ||
        error.response.status >= 500;

      if (isNetworkError && attempt < maxRetries) {
        // Calculate delay with exponential backoff and jitter
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        console.warn(`Upload attempt ${attempt} failed. Retrying in ${Math.round(delay)}ms... Error:`, error.message);

        if (onProgress) {
          onProgress(0, `Network issue. Reconnecting... (Attempt ${attempt}/${maxRetries})`);
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error("Upload failed after maximum retries");
};

export const deletedFile = async (fileUrl: string) => {
  const token = getToken();
  const result = await Axios.delete(`${mediaRoute}/?fileURL=${fileUrl}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!result) {
    return {
      status: FileUploadResponseStatus.Failed,
      message: "Something went wrong",
      data: null,
    };
  } else return result.data as Omit<UploadFileRequest, "data">;
};

export const getUploadErrorMessage = (error: any): string => {
  // No internet connection
  if (!navigator.onLine) {
    return "No internet connection. Please check your network and try again.";
  }

  // Axios network error (request never reached server)
  if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
    return "Network error. Please check your connection and try again.";
  }

  // Request timeout
  if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
    return "Upload timed out. Your video may be too large or your connection too slow.";
  }

  // Server responded with error status
  if (error.response) {
    const status = error.response.status;

    if (status === 413) {
      return "File is too large for the server to accept. Please record a shorter video.";
    }
    if (status === 507 || status === 500) {
      return "Server storage issue. Please try again later or contact support.";
    }
    if (status === 401 || status === 403) {
      return "Session expired. Please log in again.";
    }
    if (status >= 500) {
      return "Server error. Please try again later.";
    }
  }

  return error.message ?? "Something went wrong. Please try again.";
};
