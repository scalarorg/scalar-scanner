'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import clsx from 'clsx'
import _ from 'lodash'
import moment from 'moment'
import { IoCheckmarkCircle, IoCheckmarkDoneCircle } from 'react-icons/io5'

import { Container } from '@/components/Container'
import { Image } from '@/components/Image'
import { Copy } from '@/components/Copy'
import { Spinner } from '@/components/Spinner'
import { Tag } from '@/components/Tag'
import { Number } from '@/components/Number'
import { Profile, ChainProfile } from '@/components/Profile'
import { TimeAgo } from '@/components/Time'
import { ExplorerLink } from '@/components/ExplorerLink'
import { useGlobalStore } from '@/components/Global'
import { searchPolls } from '@/lib/api/validator'
import { getChainData, getAssetData } from '@/lib/config'
import { toJson, split, toArray } from '@/lib/parser'
import { includesStringList } from '@/lib/operator'
import { equalsIgnoreCase, capitalize, ellipse, toTitle } from '@/lib/string'
import { formatUnits, numberFormat } from '@/lib/number'
import { timeDiff } from '@/lib/time'

const TIME_FORMAT = 'MMM D, YYYY h:mm:ss A z'

function Info({ data, id }) {
  const { chains, assets, validators } = useGlobalStore()

  const { transaction_id, sender_chain, eventName, confirmation_events, status, height, initiated_txhash, confirmation_txhash, transfer_id, deposit_address, participants, voteOptions, created_at, updated_at } = { ...data }
  const chainData = getChainData(sender_chain, chains)
  const { url, transaction_path } = { ...chainData?.explorer }

  const eventElement = (
    <Tag className={clsx('w-fit')}>
      {eventName}
    </Tag>
  )

  const totalParticipantsPower = _.sumBy(toArray(validators).filter(d => true || toArray(d.participants).includes(d.operator_address)), 'quadratic_voting_power')
  return (
    <div className="overflow-hidden bg-zinc-50/75 dark:bg-zinc-800/25 shadow sm:rounded-lg">
      <div className="px-4 sm:px-6 py-6">
        <h3 className="text-zinc-900 dark:text-zinc-100 text-base font-semibold leading-7">
          <Copy value={id}><span>{ellipse(id, 16)}</span></Copy>
        </h3>
        <div className="max-w-2xl text-zinc-400 dark:text-zinc-500 text-sm leading-6 mt-1">
          {transaction_id && (
            <div className="flex items-center gap-x-1">
              <Copy value={transaction_id}>
                <Link
                  href={`${url}${transaction_path?.replace('{tx}', transaction_id)}`}
                  target="_blank"
                  className="text-blue-600 dark:text-blue-500 font-semibold"
                >
                  {ellipse(transaction_id)}
                </Link>
              </Copy>
              <ExplorerLink value={transaction_id} chain={sender_chain} />
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-zinc-200 dark:border-zinc-700">
        <dl className="divide-y divide-zinc-100 dark:divide-zinc-800">
          <div className="px-4 sm:px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-zinc-900 dark:text-zinc-100 text-sm font-medium">Chain</dt>
            <dd className="sm:col-span-2 text-zinc-700 dark:text-zinc-300 text-sm leading-6 mt-1 sm:mt-0">
              <ChainProfile value={sender_chain} />
            </dd>
          </div>
          {eventName && (
            <div className="px-4 sm:px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-zinc-900 dark:text-zinc-100 text-sm font-medium">Event</dt>
              <dd className="sm:col-span-2 text-zinc-700 dark:text-zinc-300 text-sm leading-6 mt-1 sm:mt-0">
                <div className="flex items-center gap-x-1.5">
                  {data.url ?
                    <Link href={data.url} target="_blank">
                      {eventElement}
                    </Link> :
                    eventElement
                  }
                  {toArray(confirmation_events).map((e, i) => {
                    let { asset, symbol, amount } = { ...e }
                    const assetObject = toJson(asset)
                    if (assetObject) {
                      asset = assetObject.denom
                      amount = assetObject.amount
                    }

                    const assetData = getAssetData(asset || symbol, assets)
                    const { decimals, addresses } = { ...assetData }
                    let { image } = { ...assetData }
                    const tokenData = addresses?.[chainData?.id]
                    symbol = tokenData?.symbol || assetData?.symbol || symbol
                    image = tokenData?.image || image

                    const element = symbol && (
                      <div className="w-fit h-6 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center gap-x-1.5 px-2.5 py-1">
                        <Image
                          src={image}
                          alt=""
                          width={16}
                          height={16}
                        />
                        {amount && assets ?
                          <Number
                            value={formatUnits(amount, decimals)}
                            format="0,0.000000"
                            suffix={` ${symbol}`}
                            className="text-zinc-900 dark:text-zinc-100 text-xs font-medium"
                          /> :
                          <span className="text-zinc-900 dark:text-zinc-100 text-xs font-medium">
                            {symbol}
                          </span>
                        }
                      </div>
                    )

                    return element && (data.url ?
                      <Link key={i} href={data.url} target="_blank">
                        {element}
                      </Link> :
                      <div key={i}>{element}</div>
                    )
                  })}
                </div>
              </dd>
            </div>
          )}
          <div className="px-4 sm:px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-zinc-900 dark:text-zinc-100 text-sm font-medium">Status</dt>
            <dd className="sm:col-span-2 text-zinc-700 dark:text-zinc-300 text-sm leading-6 mt-1 sm:mt-0">
              {status && (
                <Tag className={clsx('w-fit capitalize', ['completed'].includes(status) ? 'bg-green-600 dark:bg-green-500' : ['confirmed'].includes(status) ? 'bg-orange-500 dark:bg-orange-600' : ['failed'].includes(status) ? 'bg-red-600 dark:bg-red-500' : ['expired'].includes(status) ? 'bg-zinc-400 dark:bg-zinc-500' : 'bg-yellow-400 dark:bg-yellow-500')}>
                  {status}
                </Tag>
              )}
            </dd>
          </div>
          <div className="px-4 sm:px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-zinc-900 dark:text-zinc-100 text-sm font-medium">Height</dt>
            <dd className="sm:col-span-2 text-zinc-700 dark:text-zinc-300 text-sm leading-6 mt-1 sm:mt-0">
              {height && (
                <Link
                  href={`/block/${height}`}
                  target="_blank"
                  className="text-blue-600 dark:text-blue-500 font-medium"
                >
                  <Number value={height} />
                </Link>
              )}
            </dd>
          </div>
          {initiated_txhash && (
            <div className="px-4 sm:px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-zinc-900 dark:text-zinc-100 text-sm font-medium">Initiated Tx Hash</dt>
              <dd className="sm:col-span-2 text-zinc-700 dark:text-zinc-300 text-sm leading-6 mt-1 sm:mt-0">
                <Link
                  href={`/tx/${initiated_txhash}`}
                  target="_blank"
                  className="text-blue-600 dark:text-blue-500 font-medium"
                >
                  {ellipse(initiated_txhash)}
                </Link>
              </dd>
            </div>
          )}
          {confirmation_txhash && (
            <div className="px-4 sm:px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-zinc-900 dark:text-zinc-100 text-sm font-medium">Confirmation Tx Hash</dt>
              <dd className="sm:col-span-2 text-zinc-700 dark:text-zinc-300 text-sm leading-6 mt-1 sm:mt-0">
                <Link
                  href={`/tx/${confirmation_txhash}`}
                  target="_blank"
                  className="text-blue-600 dark:text-blue-500 font-medium"
                >
                  {ellipse(confirmation_txhash)}
                </Link>
              </dd>
            </div>
          )}
          {transfer_id && (
            <div className="px-4 sm:px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-zinc-900 dark:text-zinc-100 text-sm font-medium">Transfer ID</dt>
              <dd className="sm:col-span-2 text-zinc-700 dark:text-zinc-300 text-sm leading-6 mt-1 sm:mt-0">
                <Copy value={transfer_id}>
                  <Link
                    href={data.url}
                    target="_blank"
                    className="text-blue-600 dark:text-blue-500 font-medium"
                  >
                    {transfer_id}
                  </Link>
                </Copy>
              </dd>
            </div>
          )}
          {deposit_address && (
            <div className="px-4 sm:px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-zinc-900 dark:text-zinc-100 text-sm font-medium">Deposit Address</dt>
              <dd className="sm:col-span-2 text-zinc-700 dark:text-zinc-300 text-sm leading-6 mt-1 sm:mt-0">
                <Copy value={deposit_address}>
                  <Link
                    href={`/account/${deposit_address}`}
                    target="_blank"
                    className="text-blue-600 dark:text-blue-500 font-medium"
                  >
                    {ellipse(deposit_address)}
                  </Link>
                </Copy>
              </dd>
            </div>
          )}
          <div className="px-4 sm:px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-zinc-900 dark:text-zinc-100 text-sm font-medium">Created</dt>
            <dd className="sm:col-span-2 text-zinc-700 dark:text-zinc-300 text-sm leading-6 mt-1 sm:mt-0">
              {moment(created_at?.ms).format(TIME_FORMAT)}
            </dd>
          </div>
          {updated_at?.ms > created_at?.ms && (
            <div className="px-4 sm:px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-zinc-900 dark:text-zinc-100 text-sm font-medium">Updated</dt>
              <dd className="sm:col-span-2 text-zinc-700 dark:text-zinc-300 text-sm leading-6 mt-1 sm:mt-0">
                {moment(updated_at.ms).format(TIME_FORMAT)}
              </dd>
            </div>
          )}
          {participants && (
            <div className="px-4 sm:px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-zinc-900 dark:text-zinc-100 text-sm font-medium">{`Participants${participants.length > 1 ? ` (${participants.length})` : ''}`}</dt>
              <dd className="sm:col-span-2 text-zinc-700 dark:text-zinc-300 text-sm leading-6 mt-1 sm:mt-0">
                <div className="w-fit flex items-center">
                  {voteOptions.map((v, i) => {
                    const totalVotersPower = _.sumBy(toArray(validators).filter(d => toArray(v.voters).includes(d.broadcaster_address)), 'quadratic_voting_power')
                    const powerDisplay = totalVotersPower > 0 && totalParticipantsPower > 0 ? `${numberFormat(totalVotersPower, '0,0.0a')} (${numberFormat(totalVotersPower * 100 / totalParticipantsPower, '0,0.0')}%)` : ''
                    const isDisplayPower = powerDisplay && timeDiff(created_at?.ms, 'days') < 3

                    return (
                      <Number
                        key={i}
                        value={v.value}
                        format="0,0"
                        suffix={` ${toTitle(v.option.substring(0, ['unsubmitted'].includes(v.option) ? 2 : 1))}${isDisplayPower ? `: ${powerDisplay}` : ''}`}
                        noTooltip={true}
                        className={clsx('rounded-xl uppercase text-xs mr-2 px-2.5 py-1', ['no'].includes(v.option) ? 'bg-red-600 dark:bg-red-500 text-white' : ['yes'].includes(v.option) ? 'bg-green-600 dark:bg-green-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500')}
                      />
                    )
                  })}
                </div>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  )
}

function Votes({ data }) {
  const [votes, setVotes] = useState(null)
  const { validators } = useGlobalStore()

  useEffect(() => {
    if (data?.votes) {
      const votes = toArray(data.votes).map(d => ({ ...d, validatorData: toArray(validators).find(v => equalsIgnoreCase(v.broadcaster_address, d.voter)) }))
      setVotes(_.concat(
        _.orderBy(votes.map(d => ({ ...d, confirmedFlag: d.confirmed ? 1 : 0 })), ['confirmedFlag'], ['desc']),
        // unsubmitted
        toArray(data.participants).filter(p => votes.findIndex(d => equalsIgnoreCase(d.validatorData?.operator_address, p)) < 0).map(p => {
          const validatorData = toArray(validators).find(v => equalsIgnoreCase(v.operator_address, p))
          return { voter: validatorData?.broadcaster_address || p, validatorData }
        }),
      ))
    }
  }, [validators, data, setVotes])

  const { initiated_txhash, confirmation_txhash } = { ...data }
  const totalVotingPower = _.sumBy(toArray(validators).filter(d => !d.jailed && d.status === 'BOND_STATUS_BONDED'), 'quadratic_voting_power')

  return votes && (
    <div className="overflow-x-auto lg:overflow-x-visible -mx-4 sm:-mx-0 mt-8">
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
        <thead className="sticky top-0 z-10 bg-white dark:bg-zinc-900">
          <tr className="text-zinc-800 dark:text-zinc-200 text-sm font-semibold">
            <th scope="col" className="pl-4 sm:pl-0 pr-3 py-3.5 text-left">
              #
            </th>
            <th scope="col" className="px-3 py-3.5 text-left">
              Voter
            </th>
            <th scope="col" className="px-3 py-3.5 text-right whitespace-nowrap">
              Voting Power
            </th>
            <th scope="col" className="px-3 py-3.5 text-left whitespace-nowrap">
              Tx Hash
            </th>
            <th scope="col" className="px-3 py-3.5 text-left">
              Height
            </th>
            <th scope="col" className="px-3 py-3.5 text-right">
              Vote
            </th>
            <th scope="col" className="pl-3 pr-4 sm:pr-0 py-3.5 text-right">
              Time
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800">
          {votes.map((d, i) => {
            const vote = d.vote ? 'yes' : typeof d.vote === 'boolean' ? 'no' : 'unsubmitted'

            return (
              <tr key={i} className="align-top text-zinc-400 dark:text-zinc-500 text-sm">
                <td className="pl-4 sm:pl-0 pr-3 py-4 text-left">
                  {i + 1}
                </td>
                <td className="px-3 py-4 text-left">
                  {d.validatorData ?
                    <Profile i={i} address={d.validatorData.operator_address} prefix="scalarvaloper" /> :
                    <Copy value={d.voter}>
                      <Link
                        href={`/account/${d.voter}`}
                        target="_blank"
                        className="text-blue-600 dark:text-blue-500 font-medium"
                      >
                        {ellipse(d.voter, 10, 'scalar')}
                      </Link>
                    </Copy>
                  }
                </td>
                <td className="px-3 py-4 text-right">
                  {d.validatorData && (
                    <div className="flex flex-col items-end gap-y-1">
                      <Number
                        value={d.validatorData.quadratic_voting_power}
                        format="0,0.00a"
                        noTooltip={true}
                        className="text-zinc-900 dark:text-zinc-100 font-semibold"
                      />
                      {d.validatorData.quadratic_voting_power > 0 && totalVotingPower > 0 && (
                        <Number
                          value={d.validatorData.quadratic_voting_power * 100 / totalVotingPower}
                          format="0,0.000000"
                          suffix="%"
                          noTooltip={true}
                          className="text-zinc-400 dark:text-zinc-500"
                        />
                      )}
                    </div>
                  )}
                </td>
                <td className="px-3 py-4 text-left">
                  {d.id && (
                    <div className="flex flex-col gap-y-1">
                      <Copy value={d.id}>
                        <Link
                          href={`/tx/${d.id}`}
                          target="_blank"
                          className="text-blue-600 dark:text-blue-500 font-medium"
                        >
                          {ellipse(d.id, 6)}
                        </Link>
                      </Copy>
                      {equalsIgnoreCase(d.id, initiated_txhash) && (
                        <Link
                          href={`/tx/${initiated_txhash}`}
                          target="_blank"
                          className="h-6 flex items-center gap-x-1"
                        >
                          <IoCheckmarkCircle size={18} className="text-orange-500 dark:text-orange-600" />
                          <span className="text-zinc-400 dark:text-zinc-500">
                            Initiated
                          </span>
                        </Link>
                      )}
                      {equalsIgnoreCase(d.id, confirmation_txhash) && (
                        <Link
                          href={`/tx/${confirmation_txhash}`}
                          target="_blank"
                          className="h-6 flex items-center gap-x-1"
                        >
                          <IoCheckmarkDoneCircle size={18} className="text-green-600 dark:text-green-500" />
                          <span className="text-zinc-400 dark:text-zinc-500">
                            Confirmation
                          </span>
                        </Link>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-3 py-4 text-left">
                  {d.height && (
                    <Link
                      href={`/block/${d.height}`}
                      target="_blank"
                      className="text-blue-600 dark:text-blue-500 font-medium"
                    >
                      <Number value={d.height} />
                    </Link>
                  )}
                </td>
                <td className="px-3 py-4 text-right">
                  <div className="flex flex-col items-end">
                    <Tag className={clsx('w-fit capitalize', ['no'].includes(vote) ? 'bg-red-600 dark:bg-red-500 text-white' : ['yes'].includes(vote) ? 'bg-green-600 dark:bg-green-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500')}>
                      {toTitle(vote)}
                    </Tag>
                  </div>
                </td>
                <td className="pl-3 pr-4 sm:pr-0 py-4 flex items-center justify-end text-right">
                  <TimeAgo timestamp={d.created_at} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function EVMPoll({ id }) {
  const [data, setData] = useState(null)
  const { chains, validators } = useGlobalStore()

  useEffect(() => {
    const getData = async () => {
      const { data } = { ...await searchPolls({ pollId: id }) }
      let d = _.head(data)

      if (d) {
        const votes = []
        Object.entries(d).filter(([k, v]) => k.startsWith('scalar')).forEach(([k, v]) => votes.push(v))

        let voteOptions = Object.entries(_.groupBy(toArray(votes).map(v => ({ ...v, option: v.vote ? 'yes' : typeof v.vote === 'boolean' ? 'no' : 'unsubmitted' })), 'option')).map(([k, v]) => {
          return {
            option: k,
            value: toArray(v).length,
            voters: toArray(toArray(v).map(_v => _v.voter)),
          }
        }).filter(v => v.value).map(v => ({ ...v, i: v.option === 'yes' ? 0 : v.option === 'no' ? 1 : 2 }))

        if (toArray(d.participants).length > 0 && voteOptions.findIndex(v => v.option === 'unsubmitted') < 0 && _.sumBy(voteOptions, 'value') < d.participants.length) {
          voteOptions.push({ option: 'unsubmitted', value: d.participants.length - _.sumBy(voteOptions, 'value') })
        }
        voteOptions = _.orderBy(voteOptions, ['i'], ['asc'])

        let eventName = split(d.event, { delimiter: '_', toCase: 'lower' }).join('_')
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

        const { url, transaction_path } = { ...getChainData(d.sender_chain, chains)?.explorer }
        const confirmation_txhash = toArray(votes).find(v => v.confirmed)?.id
        d = {
          ...d,
          status: d.success ? 'completed' : d.failed ? 'failed' : d.expired ? 'expired' : d.confirmation || confirmation_txhash ? 'confirmed' : 'pending',
          height: _.minBy(votes, 'height')?.height || d.height,
          confirmation_txhash,
          votes: _.orderBy(votes, ['height', 'created_at'], ['desc', 'desc']),
          voteOptions,
          eventName: d.event ? split(toTitle(eventName), { delimiter: ' ' }).map(s => capitalize(s)).join('') : eventName,
          url: includesStringList(eventName, ['operator', 'token_deployed']) ? `${url}${transaction_path?.replace('{tx}', d.transaction_id)}` : `/${includesStringList(eventName, ['contract_call', 'ContractCall']) || !(includesStringList(eventName, ['transfer', 'Transfer']) || d.deposit_address) ? 'gmp' : 'transfer'}/${d.transaction_id ? d.transaction_id : d.transfer_id ? `?transferId=${d.transfer_id}` : ''}`,
        }
      }

      console.log('[data]', d)
      setData(d)
    }
    getData()
  }, [id, chains, setData])

  return (
    <Container className="sm:mt-8">
      {!data ? <Spinner /> :
        <div className="max-w-5xl flex flex-col gap-y-4 sm:gap-y-6">
          <Info data={data} id={id} />
          {validators && <Votes data={data} />}
        </div>
      }
    </Container>
  )
}
