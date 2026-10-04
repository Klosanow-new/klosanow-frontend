import { createAsyncThunk } from "@reduxjs/toolkit";
import { getDrafts, getLessons, getSavedLessons } from ".";

export const fetchLessons = createAsyncThunk(
  "lessons/fetchLessons",
  async () => {
    const res = await getLessons();
    return res;
  }
);

export const fetchDrafts = createAsyncThunk("lessons/fetchDrafts", async () => {
  const res = await getDrafts();
  return res;
});

export const fetchSavedLessons = createAsyncThunk(
  "lessons/fetchSavedLessons",
  async () => {
    const res = await getSavedLessons();
    return res;
  }
);
