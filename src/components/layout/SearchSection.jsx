import { useNavigate } from 'react-router-dom';
import MovieCard from '../cards/MovieCard';
import useSearchMovies from '../../hooks/useSearchMovies';
import './SearchSection.css';

export default function SearchSection() {
  const navigate = useNavigate();
  const { query, setQuery, movies, loading, error } = useSearchMovies();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?query=${encodeURIComponent(query)}`);
      setQuery('');
    }
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const handleViewAll = () => {
    if (query.trim()) {
      navigate(`/search?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="search-section">
      {/* Search Input */}
      <div className="search-container">
        <form onSubmit={handleSubmit} className="search-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search movies"
          />
          {query && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </form>
      </div>

      {/* Search Results */}
      {query && (
        <div className="search-results">
          {loading ? (
            <div className="search-loading">
              <span className="spinner"></span>
              Searching...
            </div>
          ) : error ? (
            <div className="search-error">
              {error}
            </div>
          ) : movies.length === 0 ? (
            <div className="search-empty">
              <span className="empty-icon">🎬</span>
              <p>No movies found for "{query}"</p>
            </div>
          ) : (
            <>
              <div className="search-grid">
                {movies.slice(0, 6).map((movie) => (
                  <div 
                    key={movie.id} 
                    className="search-result-item"
                    onClick={() => handleMovieClick(movie.id)}
                  >
                    <MovieCard movie={movie} variant="search" />
                  </div>
                ))}
              </div>
              {movies.length > 6 && (
                <button className="search-view-all" onClick={handleViewAll}>
                  View all {movies.length} results →
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
