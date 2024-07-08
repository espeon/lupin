// root.tsx

import {ThemeProvider, useTheme, PreventFlashOnWrongTheme} from 'remix-themes'
import {themeSessionResolver} from './sessions.server'
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from '@remix-run/react'
import "./tailwind.css"
import { LoaderFunction } from '@remix-run/node'

// Return the theme from the session storage using the loader
export const loader: LoaderFunction = async ({request}) => {
  const {getTheme} = await themeSessionResolver(request)
  return {
    theme: getTheme(),
  }
}

// Wrap your app with ThemeProvider.
// `specifiedTheme` is the stored theme in the session storage.
// `themeAction` is the action name that's used to change the theme in the session storage.
export default function AppWithProviders() {
  const data = useLoaderData()
  return (
    <ThemeProvider specifiedTheme={data.theme} themeAction="/action/set-theme">
      <App />
    </ThemeProvider>
  )
}

// Use the theme in your app.
// If the theme is missing in session storage, PreventFlashOnWrongTheme will get
// the browser theme before hydration and will prevent a flash in browser.
// The client code runs conditionally, it won't be rendered if we have a theme in session storage.
function App() {
  const data = useLoaderData()
  const [theme] = useTheme()
  return (
    <html lang="en" className={theme || 'dark'} >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}