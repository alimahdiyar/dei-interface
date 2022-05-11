import React, { useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import Pagination from 'components/Pagination'
import { PrimaryButton } from 'components/Button'
import { Cel, Head, Row, TableWrapper, Wrapper } from 'components/Table'
import { AccountVenftToken } from 'hooks/useVeNFT'
import dayjs from 'dayjs'
import useActiveWeb3React from 'hooks/useWeb3'
import useApproveNftCallback, { ApprovalState } from 'hooks/useApproveNftCallback'
import { Vault, veNFT } from 'constants/addresses'
import { useVeNFTContract } from 'hooks/useContract'
import { DotFlashing } from 'components/Icons'
import { useVaultCallback, VaultAction } from 'hooks/useVaultCallback'

const VeNFTCel = styled(Cel)`
  ${({ theme }) => theme.mediaWidth.upToMedium`
    :nth-child(3),
    :nth-child(4) {
      display: none;
    }
  `}
  ${({ theme }) => theme.mediaWidth.upToSmall`
    :nth-child(2) {
      display: none;
    }
  `}
`

const itemsPerPage = 10
export default function TableDeposit({ veNFTTokens }: { veNFTTokens: AccountVenftToken[] }) {
  const [offset, setOffset] = useState(0)

  const paginatedOptions = useMemo(() => {
    return veNFTTokens.slice(offset, offset + itemsPerPage)
  }, [veNFTTokens, offset])

  const pageCount = useMemo(() => {
    return Math.ceil(veNFTTokens.length / itemsPerPage)
  }, [veNFTTokens])

  const onPageChange = ({ selected }: { selected: number }) => {
    setOffset(Math.ceil(selected * itemsPerPage))
  }

  return (
    <Wrapper>
      <TableWrapper>
        <Head>
          <tr>
            <Cel>Token ID</Cel>
            <Cel>You Will Get</Cel>
            <Cel>Time</Cel>
            <Cel>Deposit</Cel>
          </tr>
        </Head>
        <tbody>
          {paginatedOptions.length ? (
            paginatedOptions.map((item: AccountVenftToken, index) => (
              <TableRow veNFTToken={item} index={index} key={index} />
            ))
          ) : (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }} data-testid="venft-deposit-no-results">
                No Results Found
              </td>
            </tr>
          )}
        </tbody>
      </TableWrapper>
      {paginatedOptions.length > 0 && <Pagination pageCount={pageCount} onPageChange={onPageChange} />}
    </Wrapper>
  )
}

function TableRow({ veNFTToken, index }: { veNFTToken: AccountVenftToken; index: number }) {
  const { chainId } = useActiveWeb3React()
  const [approvalState, approve] = useApproveNftCallback(
    veNFTToken.tokenId,
    chainId ? veNFT[chainId] : undefined,
    useVeNFTContract(),
    chainId ? Vault[chainId] : undefined
  )
  const { callback: depositVeNFTCallback } = useVaultCallback(veNFTToken.tokenId, VaultAction.DEPOSIT)

  const [loading, setLoading] = useState(false)

  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const handleDepositVeNFT = async () => {
    if (loading) return
    setLoading(true)
    if (approvalState === ApprovalState.APPROVED) {
      try {
        await depositVeNFTCallback?.()
      } catch (e) {
        console.log('deposit failed')
        console.log(e)
      }
    } else {
      try {
        await approve()
      } catch (e) {
        console.log('approve failed')
        console.log(e)
      }
    }
    if (mounted.current) {
      setLoading(false)
    }
  }

  const buttonText = useMemo(() => (approvalState === ApprovalState.APPROVED ? 'Deposit' : 'Approve'), [approvalState])

  return (
    <Row>
      <VeNFTCel data-testid={`venft-deposit-row-${index}-token-id`}>veNFT #{veNFTToken.tokenId.toNumber()}</VeNFTCel>
      <VeNFTCel>{veNFTToken.needsAmount.toString()} fSolid</VeNFTCel>
      <VeNFTCel>{dayjs.utc(new Date(veNFTToken.endTime.toNumber() * 1000)).fromNow(true)}</VeNFTCel>
      <VeNFTCel style={{ padding: '5px 10px' }}>
        <PrimaryButton data-testid={`venft-deposit-row-${index}-action`} onClick={handleDepositVeNFT}>
          {buttonText}{' '}
          {(approvalState === ApprovalState.PENDING || loading) && <DotFlashing data-testid="venft-deposit-loading" />}
        </PrimaryButton>
      </VeNFTCel>
    </Row>
  )
}