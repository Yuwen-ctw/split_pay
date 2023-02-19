import { ChangeEvent, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectGroupMembers } from '../../costSlice'
import Decimal from 'decimal.js-light'
// actions
import {
  addPayer,
  removePayer,
  editPayer,
  addConsumer,
  removeConsumer,
  editConsumerPrice,
  editConsumerPropotion,
  selectAllPayers,
  selectAllConsumers,
  selectPrice,
} from '../../distributedPriceSlice'
// components
import { Button, Alert } from '@mui/material'
import { showDistributedListType } from './CostForm'
import DistributedListItem from './DistributedListItem'

interface DistributedListProps {
  field: 'payers' | 'consumers'
  setShowDistributedList: React.Dispatch<
    React.SetStateAction<showDistributedListType>
  >
}

const DistributedList = ({
  field,
  setShowDistributedList,
}: DistributedListProps) => {
  const dispatch = useDispatch()
  const members = useSelector(selectGroupMembers)
  const [showAlert, setShowAlert] = useState<boolean>(false)
  const dealerList = useSelector(
    field === 'payers' ? selectAllPayers : selectAllConsumers
  )
  const price = useSelector(selectPrice)
  const sumPriceFromDealers = dealerList
    .reduce((preValue, curr) => preValue.plus(curr.price), new Decimal(0))
    .toNumber()
  const restPrice = new Decimal(price).minus(sumPriceFromDealers).toNumber()

  function handleTogglePayer(e: ChangeEvent<HTMLInputElement>): void {
    if (showAlert) setShowAlert(false)
    const memberInfo = members.find(
      (member) => member.id === Number(e.target.id)
    )
    if (!memberInfo) return

    if (e.target.checked) {
      field === 'payers'
        ? dispatch(addPayer(memberInfo))
        : dispatch(addConsumer(memberInfo))
    } else {
      field === 'payers'
        ? dispatch(removePayer(memberInfo.id))
        : dispatch(removeConsumer(memberInfo.id))
    }
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (showAlert) setShowAlert(false)

    const value = Math.floor(Number(e.target.value) * 1000) / 1000
    if (isNaN(value)) return
    const memberInfo = members.find(
      (member) => member.id === Number(e.target.id.replace('payer-', ''))
    )
    if (!memberInfo) return

    if (field === 'payers') {
      dispatch(editPayer(memberInfo, value))
    } else {
      dispatch(editConsumerPrice(memberInfo, value))
    }
  }

  function handlePropotionChange(e: ChangeEvent<HTMLInputElement>) {
    if (showAlert) setShowAlert(false)

    const propotion = Number(e.target.value.replace('.', ''))
    if (propotion < 0) return

    const memberInfo = members.find(
      (member) =>
        member.id === Number(e.target.id.replace('payer-propotion-', ''))
    )
    if (!memberInfo) return

    dispatch(editConsumerPropotion(memberInfo, propotion))
  }

  function handleComplete() {
    if (restPrice) return setShowAlert(true)
    setShowDistributedList('none')
  }

  const rows = members.map((member) => {
    return (
      <DistributedListItem
        key={member.id}
        memberId={member.id}
        field={field}
        onToggle={handleTogglePayer}
        onInputChange={handleInputChange}
        onPropotionChange={handlePropotionChange}
      />
    )
  })

  return (
    <div className="advanceForm">
      <div className="advanceForm__title">
        <div>
          <span> NTD {sumPriceFromDealers}</span> / <span> NTD {price}</span>
        </div>
        <p>剩餘 NTD {restPrice}</p>
      </div>
      <ul className="advanceForm__dealersList">{rows}</ul>
      <div className="advanceForm__buttons">
        {showAlert && (
          <Alert className="advanceForm__alert" severity="error">
            分帳尚未完成，剩餘 {restPrice} 元
          </Alert>
        )}
        <Button
          variant="contained"
          color="success"
          size="large"
          fullWidth
          onClick={handleComplete}
        >
          上一頁
        </Button>
      </div>
    </div>
  )
}

export default DistributedList
