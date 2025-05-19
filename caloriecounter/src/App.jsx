import './App.css';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/navbar';
import HomePage from './pages/Home';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </div>
  );
}

export default App;
