import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Restaurant Menu",
  description: "Digital menus for restaurants",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
