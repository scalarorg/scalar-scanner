const request = async (method, params) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_TOKEN_TRANSFER_API_URL}/${method}`, { method: 'POST', body: JSON.stringify(params) }).catch(error => { return null })
  return response && await response.json()
}

export const searchTransfers = async params => await request('searchTransfers', params)
export const transfersStats = async params => await request('transfersStats', params)
export const transfersChart = async params => await request('transfersChart', params)
export const transfersTotalVolume = async params => await request('transfersTotalVolume', params)
export const transfersTotalFee = async params => await request('transfersTotalFee', params)
export const transfersTotalActiveUsers = async params => await request('transfersTotalActiveUsers', params)
export const transfersTopUsers = async params => await request('transfersTopUsers', params)
export const searchDepositAddresses = async params => await request('searchDepositAddresses', params)
export const searchBatches = async params => await request('searchBatches', params)
export const getBatch = async (chain, batchId) => await request('lcd', { path: `/axelar/evm/v1beta1/batched_commands/${chain}/${batchId}` })
