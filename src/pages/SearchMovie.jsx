import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchMovies as searchMoviesAPI } from '../services/movieService';
import MovieCard from '../components/cards/MovieCard';
import './SearchMovie.css';


export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!query.trim()) {
      setMovies([]);
      setError('No search query provided');
      return;
    }

    const fetchSearchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await searchMoviesAPI(query, currentPage);
        setMovies(result.results || []);
        setTotalPages(result.total_pages || 0);
      } catch (err) {
        setError(err.message || 'Failed to search movies');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, currentPage]);

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  if (error && !query) {
    return (
      <div className="search-page error">
        <div className="search-page-container">
          <span className="empty-icon">🔍</span>
          <h1>No search query</h1>
          <p>Please enter a search term to find movies</p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-page">
      <div className="search-page-header">
        <div className="search-page-container">
          <h1 className="search-page-title">
            Search Results for "{query}"
          </h1>
        </div>
      </div>

      <div className="search-page-content">
        <div className="search-page-container">
          {loading ? (
            <div className="search-loading">
              <div className="spinner"></div>
              <p>Searching for "{query}"...</p>
            </div>
          ) : error ? (
            <div className="search-error">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          ) : movies.length === 0 ? (
            <div className="search-empty">
              <span className="empty-icon">🎬</span>
              <h2>No movies found</h2>
              <p>Try a different search term</p>
            </div>
          ) : (
            <>
              <div className="search-results-grid">
                {movies.map((movie) => (
                  <div
                    key={movie.id}
                    className="search-result-card"
                    onClick={() => handleMovieClick(movie.id)}
                  >
                    <MovieCard movie={movie} variant="grid" />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="search-pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    aria-label="First page"
                  >
                    «
                  </button>
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                  >
                    ‹
                  </button>

                  <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                  >
                    ›
                  </button>
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    aria-label="Last page"
                  >
                    »
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
