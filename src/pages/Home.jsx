import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import movieService, { imageUrl, getGenres, discoverMovies } from '../services/movieService';
import MovieCard from '../components/cards/MovieCard';
import './Home.css';

function useCardsPerPage() {
  const getCount = () => {
    const w = window.innerWidth;
    if (w > 1200) return 5;
    if (w > 900) return 4;
    if (w > 600) return 3;
    if (w > 380) return 2;
    return 1;
  };

  const [count, setCount] = useState(getCount);

  useEffect(() => {
    let timer;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setCount(getCount()), 150);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return count;
}

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

const GRID_PER_PAGE = 10;
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i);

export default function Home() {
  // ── Навігація ──
  const navigate = useNavigate();
  
  // ── Carousel ──
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [sidebarMovies, setSidebarMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [carouselPage, setCarouselPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cardsPerPage = useCardsPerPage();

  const goToPage = useCallback((page) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCarouselPage(page);
      setIsAnimating(false);
    }, 300);
  }, [isAnimating]);

  // ── Grid ──
  const [allMovies, setAllMovies] = useState([]);
  const [gridPage, setGridPage] = useState(1);
  const [totalGridPages, setTotalGridPages] = useState(1);
  const [gridLoading, setGridLoading] = useState(false);
  const [genres, setGenres] = useState([]);
  const [filters, setFilters] = useState({
    genre: '',
    yearMin: '',
    yearMax: '',
    ratingMin: '',
    ratingMax: '',
    sortBy: 'popularity.desc',
  });

  const CARDS_PER_PAGE = useCardsPerPage();
  const totalPages = Math.ceil(topRatedMovies.length / CARDS_PER_PAGE);
  const hasActiveFilters = filters.genre || filters.yearMin || filters.yearMax ||
    filters.ratingMin || filters.ratingMax || filters.sortBy !== 'popularity.desc';

  // ── Скидання сторінки карусель при ресайзі ──
  useEffect(() => {
    setCarouselPage((prev) => Math.min(prev, Math.max(0, totalPages - 1)));
  }, [totalPages]);

  // ── Початкове завантаження ──
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const [popularResult, topRatedResult] = await Promise.all([
          movieService.getPopularMovies(1),
          movieService.getTopRatedMovies(1),
        ]);

        if (popularResult.results.length > 0) {
          setFeaturedMovie(popularResult.results[0]);
          setSidebarMovies(popularResult.results.slice(1, 4));
        }
        if (topRatedResult.results.length > 0) {
          setTopRatedMovies(topRatedResult.results);
        }
        setError(null);
      } catch (err) {
        setError('Failed to load movies');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // ── Завантаження жанрів ──
  useEffect(() => {
    getGenres('en').then(setGenres);
  }, []);

  // ── Завантаження гріду при зміні фільтрів/сторінки ──
  useEffect(() => {
    const fetchGrid = async () => {
      setGridLoading(true);
      window.scrollTo({ top: document.querySelector('.movies-section')?.offsetTop - 20, behavior: 'smooth' });

      try {
        const params = {
          page: gridPage,
          sort_by: filters.sortBy,
          ...(filters.genre && { with_genres: filters.genre }),
          ...(filters.yearMin && { 'primary_release_date.gte': `${filters.yearMin}-01-01` }),
          ...(filters.yearMax && { 'primary_release_date.lte': `${filters.yearMax}-12-31` }),
          ...(filters.ratingMin && { 'vote_average.gte': filters.ratingMin }),
          ...(filters.ratingMax && { 'vote_average.lte': filters.ratingMax }),
        };
        const result = await discoverMovies(params);
        setAllMovies(result.results || []);
        setTotalGridPages(Math.min(result.total_pages || 1, 500));
      } catch (err) {
        console.error('Grid fetch error:', err);
      } finally {
        setGridLoading(false);
      }
    };
    fetchGrid();
  }, [filters, gridPage]);

  // ── Авто-скрол карусель ──
  useEffect(() => {
    if (totalPages <= 1) return;
    const interval = setInterval(() => {
      goToPage((carouselPage + 1) % totalPages);
    }, 5000);
    return () => clearInterval(interval);
  }, [totalPages, carouselPage, isAnimating, goToPage]);

  // ── Карусель навігація з анімацією ─

  const handleCarouselPrev = () => goToPage((carouselPage - 1 + totalPages) % totalPages);
  const handleCarouselNext = () => goToPage((carouselPage + 1) % totalPages);

  // ── Фільтри ──
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

  const backdropUrl = featuredMovie
    ? imageUrl.backdrop(featuredMovie.backdropPath, 'w1280')
    : null;

  return (
    <div className="home-page">
      <div className="home-container">

        {/* Featured Movie Banner */}
        <div className="featured-section">
          <div 
            className="featured-banner-wrapper"
            onClick={() => navigate(`/movie/${featuredMovie?.id}`)}
            style={{ cursor: 'pointer' }}
          >
            {backdropUrl && (
              <img src={backdropUrl} alt={featuredMovie.title} className="featured-backdrop" />
            )}
            <div className="featured-overlay" />
            <div className="featured-content">
              <h1 className="featured-title">{featuredMovie?.title}</h1>
              <div className="featured-meta">
                <span className="featured-rating">
                  <span className="rating-icon">★</span>
                  {featuredMovie?.voteAverage?.toFixed(1)}/10
                </span>
                <span className="featured-year">{featuredMovie?.releaseYear || 'N/A'}</span>
              </div>
              <p className="featured-description">
                {featuredMovie?.overview || 'No description available'}
              </p>
              <button 
                className="featured-btn"
                onClick={() => navigate(`/movie/${featuredMovie?.id}`)}
              >
                Watch Now
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar-section">
          <h2 className="sidebar-title">Trending Now</h2>
          <div className="sidebar-movies">
            {sidebarMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} variant="sidebar" />
            ))}
          </div>
        </div>
      </div>

      {/* Top Rated Carousel */}
      {topRatedMovies.length > 0 && (
        <div className="carousel-section">
          <div className="carousel-wrapper">
            <h2 className="carousel-title">Top Rated Movies</h2>

            <div className="carousel-container">
              <button
                className="carousel-btn carousel-btn-prev"
                onClick={handleCarouselPrev}
                disabled={carouselPage === 0}
                aria-label="Previous"
              >
                ‹
              </button>

              <div className={`carousel-track ${isAnimating ? 'is-animating' : ''}`}>
                {topRatedMovies
                  .slice(carouselPage * cardsPerPage, (carouselPage + 1) * cardsPerPage)
                  .map((movie) => (
                    <div key={movie.id} className="carousel-item">
                      <MovieCard movie={movie} variant="carousel" />
                    </div>
                  ))}
              </div>

              <button
                className="carousel-btn carousel-btn-next"
                onClick={handleCarouselNext}
                disabled={carouselPage >= totalPages - 1}
                aria-label="Next"
              >
                ›
              </button>
            </div>

            <div className="carousel-indicators">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`carousel-indicator ${i === carouselPage ? 'active' : ''}`}
                  onClick={() => goToPage(i)}
                  aria-label={`Page ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════
          MOVIES GRID SECTION
      ══════════════════════════════════ */}
      <div className="movies-section">

        {/* Header */}
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