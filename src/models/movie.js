export class Movie {
  constructor(data = {}) {
    this.id = data.id;
    this.title = data.title || data.name || '';
    this.overview = data.overview || '';
    this.releaseDate = data.release_date || data.first_air_date || null;
    this.releaseYear = this.releaseDate ? new Date(this.releaseDate).getFullYear() : null;
    this.voteAverage = data.vote_average || 0;
    this.voteCount = data.vote_count || 0;
    this.popularity = data.popularity || 0;
    this.posterPath = data.poster_path || null;
    this.backdropPath = data.backdrop_path || null;

    this.genres = (data.genres || []).map((g) => ({ id: g.id, name: g.name }));

    this.cast = (data.credits?.cast || []).map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profilePath: c.profile_path,
    }));

    this.videos = (data.videos?.results || []).map((v) => ({
      id: v.id,
      key: v.key,
      name: v.name,
      site: v.site,
      type: v.type,
      official: v.official,
    }));

    this.runtime = data.runtime || null;
    this.budget = data.budget || null;
    this.revenue = data.revenue || null;
    this.tagline = data.tagline || '';
    this.status = data.status || '';
  }

  getPosterUrl(size = 'w500') {
    return this.posterPath ? `https://image.tmdb.org/t/p/${size}${this.posterPath}` : null;
  }

  getBackdropUrl(size = 'w1280') {
    return this.backdropPath ? `https://image.tmdb.org/t/p/${size}${this.backdropPath}` : null;
  }

  getTrailer() {
    if (!this.videos.length) return null;
    return (
      this.videos.find((v) => v.type === 'Trailer' && v.site === 'YouTube' && v.official) ||
      this.videos.find((v) => v.type === 'Trailer' && v.site === 'YouTube') ||
      this.videos[0]
    );
  }

  getTopCast(n = 5) {
    return this.cast.slice(0, n);
  }

  get formattedRating() {
    return this.voteAverage.toFixed(1);
  }

  get genreNames() {
    return this.genres.map((g) => g.name).join(', ');
  }
}

export default Movie;