import { createSlice } from '@reduxjs/toolkit';

const outputTextSlice = createSlice({
  name: 'output',
  initialState: { value: '' }, 
  reducers: {
    setOutput: (state, action) => {
      state.value = action.payload 
    },
  },
})

export const { setOutput } = outputTextSlice.actions
export default outputTextSlice.reducer
