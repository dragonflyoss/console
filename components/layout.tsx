import styles from './layout.module.css';
import {
  Alert,
  Avatar,
  Backdrop,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Tooltip,
  Typography,
} from '@mui/material';
import * as React from 'react';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import { ListItemButton, ListItemIcon } from '@mui/material';
import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Logout, PersonAdd } from '@mui/icons-material';
import { getuserRoles, getUser, signOut } from 'lib/api';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import Link from 'next/link';
import { getUserID } from 'lib/utils';

type LayoutProps = {
  children: ReactNode;
};

const theme = createTheme({
  typography: {
    fontFamily: 'mabry-light,sans-serif',
  },
});

const Main = styled('div')(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  minHeight: '100%',
  height: '100vh',
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.up('lg')]: {
    paddingTop: '2rem',
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
}));

export default function Layout({ children }: LayoutProps) {
  const [role, setRole] = useState('guest');
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [pageLoding, setPageLoding] = useState(false);
  const [user, setUser] = useState({ name: '', email: '', avatar: '' });
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    const userID = getUserID();

    if (userID) {
      getUser(userID).then(async (response) => {
        if (response.status == 200) {
          setUser(await response.json());
        } else {
          setErrorMessage(true);
          setErrorMessageText(response.statusText);
        }
      });

      getuserRoles(userID).then(async (response) => {
        const res = await response.json();
        setRole(res[0]);
      });
    } else {
      router.push('/signin');
    }

    const handleStart = () => {
      setPageLoding(true);
    };

    const handleComplete = () => {
      setPageLoding(false);
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
    };
  }, [router]);

  const pathName = router.pathname.split('/');

  const menuItem = [
    {
      label: 'clusters',
      href: '/clusters',
      text: 'Cluster',
      icon: <Box component="img" className={styles.menuIcon} src="/icons/cluster/cluster.svg" />,
    },
    {
      label: 'users',
      href: '/users',
      text: 'User',
      icon: <Box component="img" className={styles.menuIcon} src="/icons/cluster/user.svg" />,
    },
  ];

  const menu =
    role === 'root'
      ? menuItem
      : menuItem.filter((item) => {
          return item.label !== 'users';
        });

  const handleLogout = () => {
    signOut().then((response) => {
      if (response.status == 200) {
        setPageLoding(true);
        router.push('/signin');
      }
    });
  };

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setErrorMessage(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Backdrop
        open={pageLoding}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: 'rgba(0,0,0,0.3)' }}
      >
        <Box component="img" sx={{ width: '4rem', height: '4rem' }} src="/icons/cluster/page-loading.svg" />
      </Backdrop>
      <Snackbar
        open={errorMessage}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
          {errorMessageText}
        </Alert>
      </Snackbar>
      <Box className={styles.container}>
        <CssBaseline />
        <Box className={styles.NavigationBarContainer}>
          <Grid sx={{ pl: '1rem', pr: '1rem' }}>
            <Box className={styles.title}>
              <picture>
                <Box component="img" className={styles.logo} src="/icons/cluster/logo.svg" />
              </picture>
              <Typography variant="h6" gutterBottom sx={{ fontFamily: 'mabry-bold' }}>
                Dragonfly
              </Typography>
            </Box>
            <List component="nav" aria-label="main mailbox folders" sx={{ width: '100%' }}>
              {menu.map((item) => {
                return (
                  <ListItemButton
                    key={item.href}
                    selected={pathName[1] === item.label}
                    component={Link}
                    href={item.href}
                    sx={{
                      '&.Mui-selected': { backgroundColor: '#DFFF55' },
                      '&.Mui-selected:hover': { backgroundColor: '#DDFF55', color: '#121726' },
                      height: '2rem',
                      mb: '0.4rem',
                    }}
                  >
                    {item.icon}
                    <Typography variant="subtitle1" sx={{ fontFamily: 'mabry-bold', ml: '0.4rem' }}>
                      {item.text}
                    </Typography>
                  </ListItemButton>
                );
              })}
            </List>
          </Grid>
          <Grid sx={{ mb: '4rem' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar className={styles.avatar} src={user?.avatar} />
                <Box sx={{ width: '7rem' }}>
                  <Typography fontFamily="mabry-bold">{user?.name || '-'}</Typography>
                  <Tooltip title={user?.email || '-'} placement="top">
                    <Typography
                      component="div"
                      variant="caption"
                      sx={{ width: '7rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                      {user?.email || '-'}
                    </Typography>
                  </Tooltip>
                </Box>
              </Box>
              <IconButton
                onClick={(event: any) => {
                  setAnchorEl(event.currentTarget);
                }}
                size="small"
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                sx={{ mr: '0.6rem', position: 'relative' }}
              >
                <UnfoldMoreIcon />
              </IconButton>
            </Box>
            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={open}
              onClose={() => {
                setAnchorEl(null);
              }}
              sx={{ position: 'absolute', top: '-5.5rem', left: '-4.8rem' }}
            >
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  router.push(`/profile`);
                }}
              >
                <ListItemIcon>
                  <PersonAdd fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Grid>
        </Box>
        <Divider orientation="vertical" flexItem />
        <Main>{children}</Main>
      </Box>
    </ThemeProvider>
  );
}
