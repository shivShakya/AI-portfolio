import { createSlice } from '@reduxjs/toolkit';

const inputTextSlice = createSlice({
  name: 'input',
  initialState: { value: '' }, 
  reducers: {
    setInput: (state, action) => {
      state.value = action.payload 
    },
  },
})

export const { setInput } = inputTextSlice.actions
export default inputTextSlice.reducer
