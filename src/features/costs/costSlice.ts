import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
} from '@reduxjs/toolkit'
import { RootState } from '../../app/store'

export type MemberType = {
  id: number
  name: string
}

type GroupType = {
  id: number
  title: string
  cover: string
  members: MemberType[]
}

export type DealersType = {
  id: number
  name: string
  price: number
  propotion: number | 'fix'
}

export interface CostType {
  id: number
  costTime: string
  title: string
  note: string
  price: number
  payers: DealersType[]
  consumers: DealersType[]
  photos: string[]
}

type status = 'idle' | 'loading' | 'succeeded' | 'failed'
type error = string | undefined

const costsAdapter = createEntityAdapter<CostType>({
  selectId: (cost) => cost.id,
  sortComparer: (a, b) => b.costTime.localeCompare(a.costTime),
})

const membersAdapter = createEntityAdapter<MemberType>({
  selectId: (member) => member.id,
  sortComparer: (a, b) => a.id - b.id,
})

export const fetchAllCost = createAsyncThunk('costs/fetchcosts', async () => {
  const response = await fetch('http://localhost:3001/costs')
  if (response.ok) {
    const data = (await response.json()) as CostType[]
    return data
  }
  return Promise.reject(
    `fetch all costs failed
    status: ${response.status}, statusText: ${response.statusText}`
  )
})

export const fetchGroupById = createAsyncThunk(
  'costs/fetchGroupById',
  async (groupId: number) => {
    const response = await fetch(`http://localhost:3001/group/${groupId}`)
    if (response.ok) {
      const data = (await response.json()) as GroupType
      return data.members
    }
    return Promise.reject(`
   fetch single cost failed
   status: ${response.status}, statusText: ${response.statusText}`)
  }
)

export const deleteCost = createAsyncThunk(
  'costs/deleteCost',
  async (id: number) => {
    const response = await fetch(`http://localhost:3001/costs/${id}`, {
      method: 'DELETE',
    })
    if (response.ok) {
      return id
    }
    return Promise.reject(
      `status: ${response.status}, statusText: ${response.statusText}`
    )
  }
)

export const addCost = createAsyncThunk(
  'costs/addCost',
  async (payload: CostType) => {
    const response = await fetch(`http://localhost:3001/costs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (response.ok) {
      return payload
    }
    return Promise.reject(
      `status: ${response.status}, statusText: ${response.statusText}`
    )
  }
)

export const editCost = createAsyncThunk(
  'costs/editCost',
  async (payload: CostType) => {
    const response = await fetch(`http://localhost:3001/costs/${payload.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (response.ok) {
      return payload
    }
    return Promise.reject(
      `status: ${response.status}, statusText: ${response.statusText}`
    )
  }
)

const costSlice = createSlice({
  name: 'costs',
  initialState: costsAdapter.getInitialState({
    members: membersAdapter.getInitialState(),
    status: 'idle' as status,
    error: undefined as error,
  }),
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchGroupById.fulfilled, (state, action) => {
        membersAdapter.setAll(state.members, action.payload)
      })
      .addCase(fetchAllCost.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchAllCost.fulfilled, (state, action) => {
        state.status = 'succeeded'
        costsAdapter.setAll(state, action.payload)
      })
      .addCase(fetchAllCost.rejected, (state, action) => {
        (state.status = 'failed'), (state.error = action.error.message)
      })

      .addCase(deleteCost.fulfilled, (state, action) => {
        costsAdapter.removeOne(state, action.payload)
      })
      .addCase(addCost.fulfilled, (state, action) => {
        costsAdapter.setOne(state, action.payload)
      })
      .addCase(editCost.fulfilled, (state, action) => {
        costsAdapter.upsertOne(state, action.payload)
      })
  },
})

export const { selectAll: selectAllCosts, selectById: selectCostById } =
  costsAdapter.getSelectors((state: RootState) => state.costs)

export const {
  selectAll: selectGroupMembers,
  selectById: selectGroupMemberById,
  selectTotal: selectGroupMemberAmount,
} = membersAdapter.getSelectors((state: RootState) => state.costs.members)

export default costSlice.reducer
