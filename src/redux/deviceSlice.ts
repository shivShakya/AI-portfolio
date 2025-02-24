import { createSlice } from '@reduxjs/toolkit';

const deviceSlice = createSlice({
  name: 'device',
  initialState: { value: '' }, 
  reducers: {
    setDevice: (state, action) => {
      state.value = action.payload 
    },
  },
})

export const { setDevice } = deviceSlice.actions
export default deviceSlice.reducer
