import { Box, Button, Typography, styled } from '@mui/material';
import Link from 'next/link';

const LandingPage = () => {
  return (
    <>
      <Box sx={{ margin: '20rem' }}>
        <Typography variant="h3">Dragonfly-console</Typography>
        <Box>
          <Button href="/home" variant="contained">
            login succeeded
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default LandingPage;
