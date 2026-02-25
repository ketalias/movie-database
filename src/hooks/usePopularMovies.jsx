import { useState, useEffect } from 'react';
import movieService from '../services/movieService';

export default function usePopularMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const result = await movieService.getPopularMovies(1);
        setMovies(result.results || []);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load popular movies');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { movies, loading, error };
}
