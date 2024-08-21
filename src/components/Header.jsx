'use client'

import { Fragment, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Popover, Transition } from '@headlessui/react'
import clsx from 'clsx'
import _ from 'lodash'
import { FiChevronDown } from 'react-icons/fi'

import { Container } from '@/components/Container'
import { ScalarLogo } from '@/components/ScalarLogo'
import { NavLink } from '@/components/NavLink'
import { Search } from '@/components/Search'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Tag } from '@/components/Tag'
import { Number } from '@/components/Number'
import { useGlobalStore } from '@/components/Global'
import { ENVIRONMENT, getAssetData, getITSAssetData } from '@/lib/config'
import { toArray } from '@/lib/parser'
import { isNumber, toNumber } from '@/lib/number'

const navigations = [
  // { title: 'General Message Passing', href: '/gmp/search' },
  // {
  //   title: 'Interchain',
  //   children: [
  //     { title: 'Statistics', href: '/interchain' },
  //     { title: 'General Message Passing', href: '/gmp/search' },
  //     { title: 'Token Transfers', href: '/transfers/search' },
  //   ],
  // },
  // {
  //   title: 'Network',
  //   children: toArray([
  //     { title: 'Validators', href: '/validators' },
  //     ['devnet-amplifier', 'devnet-verifiers'].includes(ENVIRONMENT) && { title: 'Verifiers', href: '/verifiers' },
  //     { title: 'Blocks', href: '/blocks' },
  //     { title: 'Transactions', href: '/transactions' },
  //     { title: 'EVM Polls', href: '/evm-polls' },
  //     ['devnet-amplifier', 'devnet-verifiers'].includes(ENVIRONMENT) && { title: 'VM Polls', href: '/vm-polls' },
  //     { title: 'EVM Batches', href: '/evm-batches' },
  //     { title: 'Proposals', href: '/proposals' },
  //   ]),
  // },
  // ENVIRONMENT === 'mainnet' && { title: 'TVL', href: '/tvl' },
  // {
  //   title: 'Resources',
  //   children: [
  //     { title: 'Chains', href: '/resources/chains' },
  //     { title: 'Assets', href: '/resources/assets' },
  //   ],
  // },
]

const environments = [
  { name: 'mainnet', href: 'https://axelarscan.io' },
  { name: 'testnet', href: 'https://testnet.axelarscan.io' },
  { name: 'stagenet', href: 'https://stagenet.axelarscan.io' },
  { name: 'devnet-amplifier', href: 'https://devnet-amplifier.axelarscan.io' },
  { name: 'devnet-verifiers', href: 'https://devnet-verifiers.axelarscan.io' },
].filter(
  (d) =>
    !['stagenet', 'devnet-amplifier', 'devnet-verifiers'].includes(d.name) ||
    d.name === ENVIRONMENT,
)

function MobileNavLink({ href, children, className }) {
  const pathname = usePathname()

  return (
    <Popover.Button
      as={Link}
      href={href}
      className={clsx(
        'block w-full px-2 py-1',
        href === pathname
          ? 'text-blue-600 dark:text-blue-500'
          : 'text-zinc-700 dark:text-zinc-300',
        className,
      )}
    >
      {children}
    </Popover.Button>
  )
}

function MobileNavIcon({ open }) {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5 overflow-visible stroke-zinc-700 dark:stroke-zinc-300"
      fill="none"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path
        d="M0 1H14M0 7H14M0 13H14"
        className={clsx(
          'origin-center transition',
          open && 'scale-90 opacity-0',
        )}
      />
      <path
        d="M2 2L12 12M12 2L2 12"
        className={clsx(
          'origin-center transition',
          !open && 'scale-90 opacity-0',
        )}
      />
    </svg>
  )
}

function MobileNavigation() {
  return (
    <Popover>
      <Popover.Button
        className="relative z-10 flex h-8 w-8 items-center justify-center ui-not-focus-visible:outline-none"
        aria-label="Toggle Navigation"
      >
        {({ open }) => <MobileNavIcon open={open} />}
      </Popover.Button>
      <Transition.Root>
        <Transition.Child
          as={Fragment}
          enter="duration-150 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="duration-150 ease-in"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Popover.Overlay className="fixed inset-0 bg-zinc-100/50 dark:bg-zinc-900/50" />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter="duration-150 ease-out"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="duration-100 ease-in"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Popover.Panel
            as="div"
            className="absolute inset-x-0 top-full mt-4 flex origin-top flex-col rounded-2xl bg-white p-4 text-lg tracking-tight text-zinc-900 shadow-xl ring-1 ring-zinc-900/5 dark:bg-zinc-800 dark:text-zinc-100"
          >
            {/*<div className="md:hidden">
              <Search />
            </div>*/}
            {navigations.map((d, i) => {
              const { title, href, children } = { ...d }

              if (children) {
                return (
                  <div key={i} className="flex flex-col">
                    <span className="px-2 pb-1 pt-4 font-bold">{title}</span>
                    {children.map((c, j) => (
                      <MobileNavLink key={j} href={c.href}>
                        {c.title}
                      </MobileNavLink>
                    ))}
                  </div>
                )
              }

              return (
                href && (
                  <MobileNavLink key={i} href={href} className="pt-4 font-bold">
                    {title}
                  </MobileNavLink>
                )
              )
            })}
          </Popover.Panel>
        </Transition.Child>
      </Transition.Root>
    </Popover>
  )
}

function EnvirontmentLink({ name, href, children }) {
  return (
    <Link
      href={href}
      className={clsx(
        'inline-block w-full whitespace-nowrap rounded-lg p-2 text-sm capitalize hover:text-blue-600 dark:hover:text-blue-500',
        name === ENVIRONMENT
          ? 'text-blue-600 dark:text-blue-500'
          : 'text-zinc-700 dark:text-zinc-300',
      )}
    >
      {children}
    </Link>
  )
}

export function Header() {
  const pathname = usePathname()
  const [popoverOpen, setPopoverOpen] = useState(null)
  const [popoverEnvironmentOpen, setPopoverEnvironmentOpen] = useState(false)
  const [data, setData] = useState(null)
  const { assets, itsAssets, tvl } = useGlobalStore()

  useEffect(() => {
    if (
      assets &&
      itsAssets &&
      tvl?.data &&
      tvl.data.length > (assets.length + itsAssets.length) / 2
    ) {
      setData(
        tvl.data.map((d) => {
          const { asset, assetType, total } = { ...d }
          let { price } = { ...d }

          const assetData =
            assetType === 'its'
              ? getITSAssetData(asset, itsAssets)
              : getAssetData(asset, assets)
          price = toNumber(
            isNumber(price)
              ? price
              : isNumber(assetData?.price)
                ? assetData.price
                : -1,
          )

          return { ...d, value: toNumber(total) * price }
        }),
      )
    }
  }, [assets, itsAssets, tvl, setData])

  return (
    <header
      className={clsx(
        'bg-white py-6 dark:bg-zinc-900',
        ['/tvl'].includes(pathname) && !!tvl && 'lg:w-tvl',
      )}
    >
      <Container
        className={['/tvl'].includes(pathname) && !!tvl && clsx('lg:!mx-24')}
      >
        <nav className="relative z-50 flex justify-between gap-x-4">
          <div className="flex items-center xl:gap-x-12">
            <Link href="/" aria-label="Dashboard">
              <ScalarLogo className="h-10 w-auto" />
            </Link>
            <div className="hidden xl:flex xl:gap-x-4">
              {navigations.map((d, i) => {
                const { title, href, children } = { ...d }

                if (children) {
                  return (
                    <Popover
                      key={i}
                      onMouseEnter={() => setPopoverOpen(i)}
                      onMouseLeave={() => setPopoverOpen(null)}
                      className="relative"
                    >
                      <Popover.Button
                        className={clsx(
                          'whitespace-nowrap rounded-lg text-sm uppercase focus:outline-none',
                          href === pathname ||
                            children.find((c) => c.href === pathname)
                            ? 'text-blue-600 dark:text-blue-500'
                            : 'text-zinc-700 dark:text-zinc-300',
                        )}
                      >
                        <Link
                          href={children[0].href}
                          className="inline-flex items-center gap-x-1 p-2"
                        >
                          <span>{title}</span>
                          <FiChevronDown className="h-4 w-4" />
                        </Link>
                      </Popover.Button>

                      <Transition
                        show={i === popoverOpen}
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                      >
                        <Popover.Panel className="absolute left-1/2 z-10 flex w-screen max-w-min -translate-x-1/2">
                          <div className="shrink rounded-xl bg-white p-2 text-sm shadow-lg ring-1 ring-zinc-900/5 dark:bg-zinc-800">
                            {children.map((c, j) => (
                              <NavLink key={j} href={c.href}>
                                {c.title}
                              </NavLink>
                            ))}
                          </div>
                        </Popover.Panel>
                      </Transition>
                    </Popover>
                  )
                }

                return (
                  href && (
                    <NavLink key={i} href={href}>
                      <div className="flex items-center">
                        {title}
                        {/*title === 'TVL' && !!data && (
                        <Tag className="w-fit bg-zinc-100 dark:bg-zinc-800 ml-2">
                          <Number
                            value={_.sumBy(data.filter(d => d.value > 0), 'value')}
                            format="0,0.00a"
                            prefix="$"
                            noTooltip={true}
                            className="text-green-600 dark:text-green-500 text-xs font-semibold"
                          />
                        </Tag>
                      )*/}
                      </div>
                    </NavLink>
                  )
                )
              })}
            </div>
          </div>
          <div className="flex items-center gap-x-4">
            <div className={clsx('block' /*, 'hidden md:block'*/)}>
              <Search />
            </div>
            <div className="hidden xl:block">
              <Popover
                onMouseEnter={() => setPopoverEnvironmentOpen(true)}
                onMouseLeave={() => setPopoverEnvironmentOpen(false)}
                className="relative"
              >
                <Popover.Button className="whitespace-nowrap rounded-lg p-2 text-sm capitalize text-zinc-700 focus:outline-none dark:text-zinc-300">
                  <span>{ENVIRONMENT}</span>
                </Popover.Button>

                <Transition
                  show={popoverEnvironmentOpen}
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                >
                  <Popover.Panel className="absolute left-1/2 z-10 flex w-screen max-w-min -translate-x-1/2">
                    <div className="shrink rounded-xl bg-white p-2 text-sm shadow-lg ring-1 ring-zinc-900/5 dark:bg-zinc-800">
                      {environments.map((d, i) => (
                        <EnvirontmentLink key={i} {...d}>
                          {d.name}
                        </EnvirontmentLink>
                      ))}
                    </div>
                  </Popover.Panel>
                </Transition>
              </Popover>
            </div>
            {/* <ThemeToggle /> */}
            <div className="-mr-1 xl:hidden">
              <MobileNavigation />
            </div>
          </div>
        </nav>
      </Container>
    </header>
  )
}
