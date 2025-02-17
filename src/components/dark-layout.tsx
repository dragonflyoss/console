import { IconButton, Link, useTheme } from '@mui/material';
import { ReactComponent as Dark } from '../assets/images/header/dark.svg';
import { ReactComponent as Light } from '../assets/images/header/light.svg';
import { ReactComponent as Github } from '../assets/images/header/github.svg';
import { useContext } from 'react';
import { ColorModeContext } from '../App';
import styles from './dark-layout.module.css';

const HeaderLayout = () => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  return (
    <>
      <IconButton onClick={colorMode.toggleColorMode} color="inherit">
        {theme.palette.mode === 'dark' ? <Dark className={styles.github} /> : <Light className={styles.github} />}
      </IconButton>
      <Link
        underline="hover"
        href="https://github.com/dragonflyoss/dragonfly"
        target="_blank"
        rel="noopener noreferrer"
      >
        <IconButton>
          <Github className={styles.github} />
        </IconButton>
      </Link>
    </>
  );
};
export default HeaderLayout;
