import React, { useState } from 'react'
import styled from 'styled-components'
import { Card } from 'components/Card'
import SearchBox from './SearchBox'
import Liquid from './Liquid'
import EnhancedTable from './Table'

const Wrapper = styled(Card)`
  padding: 50px;
  max-width: 1300px;
  margin: 0 auto;
  margin-top: 50px;
`
const RowBetween = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  margin-bottom: 20px;
`

export default function Main() {
  const [query, setQuery] = useState('')
  const [error, setError] = useState(false)
  return (
    <Wrapper>
      <RowBetween>
        <SearchBox query={query} error={error} onChange={setQuery} />
        <Liquid balance={'15846.50'} status={''} />
      </RowBetween>
      <EnhancedTable />
    </Wrapper>
  )
}
