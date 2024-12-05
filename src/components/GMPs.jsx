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
import { RiTimerFlashLine } from 'react-icons/ri'

import { Container } from '@/components/Container'
import { Overlay } from '@/components/Overlay'
import { Button } from '@/components/Button'
import { DateRangePicker } from '@/components/DateRangePicker'
import { Image } from '@/components/Image'
import { Copy } from '@/components/Copy'
import { Tooltip } from '@/components/Tooltip'
import { Spinner } from '@/components/Spinner'
import { Tag } from '@/components/Tag'
import { Number } from '@/components/Number'
import { Profile, ChainProfile, AssetProfile } from '@/components/Profile'
import { ExplorerLink } from '@/components/ExplorerLink'
import { TimeAgo, TimeSpent } from '@/components/Time'
import { getParams, getQueryString, Pagination } from '@/components/Pagination'
import { useGlobalStore } from '@/components/Global'
import { searchGMP } from '@/lib/api/gmp'
import { ENVIRONMENT } from '@/lib/config'
import { split, toArray } from '@/lib/parser'
import {
  isString,
  equalsIgnoreCase,
  capitalize,
  toBoolean,
  ellipse,
  toTitle,
} from '@/lib/string'
import { isNumber } from '@/lib/number'
import customGMPs from '@/data/custom/gmp'
import {
  methodLabel,
  scalarBlueText,
  scalarColumnHeader,
  scalarDivideBodyRow,
  scalarDivideRow,
} from '@/styles/scalar'

const getMessageId = (call) => {
  if (call.returnValues?.messageId) {
    return call.returnValues.messageId
  }

  const isCosmos = call.chain_type === 'cosmos'

  // const isEvm = call.chain_type === 'evm'

  // const hasReceipt = call.receipt

  const messageIdIndex = isNumber(call.messageIdIndex)

  // const logIndex = isNumber(call._logIndex)
  //   ? `-${call._logIndex}`
  //   : isNumber(call.logIndex)
  //     ? `:${call.logIndex}`
  //     : ''

  if (isCosmos && messageIdIndex) {
    return `${call.axelarTransactionHash}-${call.messageIdIndex}`
  }

  // if ((isEvm || !call.chain_type) && hasReceipt) {
  //   return `${call.transactionHash}${logIndex}`
  // }

  // return call.transactionHash
  return call.messageId || call.id || call.transactionHash + '-' + call.logIndex
}

const size = 25

function Filters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [params, setParams] = useState(getParams(searchParams, size))
  const { handleSubmit } = useForm()
  const { chains, assets, itsAssets } = useGlobalStore()

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
    { label: 'Tx Hash', name: 'txHash' },
    { label: 'Message ID', name: 'messageId' },
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
      label: 'Asset Type',
      name: 'assetType',
      type: 'select',
      options: _.concat({ title: 'Any' }, [
        { value: 'gateway', title: 'Gateway Token' },
        { value: 'its', title: 'ITS Token' },
      ]),
    },
    {
      label: 'Asset',
      name: 'asset',
      type: 'select',
      multiple: true,
      options: _.orderBy(
        toArray(
          _.concat(
            params.assetType !== 'its' &&
              toArray(assets).map((d) => ({ value: d.id, title: d.symbol })),
            params.assetType !== 'gateway' &&
              toArray(itsAssets).map((d) => ({
                value: d.symbol,
                title: `${d.symbol} (ITS)`,
              })),
          ),
        ),
        ['title'],
        ['asc'],
      ),
    },
    params.assetType === 'its' && {
      label: 'ITS Token Address',
      name: 'itsTokenAddress',
    },
    {
      label: 'Method',
      name: 'contractMethod',
      type: 'select',
      options: _.concat({ title: 'Any' }, [
        { value: 'callContract', title: 'CallContract' },
        { value: 'callContractWithToken', title: 'CallContractWithToken' },
        { value: 'InterchainTransfer', title: 'InterchainTransfer' },
        {
          value: 'InterchainTokenDeployment',
          title: 'InterchainTokenDeployment',
        },
        { value: 'TokenManagerDeployment', title: 'TokenManagerDeployment' },
      ]),
    },
    {
      label: 'Status',
      name: 'status',
      type: 'select',
      options: _.concat({ title: 'Any' }, [
        { value: 'called', title: 'Called' },
        { value: 'confirming', title: 'Wait for Confirmation' },
        { value: 'express_executed', title: 'Express Executed' },
        { value: 'approving', title: 'Wait for Approval' },
        { value: 'approved', title: 'Approved' },
        { value: 'executing', title: 'Executing' },
        { value: 'executed', title: 'Executed' },
        { value: 'error', title: 'Error Execution' },
        { value: 'insufficient_fee', title: 'Insufficient Fee' },
        { value: 'not_enough_gas_to_execute', title: 'Not Enough Gas' },
      ]),
    },
    { label: 'Sender', name: 'senderAddress' },
    { label: 'Contract', name: 'contractAddress' },
    { label: 'Command ID', name: 'commandId' },
    { label: 'Time', name: 'time', type: 'datetimeRange' },
    {
      label: 'Sort By',
      name: 'sortBy',
      type: 'select',
      options: _.concat({ title: 'Any' }, [
        { value: 'time', title: 'ContractCall Time' },
        { value: 'value', title: 'Token Value' },
      ]),
    },
    { label: 'Proposal ID', name: 'proposalId' },
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

export const getEvent = (data) => {
  const {
    call,
    token_sent,
    token_deployment_initialized,
    token_deployed,
    token_manager_deployment_started,
    interchain_token_deployment_started,
    interchain_transfer,
    interchain_transfer_with_data,
  } = { ...data }
  if (token_sent || interchain_transfer || interchain_transfer_with_data)
    return 'InterchainTransfer'
  if (token_deployment_initialized) return 'TokenDeploymentInitialized'
  if (token_deployed) return 'TokenDeployed'
  if (token_manager_deployment_started) return 'TokenManagerDeployment'
  if (interchain_token_deployment_started) return 'InterchainTokenDeployment'
  return call?.event
}
export const normalizeEvent = (event) =>
  event?.replace('ContractCall', 'callContract')

export const customData = async (data) => {
  const { call, interchain_transfer } = { ...data }
  const { destinationContractAddress, payload } = { ...call?.returnValues }
  if (!(destinationContractAddress && isString(payload))) return data

  try {
    const { id, name, customize } = {
      ...toArray(customGMPs).find(
        (d) =>
          toArray(d.addresses).findIndex((a) =>
            equalsIgnoreCase(a, destinationContractAddress),
          ) > -1 &&
          (!d.environment || equalsIgnoreCase(d.environment, ENVIRONMENT)),
      ),
    }
    if (typeof customize === 'function') {
      const customValues = await customize(call.returnValues, ENVIRONMENT)
      if (
        typeof customValues === 'object' &&
        !Array.isArray(customValues) &&
        Object.keys({ ...customValues }).length > 0
      ) {
        customValues.projectId = id
        customValues.projectName = name || capitalize(id)
        data.customValues = customValues
      }
    }

    // interchain transfer
    if (
      interchain_transfer?.destinationAddress &&
      !data.customValues?.recipientAddress
    )
      data.customValues = {
        ...data.customValues,
        recipientAddress: interchain_transfer.destinationAddress,
        projectId: 'its',
        projectName: 'ITS',
      }
  } catch (error) {}
  return data
}

const generateKeyFromParams = (params) => JSON.stringify(params)

export function GMPs({ address }) {
  const searchParams = useSearchParams()
  const [params, setParams] = useState(null)
  const [searchResults, setSearchResults] = useState(null)
  const [refresh, setRefresh] = useState(null)

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
        const sort = params.sortBy === 'value' ? { value: 'desc' } : undefined
        const _params = _.cloneDeep(params)
        delete _params.sortBy

        const response = await searchGMP({ ..._params, size, sort })
        if (response?.data)
          response.data = await Promise.all(
            toArray(response.data).map(
              (d) =>
                new Promise(async (resolve) => resolve(await customData(d))),
            ),
          )

        console.log(response.data)

        setSearchResults({
          ...(refresh ? undefined : searchResults),
          [generateKeyFromParams(params)]: { ...response },
        })
        setRefresh(false)
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
                General Message Passings
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
            <table className={clsx('min-w-full divide-y', scalarDivideRow)}>
              <thead className="sticky top-0 z-10 bg-white dark:bg-zinc-900">
                <tr className="text-zinc-800 dark:text-zinc-200">
                  <th
                    scope="col"
                    className={clsx(
                      'whitespace-nowrap py-3.5 pl-4 pr-3 text-left sm:pl-0',
                      scalarColumnHeader,
                    )}
                  >
                    Tx Hash
                  </th>
                  <th
                    scope="col"
                    className={clsx(
                      'px-3 py-3.5 text-left',
                      scalarColumnHeader,
                    )}
                  >
                    Method
                  </th>
                  <th
                    scope="col"
                    className={clsx(
                      'px-3 py-3.5 text-left',
                      scalarColumnHeader,
                    )}
                  >
                    Sender
                  </th>
                  <th
                    scope="col"
                    className={clsx(
                      'px-3 py-3.5 text-left',
                      scalarColumnHeader,
                    )}
                  >
                    Destination
                  </th>
                  <th
                    scope="col"
                    className={clsx(
                      'px-3 py-3.5 text-left',
                      scalarColumnHeader,
                    )}
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className={clsx(
                      'whitespace-nowrap py-3.5 pl-3 pr-4 text-right sm:pr-0',
                      scalarColumnHeader,
                    )}
                  >
                    Created at
                  </th>
                </tr>
              </thead>
              <tbody
                className={clsx(
                  'divide-y bg-white dark:bg-zinc-900',
                  scalarDivideBodyRow,
                )}
              >
                {data.map((d) => {
                  const symbol =
                    d.call.returnValues?.symbol ||
                    d.token_sent?.symbol ||
                    d.interchain_transfer?.symbol ||
                    d.interchain_transfer_with_data?.symbol ||
                    d.token_deployed?.symbol ||
                    d.token_deployment_initialized?.tokenSymbol ||
                    d.token_manager_deployment_started?.symbol ||
                    d.interchain_token_deployment_started?.tokenSymbol
                  const receivedTransactionHash =
                    d.express_executed?.transactionHash ||
                    d.express_executed?.receipt?.transactionHash ||
                    d.express_executed?.receipt?.hash ||
                    d.executed?.transactionHash ||
                    d.executed?.receipt?.transactionHash ||
                    d.executed?.receipt?.hash

                  return (
                    <tr
                      key={d.call.id}
                      className="align-top text-sm text-zinc-400 dark:text-zinc-500"
                    >
                      <td className="py-4 pl-4 pr-3 text-left sm:pl-0">
                        <div className="flex items-center gap-x-1">
                          <Copy
                            value={
                              d.call.proposal_id &&
                              d.call.returnValues?.messageId
                                ? d.call.returnValues.messageId
                                : d.call.transactionHash
                            }
                          >
                            <Link
                              href={`/gmp/${getMessageId(d.call)}`}
                              target="_blank"
                              className={scalarBlueText}
                            >
                              {ellipse(
                                d.call.proposal_id &&
                                  d.call.returnValues?.messageId
                                  ? d.call.returnValues.messageId
                                  : d.call.transactionHash,
                                4,
                                '0x',
                              )}
                            </Link>
                          </Copy>
                          {!d.call.proposal_id && (
                            <ExplorerLink
                              value={d.call.transactionHash}
                              chain={d.call.chain}
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-left">
                        <div className="flex flex-col gap-y-1.5">
                          <Tag
                            className={clsx('w-fit capitalize', methodLabel)}
                          >
                            {toTitle(normalizeEvent(getEvent(d)))}
                          </Tag>
                          {symbol && (
                            <AssetProfile
                              value={symbol}
                              chain={d.call.chain}
                              amount={d.amount}
                              ITSPossible={true}
                              onlyITS={!getEvent(d)?.includes('ContractCall')}
                              width={16}
                              height={16}
                              className="h-6 w-fit rounded-xl bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800"
                              titleClassName="text-xs"
                            />
                          )}
                          {d.interchain_transfer?.contract_address && (
                            <Tooltip
                              content="Token Address"
                              className="whitespace-nowrap"
                              parentClassName="!justify-start"
                            >
                              <Profile
                                address={d.interchain_transfer.contract_address}
                                chain={d.call.chain}
                                width={16}
                                height={16}
                                className="w-fit text-xs"
                              />
                            </Tooltip>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-left">
                        <div className="flex flex-col gap-y-1">
                          <ChainProfile
                            value={d.call.chain}
                            className="h-6"
                            titleClassName="font-semibold"
                          />
                          <Profile
                            address={d.call.transaction?.from}
                            chain={d.call.chain}
                          />
                        </div>
                      </td>
                      <td className="px-3 py-4 text-left">
                        <div className="flex flex-col gap-y-1">
                          {d.is_invalid_destination_chain ? (
                            <div className="flex">
                              <Tooltip
                                content={d.call.returnValues?.destinationChain}
                              >
                                <div className="flex h-6 items-center gap-x-1.5 text-red-600 dark:text-red-500">
                                  <PiWarningCircle size={20} />
                                  <span>Invalid Chain</span>
                                </div>
                              </Tooltip>
                            </div>
                          ) : (
                            <ChainProfile
                              value={d.call.returnValues?.destinationChain}
                              className="h-6"
                              titleClassName="font-semibold"
                            />
                          )}
                          {d.is_invalid_contract_address ? (
                            <div className="flex">
                              <Tooltip
                                content={
                                  d.call.returnValues
                                    ?.destinationContractAddress
                                }
                              >
                                <div className="flex h-6 items-center gap-x-1.5 text-red-600 dark:text-red-500">
                                  <PiWarningCircle size={20} />
                                  <span>Invalid Contract</span>
                                </div>
                              </Tooltip>
                            </div>
                          ) : (
                            <>
                              <Tooltip
                                content="Destination Contract"
                                parentClassName="!justify-start"
                              >
                                <Profile
                                  address={
                                    d.call.returnValues
                                      ?.destinationContractAddress
                                  }
                                  chain={d.call.returnValues?.destinationChain}
                                />
                              </Tooltip>
                              {d.customValues?.recipientAddress && (
                                <Tooltip
                                  content={`${d.customValues.projectName ? d.customValues.projectName : 'Final User'} Recipient`}
                                  parentClassName="!justify-start"
                                >
                                  <Profile
                                    address={d.customValues.recipientAddress}
                                    chain={
                                      d.call.returnValues?.destinationChain
                                    }
                                  />
                                </Tooltip>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-left">
                        <div className="flex flex-col gap-y-1.5">
                          {d.simplified_status && (
                            <div className="flex items-center space-x-1.5">
                              <Tag
                                className={clsx(
                                  'w-fit rounded-full px-4 py-1.5 capitalize',
                                  ['Success'].includes(d.simplified_status)
                                    ? 'bg-green-600 dark:bg-green-500'
                                    : ['Approved'].includes(d.simplified_status)
                                      ? 'bg-orange-500 dark:bg-orange-600'
                                      : ['Failed'].includes(d.simplified_status)
                                        ? 'bg-red-600 dark:bg-red-500'
                                        : 'bg-yellow-400 dark:bg-yellow-500',
                                )}
                              >
                                {d.simplified_status === 'Received' &&
                                getEvent(d) === 'ContractCall'
                                  ? 'Executed'
                                  : d.simplified_status}
                              </Tag>
                              {['received'].includes(d.simplified_status) && (
                                <ExplorerLink
                                  value={receivedTransactionHash}
                                  chain={d.call.returnValues?.destinationChain}
                                />
                              )}
                            </div>
                          )}
                          {d.is_insufficient_fee && (
                            <div className="flex items-center gap-x-1 text-red-600 dark:text-red-500">
                              <PiWarningCircle size={16} />
                              <span className="text-xs">Insufficient Fee</span>
                            </div>
                          )}
                          {d.is_invalid_gas_paid && (
                            <div className="flex items-center gap-x-1 text-red-600 dark:text-red-500">
                              <PiWarningCircle size={16} />
                              <span className="text-xs">Invalid Gas Paid</span>
                            </div>
                          )}
                          {d.time_spent?.call_express_executed > 0 &&
                            ['express_executed', 'executed'].includes(
                              d.status,
                            ) && (
                              <div className="flex items-center gap-x-1 text-green-600 dark:text-green-500">
                                <RiTimerFlashLine size={16} />
                                <TimeSpent
                                  fromTimestamp={0}
                                  toTimestamp={
                                    d.time_spent.call_express_executed * 1000
                                  }
                                  className="text-xs"
                                />
                              </div>
                            )}
                          {d.time_spent?.total > 0 &&
                            ['executed'].includes(d.status) && (
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
                        <TimeAgo timestamp={d.call.block_timestamp * 1000} />
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
