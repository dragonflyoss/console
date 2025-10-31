import { Grid, useTheme } from '@mui/material';
import { ReactComponent as DarkDragonfly } from '../assets/images/login/dragonflyDark.svg';
import { ReactComponent as Dragonfly } from '../assets/images/login/dragonflyLight.svg';


export default function Rotation() {
  const theme = useTheme();

  return (
    <Grid sx={{ backgroundColor: 'var(--palette-background-rotation)', height: '100vh' }}>
      {theme.palette.mode === 'light' ? <Dragonfly style={{ width: '100%', height: '100%' }} /> : <DarkDragonfly style={{ width: '100%', height: '100%' }} />}
    </Grid>
  );
}
