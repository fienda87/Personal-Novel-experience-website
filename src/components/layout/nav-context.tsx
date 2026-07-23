'use client'

import { createContext, useContext, useState } from 'react'

interface NavCtxType {
  isMenuOpen: boolean
  setMenuOpen: (v: boolean) => void
}

const NavCtx = createContext<NavCtxType>({
  isMenuOpen: false,
  setMenuOpen: () => {},
})

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setMenuOpen] = useState(false)
  return (
    <NavCtx.Provider value={{ isMenuOpen, setMenuOpen }}>
      {children}
    </NavCtx.Provider>
  )
}

export function useNav() {
  return useContext(NavCtx)
}
