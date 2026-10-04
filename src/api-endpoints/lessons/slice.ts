import { createSlice } from "@reduxjs/toolkit";
import { fetchDrafts, fetchLessons, fetchSavedLessons } from "./actions";
import { LessonPayload } from "../../types";

const initialState: LessonPayload = {
  lessons: {
    data: [],
  },
  drafts: {
    data: [],
  },
  savedLessons: {
    data: [],
  },
};

export const lessonsSlice = createSlice({
  name: "lessons",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLessons.pending, (state) => state)
      .addCase(fetchLessons.fulfilled, (state, action) => {
        state.lessons = action.payload;
      })
      .addCase(fetchLessons.rejected, (state) => state)
      .addCase(fetchDrafts.pending, (state) => ({
        ...state,
      }))
      .addCase(fetchDrafts.fulfilled, (state, action) => {
        state.drafts = action.payload;
      })
      .addCase(fetchDrafts.rejected, (state) => state)
      .addCase(fetchSavedLessons.pending, (state) => state)
      .addCase(fetchSavedLessons.fulfilled, (state, action) => {
        state.savedLessons = action.payload;
      })
      .addCase(fetchSavedLessons.rejected, (state) => state);
  },
});

export const lessonsReducer = lessonsSlice.reducer;
