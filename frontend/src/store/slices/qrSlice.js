import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Initial state here
};

const qrSlice = createSlice({
  name: 'qr',
  initialState,
  reducers: {
    // Reducers here
  },
});

export const { } = qrSlice.actions;
export default qrSlice.reducer;
