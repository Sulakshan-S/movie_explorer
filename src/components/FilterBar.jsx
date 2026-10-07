import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Typography,
  Button,
  Collapse,
  Badge,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { getGenres } from '../api/tmdb';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 40 }, (_, i) => CURRENT_YEAR - i);

export const FilterBar = ({ filters, onFilterChange, onReset }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [genres, setGenres] = useState([]);

  // Fetch genre options on mount
  useEffect(() => {
    let active = true;
    const fetchGenreList = async () => {
      try {
        const data = await getGenres();
        if (active && data?.genres) {
          setGenres(data.genres);
        }
      } catch (err) {
        console.warn('Could not fetch genres:', err);
      }
    };
    fetchGenreList();
    return () => {
      active = false;
    };
  }, []);

  const isExpanded = !isMobile || mobileExpanded;

  const activeFiltersCount =
    (filters.genre ? 1 : 0) +
    (filters.year ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0);

  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: 3,
        border: (cardTheme) =>
          cardTheme.palette.mode === 'dark'
            ? '1px solid rgba(255, 255, 255, 0.08)'
            : '1px solid rgba(0, 0, 0, 0.06)',
        bgcolor: 'background.paper',
        overflow: 'visible',
      }}
    >
      {/* Mobile Collapsible Header */}
      {isMobile && (
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
          onClick={() => setMobileExpanded((prev) => !prev)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Badge badgeContent={activeFiltersCount} color="primary">
              <TuneIcon color="action" />
            </Badge>
            <Typography variant="subtitle1" fontWeight="600">
              Filters & Refinements
            </Typography>
          </Box>
          <Button
            size="small"
            endIcon={mobileExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            aria-label="Toggle filters collapse"
          >
            {mobileExpanded ? 'Hide' : 'Show'}
          </Button>
        </Box>
      )}

      {/* Filter Controls (Collapsible on mobile) */}
      <Collapse in={isExpanded} timeout="auto">
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 2.5,
              alignItems: 'center',
            }}
          >
            {/* Genre Select */}
            <FormControl fullWidth size="small">
              <InputLabel id="genre-select-label">Genre</InputLabel>
              <Select
                labelId="genre-select-label"
                id="genre-select"
                value={filters.genre || ''}
                label="Genre"
                onChange={(e) => onFilterChange('genre', e.target.value)}
              >
                <MenuItem value="">
                  <em>All Genres</em>
                </MenuItem>
                {genres.map((g) => (
                  <MenuItem key={g.id} value={g.id}>
                    {g.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Release Year Select */}
            <FormControl fullWidth size="small">
              <InputLabel id="year-select-label">Release Year</InputLabel>
              <Select
                labelId="year-select-label"
                id="year-select"
                value={filters.year || ''}
                label="Release Year"
                onChange={(e) => onFilterChange('year', e.target.value)}
              >
                <MenuItem value="">
                  <em>All Years</em>
                </MenuItem>
                {YEAR_OPTIONS.map((yr) => (
                  <MenuItem key={yr} value={yr}>
                    {yr}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Minimum Rating Slider */}
            <Box sx={{ px: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 0.5,
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight="600">
                  Minimum Rating:
                </Typography>
                <Typography variant="caption" fontWeight="700" color="primary.main">
                  {filters.minRating > 0 ? `${filters.minRating} ★` : 'Any'}
                </Typography>
              </Box>
              <Slider
                value={Number(filters.minRating) || 0}
                min={0}
                max={10}
                step={0.5}
                onChange={(e, val) => onFilterChange('minRating', val)}
                aria-label="Minimum Rating"
                valueLabelDisplay="auto"
                size="small"
                sx={{
                  color: 'primary.main',
                  py: 1,
                }}
              />
            </Box>

            {/* Clear Filters Button */}
            <Box sx={{ display: 'flex', justifyContent: { xs: 'stretch', md: 'flex-end' } }}>
              <Button
                fullWidth={isMobile}
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={<RotateLeftIcon />}
                onClick={onReset}
                disabled={activeFiltersCount === 0}
                sx={{
                  py: 1,
                  px: 2,
                  borderRadius: 2,
                }}
              >
                Clear Filters
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default FilterBar;
