import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  Button,
} from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import SearchBar from '../components/SearchBar';
import MovieGrid from '../components/MovieGrid';
import { getTrending, searchMovies } from '../api/tmdb';

const STORAGE_QUERY_KEY = 'movie_explorer_last_query';

export const Home = () => {
  const [query, setQuery] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_QUERY_KEY) || '';
    } catch {
      return '';
    }
  });

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);

  const fetchMovies = useCallback(
    async (searchQuery) => {
      // Cancel previous in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        let data;
        const trimmed = searchQuery.trim();

        if (trimmed) {
          data = await searchMovies(trimmed, 1, undefined, controller.signal);
        } else {
          data = await getTrending(1, controller.signal);
        }

        setMovies(data?.results || []);
      } catch (err) {
        if (err.name === 'CanceledError' || err.name === 'AbortError' || err.message === 'canceled') {
          return;
        }
        setError(err.message || 'Failed to fetch movies. Please try again.');
      } finally {
        if (abortControllerRef.current === controller) {
          setLoading(false);
        }
      }
    },
    []
  );

  // Sync query change, persist in localStorage and trigger fetch
  const handleSearch = useCallback(
    (newQuery) => {
      setQuery(newQuery);
      try {
        if (newQuery) {
          localStorage.setItem(STORAGE_QUERY_KEY, newQuery);
        } else {
          localStorage.removeItem(STORAGE_QUERY_KEY);
        }
      } catch (err) {
        console.warn('Failed to persist query:', err);
      }
      fetchMovies(newQuery);
    },
    [fetchMovies]
  );

  // Initial load
  useEffect(() => {
    fetchMovies(query);
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // Run on mount with initial query

  const isSearching = Boolean(query.trim());
  const headerTitle = isSearching ? `Results for "${query.trim()}"` : 'Trending Movies';

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, sm: 4 } }}>
      {/* Search Bar Section */}
      <Box sx={{ maxWidth: 640, mx: 'auto', mb: { xs: 3, sm: 4 } }}>
        <SearchBar initialValue={query} onSearch={handleSearch} />
      </Box>

      {/* Heading Section */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Typography variant="h5" component="h1" fontWeight="700">
          {headerTitle}
        </Typography>
      </Box>

      {/* Error Alert with Retry */}
      {error && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<ReplayIcon />}
              onClick={() => fetchMovies(query)}
            >
              Retry
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {/* Empty State */}
      {!loading && !error && movies.length === 0 && (
        <Box
          sx={{
            py: 8,
            textAlign: 'center',
            bgcolor: 'background.paper',
            borderRadius: 3,
            p: 4,
          }}
        >
          <Typography variant="h6" fontWeight="600" gutterBottom>
            {isSearching ? `No movies found for "${query}"` : 'No movies available'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isSearching
              ? 'Try checking for typos or searching for a different title.'
              : 'Please check back later.'}
          </Typography>
        </Box>
      )}

      {/* Movie Grid */}
      <MovieGrid movies={movies} loading={loading} />
    </Container>
  );
};

export default Home;
