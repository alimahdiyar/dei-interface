import React from 'react'
import styled from 'styled-components'

import { BorrowPool } from 'state/borrow/reducer'

import Hero, { HeroSubtext } from 'components/Hero'
import Disclaimer from 'components/Disclaimer'
import { Table } from 'components/App/Claim'

import { DeprecatedBorrowPools } from 'constants/borrow'

const Container = styled.div`
  display: flex;
  flex-flow: column nowrap;
  overflow: visible;
  margin: 0 auto;
`

const Wrapper = styled(Container)`
  margin: 0 auto;
  margin-top: 50px;
  width: clamp(250px, 90%, 1200px);

  & > * {
    &:nth-child(2) {
      margin-bottom: 25px;
      display: flex;
      flex-flow: row nowrap;
      width: 100%;
      gap: 15px;
      & > * {
        &:last-child {
          max-width: 300px;
        }
      }
    }
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-top: 20px;
  `}
`

export default function Reimburse() {
  return (
    <Container>
      <Hero>
        <div>Rewards</div>
        <HeroSubtext>claim your reminding rewards from old lenders</HeroSubtext>
      </Hero>
      <Wrapper>
        <Table options={DeprecatedBorrowPools as unknown as BorrowPool[]} />
      </Wrapper>
      <Disclaimer />
    </Container>
  )
}
