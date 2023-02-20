import { useSelector, useDispatch } from 'react-redux'
import { selectAllCosts, fetchAllCost, fetchGroupById } from '../../costSlice'
import { RootState, AppDispatch } from '../../../../app/store'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@mui/material'
import CostListItem from './CostListItem'
import dayjs from 'dayjs'

const CostList = () => {
  const dispatch: AppDispatch = useDispatch()
  const costStatus = useSelector((state: RootState) => state.costs.status)
  const costError = useSelector((state: RootState) => state.costs.error)
  const costs = useSelector((state: RootState) => selectAllCosts(state)) || []
  const navigate = useNavigate()

  const content: JSX.Element[] = []
  useEffect(() => {
    if (costStatus === 'idle') {
      dispatch(fetchGroupById(1))
      dispatch(fetchAllCost())
    }
  }, [])

  switch (costStatus) {
    case 'loading':
      content.push(<p key={'loading'}>Loaing</p>)
      return content

    case 'failed':
      content.push(<p key={'failed'}>{costError}</p>)
      return content

    default: {
      if (!costs) return null
      let currentDate = ''
      costs.forEach((cost) => {
        const nextDate = dayjs(cost.costTime).format('YYYY/MM/DD')
        if (currentDate !== nextDate) {
          content.push(<h2 key={nextDate}>{nextDate}</h2>)
          currentDate = nextDate
        }
        content.push(<CostListItem key={cost.id} costId={cost.id} />)
      })
    }
  }

  return (
    <section className="costSection">
      <ul className="costSection__costList">{content}</ul>
      <div className="costSection__buttonWrapper">
        <Button
          variant="contained"
          color="success"
          size="large"
          onClick={() => navigate('/create-cost')}
        >
          新增
        </Button>
      </div>
    </section>
  )
}

export default CostList
