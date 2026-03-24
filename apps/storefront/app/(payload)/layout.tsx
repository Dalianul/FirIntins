import config from "@payload-config"
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts"
import React from "react"
import { importMap } from "./admin/importMap.js"
import "@payloadcms/next/css"

export const dynamic = "force-dynamic"

type Args = {
  children: React.ReactNode
}

export default async function PayloadLayout({ children }: Args) {
  async function serverFunction(
    args: Parameters<typeof handleServerFunctions>[0],
  ) {
    "use server"
    return handleServerFunctions({
      ...args,
      config,
      importMap,
    })
  }

  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  )
}
