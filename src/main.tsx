import dayjs from "dayjs"
import React from "react"
import ReactDOM from "react-dom/client"
import { QueryClient, QueryClientProvider } from "react-query"

import App from "./UI/App"
import "dayjs/locale/sv"

import "./main.scss"

dayjs.locale("sv")

// @ts-ignore TS2339: Property CESIUM_BASE_URL does not exist on type Window & typeof globalThis
window.CESIUM_BASE_URL = "/Cesium/"

const queryClient = new QueryClient()

ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App/>
    </QueryClientProvider>
  </React.StrictMode>
)
