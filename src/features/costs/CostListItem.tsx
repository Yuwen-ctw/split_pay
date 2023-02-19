import { Link } from 'react-router-dom'
import { selectCostById } from './costSlice'
import { useSelector } from 'react-redux'
import { RootState } from '../../app/store'

interface CostListItemProps {
  costId: number
}

const CostListItem = ({ costId }: CostListItemProps) => {
  const cost = useSelector((state: RootState) => selectCostById(state, costId))
  if (!cost) return null
  return (
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
  )
}

export default CostListItem
