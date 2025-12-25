import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Initial state here
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Reducers here
  },
});

export const { } = uiSlice.actions;
export default uiSlice.reducer;
