'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import Linkify from 'react-linkify'
import clsx from 'clsx'
import _ from 'lodash'
import moment from 'moment'

import { Container } from '@/components/Container'
import { Copy } from '@/components/Copy'
import { Spinner } from '@/components/Spinner'
import { Tag } from '@/components/Tag'
import { Number } from '@/components/Number'
import { Profile } from '@/components/Profile'
import { useGlobalStore } from '@/components/Global'
import { ellipse } from '@/lib/string'
import { formatUnits } from '@/lib/number'

const TIME_FORMAT = 'MMM D, YYYY h:mm:ss A z'

function Info({ data, tx }) {
  const { height, type, delegator_address, validator_address, amount, timestamp } = { ...data }

  return (
    <div className="overflow-hidden bg-zinc-50/75 dark:bg-zinc-800/25 shadow sm:rounded-lg">
      <div className="px-4 sm:px-6 py-6">
        <h3 className="text-zinc-900 dark:text-zinc-100 text-base font-semibold leading-7">
          <Copy value={tx}>{ellipse(tx, 16)}</Copy>
        </h3>
      </div>
      <div className="border-t border-zinc-200 dark:border-zinc-700">
        <dl className="divide-y divide-zinc-100 dark:divide-zinc-800">
          <div className="px-4 sm:px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-zinc-900 dark:text-zinc-100 text-sm font-medium">Height</dt>
            <dd className="sm:col-span-2 text-zinc-700 dark:text-zinc-300 text-sm leading-6 mt-1 sm:mt-0">
              <Link
                href={`/block/${height}`}
                target="_blank"
                className="text-blue-600 dark:text-blue-500 font-medium"
              >
                <Number value={height} />
              </Link>
            </dd>
          </div>
          <div className="px-4 sm:px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-zinc-900 dark:text-zinc-100 text-sm font-medium">Type</dt>
            <dd className="sm:col-span-2 text-zinc-700 dark:text-zinc-300 text-sm leading-6 mt-1 sm:mt-0">
              {type && (
                <Tag className={clsx('w-fit capitalize bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100')}>
                  {type}
                </Tag>
              )}
            </dd>
          </div>
          <div className="px-4 sm:px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-zinc-900 dark:text-zinc-100 text-sm font-medium">Delegator</dt>
            <dd className="sm:col-span-2 text-zinc-700 dark:text-zinc-300 text-sm leading-6 mt-1 sm:mt-0">
              <Profile address={delegator_address} />
            </dd>
          </div>
          <div className="px-4 sm:px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-zinc-900 dark:text-zinc-100 text-sm font-medium">Validator</dt>
            <dd className="sm:col-span-2 text-zinc-700 dark:text-zinc-300 text-sm leading-6 mt-1 sm:mt-0">
              <Profile address={validator_address} />
            </dd>
          </div>
          <div className="px-4 sm:px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-zinc-900 dark:text-zinc-100 text-sm font-medium">Amount</dt>
            <dd className="sm:col-span-2 text-zinc-700 dark:text-zinc-300 text-sm leading-6 mt-1 sm:mt-0">
              <Number
                value={formatUnits(amount?.amount, 6)}
                format="0,0.000000"
                suffix=" AXL"
                className="text-zinc-700 dark:text-zinc-300 font-medium"
              />
            </dd>
          </div>
          <div className="px-4 sm:px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-zinc-900 dark:text-zinc-100 text-sm font-medium">Created</dt>
            <dd className="sm:col-span-2 text-zinc-700 dark:text-zinc-300 text-sm leading-6 mt-1 sm:mt-0">
              {moment(timestamp).format(TIME_FORMAT)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

function Data({ data }) {
  // Simplified data component - to be implemented later
  return (
    <div className="bg-zinc-50/75 dark:bg-zinc-800/25 sm:rounded-lg px-4 sm:px-6 py-6">
      <div className="text-zinc-900 dark:text-zinc-100">
        Stake details to be implemented
      </div>
    </div>
  )
}

export function Stake({ tx }) {
  const [data, setData] = useState(null)
  const { assets } = useGlobalStore()

  useEffect(() => {
    const getData = async () => {
      // TODO: Implement actual stake data fetching
      // Dummy data for now
      const dummyData = {
        height: 12345678,
        type: 'Delegate',
        delegator_address: '0xabcdef1234567890abcdef1234567890abcdef12',
        validator_address: '0xbcdef1234567890abcdef1234567890abcdef123',
        amount: {
          amount: '1000000000',
          denom: 'uaxl'
        },
        timestamp: '2024-03-20T10:30:00Z'
      }
      setData(dummyData)
    }
    getData()
  }, [tx, assets, setData])

  return (
    <Container className="sm:mt-8">
      {!data ? <Spinner /> :
        <div className="max-w-4xl flex flex-col gap-y-8 sm:gap-y-12">
          <Info data={data} tx={tx} />
          <Data data={data} />
        </div>
      }
    </Container>
  )
}
