import { Box, Typography, Container } from '@mui/material';

export const Home = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Trending Movies
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Home page content loading...
      </Typography>
    </Container>
  );
};

export default Home;
