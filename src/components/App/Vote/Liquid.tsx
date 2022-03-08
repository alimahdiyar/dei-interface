import React from 'react'
import { Loader } from 'react-feather'

import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  border-radius: 10px;
  background: ${({ theme }) => theme.bg0};
  border: 1px solid ${({ theme }) => theme.border1};
  align-items: center;
  padding: 0 20px;
  height: 40px;
`

const Label = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  font-weight: bold;
  font-size: 1rem;
  color: ${({ theme }) => theme.blue1};
`

const Symbol = styled.div`
  font-weight: bold;
  color: ${({ theme }) => theme.blue1};
  margin-left: 8px;
  font-size: 1rem;
`

export default function Liquid({ balance, status }: { balance: string; status: string }) {
  return (
    <Wrapper>
      {/* <Description>Your Balance:</Description> */}
      <Label>
        {status === 'LOADING' ? <Loader height={'20px'} /> : balance} <Symbol>LIQUID</Symbol>
      </Label>
    </Wrapper>
  )
}
