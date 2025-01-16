// import { Overview } from '@/components/Overview'
// import { GMPs } from '@/components/GMPs'
import { redirect } from 'next/navigation'

export default function Index() {
  // TODO_SCALAR: Uncomment the line below to display the Overview component when api is ready
  // return <GMPs />
  // return <Overview />
  redirect('/transfers/search')
}
