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
} from 'react-icons/md'
import { LuChevronsUpDown } from 'react-icons/lu'
import { IoCheckmarkCircle, IoCheckmarkDoneCircle } from 'react-icons/io5'

import { Container } from '@/components/Container'
import { Overlay } from '@/components/Overlay'
import { Button } from '@/components/Button'
import { DateRangePicker } from '@/components/DateRangePicker'
import { Image } from '@/components/Image'
import { Copy } from '@/components/Copy'
import { Spinner } from '@/components/Spinner'
import { Tag } from '@/components/Tag'
import { Number } from '@/components/Number'
import { ChainProfile } from '@/components/Profile'
import { ExplorerLink } from '@/components/ExplorerLink'
import { TimeAgo } from '@/components/Time'
import { getParams, getQueryString, Pagination } from '@/components/Pagination'
import { useGlobalStore } from '@/components/Global'
import { searchPolls } from '@/lib/api/validator'
import { getChainData, getAssetData } from '@/lib/config'
import { toJson, split, toArray } from '@/lib/parser'
import { includesStringList } from '@/lib/operator'
import {
  equalsIgnoreCase,
  capitalize,
  toBoolean,
  ellipse,
  toTitle,
} from '@/lib/string'
import { isNumber, toNumber, formatUnits, numberFormat } from '@/lib/number'
import { timeDiff } from '@/lib/time'

const size = 25

function Filters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [params, setParams] = useState(getParams(searchParams, size))
  const [types, setTypes] = useState([])
  const { handleSubmit } = useForm()
  const { chains } = useGlobalStore()

  useEffect(() => {
    const getTypes = async () => {
      const response = await searchPolls({
        aggs: { types: { terms: { field: 'event.keyword', size: 25 } } },
        size: 0,
      })
      setTypes(toArray(response).map((d) => d.key))
    }
    getTypes()
  }, [])

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

  const attributes = toArray([
    { label: 'Poll ID', name: 'pollId' },
    { label: 'Tx Hash', name: 'transactionId' },
    {
      label: 'Chain',
      name: 'chain',
      type: 'select',
      multiple: true,
      options: _.orderBy(
        toArray(chains)
          .filter(
            (d) => d.chain_type === 'evm' && (!d.no_inflation || d.deprecated),
          )
          .map((d, i) => ({ ...d, i })),
        ['deprecated', 'name', 'i'],
        ['desc', 'asc', 'asc'],
      ).map((d) => ({
        value: d.id,
        title: `${d.name}${d.deprecated ? ` (deprecated)` : ''}`,
      })),
    },
    {
      label: 'Event Type',
      name: 'event',
      type: 'select',
      multiple: true,
      options: _.concat(
        { title: 'Any' },
        types.map((d) => ({
          value: d,
          title: split(toTitle(d), { delimiter: ' ' })
            .map((s) => capitalize(s))
            .join(''),
        })),
      ),
    },
    {
      label: 'Status',
      name: 'status',
      type: 'select',
      multiple: true,
      options: _.concat(
        { title: 'Any' },
        ['completed', 'failed', 'expired', 'confirmed', 'pending'].map((d) => ({
          value: d,
          title: capitalize(d),
        })),
      ),
    },
    { label: 'Voter (Broadcaster Address)', name: 'voter' },
    params.voter?.startsWith('axelar') && {
      label: 'Vote',
      name: 'vote',
      type: 'select',
      options: _.concat(
        { title: 'Any' },
        ['yes', 'no', 'unsubmitted'].map((d) => ({
          value: d,
          title: capitalize(d),
        })),
      ),
    },
    { label: 'Time', name: 'time', type: 'datetimeRange' },
    { label: 'Transfer ID', name: 'transferId' },
  ])

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

const generateKeyFromParams = (params) => JSON.stringify(params)

export function EVMPolls() {
  const searchParams = useSearchParams()
  const [params, setParams] = useState(null)
  const [searchResults, setSearchResults] = useState(null)
  const [refresh, setRefresh] = useState(null)
  const { chains, assets, validators } = useGlobalStore()

  useEffect(() => {
    const _params = getParams(searchParams, size)
    if (!_.isEqual(_params, params)) {
      setParams(_params)
      setRefresh(true)
    }
  }, [searchParams, params, setParams])

  useEffect(() => {
    const getData = async () => {
      if (params && toBoolean(refresh)) {
        const { data, total } = { ...(await searchPolls({ ...params, size })) }

        setSearchResults({
          ...(refresh ? undefined : searchResults),
          [generateKeyFromParams(params)]: {
            data: _.orderBy(
              toArray(data).map((d) => {
                const votes = []
                Object.entries(d)
                  .filter(([k, v]) => k.startsWith('axelar'))
                  .forEach(([k, v]) => votes.push(v))

                let voteOptions = Object.entries(
                  _.groupBy(
                    toArray(votes).map((v) => ({
                      ...v,
                      option: v.vote
                        ? 'yes'
                        : typeof v.vote === 'boolean'
                          ? 'no'
                          : 'unsubmitted',
                    })),
                    'option',
                  ),
                )
                  .map(([k, v]) => {
                    return {
                      option: k,
                      value: toArray(v).length,
                      voters: toArray(toArray(v).map((_v) => _v.voter)),
                    }
                  })
                  .filter((v) => v.value)
                  .map((v) => ({
                    ...v,
                    i: v.option === 'yes' ? 0 : v.option === 'no' ? 1 : 2,
                  }))

                if (
                  toArray(d.participants).length > 0 &&
                  voteOptions.findIndex((v) => v.option === 'unsubmitted') <
                    0 &&
                  _.sumBy(voteOptions, 'value') < d.participants.length
                ) {
                  voteOptions.push({
                    option: 'unsubmitted',
                    value:
                      d.participants.length - _.sumBy(voteOptions, 'value'),
                  })
                }
                voteOptions = _.orderBy(voteOptions, ['i'], ['asc'])

                let eventName = split(d.event, {
                  delimiter: '_',
                  toCase: 'lower',
                }).join('_')
                if (d.confirmation_events) {
                  const { type, txID } = { ...d.confirmation_events[0] }
                  switch (type) {
                    case 'depositConfirmation':
                      eventName = eventName || 'Transfer'
                      break
                    case 'ContractCallApproved':
                      eventName = eventName || 'ContractCall'
                      break
                    case 'ContractCallApprovedWithMint':
                    case 'ContractCallWithMintApproved':
                      eventName = eventName || 'ContractCallWithToken'
                      break
                    default:
                      eventName = type
                      break
                  }
                  d.transaction_id = d.transaction_id || txID
                }

                const { url, transaction_path } = {
                  ...getChainData(d.sender_chain, chains)?.explorer,
                }
                const confirmation_txhash = toArray(votes).find(
                  (v) => v.confirmed,
                )?.id
                return {
                  ...d,
                  idNumber: isNumber(d.id) ? toNumber(d.id) : d.id,
                  status: d.success
                    ? 'completed'
                    : d.failed
                      ? 'failed'
                      : d.expired
                        ? 'expired'
                        : d.confirmation || confirmation_txhash
                          ? 'confirmed'
                          : 'pending',
                  height: _.minBy(votes, 'height')?.height || d.height,
                  confirmation_txhash,
                  votes: _.orderBy(
                    votes,
                    ['height', 'created_at'],
                    ['desc', 'desc'],
                  ),
                  voteOptions,
                  eventName: d.event
                    ? split(toTitle(eventName), { delimiter: ' ' })
                        .map((s) => capitalize(s))
                        .join('')
                    : eventName,
                  url: includesStringList(eventName, [
                    'operator',
                    'token_deployed',
                  ])
                    ? `${url}${transaction_path?.replace('{tx}', d.transaction_id)}`
                    : `/${includesStringList(eventName, ['contract_call', 'ContractCall']) || !(includesStringList(eventName, ['transfer', 'Transfer']) || d.deposit_address) ? 'gmp' : 'transfer'}/${d.transaction_id ? d.transaction_id : d.transfer_id ? `?transferId=${d.transfer_id}` : ''}`,
                }
              }),
              ['idNumber', 'created_at.ms'],
              ['desc', 'desc'],
            ),
            total,
          },
        })
        setRefresh(false)
      }
    }
    getData()
  }, [chains, params, setSearchResults, refresh, setRefresh])

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
                EVM Polls
              </h1>
              <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
                <Number
                  value={total}
                  suffix={` result${total > 1 ? 's' : ''}`}
                />
              </p>
            </div>
            <div className="flex items-center gap-x-2">
              <Filters />
              {refresh ? (
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
          {refresh && <Overlay />}
          <div className="-mx-4 mt-4 overflow-x-auto sm:-mx-0 lg:overflow-x-visible">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
              <thead className="sticky top-0 z-10 bg-white dark:bg-zinc-900">
                <tr className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left sm:pl-0"
                  >
                    ID
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left">
                    Chain
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left">
                    Event
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left">
                    Height
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left">
                    Participations
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 pl-3 pr-4 text-right sm:pr-0"
                  >
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                {data.map((d) => {
                  const chainData = getChainData(d.sender_chain, chains)
                  const { url, transaction_path } = { ...chainData?.explorer }

                  const eventElement = (
                    <Tag className={clsx('w-fit')}>{d.eventName}</Tag>
                  )

                  const totalParticipantsPower = _.sumBy(
                    toArray(validators).filter(
                      (d) =>
                        true ||
                        toArray(d.participants).includes(d.operator_address),
                    ),
                    'quadratic_voting_power',
                  )
                  return (
                    <tr
                      key={d.id}
                      className="align-top text-sm text-zinc-400 dark:text-zinc-500"
                    >
                      <td className="py-4 pl-4 pr-3 text-left sm:pl-0">
                        <div className="flex flex-col gap-y-0.5">
                          <Copy value={d.id}>
                            <Link
                              href={`/evm-poll/${d.id}`}
                              target="_blank"
                              className="font-semibold text-blue-600 dark:text-blue-500"
                            >
                              {ellipse(d.id)}
                            </Link>
                          </Copy>
                          {d.transaction_id && (
                            <div className="flex items-center gap-x-1">
                              <Copy value={d.transaction_id}>
                                <Link
                                  href={`${url}${transaction_path?.replace('{tx}', d.transaction_id)}`}
                                  target="_blank"
                                  className="font-semibold text-blue-600 dark:text-blue-500"
                                >
                                  {ellipse(d.transaction_id)}
                                </Link>
                              </Copy>
                              <ExplorerLink
                                value={d.transaction_id}
                                chain={d.sender_chain}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-left">
                        <ChainProfile value={d.sender_chain} />
                      </td>
                      <td className="px-3 py-4 text-left">
                        <div className="flex flex-col gap-y-1.5">
                          {d.eventName &&
                            (d.url ? (
                              <Link href={d.url} target="_blank">
                                {eventElement}
                              </Link>
                            ) : (
                              eventElement
                            ))}
                          {toArray(d.confirmation_events).map((e, i) => {
                            let { asset, symbol, amount } = { ...e }
                            const assetObject = toJson(asset)
                            if (assetObject) {
                              asset = assetObject.denom
                              amount = assetObject.amount
                            }

                            const assetData = getAssetData(
                              asset || symbol,
                              assets,
                            )
                            const { decimals, addresses } = { ...assetData }
                            let { image } = { ...assetData }
                            const tokenData = addresses?.[chainData?.id]
                            symbol =
                              tokenData?.symbol || assetData?.symbol || symbol
                            image = tokenData?.image || image

                            const element = symbol && (
                              <div className="flex h-6 w-fit items-center gap-x-1.5 rounded-xl bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800">
                                <Image
                                  src={image}
                                  alt=""
                                  width={16}
                                  height={16}
                                />
                                {amount && assets ? (
                                  <Number
                                    value={formatUnits(amount, decimals)}
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
                            )

                            return (
                              element &&
                              (d.url ? (
                                <Link key={i} href={d.url} target="_blank">
                                  {element}
                                </Link>
                              ) : (
                                <div key={i}>{element}</div>
                              ))
                            )
                          })}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-left">
                        {d.height && (
                          <Link
                            href={`/block/${d.height}`}
                            target="_blank"
                            className="font-medium text-blue-600 dark:text-blue-500"
                          >
                            <Number value={d.height} />
                          </Link>
                        )}
                      </td>
                      <td className="px-3 py-4 text-left">
                        <div className="flex flex-col gap-y-1">
                          {d.status && (
                            <Tag
                              className={clsx(
                                'w-fit capitalize',
                                ['completed'].includes(d.status)
                                  ? 'bg-green-600 dark:bg-green-500'
                                  : ['confirmed'].includes(d.status)
                                    ? 'bg-orange-500 dark:bg-orange-600'
                                    : ['failed'].includes(d.status)
                                      ? 'bg-red-600 dark:bg-red-500'
                                      : ['expired'].includes(d.status)
                                        ? 'bg-zinc-400 dark:bg-zinc-500'
                                        : 'bg-yellow-400 dark:bg-yellow-500',
                              )}
                            >
                              {d.status}
                            </Tag>
                          )}
                          <div className="flex flex-col">
                            {d.initiated_txhash && (
                              <Link
                                href={`/tx/${d.initiated_txhash}`}
                                target="_blank"
                                className="flex h-5 items-center gap-x-1"
                              >
                                <IoCheckmarkCircle
                                  size={18}
                                  className="text-green-600 dark:text-green-500"
                                />
                                <span className="text-zinc-400 dark:text-zinc-500">
                                  Initiated
                                </span>
                              </Link>
                            )}
                            {d.confirmation_txhash && (
                              <Link
                                href={`/tx/${d.confirmation_txhash}`}
                                target="_blank"
                                className="flex h-5 items-center gap-x-1"
                              >
                                <IoCheckmarkDoneCircle
                                  size={18}
                                  className="text-green-600 dark:text-green-500"
                                />
                                <span className="font-medium text-green-600 dark:text-green-500">
                                  Confirmation
                                </span>
                              </Link>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-left">
                        <Link
                          href={`/evm-poll/${d.id}`}
                          target="_blank"
                          className="flex w-fit items-center"
                        >
                          {d.voteOptions.map((v, i) => {
                            const totalVotersPower = _.sumBy(
                              toArray(validators).filter((d) =>
                                toArray(v.voters).includes(
                                  d.broadcaster_address,
                                ),
                              ),
                              'quadratic_voting_power',
                            )
                            const powerDisplay =
                              totalVotersPower > 0 && totalParticipantsPower > 0
                                ? `${numberFormat(totalVotersPower, '0,0.0a')} (${numberFormat((totalVotersPower * 100) / totalParticipantsPower, '0,0.0')}%)`
                                : ''
                            const isDisplayPower =
                              powerDisplay &&
                              timeDiff(d.created_at?.ms, 'days') < 3

                            return (
                              <Number
                                key={i}
                                value={v.value}
                                format="0,0"
                                suffix={` ${toTitle(v.option.substring(0, ['unsubmitted'].includes(v.option) ? 2 : 1))}${isDisplayPower ? `: ${powerDisplay}` : ''}`}
                                noTooltip={true}
                                className={clsx(
                                  'mr-2 rounded-xl px-2.5 py-1 text-xs uppercase',
                                  ['no'].includes(v.option)
                                    ? 'bg-red-600 text-white dark:bg-red-500'
                                    : ['yes'].includes(v.option)
                                      ? 'bg-green-600 text-white dark:bg-green-500'
                                      : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500',
                                )}
                              />
                            )
                          })}
                        </Link>
                      </td>
                      <td className="flex items-center justify-end py-4 pl-3 pr-4 text-right sm:pr-0">
                        <TimeAgo timestamp={d.created_at?.ms} />
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
