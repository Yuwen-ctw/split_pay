import { DealersType } from '../costSlice'
import Decimal from 'decimal.js-light'

const distributePrice = (price: number, arry: DealersType[]): DealersType[] => {
  let totalPropotion = 0
  const fixedPrice = arry.reduce((preValue, curr) => {
    if (curr.propotion === 'fix') {
      return preValue + curr.price
    }
    totalPropotion += curr.propotion
    return preValue
  }, 0)
  const restPrice = price - fixedPrice
  const prices = getSplitCosts(restPrice, totalPropotion)

  const result = arry.map((payer) => {
    if (payer.propotion !== 'fix') {
      const getPriceByPropotion = prices.splice(0, payer.propotion)
      const sumCost = getPriceByPropotion
        .reduce((preValue, curr) => preValue.plus(curr), new Decimal(0))
        .toNumber()
      return { ...payer, price: sumCost }
    } else {
      return payer
    }
  })

  return result
}

function getSplitCosts(price: number, totalPropotion: number): number[] {
  const groups = []
  for (const number of distributeNumber(price, totalPropotion)) {
    console.log(new Decimal(number).toNumber())
    groups.push(number)
  }

  function* distributeNumber(total: number, divider: number) {
    if (divider === 0) {
      yield 0
    } else if (divider === 1) {
      yield Math.round(total * 1000) / 1000
    } else {
      // 取至小數第 3 位 -> * 1000
      let rest = (total * 1000) % divider
      const result = (total / divider) * 1000
      for (let i = 0; i < divider; i++) {
        if (rest-- >= 1) {
          yield Math.ceil(result) / 1000
        } else {
          yield Math.floor(result) / 1000
        }
      }
    }
  }
  return groups
}

export default distributePrice
