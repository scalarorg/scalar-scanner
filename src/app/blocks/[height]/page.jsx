import { redirect } from 'next/navigation'

export default function BlockPage({ params }) {
  redirect(`/block/${params.height}`)
}
