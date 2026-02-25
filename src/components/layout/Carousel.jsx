import { useState, useEffect, useCallback } from 'react';
import MovieCard from '../cards/MovieCard';
import useCardsPerPage from '../../hooks/useCardsPerPage';
import './Carousel.css';

export default function Carousel({ topRatedMovies, loading }) {
  const cardsPerPage = useCardsPerPage();

  const totalMovies = topRatedMovies?.length || 0;
  const isCarouselActive = totalMovies > cardsPerPage;
  
  const [currentIndex, setCurrentIndex] = useState(totalMovies > 0 ? totalMovies : 0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const extendedMovies = isCarouselActive
    ? [...topRatedMovies, ...topRatedMovies, ...topRatedMovies]
    : topRatedMovies || [];

  const handleCarouselNext = useCallback(() => {
    if (!isCarouselActive || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, [isCarouselActive, isTransitioning]);

  const handleCarouselPrev = useCallback(() => {
    if (!isCarouselActive || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, [isCarouselActive, isTransitioning]);

  const handleTransitionEnd = () => {
    setIsTransitioning(false);
    if (currentIndex >= totalMovies * 2) {
      setCurrentIndex(currentIndex - totalMovies);
    } else if (currentIndex <= totalMovies - 1) {
      setCurrentIndex(currentIndex + totalMovies);
    }
  };

  useEffect(() => {
    if (!isCarouselActive) return;
    const interval = setInterval(() => {
      handleCarouselNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [isCarouselActive, handleCarouselNext]);

  if (loading) return null;

  const trackWidth = isCarouselActive ? `${(extendedMovies.length / cardsPerPage) * 100}%` : '100%';
  const itemWidth = extendedMovies.length > 0 ? `${100 / extendedMovies.length}%` : '100%';
  const transformOffset = extendedMovies.length > 0 ? `translateX(-${(currentIndex / extendedMovies.length) * 100}%)` : 'none';

  return (
    <>
      {topRatedMovies.length > 0 && (
        <div className="carousel-section">
          <div className="carousel-wrapper">
            <h2 className="carousel-title">Top Rated Movies</h2>

            <div className="carousel-container">
              <button
                className="carousel-btn carousel-btn-prev"
                onClick={handleCarouselPrev}
                aria-label="Previous"
              >
                ‹
              </button>

              <div className="carousel-track-wrapper">
                <div
                  className="carousel-track"
                  onTransitionEnd={handleTransitionEnd}
                  style={{
                    width: trackWidth,
                    transform: transformOffset,
                    transition: isTransitioning ? 'transform 0.45s cubic-bezier(0.25, 0.8, 0.25, 1)' : 'none',
                  }}
                >
                  {extendedMovies.map((movie, index) => (
                    <div 
                      key={`${movie.id}-${index}`} 
                      className="carousel-item"
                      style={{ width: itemWidth }}
                    >
                      <MovieCard movie={movie} variant="carousel" />
                    </div>
                  ))}
                </div>
              </div>

              <button
                className="carousel-btn carousel-btn-next"
                onClick={handleCarouselNext}
                aria-label="Next"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}