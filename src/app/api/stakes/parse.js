const bitcoin = require('bitcoinjs-lib')

export const parseStakeResponse = (response) => {
  if (!response || !Array.isArray(response)) return []

  return response.map((stake) => ({
    ...stake,
    txHash: stake.txid || '',
    chain: isValidBitcoinAddress(stake.staker_address) || 'Unknown',
    amount: stake.amount || '0',
    height: stake.confirmed_height || 0,
    sender: stake.staker_address || '',
    fee: txHexToFee(stake.tx_content) || '0',
    timestamp: stake.timestamp || new Date().toISOString(),
  }))
}

export function isValidBitcoinAddress(address) {
  try {
    // Try mainnet
    try {
      bitcoin.address.toOutputScript(address, bitcoin.networks.bitcoin)
      return 'BTC mainnet'
    } catch {}

    // Try testnet
    try {
      bitcoin.address.toOutputScript(address, bitcoin.networks.testnet)
      return 'BTC testnet'
    } catch {}

    // Try regtest
    try {
      bitcoin.address.toOutputScript(address, bitcoin.networks.regtest)
      return 'BTC regtest'
    } catch {}

    return null
  } catch (e) {
    return null
  }
}

export function txHexToFee(txHex) {
  try {
    return '0'
  } catch (error) {
    console.error('Error parsing tx hex:', error)
    return '0'
  }
}
