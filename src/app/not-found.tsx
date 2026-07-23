import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <span className="font-serif text-8xl text-moonstone-blue opacity-30">404</span>
      <h1 className="font-serif text-3xl text-on-surface">Chronicle Not Found</h1>
      <p className="text-on-surface-variant max-w-md">
        This page has been lost to the void. The Archivists have no record of its existence.
      </p>
      <Link
        href="/"
        className="liquid-mercury-btn px-8 py-3 rounded-full font-semibold text-sm"
      >
        Return to Library
      </Link>
    </div>
  )
}
