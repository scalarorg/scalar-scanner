export const searchStakes = async () => {
  try {
    const response = await fetch('/api/stakes')
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch stakes')
    }

    return data.data
  } catch (error) {
    console.error('Failed to fetch stakes:', error)
    return null
  }
}
