import Sidebar from './Sidebar.jsx'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-paper-50">
      <Sidebar />
      <main className="flex-1 px-8 py-8 md:px-12 md:py-10 max-w-6xl">{children}</main>
    </div>
  )
}
