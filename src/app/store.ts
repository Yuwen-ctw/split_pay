import { configureStore } from '@reduxjs/toolkit'
import costReducer from '../features/costs/costSlice'
import userReducer from '../features/user/userSlice'

export const store = configureStore({
  reducer: {
    costs: costReducer,
    user: userReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
