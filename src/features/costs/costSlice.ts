import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'

type GroupType = {
  id: number
  title: string
  cover: string
  members: {
    id: number
    name: string
  }[]
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

interface CostState {
  group: GroupType
  costs: CostType[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error?: string | null
}

const initialState: CostState = {
  group: {} as GroupType,
  costs: [],
  status: 'idle',
  error: null,
}

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
      return data
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
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchGroupById.fulfilled, (state, action) => {
        state.group = action.payload
      })
      .addCase(fetchAllCost.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchAllCost.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.costs = action.payload
      })
      .addCase(fetchAllCost.rejected, (state, action) => {
        (state.status = 'failed'), (state.error = action.error.message)
      })

      .addCase(deleteCost.fulfilled, (state, action) => {
        const nextstate = state.costs.filter(
          (cost) => cost.id !== action.payload
        )
        state.costs = nextstate
      })
      .addCase(addCost.fulfilled, (state, action) => {
        state.costs.push(action.payload)
      })
      .addCase(editCost.fulfilled, (state, action) => {
        const nextState = state.costs.map((cost) => {
          if (cost.id === action.payload.id) return action.payload
          return cost
        })
        state.costs = nextState
      })
  },
})

export const selectGroupData = (state: RootState) => state.costs.group
export const selectAllCosts = (state: RootState) => state.costs.costs
export const selectSingleCost = (state: RootState, id: number) =>
  state.costs.costs.find((cost) => cost.id === id)
export default costSlice.reducer
