import { createSlice } from '@reduxjs/toolkit';

const responseSlice = createSlice({
    name: 'response',
    initialState: { value: '' }, 
    reducers: {
      setTextResponse: (state, action) => {
        state.value = action.payload 
      },
    },
  })
  

export const { setTextResponse } = responseSlice.actions
export default responseSlice.reducer
