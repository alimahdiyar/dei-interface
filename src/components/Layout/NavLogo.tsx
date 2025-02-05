import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import Image from 'next/image'
import { isMobile } from 'react-device-detect'

import { useIsDarkMode } from 'state/user/hooks'

const Container = styled.div`
  margin-right: auto;
`

const Wrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  width: fit-content;

  &:hover {
    cursor: pointer;
  }

  & > div {
    display: flex;
    align-items: center;
    &:first-child {
      margin-right: 10px;
    }
  }
`

export default function NavLogo() {
  const darkMode = useIsDarkMode()

  return (
    <Container>
      <Link href="/borrow" passHref>
        <Wrapper>
          <div>
            <Image src={'/static/images/DeiLogo.svg'} alt="App Logo" width={30} height={30} />
          </div>
          {!isMobile && (
            <div>
              <Image
                src={darkMode ? '/static/images/DeiText.svg' : '/static/images/DeiText.svg'}
                width={55}
                height={30}
                alt="App Logo"
              />
            </div>
          )}
        </Wrapper>
      </Link>
    </Container>
  )
}
