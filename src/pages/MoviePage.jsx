import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieDetails, imageUrl } from '../services/movieService';
import './MoviePage.css';

function StatBlock({ label, value }) {
  if (!value) return null;
  return (
    <div className="stat-block">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}

function CastCard({ member }) {
  return (
    <div className="cast-card">
      <div className="cast-avatar">
        {member.profilePath ? (
          <img
            src={imageUrl.profile(member.profilePath, 'w185')}
            alt={member.name}
            className="cast-avatar-img"
          />
        ) : (
          <div className="cast-avatar-placeholder">
            {member.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="cast-info">
        <p className="cast-name">{member.name}</p>
        <p className="cast-character">{member.character}</p>
      </div>
    </div>
  );
}

function formatCurrency(n) {
  if (!n || n === 0) return null;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

function formatRuntime(mins) {
  if (!mins) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function RatingRing({ value, max = 10 }) {
  const pct = (value / max) * 100;
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  const color = value >= 7.5 ? '#22c55e' : value >= 5 ? '#f59e0b' : '#ef4444';

  return (
    <div className="rating-ring-wrapper">
      <svg className="rating-ring-svg" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
        <circle
          cx="36" cy="36" r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={circ * 0.25}
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="rating-ring-value" style={{ color }}>
        {value.toFixed(1)}
      </div>
    </div>
  );
}

export default function MoviePage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [movie,    setMovie]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [imgError, setImgError] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setError(null);
    setImgError(false);

    getMovieDetails(id)
      .then(setMovie)
      .catch((err) => {
        console.error(err);
        setError('Failed to load movie.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="movie-page-skeleton">
        <div className="skeleton-hero" />
        <div className="skeleton-body">
          <div className="skeleton-poster" />
          <div className="skeleton-lines">
            <div className="skeleton-line w60" />
            <div className="skeleton-line w40" />
            <div className="skeleton-line w80" />
            <div className="skeleton-line w70" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="movie-page-error">
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>← Go back</button>
      </div>
    );
  }

  if (!movie) return null;

  const backdrop  = !imgError && movie.backdropPath ? imageUrl.backdrop(movie.backdropPath, 'original') : null;
  const poster    = movie.posterPath ? imageUrl.poster(movie.posterPath, 'w500') : null;
  const trailer   = movie.getTrailer?.();
  const topCast   = movie.getTopCast?.(8) ?? movie.cast?.slice(0, 8) ?? [];
  const genres    = movie.genres?.map((g) => g.name) ?? [];

  const scoreColor = movie.voteAverage >= 7.5 ? 'green' : movie.voteAverage >= 5 ? 'amber' : 'red';

  return (
    <div className="movie-page">

      <div className="movie-hero">
        {backdrop ? (
          <img
            src={backdrop}
            alt=""
            className="movie-hero-bg"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="movie-hero-bg movie-hero-bg--fallback" />
        )}
        <div className="movie-hero-vignette" />
        <div className="movie-hero-bottom-fade" />

        <button className="back-btn" onClick={() => navigate(-1)}>
          <span className="back-btn-arrow">←</span>
          <span>Back</span>
        </button>
      </div>

      <div className="movie-main">

        <div className="movie-poster-col">
          <div className="movie-poster-wrapper">
            {poster ? (
              <img src={poster} alt={movie.title} className="movie-poster-img" />
            ) : (
              <div className="movie-poster-placeholder">📽</div>
            )}
            {trailer && (
              <a
                href={`https://www.youtube.com/watch?v=${trailer.key}`}
                target="_blank"
                rel="noopener noreferrer"
                className="trailer-btn"
              >
                <span className="trailer-btn-icon">▶</span>
                Watch Trailer
              </a>
            )}
          </div>
        </div>

        <div className="movie-info-col">

          <div className="movie-title-block">
            {genres.length > 0 && (
              <div className="genre-tags">
                {genres.map((g) => (
                  <span key={g} className="genre-tag">{g}</span>
                ))}
              </div>
            )}
            <h1 className="movie-title">{movie.title}</h1>
            {movie.tagline && (
              <p className="movie-tagline">"{movie.tagline}"</p>
            )}
          </div>

          <div className="movie-score-row">
            <div className="score-main">
              <RatingRing value={movie.voteAverage} />
              <div className="score-meta">
                <span className={`score-label score-label--${scoreColor}`}>
                  {movie.voteAverage >= 7.5 ? 'Great' : movie.voteAverage >= 5 ? 'Mixed' : 'Poor'}
                </span>
                <span className="score-votes">
                  {movie.voteCount?.toLocaleString()} votes
                </span>
              </div>
            </div>

            <div className="movie-quick-stats">
              {movie.releaseDate && (
                <div className="quick-stat">
                  <span className="quick-stat-icon">➴</span>
                  <span>{new Date(movie.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              )}
              {formatRuntime(movie.runtime) && (
                <div className="quick-stat">
                  <span className="quick-stat-icon">⏱</span>
                  <span>{formatRuntime(movie.runtime)}</span>
                </div>
              )}
              {movie.status && (
                <div className="quick-stat">
                  <span className="quick-stat-icon">📽</span>
                  <span>{movie.status}</span>
                </div>
              )}
            </div>
          </div>

          <div className="movie-tabs">
            {['overview', 'details', 'cast'].map((tab) => (
              <button
                key={tab}
                className={`movie-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="tab-content tab-overview">
              <p className="movie-overview">
                {movie.overview || 'No description available.'}
              </p>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="tab-content tab-details">
              <div className="stats-grid">
                <StatBlock label="Release Date" value={movie.releaseDate
                  ? new Date(movie.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                  : null}
                />
                <StatBlock label="Runtime"      value={formatRuntime(movie.runtime)} />
                <StatBlock label="Status"       value={movie.status} />
                <StatBlock label="Budget"       value={formatCurrency(movie.budget)} />
                <StatBlock label="Revenue"      value={formatCurrency(movie.revenue)} />
                <StatBlock label="Genres"       value={genres.join(', ') || null} />
              </div>
            </div>
          )}

          {activeTab === 'cast' && (
            <div className="tab-content tab-cast">
              {topCast.length > 0 ? (
                <div className="cast-grid">
                  {topCast.map((member) => (
                    <CastCard key={member.id} member={member} />
                  ))}
                </div>
              ) : (
                <p className="cast-empty">No cast information available.</p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}