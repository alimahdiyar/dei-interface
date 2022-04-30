import {
  HasVeNFTToSellBridge,
  provider,
  SellVeNFTBridge,
  signer,
  TEST_ADDRESS_NEVER_USE_SHORTENED,
  ZeroBalanceVeNFTBridge,
} from '../support/commands'

describe('Landing Page', () => {
  const setupEthBridge = () => {
    cy.on('window:before:load', (win) => {
      // @ts-ignore
      win.ethereum = new ZeroBalanceVeNFTBridge(signer, provider)
    })
  }

  it('is connected', () => {
    setupEthBridge()
    cy.visit('/venft/sell/')
    cy.get('[data-testid=wallet-connect]', { timeout: 1000 }).contains(TEST_ADDRESS_NEVER_USE_SHORTENED)
  })

  it('gets VeNFT balance', () => {
    const ethBridge = new ZeroBalanceVeNFTBridge(signer, provider)
    cy.on('window:before:load', (win) => {
      // @ts-ignore
      win.ethereum = ethBridge
      cy.spy(ethBridge, 'VeNFTBalanceOf')
    })

    cy.visit('/venft/sell/')

    cy.wait(1000)
    cy.window().then((win) => {
      expect(ethBridge.VeNFTBalanceOf).to.have.callCount(1)
    })
    cy.get(`[data-testid=venft-sell-no-results]`)
  })

  it('loads VeNFT list', () => {
    const ethBridge = new HasVeNFTToSellBridge(signer, provider)
    cy.on('window:before:load', (win) => {
      // @ts-ignore
      win.ethereum = ethBridge
      cy.spy(ethBridge, 'VeNFTBalanceOf')
      cy.spy(ethBridge, 'tokenOfOwnerByIndex')
      cy.spy(ethBridge, 'veNFTLockedData')
    })

    cy.visit('/venft/sell/')
    const expectTokenId = ethBridge.tokens.sort((a: any, b: any) => a.tokenId - b.tokenId)[1].tokenId
    cy.get(`[data-testid=venft-sell-row-1-token-id]`, { timeout: 2000 }).contains(expectTokenId)
    cy.window().then((win) => {
      expect(ethBridge.VeNFTBalanceOf).to.have.callCount(1)
      expect(ethBridge.tokenOfOwnerByIndex).to.have.callCount(2)
      expect(ethBridge.veNFTLockedData).to.have.callCount(2)
    })
  })

  it('sells VeNFT', () => {
    const ethBridge = new SellVeNFTBridge(signer, provider)
    cy.on('window:before:load', (win) => {
      // @ts-ignore
      win.ethereum = ethBridge
      cy.spy(ethBridge, 'sellVeNFTSpy')
    })

    cy.visit('/venft/sell/')
    const expectTokenId = ethBridge.tokens.sort((a: any, b: any) => a.tokenId - b.tokenId)[1].tokenId
    cy.get(`[data-testid=venft-sell-row-1-action]`, { timeout: 2000 }).click()
    cy.wait(500)
    cy.window().then((win) => {
      expect(ethBridge.sellVeNFTSpy).to.have.calledWith(expectTokenId)
    })
  })
})