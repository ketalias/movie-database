import { useState, useEffect } from 'react';
import movieService from '../services/movieService';

export default function useTopRatedMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const result = await movieService.getTopRatedMovies(1);
        setMovies(result.results || []);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load top rated movies');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { movies, loading, error };
}
