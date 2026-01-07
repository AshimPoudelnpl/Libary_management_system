import { createSlice } from "@reduxjs/toolkit";

const popupSlice = createSlice({
  name: "popup",
  initialState: {
    isOpen: false,
    type: null,
    data: null,
    title: "",
    message: "",
  },
  reducers: {
    openPopup(state, action) {
      state.isOpen = true;
      state.type = action.payload.type;
      state.data = action.payload.data || null;
      state.title = action.payload.title || "";
      state.message = action.payload.message || "";
    },
    closePopup(state) {
      state.isOpen = false;
      state.type = null;
      state.data = null;
      state.title = "";
      state.message = "";
    },
    updatePopupData(state, action) {
      state.data = action.payload;
    },
    resetPopupSlice(state) {
      state.isOpen = false;
      state.type = null;
      state.data = null;
      state.title = "";
      state.message = "";
    }
  },
});

export const { openPopup, closePopup, updatePopupData } = popupSlice.actions;

export default popupSlice.reducer;