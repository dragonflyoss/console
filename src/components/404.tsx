import { Box, Typography } from '@mui/material';

export default function NotFound() {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box sx={{ width: '40rem' }}>
        <Box component="img" src="/images/404.svg" sx={{ width: '20rem' }} />
        <Typography variant="h6" gutterBottom fontFamily="mabry-light" mt="3rem">
          We could not find what you were looking for.
        </Typography>
        <Typography variant="h6" gutterBottom fontFamily="mabry-light" mt="1rem">
          Please contact the owner of the site that linked you to the original URL and let them know their link is
          broken.
        </Typography>
      </Box>
    </Box>
  );
}
