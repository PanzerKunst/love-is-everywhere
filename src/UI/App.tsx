import React from "react"
import { createBrowserRouter, RouterProvider } from "react-router-dom"

import HomePage from "./HomePage/HomePage.tsx"

import "./App.scss"

const router = createBrowserRouter([
  {
    path: "/love-is-everywhere",
    element: <HomePage/>,
  },
])

export default function App() {
  return <RouterProvider router={router}/>
}
