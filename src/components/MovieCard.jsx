import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Box,
  Chip,
  Tooltip,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { getPosterUrl, getYear, formatRating } from '../utils/helpers';
import { PLACEHOLDER_POSTER } from '../utils/constants';

export const MovieCard = ({ movie, isFavorite = false, onToggleFavorite }) => {
  const navigate = useNavigate();
  const [imgSrc, setImgSrc] = useState(() => getPosterUrl(movie?.poster_path));

  if (!movie) return null;

  const handleCardClick = () => {
    navigate(`/movie/${movie.id}`);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(movie);
    }
  };

  const rating = formatRating(movie.vote_average);
  const year = getYear(movie.release_date);

  const getRatingColor = (val) => {
    const num = Number(val);
    if (isNaN(num)) return 'default';
    if (num >= 7) return 'success';
    if (num >= 5) return 'warning';
    return 'default';
  };

  return (
    <Card
      onClick={handleCardClick}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 12px 28px rgba(0, 0, 0, 0.65)'
              : '0 12px 28px rgba(0, 0, 0, 0.15)',
          '& .movie-poster': {
            transform: 'scale(1.04)',
          },
        },
        '&:focus-visible': {
          outline: (theme) => `2px solid ${theme.palette.primary.main}`,
        },
      }}
    >
      {/* Poster with relative overlay buttons */}
      <Box sx={{ position: 'relative', pt: '150%', overflow: 'hidden', bgcolor: '#0f172a' }}>
        <CardMedia
          component="img"
          image={imgSrc}
          alt={movie.title || 'Movie Poster'}
          onError={() => setImgSrc(PLACEHOLDER_POSTER)}
          className="movie-poster"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
        />

        {/* Rating Badge */}
        {rating !== 'N/A' && (
          <Chip
            icon={<StarIcon sx={{ fontSize: '14px !important', color: '#ffb703' }} />}
            label={rating}
            size="small"
            color={getRatingColor(rating)}
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              fontWeight: 700,
              fontSize: '0.75rem',
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          />
        )}

        {/* Favorite Heart Button */}
        <Tooltip title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
          <IconButton
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)',
              color: isFavorite ? '#e50914' : '#ffffff',
              transition: 'transform 0.2s ease, background-color 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                transform: 'scale(1.15)',
              },
            }}
          >
            {isFavorite ? (
              <FavoriteIcon sx={{ fontSize: 18 }} />
            ) : (
              <FavoriteBorderIcon sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Card Details */}
      <CardContent
        sx={{
          p: 1.5,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          '&:last-child': { pb: 1.5 },
        }}
      >
        <Typography
          variant="subtitle2"
          component="h2"
          sx={{
            fontWeight: 700,
            lineHeight: 1.25,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            mb: 0.5,
          }}
          title={movie.title}
        >
          {movie.title || 'Untitled'}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            {year}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MovieCard;
