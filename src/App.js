import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MoviePage from './pages/MoviePage';
import SearchMovie from './pages/SearchMovie';
import NavBar from './components/layout/NavBar';
import FooterComp from './components/layout/FooterComp';
import './App.css';

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MoviePage />} />
        <Route path="/search" element={<SearchMovie />} />
      </Routes>
      <FooterComp />
    </Router>
  );
}

export default App;