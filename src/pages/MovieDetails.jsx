import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Chip,
  Button,
  IconButton,
  Alert,
  Skeleton,
  Card,
  CardMedia,
  Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ReplayIcon from '@mui/icons-material/Replay';
import { getMovieDetails } from '../api/tmdb';
import { getPosterUrl, formatRuntime, formatRating, formatDate } from '../utils/helpers';
import { BACKDROP_BASE_URL, PLACEHOLDER_POSTER } from '../utils/constants';
import TrailerModal from '../components/TrailerModal';
import { useFavorites } from '../context/FavoritesContext';

export const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [is404, setIs404] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);

  const abortControllerRef = useRef(null);

  const fetchDetails = async () => {
    if (!id) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    setIs404(false);

    try {
      const data = await getMovieDetails(id, controller.signal);
      setMovie(data);
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError' || err.message === 'canceled') {
        return;
      }
      if (err.message?.includes('not found') || err.message?.includes('404')) {
        setIs404(true);
      } else {
        setError(err.message || 'Failed to load movie details.');
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [id]);

  // Find first YouTube video of type "Trailer"
  const trailerVideo = movie?.videos?.results?.find(
    (video) => video.site === 'YouTube' && video.type === 'Trailer'
  ) || movie?.videos?.results?.find((video) => video.site === 'YouTube');

  // Top 10 cast members
  const topCast = (movie?.credits?.cast || []).slice(0, 10);

  const isFav = movie ? isFavorite(movie.id) : false;

  const handleToggleFav = () => {
    if (movie) {
      toggleFavorite(movie);
    }
  };

  if (is404) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Movie Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The movie with ID "{id}" could not be found. It may have been removed or does not exist.
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
        >
          Return to Home
        </Button>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<ReplayIcon />}
              onClick={fetchDetails}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Box>
      </Container>
    );
  }

  if (loading || !movie) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Skeleton variant="rounded" width={110} height={36} sx={{ mb: 3 }} />
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4,
          }}
        >
          <Skeleton
            variant="rectangular"
            sx={{
              width: { xs: '100%', sm: 320 },
              height: 480,
              borderRadius: 3,
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="70%" height={48} />
            <Skeleton variant="text" width="40%" height={28} sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Skeleton variant="rounded" width={70} height={32} />
              <Skeleton variant="rounded" width={70} height={32} />
            </Box>
            <Skeleton variant="text" width="100%" height={24} />
            <Skeleton variant="text" width="95%" height={24} />
            <Skeleton variant="text" width="80%" height={24} sx={{ mb: 3 }} />
            <Skeleton variant="rectangular" width="100%" height={160} sx={{ borderRadius: 2 }} />
          </Box>
        </Box>
      </Container>
    );
  }

  const backdropUrl = movie.backdrop_path
    ? `${BACKDROP_BASE_URL}${movie.backdrop_path}`
    : null;

  return (
    <Box sx={{ position: 'relative', pb: 8 }}>
      {/* Backdrop Header with immersive gradient overlay */}
      {backdropUrl && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: { xs: 340, md: 520 },
            backgroundImage: `url(${backdropUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            opacity: 0.28,
            filter: 'blur(3px)',
            maskImage:
              'linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, pt: 3 }}>
        {/* Back Button */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            mb: 3,
            borderRadius: 2,
            backgroundColor: 'background.paper',
            borderColor: 'divider',
          }}
        >
          Back
        </Button>

        {/* Main Content Layout: Poster + Info */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 3, md: 5 },
            alignItems: { xs: 'center', md: 'flex-start' },
          }}
        >
          {/* Movie Poster */}
          <Box
            sx={{
              width: { xs: '100%', sm: 300, md: 340 },
              flexShrink: 0,
              maxWidth: 360,
            }}
          >
            <Card
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '0 16px 36px rgba(0,0,0,0.8)'
                    : '0 16px 36px rgba(0,0,0,0.15)',
              }}
            >
              <CardMedia
                component="img"
                image={getPosterUrl(movie.poster_path)}
                alt={movie.title || 'Movie Poster'}
                onError={(e) => {
                  e.currentTarget.src = PLACEHOLDER_POSTER;
                }}
                sx={{
                  width: '100%',
                  aspectRatio: '2/3',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </Card>
          </Box>

          {/* Movie Info */}
          <Box sx={{ flexGrow: 1, width: '100%' }}>
            {/* Title & Favorite Toggle */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
                  lineHeight: 1.15,
                }}
              >
                {movie.title}
              </Typography>

              <Tooltip title={isFav ? 'Remove from favorites' : 'Add to favorites'}>
                <IconButton
                  onClick={handleToggleFav}
                  aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                  sx={{
                    p: 1.5,
                    bgcolor: 'background.paper',
                    color: isFav ? 'primary.main' : 'text.secondary',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      color: 'primary.main',
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  {isFav ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              </Tooltip>
            </Box>

            {/* Tagline */}
            {movie.tagline && (
              <Typography
                variant="subtitle1"
                color="text.secondary"
                fontStyle="italic"
                sx={{ mt: 0.5, mb: 2 }}
              >
                "{movie.tagline}"
              </Typography>
            )}

            {/* Badges: Rating, Runtime, Release Date */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 2,
                my: 2,
              }}
            >
              {movie.vote_average !== undefined && (
                <Chip
                  icon={<StarIcon sx={{ color: '#ffb703 !important' }} />}
                  label={`${formatRating(movie.vote_average)} (${movie.vote_count || 0} votes)`}
                  sx={{
                    fontWeight: 700,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 183, 3, 0.15)'
                        : 'rgba(255, 183, 3, 0.2)',
                  }}
                />
              )}

              {movie.runtime > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: 'text.secondary',
                  }}
                >
                  <AccessTimeIcon fontSize="small" />
                  <Typography variant="body2" fontWeight={500}>
                    {formatRuntime(movie.runtime)}
                  </Typography>
                </Box>
              )}

              {movie.release_date && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: 'text.secondary',
                  }}
                >
                  <CalendarTodayIcon fontSize="small" />
                  <Typography variant="body2" fontWeight={500}>
                    {formatDate(movie.release_date)}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Genre Chips */}
            {movie.genres && movie.genres.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {movie.genres.map((genre) => (
                  <Chip
                    key={genre.id}
                    label={genre.name}
                    variant="outlined"
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                ))}
              </Box>
            )}

            {/* Action Buttons (Watch Trailer) */}
            {trailerVideo && (
              <Box sx={{ mb: 4 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => setTrailerOpen(true)}
                  sx={{
                    px: 3,
                    py: 1.2,
                    fontSize: '1rem',
                    boxShadow: '0 8px 20px rgba(229, 9, 20, 0.35)',
                  }}
                >
                  Watch Trailer
                </Button>
              </Box>
            )}

            {/* Overview */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight="700" gutterBottom>
                Overview
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ lineHeight: 1.8 }}
              >
                {movie.overview || 'No overview available for this movie.'}
              </Typography>
            </Box>

            {/* Cast Section */}
            {topCast.length > 0 && (
              <Box>
                <Typography variant="h6" fontWeight="700" gutterBottom>
                  Top Cast
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'repeat(2, 1fr)',
                      sm: 'repeat(3, 1fr)',
                      md: 'repeat(5, 1fr)',
                    },
                    gap: 2,
                    mt: 1.5,
                  }}
                >
                  {topCast.map((cast) => {
                    const profileUrl = cast.profile_path
                      ? `https://image.tmdb.org/t/p/w185${cast.profile_path}`
                      : 'https://placehold.co/185x278/1e293b/ffffff?text=No+Photo';

                    return (
                      <Card
                        key={cast.id}
                        variant="outlined"
                        sx={{
                          borderRadius: 2.5,
                          overflow: 'hidden',
                          bgcolor: 'background.paper',
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={profileUrl}
                          alt={cast.name}
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://placehold.co/185x278/1e293b/ffffff?text=No+Photo';
                          }}
                          sx={{
                            aspectRatio: '1/1.2',
                            objectFit: 'cover',
                            bgcolor: '#0f172a',
                          }}
                        />
                        <Box sx={{ p: 1.2 }}>
                          <Typography
                            variant="subtitle2"
                            fontWeight="700"
                            noWrap
                            title={cast.name}
                          >
                            {cast.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            display="block"
                            title={cast.character}
                          >
                            {cast.character || 'Unknown role'}
                          </Typography>
                        </Box>
                      </Card>
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Container>

      {/* Trailer Dialog Modal */}
      {trailerVideo && (
        <TrailerModal
          open={trailerOpen}
          onClose={() => setTrailerOpen(false)}
          videoKey={trailerVideo.key}
          title={`${movie.title} - Official Trailer`}
        />
      )}
    </Box>
  );
};

export default MovieDetails;
