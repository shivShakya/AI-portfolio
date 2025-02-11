import { createSlice } from '@reduxjs/toolkit';

const voiceSlice = createSlice({
  name: 'voice',
  initialState: { value: '' }, 
  reducers: {
    setVoiceContent: (state, action) => {
      state.value = action.payload 
    },
  },
})

export const { setVoiceContent } = voiceSlice.actions
export default voiceSlice.reducer
