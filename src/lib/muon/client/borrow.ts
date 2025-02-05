import { MuonResponse, IError } from '../types'
import { Type, isError, getErrorMessage } from '../error'
import { MuonClient } from './base'
import { MUON_BASE_URL } from '../config'

interface RequestParams {
  token: string
  hashTimestamp: boolean
}

interface CollateralPriceData {
  success: true
  data: {
    response: MuonResponse
    calldata: {
      price: string
      reqId: string
      timestamp: number
      sigs: {
        signature: string
        owner: string
        nonce: string
      }[]
    }
  }
}

export class BorrowClient extends MuonClient {
  constructor(baseURL?: string) {
    super({
      baseURL: baseURL ?? MUON_BASE_URL,
      nSign: 4,
      APP_ID: 'dei_oracles_vwap',
      APP_METHOD: 'lp_price',
    })
  }

  private _getRequestParams(contract: string): Type<RequestParams> {
    if (!contract) return new Error('Param `contract` is missing.')

    const address = this._getChecksumAddress(contract)
    if (!address) return new Error('Param `contract` is not a valid address.')

    return {
      token: address,
      hashTimestamp: true,
    }
  }

  public async getCollateralPrice(contract: string): Promise<CollateralPriceData | IError> {
    try {
      const requestParams = this._getRequestParams(contract)
      if (isError(requestParams)) throw new Error(requestParams.message)
      console.info('Requesting data from Muon: ', requestParams)

      const response = await this._makeRequest(requestParams)
      if (isError(response)) throw new Error(response.message)
      console.info('Response from Muon: ', response)

      if ('error' in response) {
        throw new Error(response.error)
      } else if (!response.success || !response.result.confirmed) {
        throw new Error('An unknown Muon error has occurred')
      }

      const result = response.result
      const reqId = `0x${result?.cid?.substring(1)}`
      const signature = result?.signatures[0]?.signature
      const owner = result?.signatures[0]?.owner
      const nonce = result?.data?.init?.nonceAddress
      const sigs = [
        {
          signature,
          owner,
          nonce,
        },
      ]

      return {
        success: true,
        data: {
          response,
          calldata: {
            price: result?.data?.result?.tokenPrice,
            timestamp: result?.signatures[0]?.result?.timestamp,
            reqId,
            sigs,
          },
        },
      }
    } catch (err) {
      console.error(err)
      return {
        success: false,
        error: getErrorMessage(err),
      }
    }
  }
}
