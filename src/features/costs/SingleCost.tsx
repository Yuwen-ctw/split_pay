import { selectSingleCost, deleteCost } from './costSlice'
import { useSelector, useDispatch } from 'react-redux'
import { AppDispatch } from '../../app/store'
import { useParams, Link, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { RootState } from '../../app/store'
import { Button } from '@mui/material'

const SingleCost = () => {
  const dispatch: AppDispatch = useDispatch()
  const { costId } = useParams()
  const navigate = useNavigate()

  const cost = useSelector((state: RootState) =>
    selectSingleCost(state, Number(costId))
  )

  const handleDeleteCost = () => {
    if (!costId) return
    dispatch(deleteCost(Number(costId)))
    navigate('/')
  }
  let content
  if (cost) {
    content = (
      <article className="singleCost__costItem">
        <div className="costItem__header">
          <h4 className="costItem__costTime">
            {dayjs(cost.costTime).format(`YYYY年MM月DD日 HH:mm`)}
          </h4>
          <p className="costItem__title--single">{cost.title}</p>
          <p className="costItem__price--single">NTD {cost.price}</p>
        </div>
        <div className="costItem__body">
          <ul className="costItem__payment">
            {cost.payers.map((payer) => (
              <p key={payer.name}>
                {payer.name} 支付 <span>NTD {payer.price}</span>
              </p>
            ))}
          </ul>
          <ul className="costItem__payment">
            {cost.consumers.map((member) => (
              <p key={member.name}>
                {member.name} 欠款 <span>NTD {member.price}</span>
              </p>
            ))}
          </ul>
          <p className="costItem__note">備註: {cost.note}</p>
          <ul className="costItem__imgContainer">
            {cost.photos.map((photo, index) => (
              <div key={index} className="costItem__imgWrapper">
                <a href={photo} target="_blank" rel="noreferrer">
                  <img src={photo} alt="cost photo" />
                </a>
              </div>
            ))}
          </ul>
        </div>
        <div className="singleCost__buttonWrapper">
          <Button
            variant="contained"
            color="inherit"
            size="large"
            fullWidth
            onClick={() => navigate('/')}
          >
            返回
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="info"
            size="large"
            fullWidth
            onClick={() => navigate(`/edit-cost/${costId}`)}
          >
            編輯
          </Button>
          <Button
            variant="contained"
            color="error"
            size="large"
            fullWidth
            onClick={handleDeleteCost}
          >
            刪除
          </Button>
        </div>
      </article>
    )
  } else {
    content = <p>Cannot find Cost</p>
  }

  return content
}

export default SingleCost
