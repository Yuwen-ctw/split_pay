import { ChangeEvent, useState } from 'react'
import { useSelector } from 'react-redux'
import { selectGroupData, DealersType } from './costSlice'
import {
  FilledInput,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Button,
  Alert,
} from '@mui/material'
import { distributedState, AdvancedFormStateType } from './CostForm'
import distributePrice from './utili/distributePrice'
import Decimal from 'decimal.js-light'

interface AdvancedFormProps {
  field: 'payers' | 'consumers'
  payState: distributedState
  setPayState: React.Dispatch<React.SetStateAction<distributedState>>
  setShowAdvancedForm: React.Dispatch<
    React.SetStateAction<AdvancedFormStateType>
  >
}

const AdvancedForm = ({
  field,
  payState,
  setPayState,
  setShowAdvancedForm,
}: AdvancedFormProps) => {
  // copy Dealers from props
  const [dealers, setDealers] = useState<DealersType[]>(payState[field])
  const [invalidPay, setInvalidPay] = useState<boolean>(false)
  const groupData = useSelector(selectGroupData)

  const sumPriceFromDealers = dealers
    .reduce((preValue, curr) => preValue.plus(curr.price), new Decimal(0))
    .toNumber()
  const restPrice = new Decimal(payState.price)
    .minus(sumPriceFromDealers)
    .toNumber()

  function handleTogglePayer(e: ChangeEvent<HTMLInputElement>): void {
    if (invalidPay) setInvalidPay(false)
    const targetInfo = groupData.members.find(
      (member) => member.id === Number(e.target.id)
    )
    if (!targetInfo) return
    const targetInDealers = dealers.find(
      (dealer) => dealer.id === Number(e.target.id)
    )
    let nextDealers: DealersType[]
    if (!targetInDealers) {
      // add payer
      nextDealers = [...dealers, { ...targetInfo, price: 0, propotion: 1 }]
    } else {
      // remove payer
      nextDealers = dealers.filter((dealer) => dealer.id !== targetInDealers.id)
    }
    setDealers(() => distributePrice(payState.price, nextDealers))
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (invalidPay) setInvalidPay(false)
    const value = Math.floor(Number(e.target.value) * 1000) / 1000
    if (isNaN(value)) return

    const targetInfo = groupData.members.find(
      (member) => member.id === Number(e.target.id.replace('payer-', ''))
    )
    if (!targetInfo) return
    const targetInDealersIndex = dealers.findIndex(
      (dealer) => dealer.id === Number(e.target.id.replace('payer-', ''))
    )

    const nextDealers: DealersType[] = [...dealers]
    if (targetInDealersIndex !== -1) {
      // edit payer's price if exist in payerList
      nextDealers[targetInDealersIndex] = {
        ...targetInfo,
        price: value,
        propotion: 'fix',
      }
    } else {
      // add payer
      nextDealers.push({
        id: targetInfo.id,
        name: targetInfo.name,
        propotion: 'fix',
        price: value,
      })
    }
    setDealers(() => distributePrice(payState.price, nextDealers))
  }

  function handlePropotionChange(e: ChangeEvent<HTMLInputElement>) {
    if (invalidPay) setInvalidPay(false)
    const propotion = Number(e.target.value.replace('.', ''))
    if (propotion < 0) return
    const targetInfo = groupData.members.find(
      (member) =>
        member.id === Number(e.target.id.replace('payer-propotion-', ''))
    )
    if (!targetInfo) return
    const indexInDealers = dealers.findIndex(
      (dealer) =>
        dealer.id === Number(e.target.id.replace('payer-propotion-', ''))
    )
    const nextDealers: DealersType[] = [...dealers]
    if (indexInDealers !== -1) {
      // edit payer's price if exist in payerList
      nextDealers[indexInDealers] = {
        ...targetInfo,
        propotion,
        price: 0,
      }
    } else {
      // add payer
      nextDealers.push({
        id: targetInfo.id,
        name: targetInfo.name,
        propotion: propotion,
        price: 0,
      })
    }
    setDealers(() => distributePrice(payState.price, nextDealers))
  }

  function handleComplete() {
    if (restPrice) {
      setInvalidPay(true)
      return
    }
    const nextState: distributedState = { ...payState, [field]: dealers }
    setPayState(nextState)
    setShowAdvancedForm('none')
  }

  const rows = groupData.members.map((member) => {
    const targetInfo = dealers.find((dealer) => dealer.id === member.id)
    let value
    if (targetInfo) {
      value = targetInfo.price === 0 ? '' : targetInfo.price
    } else {
      value = ''
    }
    const checked = dealers.some((dealer) => dealer.id === member.id)
    let propotion: string | number = ''
    if (field === 'consumers' && targetInfo) {
      propotion =
        typeof targetInfo.propotion === 'string' ? '' : targetInfo.propotion
    }
    return (
      <li className="advanceForm__dealerItem" key={member.id}>
        <FormControlLabel
          control={
            <Checkbox
              id={`${member.id}`}
              checked={checked}
              onChange={handleTogglePayer}
              inputProps={{ 'aria-label': 'controlled' }}
            />
          }
          label={member.name}
        />
        <div>
          {field === 'consumers' && (
            <FilledInput
              id={`payer-propotion-${member.id}`}
              type="number"
              inputMode="numeric"
              value={propotion}
              sx={{ width: '100px', marginRight: '5px' }}
              inputProps={{
                style: {
                  height: '42px',
                  paddingBottom: '0px',
                  paddingTop: '0px',
                  color:
                    typeof targetInfo?.propotion === 'number'
                      ? '#a2a2a2'
                      : 'black',
                },
              }}
              onChange={handlePropotionChange}
              startAdornment={
                <InputAdornment position="start">份數 </InputAdornment>
              }
            />
          )}
          <FilledInput
            id={`payer-${member.id}`}
            type="number"
            inputMode="numeric"
            value={value}
            inputProps={{
              style: {
                height: '42px',
                paddingBottom: '0px',
                paddingTop: '0px',
                color:
                  typeof targetInfo?.propotion === 'number'
                    ? '#a2a2a2'
                    : 'black',
              },
            }}
            onChange={handleInputChange}
            startAdornment={
              <InputAdornment position="start">NTD </InputAdornment>
            }
          />
        </div>
      </li>
    )
  })

  return (
    <div className="advanceForm">
      <div className="advanceForm__title">
        <div>
          <span> NTD {sumPriceFromDealers}</span> /{' '}
          <span> NTD {payState.price}</span>
        </div>
        <p>剩餘 NTD {restPrice}</p>
      </div>
      <ul className="advanceForm__dealersList">{rows}</ul>
      <div className="advanceForm__buttons">
        {invalidPay && (
          <Alert className="advanceForm__alert" severity="error">
            分帳尚未完成，剩餘 {restPrice} 元
          </Alert>
        )}
        <Button
          variant="contained"
          color="error"
          size="large"
          fullWidth
          onClick={() => setShowAdvancedForm('none')}
        >
          取消
        </Button>
        <Button
          variant="contained"
          color="success"
          size="large"
          fullWidth
          onClick={handleComplete}
        >
          完成
        </Button>
      </div>
    </div>
  )
}

export default AdvancedForm
