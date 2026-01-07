import { configureStore } from "@reduxjs/toolkit";
import authStateReducer from "./slices/authStateSlice.js";
import popupReducer from "./slices/popupSlice.js";
import { indexSlice } from "./slices/indexSlice.js";

export const store = configureStore({
  reducer: {
    authState: authStateReducer,
    popup: popupReducer,
    [indexSlice.reducerPath]: indexSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(indexSlice.middleware),
});
