import Movie from '../models/movie';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
const API_TOKEN = process.env.REACT_APP_TMDB_TOKEN;

if (!API_TOKEN) {
  console.warn('[movieService] REACT_APP_TMDB_TOKEN is not set.');
}

async function tmdbFetch(endpoint, params = {}) {
  params.api_key = API_TOKEN;

  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  });

  const res = await fetch(url.toString(), {
    headers: {
      accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.status_message || `TMDB API error: ${res.status}`);
  }

  return res.json();
}

export const imageUrl = {
  poster: (path, size = 'w500') => path ? `${IMAGE_BASE_URL}/${size}${path}` : null,
  backdrop: (path, size = 'w1280') => path ? `${IMAGE_BASE_URL}/${size}${path}` : null,
  profile: (path, size = 'w185') => path ? `${IMAGE_BASE_URL}/${size}${path}` : null,
};

// ------------------
// Основні API
// ------------------

export async function getMovieDetails(movieId) {
  const data = await tmdbFetch(`/movie/${movieId}`, {
    append_to_response: 'videos,credits,images',
    include_image_language: 'en,uk,null',
  });
  return new Movie(data);
}

export async function getPopularMovies(page = 1) {
  const data = await tmdbFetch('/movie/popular', { page });
  return {
    results: data.results.map(m => new Movie(m)),
    page: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
  };
}

export async function getTopRatedMovies(page = 1) {
  const data = await tmdbFetch('/movie/top_rated', { page });
  return {
    results: data.results.map(m => new Movie(m)),
    page: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
  };
}

export async function getNowPlayingMovies(page = 1) {
  const data = await tmdbFetch('/movie/now_playing', { page });
  return {
    results: data.results.map(m => new Movie(m)),
    page: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
    dates: data.dates ?? null,
  };
}

export async function searchMovies(query, page = 1) {
  if (!query?.trim()) return { results: [], page: 1, totalPages: 0, totalResults: 0 };
  const data = await tmdbFetch('/search/movie', { query: query.trim(), page });
  return {
    results: data.results.map(m => new Movie(m)),
    page: data.page,
    totalPages: data.total_pages,
    totalResults: data.total_results,
  };
}

export async function getGenres(language) {
  const data = await tmdbFetch('/genre/movie/list', { language });
  return data.genres || [];
}

export async function discoverMovies(params = {}) {
  const data = await tmdbFetch('/discover/movie', params);
  return {
    results:       data.results.map(m => new Movie(m)),
    total_pages:   data.total_pages,
    total_results: data.total_results,
  };
}


const movieService = {
  getMovieDetails,
  getPopularMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  searchMovies,
  getGenres,
  discoverMovies,
  imageUrl,
};

export default movieService;