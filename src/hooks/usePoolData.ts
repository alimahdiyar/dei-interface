import { useMemo } from 'react'
import { formatUnits } from '@ethersproject/units'
import { Percent } from '@sushiswap/core-sdk'
import BigNumber from 'bignumber.js'
import { Interface } from '@ethersproject/abi'
import { AddressZero } from '@ethersproject/constants'

import { BorrowPool } from 'state/borrow/reducer'
import { useMultipleContractSingleData, useSingleContractMultipleMethods } from 'state/multicall/hooks'
import { useGeneralLenderContract, useLenderManagerContract, useOracleContract } from './useContract'
import GENERAL_LENDER_ABI from 'constants/abi/GENERAL_LENDER.json'

import { DEI_TOKEN } from 'constants/borrow'
import { constructPercentage, ONE_HUNDRED_PERCENT } from 'utils/prices'
import useWeb3React from './useWeb3'

export function useUserPoolData(pool: BorrowPool): {
  userCollateral: string
  userBorrow: string
  userCap: string
  userDebt: string
  userHolder: string
} {
  const { account } = useWeb3React()
  const generalLenderContract = useGeneralLenderContract(pool)
  const lenderManagerContract = useLenderManagerContract()

  const collateralBorrowCalls = useMemo(
    () =>
      !account
        ? []
        : [
            {
              methodName: 'userCollateral',
              callInputs: [account],
            },
            {
              methodName: 'userBorrow',
              callInputs: [account],
            },
          ],
    [account]
  )

  const userHolderCalls = useMemo(
    () =>
      !account
        ? []
        : [
            {
              methodName: 'userHolder',
              callInputs: [account],
            },
          ],
    [account]
  )

  const userCapCalls = useMemo(
    () =>
      !account
        ? []
        : [
            {
              methodName: 'getCap',
              callInputs: [account],
            },
          ],
    [account]
  )

  const [userCollateral, userBorrow] = useSingleContractMultipleMethods(generalLenderContract, collateralBorrowCalls)
  const [userHolder] = useSingleContractMultipleMethods(generalLenderContract, userHolderCalls)
  const [userCap] = useSingleContractMultipleMethods(lenderManagerContract, userCapCalls)

  const { userCollateralValue, userBorrowValue, userCapValue } = useMemo(
    () => ({
      userCollateralValue:
        collateralBorrowCalls.length && userCollateral?.result
          ? formatUnits(userCollateral.result[0], pool.contract.decimals)
          : '0',
      userBorrowValue:
        collateralBorrowCalls.length && userBorrow?.result
          ? formatUnits(userBorrow.result[0], DEI_TOKEN.decimals)
          : '0',
      userCapValue: userCapCalls.length && userCap?.result ? formatUnits(userCap.result[0], DEI_TOKEN.decimals) : '0',
    }),
    [collateralBorrowCalls, userCapCalls, userCollateral, userBorrow, userCap, pool]
  )

  const debtCalls = useMemo(
    () =>
      !account || !parseFloat(userBorrowValue)
        ? []
        : [
            {
              methodName: 'getDebt',
              callInputs: [account],
            },
          ],
    [account, userBorrowValue]
  )

  const [userDebt] = useSingleContractMultipleMethods(generalLenderContract, debtCalls)
  const userDebtValue = useMemo(
    () => (debtCalls.length && userDebt?.result ? formatUnits(userDebt.result[0], DEI_TOKEN.decimals) : '0'),
    [debtCalls, userDebt]
  )

  const userHolderAddress = useMemo(
    () => (userHolderCalls.length && userHolder?.result ? userHolder?.result[0].toString() : AddressZero),
    [userHolderCalls, userHolder]
  )

  return useMemo(
    () => ({
      userCollateral: userCollateralValue,
      userBorrow: userBorrowValue,
      userCap: userCapValue,
      userDebt: userDebtValue,
      userHolder: userHolderAddress,
    }),
    [userCollateralValue, userBorrowValue, userCapValue, userDebtValue, userHolderAddress]
  )
}

export function useGlobalPoolData(pool: BorrowPool): {
  maxCap: string
  totalCollateral: string
  borrowedElastic: string
  borrowedBase: string
  liquidationRatio: Percent
  borrowFee: Percent
  interestPerSecond: number
} {
  const generalLenderContract = useGeneralLenderContract(pool)

  const calls = [
    {
      methodName: 'maxCap',
      callInputs: [],
    },
    {
      methodName: 'totalCollateral',
      callInputs: [],
    },
    {
      methodName: 'totalBorrow',
      callInputs: [],
    },
    {
      methodName: 'LIQUIDATION_RATIO',
      callInputs: [],
    },
    {
      methodName: 'BORROW_OPENING_FEE',
      callInputs: [],
    },
    {
      methodName: 'accrueInfo',
      callInputs: [],
    },
  ]

  const [maxCap, totalCollateral, totalBorrow, liquidationRatio, borrowFee, accrueInfo] =
    useSingleContractMultipleMethods(generalLenderContract, calls)

  return useMemo(
    () => ({
      maxCap: maxCap?.result ? formatUnits(maxCap.result[0], pool.contract.decimals) : '0',
      totalCollateral: totalCollateral?.result ? formatUnits(totalCollateral.result[0], pool.contract.decimals) : '0',
      borrowedElastic: totalBorrow?.result ? formatUnits(totalBorrow.result[0], pool.contract.decimals) : '0',
      borrowedBase: totalBorrow?.result ? formatUnits(totalBorrow.result[1], pool.contract.decimals) : '0',
      liquidationRatio: liquidationRatio?.result
        ? constructPercentage(Number(formatUnits(liquidationRatio.result[0], 18))) // LIQUIDATION_RATIO_PRECISION
        : constructPercentage(0.8),
      borrowFee: borrowFee?.result
        ? constructPercentage(Number(formatUnits(borrowFee.result[0], 18))) // BORROW_OPENING_FEE_PRECISION
        : constructPercentage(0.005),
      interestPerSecond: accrueInfo?.result ? Number(formatUnits(accrueInfo.result[2], 18)) : 0,
    }),
    [pool, maxCap, totalCollateral, totalBorrow, liquidationRatio, borrowFee, accrueInfo]
  )
}

export function useGlobalDEIBorrowed(pools: BorrowPool[]): {
  borrowedBase: string
  borrowedElastic: string
} {
  const contracts = useMemo(() => pools.map((pool) => pool.generalLender), [pools])
  const results = useMultipleContractSingleData(contracts, new Interface(GENERAL_LENDER_ABI), 'totalBorrow', [])

  const elasticSum = useMemo(() => {
    return results.reduce((acc, value, index) => {
      if (value.error || !value.result) return acc
      const amount = formatUnits(value.result[0], pools[index].contract.decimals)
      acc = acc.plus(amount)
      return acc
    }, new BigNumber('0'))
  }, [results, pools])

  const baseSum = useMemo(() => {
    return results.reduce((acc, value, index) => {
      if (value.error || !value.result) return acc
      const amount = formatUnits(value.result[1], pools[index].contract.decimals)
      acc = acc.plus(amount)
      return acc
    }, new BigNumber('0'))
  }, [results, pools])

  return useMemo(
    () => ({
      borrowedBase: baseSum.toString(),
      borrowedElastic: elasticSum.toString(),
    }),
    [baseSum, elasticSum]
  )
}

export function useCollateralPrice(pool: BorrowPool): string {
  const oracleContract = useOracleContract(pool)
  const [price] = useSingleContractMultipleMethods(oracleContract, [{ methodName: 'getPrice', callInputs: [] }])
  return useMemo(() => (price?.result ? formatUnits(price.result[0], 18) : '0'), [price])
}

export function useAvailableForWithdrawal(pool: BorrowPool): {
  availableForWithdrawal: string
  availableForWithdrawalFactored: string
} {
  const { userCollateral, userDebt } = useUserPoolData(pool)
  const { liquidationRatio } = useGlobalPoolData(pool)
  const collateralPrice = useCollateralPrice(pool)

  const result = useMemo(() => {
    if (!parseFloat(collateralPrice) || !parseFloat(userCollateral)) {
      return '0'
    }
    const liquidationPrice = new BigNumber(liquidationRatio.toSignificant()).div(100).times(collateralPrice)
    const minimumCollateral = new BigNumber(userDebt).div(liquidationPrice)
    const withdrawable = new BigNumber(userCollateral).minus(minimumCollateral)
    return withdrawable.gt(0) ? withdrawable.toPrecision(pool.contract.decimals) : '0'
  }, [userCollateral, userDebt, liquidationRatio, collateralPrice, pool])

  return {
    availableForWithdrawal: result,
    availableForWithdrawalFactored: new BigNumber(result).times(0.995).toString(),
  }
}

export function useAvailableToBorrow(pool: BorrowPool): string {
  const { userCollateral } = useUserPoolData(pool)
  const { liquidationRatio, borrowFee } = useGlobalPoolData(pool)
  const collateralPrice = useCollateralPrice(pool)
  const { availableForWithdrawal } = useAvailableForWithdrawal(pool)

  const borrowFeeMultipler = useMemo(() => {
    return ONE_HUNDRED_PERCENT.subtract(borrowFee).divide(100).toSignificant()
  }, [borrowFee])

  return useMemo(() => {
    if (!parseFloat(collateralPrice) || !parseFloat(userCollateral) || !parseFloat(availableForWithdrawal)) {
      return '0'
    }
    return new BigNumber(availableForWithdrawal)
      .times(collateralPrice)
      .times(liquidationRatio.toSignificant())
      .div(100)
      .times(borrowFeeMultipler)
      .times(1 - 0.005) //1 - health ratio
      .toPrecision(pool.contract.decimals)
  }, [userCollateral, liquidationRatio, availableForWithdrawal, collateralPrice, pool, borrowFeeMultipler])
}

// TODO ADD CORRECT LOGIC

/**
  uint256 userCollateralAmount = userCollateral[user];
  if (userCollateralAmount == 0) return 0;

  uint256 liquidationPrice = (getDebt(user) * 1e18 * 1e18) /
      (userCollateralAmount * LIQUIDATION_RATIO);
 */

export function useLiquidationPrice(pool: BorrowPool): string {
  const { liquidationRatio } = useGlobalPoolData(pool)
  const { userCollateral, userDebt } = useUserPoolData(pool)

  return useMemo(() => {
    if (!liquidationRatio || !parseFloat(userCollateral) || !parseFloat(userDebt)) {
      return '0'
    }
    const liquidationPrice = new BigNumber(userDebt)
      .div(liquidationRatio.toSignificant())
      .times(100)
      .div(userCollateral)
    // .times(1e18)853014145177894607214922

    return liquidationPrice.toPrecision(pool.contract.decimals)
  }, [userCollateral, userDebt, liquidationRatio, pool])
}