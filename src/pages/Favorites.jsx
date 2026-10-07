import { Box, Typography, Container } from '@mui/material';

export const Favorites = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        My Favorites
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Favorites list loading...
      </Typography>
    </Container>
  );
};

export default Favorites;
