import './App.css';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/navbar';
import HomePage from './pages/Home';
import Login from './pages/LogIn';
import Signup from './pages/SignUp';
import FoodTracker from './pages/Calculating';

function App() {
  return (
    <div className="App">
      <NavBar/>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element = {<Login/>}/>
        <Route path="/signup" element = {<Signup/>}/>
        <Route path="/count-your-cal" element = {<FoodTracker/>}/>

      </Routes>
    </div>
  );
}

export default App;
