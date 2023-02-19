import {
  createSlice,
  createEntityAdapter,
  PayloadAction,
} from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import { DealersType, MemberType } from './costSlice'
import distributePrice from './utili/distributePrice'

const payersAdapter = createEntityAdapter<DealersType>({
  selectId: (payer) => payer.id,
  sortComparer: (a, b) => b.name.localeCompare(a.name),
})

const consumersAdapter = createEntityAdapter<DealersType>({
  selectId: (consumer) => consumer.id,
  sortComparer: (a, b) => b.name.localeCompare(a.name),
})

const distributedPriceSlice = createSlice({
  name: 'distributePrice',
  initialState: {
    price: 0,
    payers: payersAdapter.getInitialState(),
    consumers: consumersAdapter.getInitialState(),
  },
  reducers: {
    setPrice: (state, action: PayloadAction<number>) => {
      state.price = action.payload
    },
    setPayer: (state, action: PayloadAction<MemberType>) => {
      payersAdapter.setAll(state.payers, [
        { ...action.payload, price: state.price, propotion: 1 },
      ])
    },
    resetPayers: (state, action: PayloadAction<DealersType[]>) => {
      payersAdapter.setAll(state.payers, action.payload)
    },
    addPayer: {
      reducer(state, action: PayloadAction<DealersType>) {
        const payers = payersAdapter.getSelectors().selectAll(state.payers)
        payersAdapter.setAll(
          state.payers,
          distributePrice(state.price, [...payers, action.payload])
        )
      },
      prepare(memberInfo: MemberType) {
        return {
          payload: <DealersType>{
            ...memberInfo,
            price: 0,
            propotion: 1,
          },
        }
      },
    },
    removePayer: (state, action: PayloadAction<number>) => {
      payersAdapter.removeOne(state.payers, action.payload)
      const payers = payersAdapter.getSelectors().selectAll(state.payers)
      payersAdapter.setAll(state.payers, distributePrice(state.price, payers))
    },
    editPayer: {
      reducer(state, action: PayloadAction<DealersType>) {
        payersAdapter.upsertOne(state.payers, action.payload)
        const payers = payersAdapter.getSelectors().selectAll(state.payers)
        payersAdapter.setAll(state.payers, distributePrice(state.price, payers))
      },
      prepare(memberInfo: MemberType, price: number) {
        return {
          payload: <DealersType>{
            ...memberInfo,
            price,
            propotion: 'fix',
          },
        }
      },
    },
    resetConsumers: {
      reducer(state, action: PayloadAction<DealersType[]>) {
        const nextConsumers = distributePrice(state.price, action.payload)
        consumersAdapter.setAll(state.consumers, nextConsumers)
      },
      prepare(members: Partial<DealersType>[]) {
        const consumers = members.map((member) => ({
          ...member,
          propotion: member.propotion || 1,
          price: member.price || 0,
        }))
        return {
          payload: consumers as DealersType[],
        }
      },
    },
    addConsumer: {
      reducer(state, action: PayloadAction<DealersType>) {
        const consumers = consumersAdapter
          .getSelectors()
          .selectAll(state.consumers)
        consumersAdapter.setAll(
          state.consumers,
          distributePrice(state.price, [...consumers, action.payload])
        )
      },
      prepare(memberInfo: MemberType) {
        return {
          payload: <DealersType>{
            ...memberInfo,
            price: 0,
            propotion: 1,
          },
        }
      },
    },
    editConsumerPrice: {
      reducer(state, action: PayloadAction<DealersType>) {
        consumersAdapter.upsertOne(state.consumers, action.payload)
        const consumers = consumersAdapter
          .getSelectors()
          .selectAll(state.consumers)
        consumersAdapter.setAll(
          state.consumers,
          distributePrice(state.price, consumers)
        )
      },
      prepare(memberInfo: MemberType, price: number) {
        return {
          payload: <DealersType>{
            ...memberInfo,
            price,
            propotion: 'fix',
          },
        }
      },
    },
    editConsumerPropotion: {
      reducer(state, action: PayloadAction<DealersType>) {
        consumersAdapter.upsertOne(state.consumers, action.payload)
        const consumers = consumersAdapter
          .getSelectors()
          .selectAll(state.consumers)
        consumersAdapter.setAll(
          state.consumers,
          distributePrice(state.price, consumers)
        )
      },
      prepare(memberInfo: MemberType, propotion: number) {
        return {
          payload: <DealersType>{
            ...memberInfo,
            price: 0,
            propotion,
          },
        }
      },
    },
    removeConsumer: (state, action: PayloadAction<number>) => {
      consumersAdapter.removeOne(state.consumers, action.payload)
      const consumers = consumersAdapter
        .getSelectors()
        .selectAll(state.consumers)
      consumersAdapter.setAll(
        state.consumers,
        distributePrice(state.price, consumers)
      )
    },
  },
})

export const { selectAll: selectAllPayers, selectById: selectPayerById } =
  payersAdapter.getSelectors(
    (state: RootState) => state.distributedPrice.payers
  )
export const { selectAll: selectAllConsumers, selectById: selectConsumerById } =
  consumersAdapter.getSelectors(
    (state: RootState) => state.distributedPrice.consumers
  )
export const selectPrice = (state: RootState) => state.distributedPrice.price
export const {
  setPrice,
  setPayer,
  resetPayers,
  addPayer,
  editPayer,
  removePayer,
  resetConsumers,
  addConsumer,
  editConsumerPrice,
  editConsumerPropotion,
  removeConsumer,
} = distributedPriceSlice.actions
export default distributedPriceSlice.reducer
