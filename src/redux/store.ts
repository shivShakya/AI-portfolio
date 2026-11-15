// src/store.js
import { configureStore } from '@reduxjs/toolkit'
import categoryReducer from './categorySlice'
import responseSlice from './responseSlice';
import voiceSlice from './voiceContent';
import inputSlice from './inputTextSlice';
import outputSlice from './outputTextSlice';
import pathSlice from './pathSlice';
import deviceSlice from './deviceSlice';
import chatSlice from './chatSlice';

export const store = configureStore({
  reducer: {
    category: categoryReducer,
    response: responseSlice,
    voice: voiceSlice,
    input: inputSlice,
    output: outputSlice,
    path: pathSlice,
    device: deviceSlice,
    chat: chatSlice,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store
