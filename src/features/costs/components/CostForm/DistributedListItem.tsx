import {
  Checkbox,
  FilledInput,
  FormControlLabel,
  InputAdornment,
} from '@mui/material'
import { ChangeEvent } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../app/store'
import { selectGroupMemberById } from '../../costSlice'
import {
  selectConsumerById,
  selectPayerById,
} from '../../distributedPriceSlice'

interface DistributedListItemProps {
  memberId: number
  field: 'payers' | 'consumers'
  onToggle: (e: ChangeEvent<HTMLInputElement>) => void
  onPropotionChange: (e: ChangeEvent<HTMLInputElement>) => void
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void
}

const DistributedListItem = ({
  field,
  memberId,
  onToggle,
  onPropotionChange,
  onInputChange,
}: DistributedListItemProps) => {
  const memberInfo = useSelector((state: RootState) =>
    selectGroupMemberById(state, memberId)
  )
  if (!memberInfo) return null

  const dealerInfo =
    field === 'payers'
      ? useSelector((state: RootState) => selectPayerById(state, memberId))
      : useSelector((state: RootState) => selectConsumerById(state, memberId))

  const value = dealerInfo ? dealerInfo.price : ''
  let propotion: string | number = ''
  if (field === 'consumers' && dealerInfo) {
    propotion = dealerInfo.propotion === 'fix' ? '' : dealerInfo.propotion
  }
  return (
    <li className="advanceForm__dealerItem">
      <FormControlLabel
        control={
          <Checkbox
            id={`${memberInfo.id}`}
            checked={Boolean(dealerInfo)}
            onChange={onToggle}
            inputProps={{ 'aria-label': 'controlled' }}
          />
        }
        label={memberInfo.name}
      />
      <div>
        {field === 'consumers' && (
          <FilledInput
            id={`payer-propotion-${memberInfo.id}`}
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
                  typeof dealerInfo?.propotion === 'number'
                    ? '#a2a2a2'
                    : 'black',
              },
            }}
            onChange={onPropotionChange}
            startAdornment={
              <InputAdornment position="start">份數 </InputAdornment>
            }
          />
        )}
        <FilledInput
          id={`payer-${memberInfo.id}`}
          type="number"
          inputMode="numeric"
          value={value}
          inputProps={{
            style: {
              height: '42px',
              paddingBottom: '0px',
              paddingTop: '0px',
              color:
                typeof dealerInfo?.propotion === 'number' ? '#a2a2a2' : 'black',
            },
          }}
          onChange={onInputChange}
          startAdornment={
            <InputAdornment position="start">NTD </InputAdornment>
          }
        />
      </div>
    </li>
  )
}

export default DistributedListItem
