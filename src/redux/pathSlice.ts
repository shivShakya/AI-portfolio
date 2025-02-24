import { createSlice } from '@reduxjs/toolkit';

const pathSlice = createSlice({
  name: 'path',
  initialState: { value: '' }, 
  reducers: {
    setPath: (state, action) => {
      state.value = action.payload 
    },
  },
})

export const { setPath } = pathSlice.actions
export default pathSlice.reducer
