import { Box, Typography, Grid, Button } from '@mui/material';
import styles from './index.module.css';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as Logo } from '../../assets/images/404/logo.svg';
import { ReactComponent as NotFoundImg } from '../../assets/images/404/404.svg';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Grid className={styles.container}>
      <Box className={styles.logoContainer}>
        <Logo className={styles.logoIcon} />
        <Typography variant="h6" fontFamily="mabry-bold" color="#1c293a">
          Dragonfly
        </Typography>
      </Box>
      <Box className={styles.content}>
        <NotFoundImg className={styles.notFound} />
        <Typography variant="h4" gutterBottom mt="2rem" color="#1c293a">
          Something gone wrong!
        </Typography>
        <Typography variant="body1" fontFamily="mabry-light" mb="2rem" color="#1c293a">
          The page you were looking for doesn't exist.
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          sx={{
            width: '12rem',
            background: '#1c293a',
            color: 'var(--palette-button-text-color)',
            ':hover': { backgroundColor: '#1c293a' },
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
