import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { FormSchema } from "../lib/types";

const initialState: FormSchema = {
  id: "",
  name: "",
  createdAt: "",
  fields: [],
};

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    setForm: (_state, action: PayloadAction<FormSchema>) => action.payload,
    resetForm: () => initialState,
  },
});

export const { setForm, resetForm } = formSlice.actions;
export default formSlice.reducer;
