import { Box, Card, CardContent, Skeleton } from '@mui/material';
import MovieCard from './MovieCard';
import { useFavorites } from '../context/FavoritesContext';

export const MovieGrid = ({
  movies = [],
  loading = false,
  skeletonCount = 12,
  onToggleFavorite,
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleFavorite = (movie) => {
    if (onToggleFavorite) {
      onToggleFavorite(movie);
    } else if (toggleFavorite) {
      toggleFavorite(movie);
    }
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          sm: 'repeat(3, 1fr)',
          md: 'repeat(4, 1fr)',
          lg: 'repeat(5, 1fr)',
          xl: 'repeat(6, 1fr)',
        },
        gap: { xs: 1.5, sm: 2, md: 2.5 },
      }}
    >
      {/* Existing Movie Cards */}
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          isFavorite={isFavorite(movie.id)}
          onToggleFavorite={handleFavorite}
        />
      ))}

      {/* Loading Skeletons */}
      {loading &&
        Array.from({ length: movies.length === 0 ? skeletonCount : 6 }).map((_, index) => (
          <Card
            key={`skeleton-${index}`}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.paper',
            }}
          >
            {/* Poster skeleton with 2:3 aspect ratio */}
            <Box sx={{ position: 'relative', pt: '150%' }}>
              <Skeleton
                variant="rectangular"
                animation="wave"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
              />
            </Box>
            <CardContent sx={{ p: 1.5, flexGrow: 1, '&:last-child': { pb: 1.5 } }}>
              <Skeleton variant="text" width="85%" height={22} animation="wave" />
              <Skeleton variant="text" width="40%" height={18} animation="wave" sx={{ mt: 0.5 }} />
            </CardContent>
          </Card>
        ))}
    </Box>
  );
};

export default MovieGrid;
