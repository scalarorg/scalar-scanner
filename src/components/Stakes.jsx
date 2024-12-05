'use client'

import Link from 'next/link'
import { Fragment, useState, useEffect } from 'react'
import { MdOutlineRefresh } from 'react-icons/md'
import clsx from 'clsx'

import { Container } from '@/components/Container'
import { Button } from '@/components/Button'
import { Copy } from '@/components/Copy'
import { Number } from '@/components/Number'
import { Profile } from '@/components/Profile'
import { TimeAgo } from '@/components/Time'
import { ellipse } from '@/lib/string'

import { searchStakes } from '@/lib/api/stake'

// Dummy data for demonstration
const dummyStakes = [
  {
    txHash:
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    chain: 'Ethereum',
    amount: '1000',
    height: 12345678,
    sender: '0xabcdef1234567890abcdef1234567890abcdef12',
    fee: '0.001',
    timestamp: '2024-03-20T10:30:00Z',
  },
  {
    txHash:
      '0x2234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    chain: 'Polygon',
    amount: '500',
    height: 12345677,
    sender: '0xbcdef1234567890abcdef1234567890abcdef123',
    fee: '0.002',
    timestamp: '2024-03-20T10:29:00Z',
  },
  // Add more dummy data as needed
]

export function Stakes() {
  const [stakes, setStakes] = useState([])
  const [refresh, setRefresh] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStakes = async () => {
      setLoading(true)
      const response = await searchStakes()
      if (response) {
        setStakes(response)
      } else {
        setStakes([])
      }
      setLoading(false)
      setRefresh(false)
    }

    fetchStakes()
  }, [refresh])

  return (
    <Container className="sm:mt-8">
      <div>
        <div className="flex items-center justify-between gap-x-4">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-zinc-900 dark:text-zinc-100">
              Stakes
            </h1>
            <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
              <Number
                value={stakes.length}
                suffix={` result${stakes.length > 1 ? 's' : ''}`}
              />
            </p>
          </div>
          <div className="flex items-center gap-x-2">
            <Button
              color="default"
              circle="true"
              onClick={() => setRefresh(true)}
            >
              <MdOutlineRefresh size={20} />
            </Button>
          </div>
        </div>

        <div className="-mx-4 mt-4 overflow-x-auto sm:-mx-0 lg:overflow-x-visible">
          {loading ? (
            <div className="py-4 text-center text-sm text-zinc-500">
              Loading stakes...
            </div>
          ) : stakes.length === 0 ? (
            <div className="py-4 text-center text-sm text-zinc-500">
              No stakes found
            </div>
          ) : (
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
                    Chain
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-right">
                    Amount
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left">
                    Height
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left">
                    Sender
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-right">
                    Fee
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
                {stakes.map((stake, i) => (
                  <tr
                    key={i}
                    className="align-top text-sm text-zinc-400 dark:text-zinc-500"
                  >
                    <td className="py-4 pl-4 pr-3 text-left sm:pl-0">
                      <div className="flex flex-col gap-y-0.5">
                        <Copy value={stake.txHash}>
                          <Link
                            href={`/stake/${stake.txHash}`}
                            target="_blank"
                            className="font-semibold text-blue-600 dark:text-blue-500"
                          >
                            {ellipse(stake.txHash, 6)}
                          </Link>
                        </Copy>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-left">
                      <span className="rounded-xl bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                        {stake.chain}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-right">
                      <Number
                        value={stake.amount}
                        format="0,0.00"
                        className="font-semibold text-zinc-900 dark:text-zinc-100"
                      />
                    </td>
                    <td className="px-3 py-4 text-left">
                      <Link
                        href={`/block/${stake.height}`}
                        target="_blank"
                        className="font-medium text-blue-600 dark:text-blue-500"
                      >
                        <Number value={stake.height} />
                      </Link>
                    </td>
                    <td className="px-3 py-4 text-left">
                      <Profile address={stake.sender} />
                    </td>
                    <td className="px-3 py-4 text-right">
                      <Number
                        value={stake.fee}
                        format="0,0.000000"
                        suffix=""
                        className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
                      />
                    </td>
                    <td className="flex items-center justify-end py-4 pl-3 pr-4 text-right sm:pr-0">
                      <TimeAgo timestamp={stake.timestamp} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Container>
  )
}
