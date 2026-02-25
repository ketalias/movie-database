import { useState, useEffect } from 'react';
import { searchMovies as searchMoviesAPI } from '../services/movieService';
import useDebounce from './useDebounce';

export default function useSearchMovies() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setMovies([]);
      setError(null);
      return;
    }

    const fetch = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await searchMoviesAPI(debouncedQuery, 1);
        setMovies(result.results || []);
      } catch (err) {
        setError(err.message || 'Failed to search movies');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [debouncedQuery]);

  return { 
    query, 
    setQuery, 
    movies, 
    loading, 
    error 
  };
}
