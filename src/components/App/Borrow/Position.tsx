import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'

import { BorrowPool } from 'state/borrow/reducer'
import { useCurrenciesFromPool } from 'state/borrow/hooks'
import {
  useAvailableToBorrow,
  useCollateralPrice,
  useGlobalPoolData,
  useLiquidationPrice,
  useUserPoolData,
} from 'hooks/usePoolData'
import { useLPData } from 'hooks/useLPData'
import { useGeneralLenderContract } from 'hooks/useContract'
import { formatAmount, formatDollarAmount } from 'utils/numbers'

import { Card } from 'components/Card'
import { DotFlashing, Info } from 'components/Icons'
import { CardTitle } from 'components/Title'
import { ToolTip } from 'components/ToolTip'
import { PrimaryButton } from 'components/Button'
import useWeb3React from '../../../hooks/useWeb3'

const Wrapper = styled(Card)`
  display: flex;
  flex-flow: column nowrap;
  gap: 10px;
  max-width: 280px;

  & > * {
    &:last-child {
      margin-top: auto;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    max-width: 100%;
  `}
`

const Column = styled.div`
  display: flex;
  flex-flow: column nowrap;
  gap: 2px;
`

const Row = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;

  & > * {
    font-size: 0.6rem;
    &:last-child {
      margin-left: auto;
    }
  }
`

const SubLabel = styled.div`
  font-size: 0.5rem;
  margin-left: 25px;
`

const StyledPrimaryButton = styled(PrimaryButton)`
  font-size: 0.8rem;
  padding: 1rem 0;
`

export default function Position({ pool }: { pool: BorrowPool }) {
  const { borrowCurrency } = useCurrenciesFromPool(pool)
  const { userCollateral, userDebt } = useUserPoolData(pool)
  const borrowable = useAvailableToBorrow(pool)
  const { maxCap, borrowedElastic, borrowFee } = useGlobalPoolData(pool)
  const collateralPrice = useCollateralPrice(pool)
  const liquidationPrice = useLiquidationPrice(pool)
  const generalLender = useGeneralLenderContract(pool)
  const { balance0, balance1 } = useLPData(pool)
  const [awaitingClaimConfirmation, setAwaitingClaimConfirmation] = useState<boolean>(false)
  const { account } = useWeb3React()

  const borrowSymbol = useMemo(() => {
    return borrowCurrency?.symbol ?? ''
  }, [borrowCurrency])

  const collateralUSDValue = useMemo(() => {
    return new BigNumber(userCollateral).times(collateralPrice).toNumber()
  }, [userCollateral, collateralPrice])

  const onClaim = useCallback(async () => {
    try {
      if (!generalLender || !account) return
      setAwaitingClaimConfirmation(true)
      await generalLender.claimAndWithdraw([pool.lpPool], account)
      setAwaitingClaimConfirmation(false)
    } catch (err) {
      console.error(err)
      setAwaitingClaimConfirmation(false)
    }
  }, [generalLender, pool, account])

  function getClaimButton() {
    if (awaitingClaimConfirmation) {
      return (
        <StyledPrimaryButton active>
          Awaiting Confirmation <DotFlashing style={{ marginLeft: '10px' }} />
        </StyledPrimaryButton>
      )
    }
    return <StyledPrimaryButton onClick={onClaim}>Claim Rewards</StyledPrimaryButton>
  }
  const numerator = (100 - Number(borrowFee.toSignificant())) / 100

  return (
    <Wrapper>
      <CardTitle>Your Position</CardTitle>
      <PositionRow
        label="Max Cap"
        value={`${formatAmount(parseFloat(maxCap), 0)} DEI`}
        explanation="Max Capacity for borrowing DEI"
      />
      <PositionRow
        label="Total Remaining Cap"
        value={`${formatAmount((parseFloat(maxCap) - parseFloat(borrowedElastic)) * numerator, 0)} DEI`}
        explanation="Total Remaining Capacity for borrowing DEI"
      />
      <PositionRow
        label="Collateral Deposited"
        value={formatAmount(parseFloat(userCollateral), 4)}
        explanation="Amount of Tokens Deposited as Collateral"
      />
      <PositionRow
        label="Collateral Value"
        value={formatDollarAmount(collateralUSDValue, 4)}
        explanation={`${borrowSymbol} Value of the Collateral Deposited in your Position`}
      />
      <PositionRow
        label="Outstanding Debt"
        value={`${formatAmount(parseFloat(userDebt), 4)} DEI`}
        explanation={`${borrowSymbol} Amount that is considered Debt`}
      />
      <PositionRow
        label="LP Token Price"
        value={`${formatDollarAmount(parseFloat(collateralPrice), 4)}`}
        explanation="LP Token Price"
      />
      <PositionRow
        label="Liquidation Price"
        value={`${formatDollarAmount(parseFloat(liquidationPrice), 4)}`}
        explanation="Collateral Price at which your Position will be Liquidated"
      />
      <PositionRow
        label={`${borrowSymbol} Left to Borrow`}
        value={`${formatAmount(parseFloat(borrowable), 0)} DEI`}
        explanation={`${borrowSymbol} Borrowable based on the Collateral Deposited`}
      />
      <PositionRow
        label="Underlying LP Rewards"
        subLabel={`${formatAmount(parseFloat(balance0), 2)} SOLID + ${formatAmount(parseFloat(balance1), 2)} SEX`}
        value=""
        explanation="SEX + SOLID your position has earned so far"
      />
      {getClaimButton()}
    </Wrapper>
  )
}

function PositionRow({
  label,
  subLabel,
  value,
  explanation,
}: {
  label: string
  subLabel?: string
  value: string
  explanation: string
}) {
  return (
    <Column>
      <Row>
        <ToolTip id="id" />
        <Info data-for="id" data-tip={explanation} size={15} />
        <div>{label}</div>
        <div>{value}</div>
      </Row>
      {subLabel && <SubLabel>{subLabel}</SubLabel>}
    </Column>
  )
}