export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <main className="min-h-screen p-0">
        {children}
      </main>
    </div>
  )
}
