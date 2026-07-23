'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <span className="font-serif text-8xl text-moonstone-blue opacity-30">!</span>
      <h1 className="font-serif text-3xl text-on-surface">A Rift in the Narrative</h1>
      <p className="text-on-surface-variant max-w-md">
        Something went wrong within the archive. The pages are scattering.
      </p>
      <button
        onClick={reset}
        className="liquid-mercury-btn px-8 py-3 rounded-full font-semibold text-sm"
      >
        Attempt Recovery
      </button>
    </div>
  )
}
