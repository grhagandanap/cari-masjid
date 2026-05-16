import { HeadContent, Scripts, createRootRoute, useLocation } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { Navbar } from '#/components/Navbar.tsx'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  notFoundComponent: () => (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-muted-foreground">This page could not be found.</p>
    </div>
  ),
  head: () => ({
    meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { title: 'Cari Masjid' }, // ← change title here
    ],
    links: [
    { rel: 'stylesheet', href: appCss },
    { rel: 'icon', href: '/GG Logo (Square).jpg' }, // ← add favicon here
  ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const hideNav = location.pathname.startsWith('/auth')
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {hideNav ? null : <Navbar />}
        {children}
        <Toaster richColors position="top-right" />
        <Scripts />
      </body>
    </html>
  )
}
