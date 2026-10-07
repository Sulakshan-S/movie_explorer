import { Container, Typography, Box, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import HomeIcon from '@mui/icons-material/Home';
import MovieGrid from '../components/MovieGrid';
import { useFavorites } from '../context/FavoritesContext';

export const Favorites = () => {
  const { favorites, toggleFavorite } = useFavorites();

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, sm: 4 } }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Typography variant="h5" component="h1" fontWeight="700">
          My Favorites
        </Typography>
        {favorites.length > 0 && (
          <Typography variant="body2" color="text.secondary">
            {favorites.length} {favorites.length === 1 ? 'movie' : 'movies'} saved
          </Typography>
        )}
      </Box>

      {/* Empty State */}
      {favorites.length === 0 ? (
        <Box
          sx={{
            py: 8,
            px: 3,
            textAlign: 'center',
            bgcolor: 'background.paper',
            borderRadius: 4,
            border: (theme) =>
              theme.palette.mode === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.08)'
                : '1px solid rgba(0, 0, 0, 0.06)',
            maxWidth: 600,
            mx: 'auto',
            mt: 4,
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(229, 9, 20, 0.15)'
                  : 'rgba(229, 9, 20, 0.1)',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
            }}
          >
            <FavoriteBorderIcon sx={{ fontSize: 36 }} />
          </Box>
          <Typography variant="h6" fontWeight="700" gutterBottom>
            No Favorites Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5, maxWidth: 440, mx: 'auto' }}>
            You haven't saved any movies to your favorites. Tap the heart icon on any
            movie card or details page to add it to your watchlist!
          </Typography>
          <Button
            component={RouterLink}
            to="/"
            variant="contained"
            size="large"
            startIcon={<HomeIcon />}
            sx={{ px: 3.5, py: 1.1 }}
          >
            Explore Movies
          </Button>
        </Box>
      ) : (
        <MovieGrid
          movies={favorites}
          loading={false}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </Container>
  );
};

export default Favorites;
