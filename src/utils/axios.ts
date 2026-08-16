import Axios from "axios";
import { USER, getToken } from "./constant";
import { APP_BASE_URL } from "../data/env";

export const _token = USER()?.token || "";

const AxiosInstance = Axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_URL_MVP,
  headers: {
    "Content-Type": "application/json",
    ...(_token && { Authorization: `Bearer ${_token}` }),
  },
});

AxiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

AxiosInstance.interceptors.response.use(
  function (config) {
    return config;
  },
  function (error) {
    if (error?.response?.status === 401) {
      localStorage.clear();
      window.location.replace("/sign-in");
    }
    return Promise.reject(error);
  }
);

// Instance for endpoints served from the non-MVP base url (e.g. web push).
// The token is resolved per request rather than at module load, so it stays
// correct across a sign-in without a page refresh.
const BaseAxiosInstance = Axios.create({
  baseURL: APP_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

BaseAxiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

BaseAxiosInstance.interceptors.response.use(
  function (config) {
    return config;
  },
  function (error) {
    if (error?.response?.status === 401) {
      localStorage.clear();
      window.location.replace("/sign-in");
    }
    return Promise.reject(error);
  }
);

export { AxiosInstance, BaseAxiosInstance };
