import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  DealersType,
  MemberType,
  selectCostById,
  selectGroupMembers,
} from './costSlice'
import { selectUserData } from '../user/userSlice'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import CostForm from './CostForm'
import { RootState } from '../../app/store'
import {
  resetConsumers,
  resetPayers,
  setPayer,
  setPrice,
} from './distributedPriceSlice'

export interface CostFormType {
  id?: number
  date: string
  time: string
  title: string
  note: string
  price?: number
  payers?: DealersType[]
  consumers?: DealersType[]
  members?: MemberType[]
}

const WithCostForm = () => {
  const { costId } = useParams()
  const currentUser = useSelector(selectUserData)
  const [formData, setFormData] = useState<CostFormType | null>(null)
  const members = useSelector(selectGroupMembers)
  const cost = useSelector((state: RootState) =>
    selectCostById(state, Number(costId))
  )
  const dispatch = useDispatch()
  useEffect(() => {
    if (!cost) {
      const nextFormData = {
        date: dayjs(Date.now()).format('YYYY-MM-DD'),
        time: dayjs(Date.now()).format('HH:mm'),
        title: '',
        note: '',
      }
      setFormData(nextFormData)
      const Payer: MemberType = {
        id: currentUser.id,
        name: currentUser.name,
      }
      dispatch(setPrice(0))
      dispatch(setPayer(Payer))
      dispatch(resetConsumers(members))
    } else {
      setFormData({
        id: cost.id,
        date: dayjs(cost.costTime).format('YYYY-MM-DD'),
        time: dayjs(cost.costTime).format('HH:mm'),
        title: cost.title,
        note: cost.note,
      })
      dispatch(setPrice(cost.price))
      dispatch(resetPayers(cost.payers))
      dispatch(resetConsumers(cost.consumers))
    }
  }, [cost, members, currentUser])

  if (!formData) return null
  return <CostForm initFormData={formData} />
}

export default WithCostForm
