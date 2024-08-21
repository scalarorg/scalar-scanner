'use client'

import Image from 'next/image'
// import { useTheme } from 'next-themes'

export function ScalarLogo(props) {
  // const { resolvedTheme } = useTheme()

  return (
    <div {...props} className={`${props.className} flex items-center`}>
      <Image
        src={`/logos/logo_scalar.png`}
        alt=""
        width={257}
        height={21}
        unoptimized
        className="min-w-4"
      />
    </div>
  )
}
