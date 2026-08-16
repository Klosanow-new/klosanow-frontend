import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { UserI } from "../../types/auth/authInterface";

const initialState: UserI = {
  token: "",
  isAuth: false,
  data: null,
};

const userSlice = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    updateToken(state, action: PayloadAction<UserI>) {
      return { ...state, token: action.payload.token };
    },

    updateUserData(state, action: PayloadAction<UserI>) {
      return { ...state, data: action.payload.data };
    },

    addNotification(state, action: PayloadAction<any>) {
      if (state.data) {
        if (!state.data.notifications) {
          state.data.notifications = [];
        }
        const notif = action.payload;
        const exists = state.data.notifications.some(
          (n: any) => n._id === notif._id
        );
        if (!exists) {
          state.data.notifications = [notif, ...state.data.notifications];
        }
      }
    },
  },
});
export const { updateToken, updateUserData, addNotification } = userSlice.actions;
export const { actions: userActions, reducer: userReducer } = userSlice;
