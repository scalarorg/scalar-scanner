'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Fragment, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, Listbox, Transition } from '@headlessui/react'
import clsx from 'clsx'
import _ from 'lodash'
import {
  MdOutlineRefresh,
  MdOutlineFilterList,
  MdClose,
  MdCheck,
  MdOutlineTimer,
} from 'react-icons/md'
import { LuChevronsUpDown } from 'react-icons/lu'
import { PiWarningCircle } from 'react-icons/pi'

import { Container } from '@/components/Container'
import { Overlay } from '@/components/Overlay'
import { Button } from '@/components/Button'
import { DateRangePicker } from '@/components/DateRangePicker'
import { Image } from '@/components/Image'
import { Copy } from '@/components/Copy'
import { Spinner } from '@/components/Spinner'
import { Tag } from '@/components/Tag'
import { Number } from '@/components/Number'
import { Profile, ChainProfile } from '@/components/Profile'
import { ExplorerLink } from '@/components/ExplorerLink'
import { TimeAgo, TimeSpent } from '@/components/Time'
import { getParams, getQueryString, Pagination } from '@/components/Pagination'
import { useGlobalStore } from '@/components/Global'
import { searchTransfers } from '@/lib/api/token-transfer'
import { ENVIRONMENT, getAssetData } from '@/lib/config'
import { split, toArray } from '@/lib/parser'
import {
  isString,
  equalsIgnoreCase,
  capitalize,
  toBoolean,
  ellipse,
  toTitle,
} from '@/lib/string'
import { isNumber, formatUnits } from '@/lib/number'

const size = 25

function Filters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [params, setParams] = useState(getParams(searchParams, size))
  const { handleSubmit } = useForm()
  const { chains, assets } = useGlobalStore()

  const onSubmit = (e1, e2, _params) => {
    _params = _params || params
    if (!_.isEqual(_params, getParams(searchParams, size))) {
      router.push(`${pathname}?${getQueryString(_params)}`)
      setParams(_params)
    }
    setOpen(false)
  }

  const onClose = () => {
    setOpen(false)
    setParams(getParams(searchParams, size))
  }

  const attributes = [
    { label: 'Tx Hash', name: 'txHash' },
    {
      label: 'Source Chain',
      name: 'sourceChain',
      type: 'select',
      multiple: true,
      options: _.orderBy(
        toArray(chains).map((d, i) => ({ ...d, i })),
        ['deprecated', 'name', 'i'],
        ['desc', 'asc', 'asc'],
      ).map((d) => ({
        value: d.id,
        title: `${d.name}${d.deprecated ? ` (deprecated)` : ''}`,
      })),
    },
    {
      label: 'Destination Chain',
      name: 'destinationChain',
      type: 'select',
      multiple: true,
      options: _.orderBy(
        toArray(chains).map((d, i) => ({ ...d, i })),
        ['deprecated', 'name', 'i'],
        ['desc', 'asc', 'asc'],
      ).map((d) => ({
        value: d.id,
        title: `${d.name}${d.deprecated ? ` (deprecated)` : ''}`,
      })),
    },
    {
      label: 'From / To Chain',
      name: 'chain',
      type: 'select',
      multiple: true,
      options: _.orderBy(
        toArray(chains).map((d, i) => ({ ...d, i })),
        ['deprecated', 'name', 'i'],
        ['desc', 'asc', 'asc'],
      ).map((d) => ({
        value: d.id,
        title: `${d.name}${d.deprecated ? ` (deprecated)` : ''}`,
      })),
    },
    {
      label: 'Asset',
      name: 'asset',
      type: 'select',
      multiple: true,
      options: _.orderBy(
        toArray(assets).map((d) => ({ value: d.id, title: d.symbol })),
        ['title'],
        ['asc'],
      ),
    },
    {
      label: 'Type',
      name: 'type',
      type: 'select',
      options: _.concat({ title: 'Any' }, [
        { value: 'deposit_address', title: 'Deposit Address' },
        { value: 'send_token', title: 'Send Token' },
        { value: 'wrap', title: 'Wrap' },
        { value: 'unwrap', title: 'Unwrap' },
        { value: 'erc20_transfer', title: 'ERC20 Transfer' },
      ]),
    },
    {
      label: 'Status',
      name: 'status',
      type: 'select',
      options: _.concat(
        { title: 'Any' },
        ['executed', 'failed'].map((d) => ({ value: d, title: capitalize(d) })),
      ),
    },
    { label: 'Sender', name: 'senderAddress' },
    { label: 'Recipient', name: 'recipientAddress' },
    { label: 'Time', name: 'time', type: 'datetimeRange' },
    {
      label: 'Sort By',
      name: 'sortBy',
      type: 'select',
      options: _.concat({ title: 'Any' }, [
        { value: 'time', title: 'Transfer Time' },
        { value: 'value', title: 'Transfer Value' },
      ]),
    },
  ]

  const filtered =
    Object.keys(params).filter((k) => !['from'].includes(k)).length > 0
  return (
    <>
      <Button
        color="default"
        circle="true"
        onClick={() => setOpen(true)}
        className={clsx(filtered && 'bg-blue-50 dark:bg-blue-950')}
      >
        <MdOutlineFilterList
          size={20}
          className={clsx(filtered && 'text-blue-600 dark:text-blue-500')}
        />
      </Button>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" onClose={onClose} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-in-out duration-500 sm:duration-700"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transform transition ease-in-out duration-500 sm:duration-700"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-zinc-50 bg-opacity-50 transition-opacity dark:bg-zinc-900 dark:bg-opacity-50" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="flex h-full flex-col divide-y divide-zinc-200 bg-white shadow-xl"
                    >
                      <div className="h-0 flex-1 overflow-y-auto">
                        <div className="flex items-center justify-between bg-blue-600 p-4 sm:px-6">
                          <Dialog.Title className="text-base font-semibold leading-6 text-white">
                            Filter
                          </Dialog.Title>
                          <button
                            type="button"
                            onClick={() => onClose()}
                            className="relative ml-3 text-blue-200 hover:text-white"
                          >
                            <MdClose size={20} />
                          </button>
                        </div>
                        <div className="flex flex-1 flex-col justify-between gap-y-6 px-4 py-6 sm:px-6">
                          {attributes.map((d, i) => (
                            <div key={i}>
                              <label
                                htmlFor={d.name}
                                className="text-sm font-medium leading-6 text-zinc-900"
                              >
                                {d.label}
                              </label>
                              <div className="mt-2">
                                {d.type === 'select' ? (
                                  <Listbox
                                    value={
                                      d.multiple
                                        ? split(params[d.name])
                                        : params[d.name]
                                    }
                                    onChange={(v) =>
                                      setParams({
                                        ...params,
                                        [d.name]: d.multiple ? v.join(',') : v,
                                      })
                                    }
                                    multiple={d.multiple}
                                  >
                                    {({ open }) => {
                                      const isSelected = (v) =>
                                        d.multiple
                                          ? split(params[d.name]).includes(v)
                                          : v === params[d.name] ||
                                            equalsIgnoreCase(v, params[d.name])
                                      const selectedValue = d.multiple
                                        ? toArray(d.options).filter((o) =>
                                            isSelected(o.value),
                                          )
                                        : toArray(d.options).find((o) =>
                                            isSelected(o.value),
                                          )

                                      return (
                                        <div className="relative">
                                          <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-zinc-200 py-1.5 pl-3 pr-10 text-left text-zinc-900 shadow-sm sm:text-sm sm:leading-6">
                                            {d.multiple ? (
                                              <div
                                                className={clsx(
                                                  'flex flex-wrap',
                                                  selectedValue.length !== 0 &&
                                                    'my-1',
                                                )}
                                              >
                                                {selectedValue.length === 0 ? (
                                                  <span className="block truncate">
                                                    Any
                                                  </span>
                                                ) : (
                                                  selectedValue.map((v, j) => (
                                                    <div
                                                      key={j}
                                                      onClick={() =>
                                                        setParams({
                                                          ...params,
                                                          [d.name]:
                                                            selectedValue
                                                              .filter(
                                                                (_v) =>
                                                                  _v.value !==
                                                                  v.value,
                                                              )
                                                              .map(
                                                                (_v) =>
                                                                  _v.value,
                                                              )
                                                              .join(','),
                                                        })
                                                      }
                                                      className="my-1 mr-2 flex h-6 min-w-fit items-center rounded-xl bg-zinc-100 px-2.5 py-1 text-zinc-900"
                                                    >
                                                      {v.title}
                                                    </div>
                                                  ))
                                                )}
                                              </div>
                                            ) : (
                                              <span className="block truncate">
                                                {selectedValue?.title}
                                              </span>
                                            )}
                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                              <LuChevronsUpDown
                                                size={20}
                                                className="text-zinc-400"
                                              />
                                            </span>
                                          </Listbox.Button>
                                          <Transition
                                            show={open}
                                            as={Fragment}
                                            leave="transition ease-in duration-100"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                          >
                                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg sm:text-sm">
                                              {toArray(d.options).map(
                                                (o, j) => (
                                                  <Listbox.Option
                                                    key={j}
                                                    value={o.value}
                                                    className={({ active }) =>
                                                      clsx(
                                                        'relative cursor-default select-none py-2 pl-3 pr-9',
                                                        active
                                                          ? 'bg-blue-600 text-white'
                                                          : 'text-zinc-900',
                                                      )
                                                    }
                                                  >
                                                    {({ selected, active }) => (
                                                      <>
                                                        <span
                                                          className={clsx(
                                                            'block truncate',
                                                            selected
                                                              ? 'font-semibold'
                                                              : 'font-normal',
                                                          )}
                                                        >
                                                          {o.title}
                                                        </span>
                                                        {selected && (
                                                          <span
                                                            className={clsx(
                                                              'absolute inset-y-0 right-0 flex items-center pr-4',
                                                              active
                                                                ? 'text-white'
                                                                : 'text-blue-600',
                                                            )}
                                                          >
                                                            <MdCheck
                                                              size={20}
                                                            />
                                                          </span>
                                                        )}
                                                      </>
                                                    )}
                                                  </Listbox.Option>
                                                ),
                                              )}
                                            </Listbox.Options>
                                          </Transition>
                                        </div>
                                      )
                                    }}
                                  </Listbox>
                                ) : d.type === 'datetimeRange' ? (
                                  <DateRangePicker
                                    params={params}
                                    onChange={(v) =>
                                      setParams({ ...params, ...v })
                                    }
                                  />
                                ) : (
                                  <input
                                    type={d.type || 'text'}
                                    name={d.name}
                                    placeholder={d.label}
                                    value={params[d.name]}
                                    onChange={(e) =>
                                      setParams({
                                        ...params,
                                        [d.name]: e.target.value,
                                      })
                                    }
                                    className="w-full rounded-md border border-zinc-200 py-1.5 text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-blue-600 focus:ring-0 sm:text-sm sm:leading-6"
                                  />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 justify-end p-4">
                        <button
                          type="button"
                          onClick={() => onSubmit(undefined, undefined, {})}
                          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-200 hover:bg-zinc-50"
                        >
                          Reset
                        </button>
                        <button
                          type="submit"
                          disabled={!filtered}
                          className={clsx(
                            'ml-4 inline-flex justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
                            filtered
                              ? 'bg-blue-600 hover:bg-blue-500'
                              : 'cursor-not-allowed bg-blue-500',
                          )}
                        >
                          Submit
                        </button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}

export const normalizeType = (type) =>
  ['wrap', 'unwrap', 'erc20_transfer'].includes(type)
    ? 'deposit_service'
    : type || 'deposit_address'

const generateKeyFromParams = (params) => JSON.stringify(params)

export function Transfers({ address }) {
  const searchParams = useSearchParams()
  const [params, setParams] = useState(null)
  const [searchResults, setSearchResults] = useState(null)
  const [refresh, setRefresh] = useState(null)
  const { assets } = useGlobalStore()

  useEffect(() => {
    const _params = getParams(searchParams, size)
    if (address) _params.address = address
    if (!_.isEqual(_params, params)) {
      setParams(_params)
      setRefresh(true)
    }
  }, [address, searchParams, params, setParams])

  useEffect(() => {
    const getData = async () => {
      if (params && toBoolean(refresh)) {
        const sort =
          params.sortBy === 'value' ? { 'send.value': 'desc' } : undefined
        if (params.from === 0) delete params.from
        const _params = _.cloneDeep(params)
        delete _params.sortBy

        const response = await searchTransfers({ ..._params, size, sort })
        setSearchResults({
          ...(refresh ? undefined : searchResults),
          [generateKeyFromParams(params)]: {
            ...(response?.total ||
            (Object.keys(_params).length > 0 &&
              !(
                Object.keys(_params).length === 1 && _params.from !== undefined
              )) ||
            ENVIRONMENT !== 'mainnet'
              ? response
              : searchResults?.[generateKeyFromParams(params)]),
          },
        })
        setRefresh(
          !isNumber(response?.total) &&
            !searchResults?.[generateKeyFromParams(params)] &&
            ENVIRONMENT === 'mainnet'
            ? true
            : false,
        )
      }
    }
    getData()
  }, [params, setSearchResults, refresh, setRefresh])

  useEffect(() => {
    const interval = setInterval(() => setRefresh('true'), 0.5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const { data, total } = { ...searchResults?.[generateKeyFromParams(params)] }
  return (
    <Container className="sm:mt-8">
      {!data ? (
        <Spinner />
      ) : (
        <div>
          <div className="flex items-center justify-between gap-x-4">
            <div className="sm:flex-auto">
              <h1 className="text-base font-semibold leading-6 text-zinc-900 dark:text-zinc-100">
                Token Transfers
              </h1>
              <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
                <Number
                  value={total}
                  suffix={` result${total > 1 ? 's' : ''}`}
                />
              </p>
            </div>
            <div className="flex items-center gap-x-2">
              {!address && <Filters />}
              {refresh && refresh !== 'true' ? (
                <Spinner />
              ) : (
                <Button
                  color="default"
                  circle="true"
                  onClick={() => setRefresh(true)}
                >
                  <MdOutlineRefresh size={20} />
                </Button>
              )}
            </div>
          </div>
          {refresh && refresh !== 'true' && <Overlay />}
          <div className="-mx-4 mt-4 overflow-x-auto sm:-mx-0 lg:overflow-x-visible">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
              <thead className="sticky top-0 z-10 bg-white dark:bg-zinc-900">
                <tr className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  <th
                    scope="col"
                    className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left sm:pl-0"
                  >
                    Tx Hash
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left">
                    Method
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left">
                    Source
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left">
                    Destination
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left">
                    Status
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap py-3.5 pl-3 pr-4 text-right sm:pr-0"
                  >
                    Created at
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                {data.map((d) => {
                  const assetData = getAssetData(d.send.denom, assets)
                  const { addresses } = { ...assetData }
                  let { symbol, image } = {
                    ...addresses?.[d.send.source_chain],
                  }
                  symbol = symbol || assetData?.symbol
                  image = image || assetData?.image

                  if (symbol) {
                    switch (d.type) {
                      case 'wrap':
                        const WRAP_PREFIXES = ['w', 'axl']
                        const index = WRAP_PREFIXES.findIndex(
                          (p) =>
                            symbol.toLowerCase().startsWith(p) &&
                            !equalsIgnoreCase(p, symbol),
                        )
                        if (index > -1)
                          symbol = symbol.substring(WRAP_PREFIXES[index].length)
                        break
                      default:
                        break
                    }
                  }

                  const senderAddress =
                    d.wrap?.sender_address ||
                    d.erc20_transfer?.sender_address ||
                    d.send?.sender_address
                  const recipientAddress =
                    d.unwrap?.recipient_address || d.link?.recipient_address

                  return (
                    <tr
                      key={d.send.txhash}
                      className="align-top text-sm text-zinc-400 dark:text-zinc-500"
                    >
                      <td className="py-4 pl-4 pr-3 text-left sm:pl-0">
                        <div className="flex items-center gap-x-1">
                          <Copy value={d.send.txhash}>
                            <Link
                              href={`/transfer/${d.send.txhash}`}
                              target="_blank"
                              className="font-semibold text-blue-600 dark:text-blue-500"
                            >
                              {ellipse(d.send.txhash, 4, '0x')}
                            </Link>
                          </Copy>
                          <ExplorerLink
                            value={d.send.txhash}
                            chain={d.send.source_chain}
                          />
                        </div>
                      </td>
                      <td className="px-3 py-4 text-left">
                        <div className="flex flex-col gap-y-1.5">
                          <Tag className={clsx('w-fit capitalize')}>
                            {toTitle(normalizeType(d.type))}
                          </Tag>
                          {symbol && (
                            <div className="flex h-6 w-fit items-center gap-x-1.5 rounded-xl bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800">
                              <Image
                                src={image}
                                alt=""
                                width={16}
                                height={16}
                              />
                              {isNumber(d.send.amount) && assets ? (
                                <Number
                                  value={
                                    isString(d.send.amount)
                                      ? formatUnits(
                                          d.send.amount,
                                          assetData?.decimals,
                                        )
                                      : d.send.amount
                                  }
                                  format="0,0.000000"
                                  suffix={` ${symbol}`}
                                  className="text-xs font-medium text-zinc-900 dark:text-zinc-100"
                                />
                              ) : (
                                <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                                  {symbol}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-left">
                        <div className="flex flex-col gap-y-1">
                          <ChainProfile
                            value={d.send.source_chain}
                            className="h-6"
                            titleClassName="font-semibold"
                          />
                          <Profile
                            address={senderAddress}
                            chain={d.send.source_chain}
                          />
                        </div>
                      </td>
                      <td className="px-3 py-4 text-left">
                        <div className="flex flex-col gap-y-1">
                          <ChainProfile
                            value={
                              d.send.destination_chain ||
                              d.link?.destination_chain
                            }
                            className="h-6"
                            titleClassName="font-semibold"
                          />
                          <Profile
                            address={recipientAddress}
                            chain={
                              d.send.destination_chain ||
                              d.link?.destination_chain
                            }
                          />
                        </div>
                      </td>
                      <td className="px-3 py-4 text-left">
                        <div className="flex flex-col gap-y-1.5">
                          {(() => {
                            let className = ''
                            switch (d.simplified_status) {
                              case 'pending':
                                className = 'bg-yellow-400 dark:bg-yellow-500'
                                break
                              case 'verifying':
                                className = 'bg-blue-400 dark:bg-blue-500'
                                break
                              case 'approved':
                                className = 'bg-orange-400 dark:bg-orange-500'
                                break
                              case 'signing':
                                className = 'bg-purple-400 dark:bg-purple-500'
                                break
                              case 'executing':
                                className = 'bg-lime-400 dark:bg-lime-500'
                                break
                              case 'success':
                                className = 'bg-green-400 dark:bg-green-500'
                                break
                              case 'failed':
                                className = 'bg-red-400 dark:bg-red-500'
                                break
                              default:
                                className = 'bg-green-400 dark:bg-green-500'
                            }
                            return (
                              <div className="flex items-center space-x-1.5">
                                <Tag
                                  className={clsx(
                                    'w-fit capitalize',
                                    className,
                                  )}
                                >
                                  {d.simplified_status}
                                </Tag>
                                {['received'].includes(d.simplified_status) && (
                                  <ExplorerLink
                                    value={
                                      d.unwrap?.tx_hash_unwrap ||
                                      d.command?.transactionHash ||
                                      d.scalar_transfer?.txhash ||
                                      d.ibc_send?.recv_txhash
                                    }
                                    chain={
                                      d.send.destination_chain ||
                                      d.link?.destination_chain
                                    }
                                  />
                                )}
                              </div>
                            )
                          })()}

                          {d.send.insufficient_fee && (
                            <div className="flex items-center gap-x-1 text-red-600 dark:text-red-500">
                              <PiWarningCircle size={16} />
                              <span className="text-xs">Insufficient Fee</span>
                            </div>
                          )}
                          {d.time_spent?.total > 0 &&
                            ['received'].includes(d.simplified_status) && (
                              <div className="flex items-center gap-x-1 text-zinc-400 dark:text-zinc-500">
                                <MdOutlineTimer size={16} />
                                <TimeSpent
                                  fromTimestamp={0}
                                  toTimestamp={d.time_spent.total * 1000}
                                  className="text-xs"
                                />
                              </div>
                            )}
                        </div>
                      </td>
                      <td className="flex items-center justify-end py-4 pl-3 pr-4 text-right sm:pr-0">
                        <TimeAgo timestamp={d.send.created_at?.ms} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {total > size && (
            <div className="mt-8 flex items-center justify-center">
              <Pagination sizePerPage={size} total={total} />
            </div>
          )}
        </div>
      )}
    </Container>
  )
}
