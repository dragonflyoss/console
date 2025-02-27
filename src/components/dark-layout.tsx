import { Box, IconButton, Link, useTheme } from '@mui/material';
import { ReactComponent as Dark } from '../assets/images/header/dark.svg';
import { ReactComponent as Light } from '../assets/images/header/light.svg';
import { ReactComponent as Github } from '../assets/images/header/github.svg';
import { useContext } from 'react';
import { ColorModeContext } from '../App';
import styles from './dark-layout.module.css';

interface layoutProps {
  className?: string;
}

const HeaderLayout: React.FC<layoutProps> = ({ className }) => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  return (
    <Box className={styles.container}>
      <IconButton
        id="mode"
        sx={{
          ':hover': {
            backgroundColor: 'rgba(218 218 218 / 40%)',
          },
          p: '0.3rem',
          mr: '0.3rem',
        }}
        onClick={colorMode.toggleColorMode}
      >
        {theme.palette.mode === 'dark' ? (
          <Dark id="dark" className={className} />
        ) : (
          <Light id="light" className={className} />
        )}
      </IconButton>
      <Link
        id="github"
        underline="hover"
        href="https://github.com/dragonflyoss/dragonfly"
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          ':hover': {
            backgroundColor: 'rgba(218 218 218 / 40%)',
          },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: '0.3rem',
          mr: '0.3rem',
          borderRadius: '50%',
        }}
      >
        <Github className={className} />
      </Link>
    </Box>
  );
};
export default HeaderLayout;
