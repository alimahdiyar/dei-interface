import React from 'react'
import { Search } from 'react-feather'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  border-radius: 10px;
  background: ${({ theme }) => theme.bg1};
  border: 1px solid ${({ theme }) => theme.border2};
  align-items: center;
  padding: 0 20px;
  height: 40px;
`

const Input = styled.input<{
  error: boolean
}>`
  background: transparent;
  font-size: 1rem;
  width: auto;
  outline: none;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  color: ${({ theme, error }) => (error ? theme.red3 : theme.text2)};
  border: none;
  padding: 0 20px;
  padding-left: 10px;
`
const SearchIcon = styled(Search)``

export default function SearchBox({
  query,
  onChange,
  error,
}: {
  query: string
  onChange: (q: string) => void
  error: boolean
}) {
  return (
    <Wrapper>
      <SearchIcon />
      <Input
        value={query}
        error={error}
        placeholder="DEUS, DEI, FTM, 0x..."
        onChange={(e) => onChange(e.target.value)}
      />
    </Wrapper>
  )
}
