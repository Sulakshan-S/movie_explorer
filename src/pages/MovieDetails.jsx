import { Box, Typography, Container } from '@mui/material';
import { useParams } from 'react-router-dom';

export const MovieDetails = () => {
  const { id } = useParams();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Movie Details
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Details for movie ID: {id}
      </Typography>
    </Container>
  );
};

export default MovieDetails;
