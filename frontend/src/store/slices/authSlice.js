import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Initial state here
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Reducers here
  },
});

export const { } = authSlice.actions;
export default authSlice.reducer;
