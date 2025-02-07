// src/store.js
import { configureStore } from '@reduxjs/toolkit'
import categoryReducer from './categorySlice'
import responseSlice from './responseSlice';

export const store = configureStore({
  reducer: {
    category: categoryReducer,
    response: responseSlice
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
export default store
