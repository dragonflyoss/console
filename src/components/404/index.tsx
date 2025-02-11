import { Box, Typography, Grid, CssBaseline, Button } from '@mui/material';
import styles from './index.module.css';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Grid className={styles.container}>
      <Box className={styles.logoContainer}>
        <Box component="img" sx={{ width: '1.8rem', height: '1.8rem', mr: '0.4rem' }} src="/images/404/logo.svg" />
        <Typography variant="h6" sx={{ fontFamily: 'mabry-bold' }}>
          Dragonfly
        </Typography>
      </Box>
      <CssBaseline />
      <Box className={styles.content}>
        <Box component="img" src="/images/404/404.svg" sx={{ width: '38rem' }} />
        <Typography variant="h4" gutterBottom mt="2rem">
          Something gone wrong!
        </Typography>
        <Typography variant="body1" fontFamily="mabry-light" mb="2rem">
          The page you were looking for doesn't exist.
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          sx={{
            width: '12rem',
            '&.MuiButton-root': {
              backgroundColor: 'var(--button-color)',
            },
          }}
          onClick={() => {
            navigate(`/clusters`);
          }}
        >
          <Typography variant="button">go back cluster</Typography>
        </Button>
      </Box>
    </Grid>
  );
}
