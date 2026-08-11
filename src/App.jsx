import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

import { useEffect } from "react"
import axios from "axios"


import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom"

import Login from './pages/login'
// import AppPage from './pages/AppPage'
import ViewMode from './pages/viewmode'


import {Link} from "react-router-dom"


function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* <Route path="/" element={<AppPage />} /> */}
        <Route path='/login' element={<Login />} />
        <Route path='/' element={<ViewMode />} />


      </Routes>

    </BrowserRouter>

    

  )

}

export default App

