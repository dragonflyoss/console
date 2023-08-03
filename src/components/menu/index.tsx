import styles from './index.module.css';
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
import { styled } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import { ListItemButton, ListItemIcon } from '@mui/material';
import { useEffect, useState } from 'react';
import { Logout, PersonAdd } from '@mui/icons-material';
import { getUserRoles, getUser, signOut } from '../../lib/api';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { getJwtPayload, setPageTitle } from '../../lib/utils';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';

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

export default function Layout(props: any) {
  const [role, setRole] = useState(['']);
  const [root] = useState('root');
  const [guest] = useState('guest');
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [pageLoding, setPageLoding] = useState(false);
  const [user, setUser] = useState({ name: '', email: '', avatar: '' });
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setPageLoding(true);
    const payload = getJwtPayload();
    setPageTitle(location.pathname);

    (async function () {
      try {
        if (payload?.id) {
          const [user, userRoles] = await Promise.all([getUser(payload?.id), getUserRoles(payload?.id)]);

          setUser(user);
          setRole(userRoles);
        } else {
          navigate('/signin');
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
        }
      }
      setPageLoding(false);
    })();
  }, [location.pathname, navigate]);

  const rootMenu = [
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

  const guestMenu = [
    {
      label: 'clusters',
      href: '/clusters',
      text: 'Cluster',
      icon: <Box component="img" className={styles.menuIcon} src="/icons/cluster/cluster.svg" />,
    },
  ];

  const handleLogout = async () => {
    setAnchorEl(null);
    try {
      await signOut();
      setPageLoding(true);
      navigate('/signin');
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(true);
        setErrorMessageText(error.message);
      }
    }
  };

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorMessage(false);
  };

  return (
    <Box>
      <Backdrop
        open={pageLoding}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0,0,0,0.3)',
        }}
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
      {location.pathname === '/signin' || location.pathname === '/signup' ? (
        <main>{props.children}</main>
      ) : (
        <Box className={styles.container}>
          <CssBaseline />
          <Box className={styles.navigationBarContainer}>
            <Grid sx={{ pl: '1rem', pr: '1rem' }}>
              <Box className={styles.title}>
                <picture>
                  <Box component="img" className={styles.logo} src="/icons/cluster/logo.svg" />
                </picture>
                <Typography variant="h6" gutterBottom sx={{ fontFamily: 'mabry-bold' }}>
                  Dragonfly
                </Typography>
              </Box>
              <List component="nav" aria-label="main mailbox folders">
                {role.map((item, id) => {
                  return item === root ? (
                    rootMenu.map((items) => (
                      <ListItemButton
                        key={items.href}
                        selected={location.pathname.split('/')[1] === items.label}
                        component={Link}
                        to={items.href}
                        sx={{
                          '&.Mui-selected': { backgroundColor: '#DFFF55' },
                          '&.Mui-selected:hover': {
                            backgroundColor: '#DDFF55',
                            color: '#121726',
                          },
                          height: '2rem',
                          mb: '0.4rem',
                        }}
                      >
                        {items.icon}
                        <Typography variant="subtitle1" sx={{ fontFamily: 'mabry-bold', ml: '0.4rem' }}>
                          {items.text}
                        </Typography>
                      </ListItemButton>
                    ))
                  ) : item === guest ? (
                    guestMenu.map((items) => {
                      return (
                        <ListItemButton
                          key={items.href}
                          selected={location.pathname.split('/')[1] === items.label}
                          component={Link}
                          to={items.href}
                          sx={{
                            '&.Mui-selected': { backgroundColor: '#DFFF55' },
                            '&.Mui-selected:hover': {
                              backgroundColor: '#DDFF55',
                              color: '#121726',
                            },
                            height: '2rem',
                            mb: '0.4rem',
                          }}
                        >
                          {items.icon}
                          <Typography variant="subtitle1" sx={{ fontFamily: 'mabry-bold', ml: '0.4rem' }}>
                            {items.text}
                          </Typography>
                        </ListItemButton>
                      );
                    })
                  ) : (
                    <Box key={id}></Box>
                  );
                })}
              </List>
            </Grid>
            <Grid sx={{ mb: '4rem' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar className={styles.avatar} src={user?.avatar} />
                  <Box sx={{ width: '7rem' }}>
                    <Typography fontFamily="mabry-bold">{user?.name || '-'}</Typography>
                    <Tooltip title={user?.email || '-'} placement="top">
                      <Typography
                        component="div"
                        variant="caption"
                        sx={{
                          width: '7rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
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

                    navigate('/profile');
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
          <Main>
            <Outlet />
          </Main>
        </Box>
      )}
    </Box>
  );
}
