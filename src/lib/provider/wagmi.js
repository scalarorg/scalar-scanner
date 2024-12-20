import { QueryClient } from '@tanstack/react-query'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import {
  arbitrum,
  arbitrumSepolia,
  aurora,
  auroraTestnet,
  avalanche,
  avalancheFuji,
  base,
  baseSepolia,
  blast,
  blastSepolia,
  bsc,
  bscTestnet,
  celo,
  celoAlfajores,
  fantom,
  fantomTestnet,
  filecoin,
  filecoinCalibration,
  fraxtal,
  fraxtalTestnet,
  immutableZkEvm,
  immutableZkEvmTestnet,
  kava,
  kavaTestnet,
  linea,
  lineaSepolia,
  mainnet,
  mantle,
  mantleSepoliaTestnet,
  moonbaseAlpha,
  moonbeam,
  optimism,
  optimismSepolia,
  polygon,
  polygonAmoy,
  polygonZkEvm,
  polygonZkEvmTestnet,
  scroll,
  scrollSepolia,
  sepolia,
} from 'wagmi/chains'

import { toArray } from '@/lib/parser'

/**
 * NEXT_PUBLIC_CUSTOM_EVM_CHAINS=[_id=ethereum-local,id=1337,network=ethereum-local,name=Ethereum Local,nativeCurrencyName=Ethereum Local,nativeCurrencySymbol=ETH,nativeCurrencDecimals=18,rpcUrlsDefaultHttp=http://192.168.1.254:8545,blockExplorersDefaultName=Ethereum Local Explorer,blockExplorersDefaultUrl=http://192.168.1.254:5100<>]
 */

const parseCustomEvmChains = () => {
  const customEvmChainsEnv = process.env.NEXT_PUBLIC_CUSTOM_EVM_CHAINS

  if (!customEvmChainsEnv) return []
  if (customEvmChainsEnv === '[]') return []
  if (!(customEvmChainsEnv.startsWith('[') && customEvmChainsEnv.endsWith(']')))
    return []

  // Remove the surrounding brackets and split by commas
  const chainString = customEvmChainsEnv.slice(1, -1)
  const chainArray = chainString.split('<>')

  // remove undefined

  chainArray.forEach((chain, index) => {
    if (!chain) {
      chainArray.splice(index, 1)
    }
  })

  return chainArray.map((chain) => {
    const pairs = chain.split(',')
    const tmp = pairs.reduce((acc, pair) => {
      const [key, value] = pair.split('=')
      acc[key] = value
      return acc
    }, {})

    return {
      _id: tmp._id,
      id: tmp.id,
      network: tmp.network,
      name: tmp.name,
      nativeCurrency: {
        name: tmp.nativeCurrencyName,
        symbol: tmp.nativeCurrencySymbol,
        decimals: tmp.nativeCurrencDecimals,
      },
      rpcUrls: {
        default: { http: [tmp.rpcUrlsDefaultHttp] },
      },
      blockExplorers: {
        default: {
          name: tmp.blockExplorersDefaultName,
          url: tmp.blockExplorersDefaultUrl,
        },
      },
    }
  })
}

const customEvmChains = parseCustomEvmChains()

const defaultMainnetChains = [
  { _id: 'ethereum', ...mainnet },
  { _id: 'binance', ...bsc },
  { _id: 'polygon', ...polygon },
  { _id: 'polygon-zkevm', ...polygonZkEvm },
  { _id: 'avalanche', ...avalanche },
  { _id: 'fantom', ...fantom },
  { _id: 'moonbeam', ...moonbeam },
  { _id: 'aurora', ...aurora },
  { _id: 'arbitrum', ...arbitrum },
  { _id: 'optimism', ...optimism },
  { _id: 'base', ...base },
  { _id: 'mantle', ...mantle },
  { _id: 'celo', ...celo },
  { _id: 'kava', ...kava },
  { _id: 'filecoin', ...filecoin },
  { _id: 'linea', ...linea },
  {
    _id: 'centrifuge',
    id: 2031,
    network: 'centrifuge',
    name: 'Centrifuge',
    nativeCurrency: { name: 'Centrifuge', symbol: 'CFG', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://fullnode.parachain.centrifuge.io'] },
    },
    blockExplorers: {
      default: {
        name: 'Centrifuge',
        url: 'https://centrifuge.subscan.io',
      },
    },
  },
  { _id: 'scroll', ...scroll },
  { _id: 'immutable', ...immutableZkEvm },
  { _id: 'fraxtal', ...fraxtal },
  { _id: 'blast', ...blast },
]

const defaultTestnetChains = [
  { _id: 'ethereum-sepolia', ...sepolia },
  // { _id: 'ethereum-2', ...goerli },
  { _id: 'binance', ...bscTestnet },
  // { _id: 'polygon', ...polygonMumbai },
  { _id: 'polygon-sepolia', ...polygonAmoy },
  { _id: 'polygon-zkevm', ...polygonZkEvmTestnet },
  { _id: 'avalanche', ...avalancheFuji },
  { _id: 'fantom', ...fantomTestnet },
  { _id: 'moonbeam', ...moonbaseAlpha },
  { _id: 'aurora', ...auroraTestnet },
  // { _id: 'arbitrum', ...arbitrumGoerli },
  { _id: 'arbitrum-sepolia', ...arbitrumSepolia },
  // { _id: 'optimism', ...optimismGoerli },
  { _id: 'optimism-sepolia', ...optimismSepolia },
  // { _id: 'base', ...baseGoerli },
  { _id: 'base-sepolia', ...baseSepolia },
  // { _id: 'mantle', ...mantleTestnet },
  { _id: 'mantle-sepolia', ...mantleSepoliaTestnet },
  { _id: 'celo', ...celoAlfajores },
  { _id: 'kava', ...kavaTestnet },
  // { _id: 'filecoin', ...filecoinHyperspace },
  { _id: 'filecoin-2', ...filecoinCalibration },
  // { _id: 'linea', ...lineaTestnet },
  { _id: 'linea-sepolia', ...lineaSepolia },
  // { _id: 'centrifuge', id: 2089, network: 'centrifuge', name: 'Centrifuge', nativeCurrency: { name: 'Algol', symbol: 'ALGL', decimals: 18 }, rpcUrls: { default: { http: ['https://fullnode.algol.cntrfg.com/rpc'] } }, blockExplorers: { default: { name: 'Centrifuge', url: '' } }, testnet: true },
  {
    _id: 'centrifuge-2',
    id: 2090,
    network: 'centrifuge',
    name: 'Centrifuge',
    nativeCurrency: { name: 'Algol', symbol: 'ALGL', decimals: 18 },
    rpcUrls: { default: { http: ['https://fullnode.demo.k-f.dev'] } },
    blockExplorers: { default: { name: 'Centrifuge', url: '' } },
    testnet: true,
  },
  { _id: 'scroll', ...scrollSepolia },
  { _id: 'immutable', ...immutableZkEvmTestnet },
  process.env.NEXT_PUBLIC_ENVIRONMENT !== 'testnet' && {
    _id: 'immutable-devnet',
    id: 15003,
    network: 'immutable',
    name: 'Immutable',
    nativeCurrency: { name: 'ImmutableX', symbol: 'tIMX', decimals: 18 },
    rpcUrls: { default: { http: ['https://rpc.dev.immutable.com'] } },
    blockExplorers: {
      default: {
        name: 'Immutable',
        url: 'https://explorer.testnet.immutable.com',
      },
    },
    testnet: true,
  },
  { _id: 'fraxtal', ...fraxtalTestnet },
  { _id: 'blast-sepolia', ...blastSepolia },
]

export const CHAINS = toArray(
  process.env.NEXT_PUBLIC_ENVIRONMENT === 'mainnet'
    ? [...defaultMainnetChains, ...customEvmChains]
    : [...defaultTestnetChains, ...customEvmChains],
)

export const queryClient = new QueryClient()

export const wagmiConfig = defaultWagmiConfig({
  chains: CHAINS,
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  metadata: {
    name: 'Scalarscan',
    description: process.env.NEXT_PUBLIC_DEFAULT_TITLE,
    icons: ['/icons/favicon-32x32.png'],
  },
})

export const Web3Modal = createWeb3Modal({
  wagmiConfig,
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  chains: CHAINS,
  themeVariables: {},
  excludeWalletIds: [
    '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927',
  ],
})
