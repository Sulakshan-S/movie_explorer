import { Box, Typography, Button, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import MovieFilterOutlinedIcon from '@mui/icons-material/MovieFilterOutlined';
import HomeIcon from '@mui/icons-material/Home';

export const NotFound = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: 4,
        }}
      >
        <MovieFilterOutlinedIcon
          sx={{
            fontSize: 96,
            color: 'primary.main',
            mb: 2,
            opacity: 0.85,
          }}
        />
        <Typography
          variant="h2"
          component="h1"
          fontWeight="800"
          sx={{
            letterSpacing: '-1px',
            mb: 1,
          }}
        >
          404
        </Typography>
        <Typography variant="h5" fontWeight="600" gutterBottom>
          Page Not Found
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 480, mb: 4 }}
        >
          Oops! The reel broke. The page you are searching for doesn’t exist or has
          been moved to another theater.
        </Typography>
        <Button
          component={RouterLink}
          to="/"
          variant="contained"
          size="large"
          startIcon={<HomeIcon />}
          sx={{ px: 4, py: 1.2 }}
        >
          Back to Home
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;
