import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'

interface UserType {
  id: number
  name: string
  avatar: string
  groups:
    | {
        id: number
        title: string
        updateTime: string
      }[]
    | []
}

export const fetchAllGroups = createAsyncThunk(
  'user/fetchAllGroup',
  async () => {
    const response = await fetch('http://localhost:3001/user')
    if (response.ok) {
      const data = (await response.json()) as UserType
      return data
    } else {
      return Promise.reject(
        `fetch user failed
    status: ${response.status}, statusText: ${response.statusText}`
      )
    }
  }
)

const initialState = {
  user: {
    id: 0,
    name: '',
    avatar: '',
    groups: [],
  } as UserType,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchAllGroups.fulfilled, (state, action) => {
        state.user = action.payload
      })
      .addCase(fetchAllGroups.rejected, () => {
        console.log('opps')
      })
  },
})

export default userSlice.reducer

export const selectUserData = (state: RootState) => state.user.user
