import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieCard from '../cards/MovieCard';
import { imageUrl } from '../../services/movieService';
import useCardsPerPage from '../../hooks/useCardsPerPage';
import './CarouselSection.css';

export default function CarouselSection({ topRatedMovies, popularMovies, loading }) {
  const navigate = useNavigate();
  const cardsPerPage = useCardsPerPage();

  // ── Featured Movie and Sidebar ──
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [sidebarMovies, setSidebarMovies] = useState([]);

  // ── Carousel State ──
  const [carouselPage, setCarouselPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // ── Встановлення featured та sidebar з популярних фільмів ──
  useEffect(() => {
    if (popularMovies.length > 0) {
      setFeaturedMovie(popularMovies[0]);
      setSidebarMovies(popularMovies.slice(1, 4));
    }
  }, [popularMovies]);

  // ── Carousel Navigation ──
  const totalPages = Math.ceil(topRatedMovies.length / cardsPerPage);

  const goToPage = useCallback((page) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCarouselPage(page);
      setIsAnimating(false);
    }, 300);
  }, [isAnimating]);

  const handleCarouselPrev = () => goToPage((carouselPage - 1 + totalPages) % totalPages);
  const handleCarouselNext = () => goToPage((carouselPage + 1) % totalPages);

  // ── Reset carousel page on resize ──
  useEffect(() => {
    setCarouselPage((prev) => Math.min(prev, Math.max(0, totalPages - 1)));
  }, [totalPages]);

  // ── Auto-scroll carousel ──
  useEffect(() => {
    if (totalPages <= 1) return;
    const interval = setInterval(() => {
      goToPage((carouselPage + 1) % totalPages);
    }, 5000);
    return () => clearInterval(interval);
  }, [totalPages, carouselPage, isAnimating, goToPage]);

  if (loading) return null;

  const backdropUrl = featuredMovie
    ? imageUrl.backdrop(featuredMovie.backdropPath, 'w1280')
    : null;

  return (
    <>
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
    </>
  );
}