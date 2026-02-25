import { useState, useEffect } from 'react';
import { discoverMovies } from '../services/movieService';

export default function useDiscoverMovies(gridPage, filters) {
  const [movies, setMovies] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      window.scrollTo({ top: document.querySelector('.movies-section')?.offsetTop - 20, behavior: 'smooth' });

      try {
        const params = {
          page: gridPage,
          sort_by: filters.sortBy,
          ...(filters.genre && { with_genres: filters.genre }),
          ...(filters.yearMin && { 'primary_release_date.gte': `${filters.yearMin}-01-01` }),
          ...(filters.yearMax && { 'primary_release_date.lte': `${filters.yearMax}-12-31` }),
          ...(filters.ratingMin && { 'vote_average.gte': filters.ratingMin }),
          ...(filters.ratingMax && { 'vote_average.lte': filters.ratingMax }),
        };
        const result = await discoverMovies(params);
        setMovies(result.results || []);
        setTotalPages(Math.min(result.total_pages || 1, 500));
      } catch (err) {
        console.error('Discover movies error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [filters, gridPage]);

  return { movies, totalPages, loading };
}
