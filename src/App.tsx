import React from 'react'
import './App.css'
import CustomDatePicker from './components/CustomDatePicker'

const App: React.FC = () => {
  return (
    <div className="app-container">
      <h1>Datepicker Range Customizado</h1>
      <div className="picker-section">
        <CustomDatePicker />
      </div>
    </div>
  )
}

export default App
