import { BorrowPool, LenderVersion } from 'state/borrow/reducer'

export function getGlobalPoolDataCalls(pool: BorrowPool): any {
  if (pool.version == LenderVersion.V2) {
    return [
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
  }
  if (pool.version == LenderVersion.VENFT) {
    return [
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
        methodName: 'liquidationRatio ',
        callInputs: [],
      },
      {
        methodName: 'borrowOpeningFee',
        callInputs: [],
      },
      {
        methodName: 'accrueInfo',
        callInputs: [],
      },
    ]
  }
  if (pool.version == LenderVersion.V3) {
    const callInputs = [pool.id]
    return [
      {
        methodName: 'maxCap',
        callInputs: [],
      },
      {
        methodName: 'totalCollaterals',
        callInputs,
      },
      {
        methodName: 'totalBorrows',
        callInputs,
      },
      {
        methodName: 'liquidationRatios',
        callInputs,
      },
      {
        methodName: 'borrowOpeningFees',
        callInputs,
      },
      {
        methodName: 'accrueInfos',
        callInputs,
      },
    ]
  }
  return []
}

export function getUserPoolDataCalls(pool: BorrowPool, account: string | undefined | null): any {
  if (!account) return []

  if (pool.version == LenderVersion.V2 || pool.version == LenderVersion.VENFT) {
    const callInputs = [account]
    return [
      {
        methodName: 'userCollateral',
        callInputs,
      },
      {
        methodName: 'userBorrow',
        callInputs,
      },
      {
        methodName: 'getDebt',
        callInputs,
      },
    ]
  }

  if (pool.version == LenderVersion.V3) {
    const callInputs = [pool?.id, account]
    return [
      {
        methodName: 'userCollaterals',
        callInputs,
      },
      {
        methodName: 'userBorrows',
        callInputs,
      },
      {
        methodName: 'getDebt',
        callInputs,
      },
    ]
  }
  return []
}
