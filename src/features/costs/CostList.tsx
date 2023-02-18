import { useSelector, useDispatch } from 'react-redux'
import { selectAllCosts, fetchAllCost, fetchGroupById } from './costSlice'
import { RootState, AppDispatch } from '../../app/store'
import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@mui/material'

const CostList = () => {
  const dispatch: AppDispatch = useDispatch()
  const costs = useSelector(selectAllCosts)
  const CostStatus = useSelector((state: RootState) => state.costs.status)
  const CostError = useSelector((state: RootState) => state.costs.error)
  const navigate = useNavigate()
  let content

  useEffect(() => {
    if (CostStatus === 'idle') {
      dispatch(fetchGroupById(1))
      dispatch(fetchAllCost())
    }
  }, [])

  switch (CostStatus) {
    case 'loading':
      content = <p>Loaing</p>
      return content

    case 'failed':
      content = <p>{CostError}</p>
      return content

    default:
      content = costs.map((cost) => (
        <li className="costList__costItem" key={cost.id}>
          <Link to={`/${cost.id}`}>
            <div>
              <p className="costItem__title">{cost.title}</p>
              <p className="costItem__price">
                {cost.payers.map((payer) => payer.name).join(', ')} 先支付 NTD{' '}
                {cost.price}
              </p>
            </div>
            {cost.price && (
              <p className="costItem__userCost">{`NTD ${cost.price}`}</p>
            )}
          </Link>
        </li>
      ))
      break
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
