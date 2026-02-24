import { useNavigate } from 'react-router-dom';
import { imageUrl } from '../../services/movieService';
import './MovieCard.css';

export default function MovieCard({ movie, variant = 'grid' }) {
  const navigate = useNavigate();

  const handleClick = () => navigate(`/movie/${movie.id}`);

  const poster = movie.posterPath
    ? imageUrl.poster(movie.posterPath, 'w342')
    : null;

  if (variant === 'carousel') {
    return (
      <div className="mc mc--carousel" onClick={handleClick}>
        {poster ? (
          <img src={poster} alt={movie.title} className="mc__image" />
        ) : (
          <div className="mc__no-image">🎬</div>
        )}
        <div className="mc__overlay">
          {movie.voteAverage > 0 && (
            <div className="mc__rating">
              <span className="mc__rating-star">★</span>
              <span>{movie.voteAverage.toFixed(1)}</span>
            </div>
          )}
          <h3 className="mc__title">{movie.title}</h3>
          <p className="mc__year">{movie.releaseYear || 'N/A'}</p>
        </div>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className="mc mc--sidebar" onClick={handleClick}>
        <div className="mc__sidebar-poster">
          {poster ? (
            <img src={poster} alt={movie.title} className="mc__image" />
          ) : (
            <div className="mc__no-image">🎬</div>
          )}
        </div>
        <div className="mc__sidebar-info">
          <h3 className="mc__title">{movie.title}</h3>
          <p className="mc__year">{movie.releaseYear || 'N/A'}</p>
          {movie.voteAverage > 0 && (
            <div className="mc__rating mc__rating--inline">
              <span className="mc__rating-star">★</span>
              <span>{movie.voteAverage.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // variant === 'grid' (default)
  return (
    <div className="mc mc--grid" onClick={handleClick}>
      {poster ? (
        <img src={poster} alt={movie.title} className="mc__image" loading="lazy" />
      ) : (
        <div className="mc__no-image">🎬</div>
      )}
      <div className="mc__overlay">
        {movie.voteAverage > 0 && (
          <div className="mc__rating">
            <span className="mc__rating-star">★</span>
            <span>{movie.voteAverage.toFixed(1)}</span>
          </div>
        )}
        <h3 className="mc__title">{movie.title}</h3>
        <p className="mc__year">{movie.releaseYear || 'N/A'}</p>
      </div>
    </div>
  );
}