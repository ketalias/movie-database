import { useState, useEffect } from 'react';
import { getGenres } from '../services/movieService';
import MovieCard from '../components/cards/MovieCard';
import CarouselSection from '../components/layout/CarouselSection';
import usePopularMovies from '../hooks/usePopularMovies';
import useTopRatedMovies from '../hooks/useTopRatedMovies';
import useDiscoverMovies from '../hooks/useDiscoverMovies';
import './Home.css';

// ── Хелпер пагінації ──
function getPaginationRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const delta = 2;
  const range = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  range.push(1);
  if (left > 2) range.push('...');
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 1) range.push('...');
  range.push(total);

  return range;
}

const GRID_PER_PAGE = 20;
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i);

export default function Home() {
  
  const { movies: popularMovies, loading: popularLoading, error: popularError } = usePopularMovies();
  const { movies: topRatedMovies, loading: topRatedLoading, error: topRatedError } = useTopRatedMovies();
  
  // ── Grid ──
  const [gridPage, setGridPage] = useState(1);
  const [genres, setGenres] = useState([]);
  const [filters, setFilters] = useState({
    genre: '',
    yearMin: '',
    yearMax: '',
    ratingMin: '',
    ratingMax: '',
    sortBy: 'popularity.desc',
  });

  // ── Discover 
  const { movies: allMovies, totalPages: totalGridPages, loading: gridLoading } = useDiscoverMovies(gridPage, filters);

  const loading = popularLoading || topRatedLoading;
  const error = popularError || topRatedError;
  const hasActiveFilters = filters.genre || filters.yearMin || filters.yearMax ||
    filters.ratingMin || filters.ratingMax || filters.sortBy !== 'popularity.desc';

  useEffect(() => {
    getGenres('en').then(setGenres);
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setGridPage(1);
  };

  const handleResetFilters = () => {
    setFilters({ genre: '', yearMin: '', yearMax: '', ratingMin: '', ratingMax: '', sortBy: 'popularity.desc' });
    setGridPage(1);
  };

  if (loading) return <div className="home-page loading">Loading...</div>;
  if (error) return <div className="home-page error">{error}</div>;

  return (
    <div className="home-page">
      <CarouselSection 
        topRatedMovies={topRatedMovies} 
        popularMovies={popularMovies} 
        loading={loading} 
      />
      <div className="movies-section">

        <div className="movies-header">
          <h2 className="movies-title">Browse Movies</h2>
          {hasActiveFilters && (
            <button className="filters-reset-btn" onClick={handleResetFilters}>
              ✕ Clear filters
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="filter-group">
            <label className="filter-label">Genre</label>
            <select
              className="filter-select"
              value={filters.genre}
              onChange={(e) => handleFilterChange('genre', e.target.value)}
            >
              <option value="">All genres</option>
              {genres.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Year from</label>
            <select
              className="filter-select"
              value={filters.yearMin}
              onChange={(e) => handleFilterChange('yearMin', e.target.value)}
            >
              <option value="">Any</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Year to</label>
            <select
              className="filter-select"
              value={filters.yearMax}
              onChange={(e) => handleFilterChange('yearMax', e.target.value)}
            >
              <option value="">Any</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Rating from</label>
            <select
              className="filter-select"
              value={filters.ratingMin}
              onChange={(e) => handleFilterChange('ratingMin', e.target.value)}
            >
              <option value="">Any</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <option key={n} value={n}>{n}.0+</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Rating to</label>
            <select
              className="filter-select"
              value={filters.ratingMax}
              onChange={(e) => handleFilterChange('ratingMax', e.target.value)}
            >
              <option value="">Any</option>
              {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>{n}.0</option>
              ))}
            </select>
          </div>

          <div className="filter-group filter-group--sort">
            <label className="filter-label">Sort by</label>
            <select
              className="filter-select"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="popularity.desc">Popularity ↓</option>
              <option value="popularity.asc">Popularity ↑</option>
              <option value="vote_average.desc">Rating ↓</option>
              <option value="vote_average.asc">Rating ↑</option>
              <option value="primary_release_date.desc">Date ↓</option>
              <option value="primary_release_date.asc">Date ↑</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {gridLoading ? (
          <div className="grid-loading">
            {Array.from({ length: GRID_PER_PAGE }).map((_, i) => (
              <div key={i} className="movie-skeleton" />
            ))}
          </div>
        ) : allMovies.length === 0 ? (
          <div className="grid-empty">
            <span className="grid-empty-icon">🎬</span>
            <p>No movies found. Try changing the filters.</p>
          </div>
        ) : (
          <div className="movies-grid">
            {allMovies.map((movie, i) => (
              <div key={movie.id} className="grid-card" style={{ animationDelay: `${i * 40}ms` }}>
                <MovieCard movie={movie} variant="grid" />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!gridLoading && totalGridPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn pagination-edge"
              onClick={() => setGridPage(1)}
              disabled={gridPage === 1}
              aria-label="First page"
            >
              «
            </button>
            <button
              className="pagination-btn"
              onClick={() => setGridPage((p) => Math.max(1, p - 1))}
              disabled={gridPage === 1}
              aria-label="Previous page"
            >
              ‹
            </button>

            {getPaginationRange(gridPage, totalGridPages).map((item, i) =>
              item === '...' ? (
                <span key={`dots-${i}`} className="pagination-dots">…</span>
              ) : (
                <button
                  key={item}
                  className={`pagination-btn pagination-num ${item === gridPage ? 'active' : ''}`}
                  onClick={() => setGridPage(item)}
                >
                  {item}
                </button>
              )
            )}

            <button
              className="pagination-btn"
              onClick={() => setGridPage((p) => Math.min(totalGridPages, p + 1))}
              disabled={gridPage === totalGridPages}
              aria-label="Next page"
            >
              ›
            </button>
            <button
              className="pagination-btn pagination-edge"
              onClick={() => setGridPage(totalGridPages)}
              disabled={gridPage === totalGridPages}
              aria-label="Last page"
            >
              »
            </button>
          </div>
        )}
      </div>

    </div>
  );
}