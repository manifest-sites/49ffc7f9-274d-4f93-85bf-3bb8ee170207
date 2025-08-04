import { useState, useEffect } from 'react'
import Monetization from './components/monetization/Monetization'
import ColorVotingApp from './components/ColorVotingApp'

function App() {

  return (
    <Monetization>
      <ColorVotingApp />
    </Monetization>
  )
}

export default App