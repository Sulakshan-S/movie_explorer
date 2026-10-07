import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  Button,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import SearchBar from '../components/SearchBar';
import MovieGrid from '../components/MovieGrid';
import FilterBar from '../components/FilterBar';
import { getTrending, searchMovies, discoverMovies } from '../api/tmdb';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { TMDB_MAX_PAGE } from '../utils/constants';

const STORAGE_QUERY_KEY = 'movie_explorer_last_query';
const STORAGE_MODE_KEY = 'movie_explorer_pagination_mode';

const dedupeMovies = (existing, incoming) => {
  const existingIds = new Set(existing.map((m) => m.id));
  const newItems = incoming.filter((m) => !existingIds.has(m.id));
  return [...existing, ...newItems];
};

export const Home = () => {
  const [query, setQuery] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_QUERY_KEY) || '';
    } catch {
      return '';
    }
  });

  const [paginationMode, setPaginationMode] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_MODE_KEY) || 'infinite';
    } catch {
      return 'infinite';
    }
  });

  const [filters, setFilters] = useState({
    genre: '',
    year: '',
    minRating: 0,
  });

  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);
  const loadMoreAbortRef = useRef(null);

  const hasActiveFilters = Boolean(
    filters.genre || filters.year || (Number(filters.minRating) > 0)
  );

  // Fetch movies for a specific page with current query and filters
  const executeFetch = useCallback(
    async (targetPage, currentQuery, currentFilters, signal) => {
      const trimmed = currentQuery.trim();
      const activeFilters = Boolean(
        currentFilters.genre || currentFilters.year || Number(currentFilters.minRating) > 0
      );

      let data;

      if (!trimmed && activeFilters) {
        // Mode 1: No query + active filters -> discoverMovies
        data = await discoverMovies(
          {
            page: targetPage,
            genre: currentFilters.genre || undefined,
            year: currentFilters.year || undefined,
            minRating:
              Number(currentFilters.minRating) > 0 ? currentFilters.minRating : undefined,
          },
          signal
        );
      } else if (trimmed && activeFilters) {
        // Mode 2: Search query + active filters -> searchMovies with year + client-side filter
        data = await searchMovies(
          trimmed,
          targetPage,
          currentFilters.year || undefined,
          signal
        );

        let filtered = data?.results || [];
        if (currentFilters.genre) {
          const targetGenreId = Number(currentFilters.genre);
          filtered = filtered.filter((m) => m.genre_ids?.includes(targetGenreId));
        }
        if (Number(currentFilters.minRating) > 0) {
          filtered = filtered.filter(
            (m) => Number(m.vote_average) >= Number(currentFilters.minRating)
          );
        }

        return {
          results: filtered,
          total_pages: data?.total_pages || 1,
        };
      } else if (trimmed) {
        // Mode 3: Search query with no filters
        data = await searchMovies(trimmed, targetPage, undefined, signal);
      } else {
        // Mode 4: No query and no filters -> getTrending
        data = await getTrending(targetPage, signal);
      }

      return {
        results: data?.results || [],
        total_pages: data?.total_pages || 1,
      };
    },
    []
  );

  // Fetch page 1 (resets pagination)
  const fetchFirstPage = useCallback(
    async (currentQuery = query, currentFilters = filters) => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (loadMoreAbortRef.current) loadMoreAbortRef.current.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      setLoadingMore(false);
      setError(null);
      setPage(1);

      try {
        const data = await executeFetch(1, currentQuery, currentFilters, controller.signal);
        const results = data.results;
        const total = Math.min(data.total_pages, TMDB_MAX_PAGE);

        setMovies(results);
        setHasMore(1 < total);
      } catch (err) {
        if (err.name === 'CanceledError' || err.name === 'AbortError' || err.message === 'canceled') {
          return;
        }
        setError(err.message || 'Failed to fetch movies. Please try again.');
        setMovies([]);
        setHasMore(false);
      } finally {
        if (abortControllerRef.current === controller) {
          setLoading(false);
        }
      }
    },
    [query, filters, executeFetch]
  );

  // Fetch next page (infinite scroll & load more)
  const fetchNextPage = useCallback(async () => {
    if (loading || loadingMore || !hasMore || page >= TMDB_MAX_PAGE) {
      return;
    }

    if (loadMoreAbortRef.current) {
      loadMoreAbortRef.current.abort();
    }

    const controller = new AbortController();
    loadMoreAbortRef.current = controller;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const data = await executeFetch(nextPage, query, filters, controller.signal);
      const incoming = data.results;
      const total = Math.min(data.total_pages, TMDB_MAX_PAGE);

      setMovies((prev) => dedupeMovies(prev, incoming));
      setPage(nextPage);
      setHasMore(nextPage < total);
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError' || err.message === 'canceled') {
        return;
      }
      setError(err.message || 'Failed to load more movies.');
    } finally {
      if (loadMoreAbortRef.current === controller) {
        setLoadingMore(false);
      }
    }
  }, [loading, loadingMore, hasMore, page, query, filters, executeFetch]);

  // Handle Search Input Change
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
      fetchFirstPage(newQuery, filters);
    },
    [fetchFirstPage, filters]
  );

  // Handle Filter Change
  const handleFilterChange = (field, value) => {
    const updated = { ...filters, [field]: value };
    setFilters(updated);
    fetchFirstPage(query, updated);
  };

  // Reset Filters
  const handleResetFilters = () => {
    const reset = { genre: '', year: '', minRating: 0 };
    setFilters(reset);
    fetchFirstPage(query, reset);
  };

  // Handle Pagination Mode Change
  const handleModeChange = (event, nextMode) => {
    if (nextMode && nextMode !== paginationMode) {
      setPaginationMode(nextMode);
      try {
        localStorage.setItem(STORAGE_MODE_KEY, nextMode);
      } catch (err) {
        console.warn('Failed to persist pagination mode:', err);
      }
      fetchFirstPage(query, filters);
    }
  };

  // Infinite Scroll hook sentinel
  const sentinelRef = useInfiniteScroll(
    fetchNextPage,
    hasMore && paginationMode === 'infinite',
    loading || loadingMore
  );

  // Initial mount load
  useEffect(() => {
    fetchFirstPage(query, filters);
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (loadMoreAbortRef.current) loadMoreAbortRef.current.abort();
    };
  }, []);

  const isSearching = Boolean(query.trim());
  let headerTitle = 'Trending Movies';
  if (isSearching && hasActiveFilters) {
    headerTitle = `Results for "${query.trim()}" (Filtered)`;
  } else if (isSearching) {
    headerTitle = `Results for "${query.trim()}"`;
  } else if (hasActiveFilters) {
    headerTitle = 'Filtered Movies';
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, sm: 4 } }}>
      {/* Search Bar */}
      <Box sx={{ maxWidth: 640, mx: 'auto', mb: { xs: 2.5, sm: 3 } }}>
        <SearchBar initialValue={query} onSearch={handleSearch} />
      </Box>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Header and Controls */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
        }}
      >
        <Typography variant="h5" component="h1" fontWeight="700">
          {headerTitle}
        </Typography>

        {/* Toggle Mode: Infinite Scroll vs Load More */}
        <ToggleButtonGroup
          value={paginationMode}
          exclusive
          onChange={handleModeChange}
          size="small"
          aria-label="Pagination scroll mode"
        >
          <ToggleButton
            value="infinite"
            aria-label="Infinite scroll mode"
            sx={{ px: 1.5, py: 0.5, gap: 0.5 }}
          >
            <AllInclusiveIcon fontSize="small" />
            <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Infinite Scroll
            </Typography>
          </ToggleButton>
          <ToggleButton
            value="loadMore"
            aria-label="Load more button mode"
            sx={{ px: 1.5, py: 0.5, gap: 0.5 }}
          >
            <TouchAppIcon fontSize="small" />
            <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Load More
            </Typography>
          </ToggleButton>
        </ToggleButtonGroup>
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
              onClick={() => fetchFirstPage(query, filters)}
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
            {hasActiveFilters
              ? 'No movies found matching your filters'
              : isSearching
              ? `No movies found for "${query}"`
              : 'No movies available'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: hasActiveFilters ? 3 : 0 }}>
            {hasActiveFilters
              ? 'Try widening your criteria or clearing selected filters.'
              : isSearching
              ? 'Try checking for typos or searching for a different title.'
              : 'Please check back later.'}
          </Typography>
          {hasActiveFilters && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RotateLeftIcon />}
              onClick={handleResetFilters}
            >
              Clear Filters
            </Button>
          )}
        </Box>
      )}

      {/* Movies Grid */}
      <MovieGrid movies={movies} loading={loading} />

      {/* Pagination Controls Section */}
      {!loading && movies.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            mt: 4,
            mb: 2,
            minHeight: 60,
          }}
        >
          {/* Infinite Scroll Mode: Sentinel element & loading indicator */}
          {paginationMode === 'infinite' && (
            <>
              {hasMore && <Box ref={sentinelRef} sx={{ height: 30, width: '100%' }} />}
              {loadingMore && <CircularProgress size={36} color="primary" sx={{ my: 2 }} />}
              {!hasMore && movies.length > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
                  You have reached the end of the results ({movies.length} movies).
                </Typography>
              )}
            </>
          )}

          {/* Load More Mode: Button or end of results */}
          {paginationMode === 'loadMore' && (
            <>
              {hasMore ? (
                <Button
                  variant="outlined"
                  size="large"
                  onClick={fetchNextPage}
                  disabled={loadingMore}
                  startIcon={
                    loadingMore ? <CircularProgress size={20} color="inherit" /> : null
                  }
                  sx={{
                    px: 4,
                    py: 1.2,
                    borderRadius: 3,
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    '&:hover': {
                      borderColor: 'primary.dark',
                      backgroundColor: 'rgba(229, 9, 20, 0.08)',
                    },
                  }}
                >
                  {loadingMore ? 'Loading More...' : 'Load More Movies'}
                </Button>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
                  You have reached the end of the results ({movies.length} movies).
                </Typography>
              )}
            </>
          )}
        </Box>
      )}
    </Container>
  );
};

export default Home;
