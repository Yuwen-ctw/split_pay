import { useSelector, useDispatch } from 'react-redux'
import { selectAllCosts, fetchAllCost, fetchGroupById } from '../../costSlice'
import { RootState, AppDispatch } from '../../../../app/store'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@mui/material'
import CostListItem from './CostListItem'

const CostList = () => {
  const dispatch: AppDispatch = useDispatch()
  const costStatus = useSelector((state: RootState) => state.costs.status)
  const costError = useSelector((state: RootState) => state.costs.error)
  const costs = useSelector((state: RootState) => selectAllCosts(state)) || []
  const navigate = useNavigate()

  let content
  useEffect(() => {
    if (costStatus === 'idle') {
      dispatch(fetchGroupById(1))
      dispatch(fetchAllCost())
    }
  }, [])

  switch (costStatus) {
    case 'loading':
      content = <p>Loaing</p>
      return content

    case 'failed':
      content = <p>{costError}</p>
      return content

    default:
      if (!costs) return null
      content = costs.map((cost) => (
        <CostListItem key={cost.id} costId={cost.id} />
      ))
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
