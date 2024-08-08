const request = async (method, params) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_AXELARSCAN_API_URL}/${method}`, { method: 'POST', body: JSON.stringify(params) }).catch(error => { return null })
  return response && await response.json()
}

export const getChains = async () => await request('getChains')
export const getAssets = async () => await request('getAssets')
export const getITSAssets = async () => await request('getITSAssets')
export const getTokensPrice = async params => await request('getTokensPrice', params)
export const getInflation = async params => await request('getInflation', params)
export const getNetworkParameters = async params => await request('getNetworkParameters', params)
export const getBalances = async params => await request('getBalances', params)
export const getAccountAmounts = async params => await request('getAccountAmounts', params)
export const getProposals = async () => await request('getProposals')
export const getProposal = async params => await request('getProposal', params)
export const getTVL = async params => await request('getTVL', params)
