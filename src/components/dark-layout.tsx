import {
  Box,
  FormControl,
  FormControlLabel,
  IconButton,
  Link,
  Paper,
  styled,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  toggleButtonGroupClasses,
  Typography,
  useTheme,
} from '@mui/material';
import { ReactComponent as Dark } from '../assets/images/menu/dark.svg';
import { ReactComponent as Light } from '../assets/images/menu/light.svg';
import { useContext, useState } from 'react';
import { ColorModeContext } from '../App';
import styles from './dark-layout.module.css';

interface layoutProps {
  className?: string;
}

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  [`& .${toggleButtonGroupClasses.grouped}`]: {
    margin: theme.spacing(0.5),
    border: 0,
    borderRadius: theme.shape.borderRadius,
    [`&.${toggleButtonGroupClasses.disabled}`]: {
      border: 0,
    },
  },
  [`& .${toggleButtonGroupClasses.middleButton},& .${toggleButtonGroupClasses.lastButton}`]: {
    marginLeft: -1,
  },
  width: '100%',
}));

const VerticalToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  [`& .${toggleButtonGroupClasses.grouped}`]: {
    margin: theme.spacing(0.5),
    border: 0,
    borderRadius: theme.shape.borderRadius,
    [`&.${toggleButtonGroupClasses.disabled}`]: {
      border: 0,
    },
  },
  [`& .${toggleButtonGroupClasses.middleButton},& .${toggleButtonGroupClasses.lastButton}`]: {
    marginTop: -1,
  },
}));

export const HeaderLayout: React.FC<layoutProps> = ({ className }) => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  return (
    <Box className={className}>
      <Paper
        elevation={0}
        sx={() => ({
          display: 'inline-flex',
          flexWrap: 'wrap',
          bgcolor: 'var(--palette-grey-600Channel)',
          borderRadius: '1.2rem',
          width: '100%',
        })}
      >
        <StyledToggleButtonGroup
          size="small"
          value={theme.palette.mode}
          exclusive
          onClick={colorMode.toggleColorMode}
          aria-label="text alignment"
        >
          <ToggleButton
            sx={{
              width: '50%',
              p: '0.4rem !important',
              borderRadius: '1.3rem !important',
              textTransform: 'none',
              '&.Mui-selected': {
                boxShadow: 'var(--palette-card-box-shadow)',
                bgcolor: 'var(--palette-main-background-paper)',
              },
              '&.Mui-selected:hover': {
                boxShadow: 'var(--palette-card-box-shadow)',
                bgcolor: 'var(--palette-main-background-paper)',
              },
            }}
            id="light"
            value="light"
            aria-label="left aligned"
          >
            <Light className={styles.darkModeIcon} />
            <Typography variant="body2" pl="0.4rem" fontFamily="mabry-bold">
              Light
            </Typography>
          </ToggleButton>
          <ToggleButton
            sx={{
              width: '50%',
              p: '0.4rem !important',
              borderRadius: '1.3rem !important',
              textTransform: 'none',
              '&.Mui-selected': {
                boxShadow: 'var(--palette-card-box-shadow)',
                bgcolor: 'var(--palette-main-background-paper)',
              },
              '&.Mui-selected:hover': {
                boxShadow: 'var(--palette-card-box-shadow)',
                bgcolor: 'var(--palette-main-background-paper)',
              },
            }}
            id="dark"
            value="dark"
            aria-label="centered"
          >
            <Dark className={styles.darkModeIcon} />
            <Typography variant="body2" pl="0.4rem" fontFamily="mabry-bold">
              Dark
            </Typography>
          </ToggleButton>
        </StyledToggleButtonGroup>
      </Paper>
    </Box>
  );
};

export const ShrinkDarkMode: React.FC<layoutProps> = ({ className }) => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  return (
    <Box className={className}>
      <Paper
        elevation={0}
        sx={() => ({
          display: 'inline-flex',
          flexWrap: 'wrap',
          backgroundColor: 'var(--palette-grey-600Channel)',
          borderRadius: '1.2rem',
        })}
      >
        <VerticalToggleButtonGroup
          size="small"
          value={theme.palette.mode}
          exclusive
          onClick={colorMode.toggleColorMode}
          aria-label="text alignment"
          orientation="vertical"
        >
          <ToggleButton
            sx={{
              borderRadius: '50% !important',
              p: '0.4rem !important',
              textTransform: 'none',
              '&.Mui-selected': {
                boxShadow: 'var(--palette-card-box-shadow)',
                bgcolor: 'var(--palette-main-background-paper)',
              },
            }}
            id="light"
            value="light"
            aria-label="left aligned"
          >
            <Light id="light" className={styles.icon} />
          </ToggleButton>
          <ToggleButton
            sx={{
              borderRadius: '50% !important',
              p: '0.4rem !important',
              textTransform: 'none',
              '&.Mui-selected': {
                boxShadow: 'var(--palette-card-box-shadow)',
                bgcolor: 'var(--palette-main-background-paper)',
              },
            }}
            id="dark"
            value="dark"
            aria-label="centered"
          >
            <Dark id="dark" className={styles.icon} />
          </ToggleButton>
        </VerticalToggleButtonGroup>
      </Paper>
    </Box>
  );
};
