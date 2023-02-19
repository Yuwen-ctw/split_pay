import { configureStore } from '@reduxjs/toolkit'
import costReducer from '../features/costs/costSlice'
import userReducer from '../features/user/userSlice'
import distributedPriceReducer from '../features/costs/distributedPriceSlice'
export const store = configureStore({
  reducer: {
    costs: costReducer,
    user: userReducer,
    distributedPrice: distributedPriceReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
