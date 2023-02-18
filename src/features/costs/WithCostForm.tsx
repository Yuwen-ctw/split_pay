import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { DealersType, selectGroupData, selectSingleCost } from './costSlice'
import { selectUserData } from '../user/userSlice'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import CostForm from './CostForm'
import { RootState } from '../../app/store'

export interface CostFormType {
  id?: number
  date: string
  time: string
  title: string
  note: string
  price: number
  payers: DealersType[]
  consumers: DealersType[]
  members: { id: number; name: string }[]
}

const WithCostForm = () => {
  const { costId } = useParams()
  const currentUser = useSelector(selectUserData)
  const groupData = useSelector(selectGroupData)
  const [formData, setFormData] = useState<CostFormType | null>(null)
  const cost = useSelector((state: RootState) =>
    selectSingleCost(state, Number(costId))
  )

  useEffect(() => {
    if (!cost) {
      const consumers: DealersType[] = groupData.members.map((member) => ({
        ...member,
        propotion: 1,
        price: 0,
      }))

      const nextFormData = {
        date: dayjs(Date.now()).format('YYYY-MM-DD'),
        time: dayjs(Date.now()).format('HH:mm'),
        title: '',
        note: '',
        price: 0,
        payers: [
          {
            id: currentUser.id,
            name: currentUser.name,
            propotion: 1,
            price: 0,
          },
        ],
        consumers,
        members: groupData.members,
      }
      setFormData(nextFormData)
    } else {
      setFormData({
        id: cost.id,
        date: dayjs(cost.costTime).format('YYYY-MM-DD'),
        time: dayjs(cost.costTime).format('HH:mm'),
        title: cost.title,
        note: cost.note,
        price: cost.price,
        payers: cost.payers,
        consumers: cost.consumers,
        members: groupData.members,
      })
    }
  }, [cost, groupData.members, currentUser])

  if (!formData) return null
  return <CostForm initFormData={formData} />
}

export default WithCostForm
