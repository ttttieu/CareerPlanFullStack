import { Routes, Route, Link } from 'react-router-dom';

import About from './routes/About'
import './App.css'
function App() {
  return (
    <>
      <nav>
        <ul>          
          <li>
            <Link to="/about">About</Link>
          </li>
        </ul>
      </nav>
      <Routes>        
        <Route path="/about" element={<About />} />
      </Routes>      
    </>
  )
}

export default App
