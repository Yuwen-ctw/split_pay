// hooks
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
// redux
import { useSelector, useDispatch } from 'react-redux'
import { AppDispatch } from '../../../../app/store'
import { selectUserData } from '../../../user/userSlice'
import {
  addCost,
  editCost,
  selectGroupMembers,
  MemberType,
} from '../../costSlice'
import {
  setPrice,
  setPayer,
  resetConsumers,
  selectAllPayers,
  selectPrice,
  selectAllConsumers,
} from '../../distributedPriceSlice'
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
import AdvancedForm from './DistributedList'
import { CostFormType } from '../WithCostForm'
import dayjs from 'dayjs'

interface Props {
  initFormData: CostFormType
}

export type showDistributedListType = 'payers' | 'consumers' | 'none'

const CostForm = ({ initFormData }: Props) => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const currentUser = useSelector(selectUserData)
  const members = useSelector(selectGroupMembers)
  const price = useSelector(selectPrice)
  const payers = useSelector(selectAllPayers)
  const consumers = useSelector(selectAllConsumers)

  const [showDistributedList, setShowDistributedList] =
    useState<showDistributedListType>('none')
  const { register, handleSubmit, control, getValues } = useForm<CostFormType>()

  function handlePriceChange() {
    let value = getValues('price')
    if (!value) value = 0
    if (isNaN(value)) return

    // payload: reset payer to currentUser
    const payer = { id: currentUser.id, name: currentUser.name }
    // payload: reset the distributed price evenly
    const nextConsumers: MemberType[] = consumers.map((consumer) => {
      return { id: consumer.id, name: consumer.name }
    })
    dispatch(setPrice(value))
    dispatch(setPayer(payer))
    dispatch(resetConsumers(nextConsumers))
  }

  const handlePayerChange = (event: SelectChangeEvent<string>) => {
    const targetName = event.target.value
    const targetInfo = members.find((member) => member.name === targetName)
    if (!targetInfo) return
    dispatch(
      setPayer({
        ...targetInfo,
      })
    )
  }
  const handleConsumerChange = (event: SelectChangeEvent<string[]>) => {
    const selectedValues = event.target.value as string[]
    if (selectedValues.length === 0) return

    const nextConsumers: MemberType[] = []
    selectedValues.forEach((name) => {
      const memberInfo = members.find((member) => member.name === name)
      memberInfo && nextConsumers.push(memberInfo)
      dispatch(resetConsumers(nextConsumers))
    })
  }

  function onSubmit(data: CostFormType) {
    if (!price) return
    const times = data.time.split(':')
    const date = dayjs(data.date)
      .hour(Number(times[0]))
      .minute(Number(times[1]))
      .toISOString()
    const temPayload = {
      costTime: date,
      payers,
      consumers,
      price,
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
            id="costForm-title"
            label="品項"
            variant="filled"
            defaultValue={initFormData.title}
            {...register('title', { required: true })}
            placeholder="請輸入品項名稱"
          />
          <Controller
            control={control}
            name="price"
            rules={{
              required: true,
              onChange: handlePriceChange,
            }}
            render={({ field }) => (
              <TextField
                {...field}
                id="costForm-price"
                placeholder="0"
                value={price === 0 ? '' : price}
                label="金額(NTD)"
                variant="filled"
                type="text"
                inputMode="numeric"
              />
            )}
          />

          <FormControl>
            <div className="costForm__payerSelect">
              <label>誰先付</label>
              <Select
                value={payers.length ? payers[0].name : ''}
                onChange={handlePayerChange}
                renderValue={() => payers.map((el) => el.name).join(', ')}
              >
                <MenuItem value={''} style={{ visibility: 'hidden' }} />
                {members.map((member) => (
                  <MenuItem key={member.id} value={member.name}>
                    {member.name}
                  </MenuItem>
                ))}
              </Select>
              <button
                type="button"
                onClick={() => setShowDistributedList('payers')}
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
                value={consumers.map((el) => el.name)}
                onChange={handleConsumerChange}
                renderValue={(selected) => {
                  const isEvenly = consumers.every(
                    (consumer) => consumer.propotion === 1
                  )
                  const prfix = isEvenly ? '均分給 ' : ''
                  return prfix.concat(selected.join(', '))
                }}
              >
                <MenuItem value={''} style={{ visibility: 'hidden' }} />
                {members.map((member) => (
                  <MenuItem key={member.id} value={member.name}>
                    <Checkbox
                      checked={
                        consumers.findIndex((el) => el.name === member.name) >
                        -1
                      }
                    />
                    {member.name}
                  </MenuItem>
                ))}
              </Select>
              <button
                type="button"
                onClick={() => setShowDistributedList('consumers')}
              >
                設定
              </button>
            </div>
          </FormControl>
          <TextField
            id="costForm-note"
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
      {showDistributedList !== 'none' && (
        <AdvancedForm
          field={showDistributedList}
          setShowDistributedList={setShowDistributedList}
        />
      )}
    </div>
  )
}

export default CostForm
