// hooks
import { ChangeEvent, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
// redux
import { useSelector, useDispatch } from 'react-redux'
import { AppDispatch } from '../../app/store'
import { selectUserData } from '../user/userSlice'
import { DealersType, addCost, editCost } from './costSlice'
// components & uti
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
  Checkbox,
  Button,
} from '@mui/material'
import AdvancedForm from './AdvancedForm'
import distributePrice from './utili/distributePrice'
import dayjs from 'dayjs'
import { CostFormType } from './WithCostForm'

interface Props {
  initFormData: CostFormType
}

export type distributedState = {
  price: number
  payers: DealersType[]
  consumers: DealersType[]
}

export type AdvancedFormStateType = 'payers' | 'consumers' | 'none'

const CostForm = ({ initFormData }: Props) => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const currentUser = useSelector(selectUserData)
  const [payState, setPayState] = useState<distributedState>({
    price: initFormData.price,
    payers: initFormData.payers,
    consumers: initFormData.consumers,
  })
  const payerNames = payState.payers.map((payer) => payer.name)
  const consumerNames = payState.consumers.map((consumer) => consumer.name)

  const priceRef = useRef<HTMLInputElement | null>(null)
  const [showAdvancedForm, setShowAdvancedForm] =
    useState<AdvancedFormStateType>('none')

  const { register, handleSubmit } = useForm<CostFormType>()

  function handlePriceChange(e: ChangeEvent<HTMLInputElement>) {
    const value = Number(e.target.value)
    const nextConsumers = distributePrice(value, payState.consumers)
    setPayState({
      ...payState,
      price: value,
      payers: [
        {
          id: currentUser.id,
          name: currentUser.name,
          price: value,
          propotion: 1,
        },
      ],
      consumers: nextConsumers,
    })
  }

  const handlePayerChange = (event: SelectChangeEvent<string>) => {
    const targetName = event.target.value
    const targetInfo = initFormData.members.find(
      (member) => member.name === targetName
    )
    if (!targetInfo) return
    setPayState({
      ...payState,
      payers: [
        {
          id: targetInfo.id,
          name: targetInfo.name,
          price: payState.price,
          propotion: 1,
        },
      ],
    })
  }
  const handleConsumerChange = (event: SelectChangeEvent<string[]>) => {
    const newConsumerNames = event.target.value
    let nextConsumers: DealersType[]
    if (payState.consumers.length > newConsumerNames.length) {
      // delete target
      nextConsumers = payState.consumers.filter((consumer) => {
        return newConsumerNames.includes(consumer.name)
      })
    } else {
      // add target
      let targetName: string
      for (let i = 0; i < newConsumerNames.length; i++) {
        const index = payState.consumers.findIndex(
          (consumer) => consumer.name === newConsumerNames[i]
        )
        if (index === -1) {
          targetName = newConsumerNames[i]
          break
        }
      }
      const targetInfo = initFormData.members.find(
        (member) => member.name === targetName
      )
      if (!targetInfo) return
      nextConsumers = [
        ...payState.consumers,
        { ...targetInfo, propotion: 1, price: 0 },
      ]
    }
    nextConsumers = distributePrice(payState.price, nextConsumers)
    setPayState({ ...payState, consumers: nextConsumers })
  }

  function onSubmit(data: CostFormType) {
    const times = data.time.split(':')
    const date = dayjs(data.date)
      .hour(Number(times[0]))
      .minute(Number(times[1]))
      .toISOString()
    const temPayload = {
      costTime: date,
      payers: payState.payers,
      consumers: payState.consumers,
      price: payState.price,
      title: data.title,
      note: data.note,
      photos: [],
    }
    // edit Cost
    if (initFormData.id) {
      dispatch(editCost({ ...temPayload, id: initFormData.id }))
    } else {
      // add Cost
      const newId = Math.floor(Math.random() * 1000)
      dispatch(addCost({ ...temPayload, id: newId }))
    }
    navigate('/')
  }

  const isInvalidPrice = (value: string | number | undefined): boolean => {
    if (!value) return false
    if (typeof value === 'string' && value.length === 0) return false
    return isNaN(Number(value))
  }

  function handleShowAdvancedForm(field: AdvancedFormStateType) {
    if (isInvalidPrice(priceRef.current?.value)) return
    setShowAdvancedForm(field)
  }

  return (
    <div className="costForm__wrapper">
      <form className="costForm" onSubmit={handleSubmit(onSubmit)}>
        <div className="costForm__body">
          <div>
            <input
              type="date"
              defaultValue={initFormData.date}
              {...register('date', { required: true, valueAsDate: true })}
            />
            <input
              defaultValue={initFormData.time}
              type="time"
              {...register('time', { required: true, pattern: /^\d\d:\d\d/ })}
            />
          </div>
          <TextField
            id="filled-basic"
            label="品項"
            variant="filled"
            defaultValue={initFormData.title}
            {...register('title', { required: true })}
            placeholder="請輸入品項名稱"
          />
          <TextField
            id="filled-basic"
            defaultValue={initFormData.price || ''}
            error={isInvalidPrice(priceRef.current?.value)}
            helperText={
              isInvalidPrice(priceRef.current?.value)
                ? '請輸入正確的數字格式'
                : ''
            }
            label="金額(NTD)"
            variant="filled"
            type="text"
            inputMode="numeric"
            inputRef={priceRef}
            {...register('price', {
              required: true,
              valueAsNumber: true,
              onChange: handlePriceChange,
            })}
          />
          <FormControl>
            <div className="costForm__payerSelect">
              <label>誰先付</label>
              <Select
                value={payerNames[0]}
                onChange={handlePayerChange}
                renderValue={() => payerNames.join(', ')}
              >
                <MenuItem value={''} style={{ visibility: 'hidden' }} />
                {initFormData.members.map((member) => (
                  <MenuItem key={member.id} value={member.name}>
                    {member.name}
                  </MenuItem>
                ))}
              </Select>
              <button
                type="button"
                onClick={() => handleShowAdvancedForm('payers')}
              >
                設定
              </button>
            </div>
          </FormControl>
          <FormControl>
            <div className="costForm__payerSelect">
              <label>分給誰</label>
              <Select
                multiple
                value={consumerNames}
                onChange={handleConsumerChange}
                renderValue={(selected) => {
                  const isEvenly = payState.consumers.every(
                    (consumer) => consumer.propotion === 1
                  )
                  const prfix = isEvenly ? '均分給 ' : ''
                  return prfix.concat(selected.join(', '))
                }}
              >
                <MenuItem value={''} style={{ visibility: 'hidden' }} />
                {initFormData.members.map((member) => (
                  <MenuItem key={member.id} value={member.name}>
                    <Checkbox
                      checked={consumerNames.indexOf(member.name) > -1}
                    />
                    {member.name}
                  </MenuItem>
                ))}
              </Select>
              <button
                type="button"
                onClick={() => handleShowAdvancedForm('consumers')}
              >
                設定
              </button>
            </div>
          </FormControl>
          <TextField
            id="filled-basic"
            defaultValue={initFormData.note}
            label="備註"
            variant="filled"
            placeholder="請輸入備註"
            {...register('note')}
          />
        </div>
        <div className="costSection__buttonWrapper">
          <Button
            variant="contained"
            color="error"
            size="large"
            fullWidth
            onClick={() => navigate(-1)}
          >
            返回
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="success"
            size="large"
            fullWidth
          >
            確定
          </Button>
        </div>
      </form>
      {showAdvancedForm !== 'none' && (
        <AdvancedForm
          field={showAdvancedForm}
          payState={payState}
          setPayState={setPayState}
          setShowAdvancedForm={setShowAdvancedForm}
        />
      )}
    </div>
  )
}

export default CostForm
