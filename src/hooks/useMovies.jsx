import { useState, useEffect, useCallback, useRef } from 'react';
import movieService from '../services/movieService';
import useDebounce from './useDebounce';


export function useMovies(fetchFn, params = {}, { enabled = true, resetOnChange = true } = {}) {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const paramsKey = JSON.stringify(params);
  const prevParamsKey = useRef(paramsKey);

  useEffect(() => {
    if (resetOnChange && prevParamsKey.current !== paramsKey) {
      setMovies([]);
      setPage(1);
      setTotalPages(0);
      setTotalResults(0);
      prevParamsKey.current = paramsKey;
    }
  }, [paramsKey, resetOnChange]);

  const fetchMovies = useCallback(
    async (targetPage, append = false) => {
      if (!enabled) return;

      append ? setLoadingMore(true) : setLoading(true);
      setError(null);

      try {
        const result = await fetchFn({ ...params, page: targetPage });
        setMovies((prev) => (append ? [...prev, ...result.results] : result.results));
        setPage(result.page);
        setTotalPages(result.totalPages);
        setTotalResults(result.totalResults);
      } catch (err) {
        setError(err.message ?? 'Не вдалося завантажити фільми');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [fetchFn, paramsKey, enabled]
  );

  useEffect(() => {
    fetchMovies(1, false);
  }, [fetchMovies]);

  const fetchMore = useCallback(() => {
    if (!loadingMore && page < totalPages) {
      fetchMovies(page + 1, true);
    }
  }, [fetchMovies, loadingMore, page, totalPages]);

  const refresh = useCallback(() => {
    setMovies([]);
    fetchMovies(1, false);
  }, [fetchMovies]);

  return {
    movies,
    page,
    totalPages,
    totalResults,
    loading,
    loadingMore,
    error,
    hasMore: page < totalPages,
    fetchMore,
    refresh,
  };
}


export function useMovieSearch(query, {
  debounce = 400,
  minLength = 2,
  multi = false,
  language,
  includeAdult = false,
} = {}) {
  const debouncedQuery = useDebounce(query, debounce);

  const isEnabled = debouncedQuery.trim().length >= minLength;
  const searchFn = multi ? movieService.searchMulti : movieService.searchMovies;

  return {
    ...useMovies(
      searchFn,
      { query: debouncedQuery, language, includeAdult },
      { enabled: isEnabled }
    ),
    query,
    debouncedQuery,
  };
}

export function useMovieDetails(movieId, { append = [], language } = {}) {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!movieId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await movieService.getMovieDetails(movieId, { append, language });
      setMovie(result);
    } catch (err) {
      setError(err.message ?? 'Не вдалося завантажити деталі фільму');
    } finally {
      setLoading(false);
    }
  }, [movieId, language, JSON.stringify(append)]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { movie, loading, error, refresh: fetch };
}



export const usePopularMovies    = (params, opts) => useMovies(movieService.getPopularMovies,    params, opts);
export const useTopRatedMovies   = (params, opts) => useMovies(movieService.getTopRatedMovies,   params, opts);
export const useNowPlayingMovies = (params, opts) => useMovies(movieService.getNowPlayingMovies, params, opts);
export const useUpcomingMovies   = (params, opts) => useMovies(movieService.getUpcomingMovies,   params, opts);
export const useTrendingMovies   = (timeWindow = 'week', params, opts) =>
  useMovies((p) => movieService.getTrendingMovies(timeWindow, p), params, opts);
export const useDiscoverMovies   = (params, opts) => useMovies(movieService.discoverMovies,      params, opts);

export default useMovies;