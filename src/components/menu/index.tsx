import styles from './index.module.css';
import {
  Alert,
  Avatar,
  Backdrop,
  Collapse,
  Divider,
  Grid,
  IconButton,
  ListItemText,
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
import { createContext, useEffect, useState } from 'react';
import { ExpandLess, ExpandMore, Logout, PersonAdd, StarBorder } from '@mui/icons-material';
import { getUserRoles, getUser, signOut } from '../../lib/api';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { getJwtPayload, setPageTitle } from '../../lib/utils';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { ROLE_ROOT, ROLE_GUEST } from '../../lib/constants';

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

interface MyContextType {
  name: string;
  id: number;
}

export const MyContext = createContext<MyContextType>({
  name: '',
  id: 0,
});

export default function Layout(props: any) {
  const [role, setRole] = useState('');
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [pageLoding, setPageLoding] = useState(false);
  const [user, setUser] = useState({ name: '', email: '', avatar: '', id: 0 });
  const [anchorElement, setAnchorElement] = useState(null);
  const [firstLogin, setFirstLogin] = useState(false);
  const [expandDeveloper, setExpandDeveloper] = useState(false);
  const [expandJob, setExpandJob] = useState(false);

  const openProfile = Boolean(anchorElement);
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
          setRole(userRoles.includes(ROLE_ROOT) ? ROLE_ROOT : ROLE_GUEST);
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

    if (location.state?.firstLogin) {
      setFirstLogin(true);
    }
  }, [location, navigate]);

  const rootMenu = [
    {
      label: 'clusters',
      href: '/clusters',
      text: 'Cluster',
      icon: <Box component="img" className={styles.menuIcon} src="/icons/cluster/cluster.svg" />,
    },
    {
      label: 'Developer',
      href: '/tokens',
      text: 'Developer',
      icon: <Box component="img" className={styles.menuIcon} src="/icons/tokens/developer.svg" />,
      menuProps: {
        label: 'personal-access-tokens',
        href: '/developer/personal-access-tokens',
        text: 'Tokens',
      },
    },
    {
      label: 'Job',
      href: '/jobs',
      text: 'Job',
      icon: <Box component="img" className={styles.menuIcon} src="/icons/job/preheat/job.svg" />,
      menuProps: {
        label: 'preheats',
        href: '/jobs/preheats',
        text: 'Preheat',
      },
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
    {
      label: 'Developer',
      href: '/tokens',
      text: 'Developer',
      icon: <Box component="img" className={styles.menuIcon} src="/icons/tokens/developer.svg" />,
      menuProps: {
        label: 'personal-access-tokens',
        href: '/developer/personal-access-tokens',
        text: 'Tokens',
      },
    },
    {
      label: 'Job',
      href: '/jobs',
      text: 'Job',
      icon: <Box component="img" className={styles.menuIcon} src="/icons/job/preheat/job.svg" />,
      menuProps: {
        label: 'preheats',
        href: '/jobs/preheats',
        text: 'Preheat',
      },
    },
  ];

  const handleLogout = async () => {
    setAnchorElement(null);

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
    setFirstLogin(false);
    setErrorMessage(false);
  };

  return (
    <MyContext.Provider value={user}>
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
          open={firstLogin}
          autoHideDuration={60000}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          onClose={handleClose}
          sx={{ alignItems: 'center' }}
        >
          <Alert onClose={handleClose} severity="warning" sx={{ width: '100%' }}>
            Please change the password in time for the first login!
          </Alert>
        </Snackbar>
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
                  {role === ROLE_ROOT ? (
                    rootMenu.map((items) =>
                      items.text === 'Developer' ? (
                        <Box key={items.href}>
                          <ListItemButton
                            key={items.href}
                            onClick={() => {
                              setExpandDeveloper(!expandDeveloper);
                            }}
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
                            <Typography
                              variant="subtitle1"
                              sx={{ fontFamily: 'mabry-bold', ml: '0.4rem', width: '100%' }}
                            >
                              {items.text}
                            </Typography>
                            {expandDeveloper ? <ExpandLess /> : <ExpandMore />}
                          </ListItemButton>
                          <Collapse in={expandDeveloper} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                              <ListItemButton
                                selected={location.pathname.split('/')[2] === items?.menuProps?.label}
                                component={Link}
                                to={items?.menuProps?.href || ''}
                                sx={{
                                  '&.Mui-selected': { backgroundColor: '#DFFF55' },
                                  '&.Mui-selected:hover': {
                                    backgroundColor: '#DDFF55',
                                    color: '#121726',
                                  },
                                  height: '2rem',
                                  mb: '0.4rem',
                                  pl: '1rem',
                                }}
                              >
                                <Typography variant="body1" sx={{ ml: '2rem', fontFamily: 'mabry-bold' }}>
                                  {items?.menuProps?.text}
                                </Typography>
                              </ListItemButton>
                            </List>
                          </Collapse>
                        </Box>
                      ) : items.text === 'Job' ? (
                        <Box key={items.href}>
                          <ListItemButton
                            key={items.href}
                            onClick={() => {
                              setExpandJob(!expandJob);
                            }}
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
                            <Typography
                              variant="subtitle1"
                              sx={{ fontFamily: 'mabry-bold', ml: '0.4rem', width: '100%' }}
                            >
                              {items.text}
                            </Typography>
                            {expandJob ? <ExpandLess /> : <ExpandMore />}
                          </ListItemButton>
                          <Collapse in={expandJob} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                              <ListItemButton
                                selected={location.pathname.split('/')[2] === items?.menuProps?.label}
                                component={Link}
                                to={items?.menuProps?.href || ''}
                                sx={{
                                  '&.Mui-selected': { backgroundColor: '#DFFF55' },
                                  '&.Mui-selected:hover': {
                                    backgroundColor: '#DDFF55',
                                    color: '#121726',
                                  },
                                  height: '2rem',
                                  mb: '0.4rem',
                                  pl: '1rem',
                                }}
                              >
                                <Typography variant="body1" sx={{ ml: '2rem', fontFamily: 'mabry-bold' }}>
                                  {items?.menuProps?.text}
                                </Typography>
                              </ListItemButton>
                            </List>
                          </Collapse>
                        </Box>
                      ) : (
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
                      ),
                    )
                  ) : role === ROLE_GUEST ? (
                    guestMenu.map((items) =>
                      items.text === 'Developer' ? (
                        <Box key={items.href}>
                          <ListItemButton
                            onClick={() => {
                              setExpandDeveloper(!expandDeveloper);
                            }}
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
                            <Typography
                              variant="subtitle1"
                              sx={{ fontFamily: 'mabry-bold', ml: '0.4rem', width: '100%' }}
                            >
                              {items.text}
                            </Typography>
                            {expandDeveloper ? <ExpandLess /> : <ExpandMore />}
                          </ListItemButton>
                          <Collapse in={expandDeveloper} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                              <ListItemButton
                                selected={location.pathname.split('/')[2] === items?.menuProps?.label}
                                component={Link}
                                to={items?.menuProps?.href || ''}
                                sx={{
                                  '&.Mui-selected': { backgroundColor: '#DFFF55' },
                                  '&.Mui-selected:hover': {
                                    backgroundColor: '#DDFF55',
                                    color: '#121726',
                                  },
                                  height: '2rem',
                                  mb: '0.4rem',
                                  pl: '1rem',
                                }}
                              >
                                <Typography variant="body1" sx={{ ml: '2rem', fontFamily: 'mabry-bold' }}>
                                  {items?.menuProps?.text}
                                </Typography>
                              </ListItemButton>
                            </List>
                          </Collapse>
                        </Box>
                      ) : items.text === 'Job' ? (
                        <Box key={items.href}>
                          <ListItemButton
                            key={items.href}
                            onClick={() => {
                              setExpandJob(!expandJob);
                            }}
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
                            <Typography
                              variant="subtitle1"
                              sx={{ fontFamily: 'mabry-bold', ml: '0.4rem', width: '100%' }}
                            >
                              {items.text}
                            </Typography>
                            {expandJob ? <ExpandLess /> : <ExpandMore />}
                          </ListItemButton>
                          <Collapse in={expandJob} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                              <ListItemButton
                                selected={location.pathname.split('/')[2] === items?.menuProps?.label}
                                component={Link}
                                to={items?.menuProps?.href || ''}
                                sx={{
                                  '&.Mui-selected': { backgroundColor: '#DFFF55' },
                                  '&.Mui-selected:hover': {
                                    backgroundColor: '#DDFF55',
                                    color: '#121726',
                                  },
                                  height: '2rem',
                                  mb: '0.4rem',
                                  pl: '1rem',
                                }}
                              >
                                <Typography variant="body1" sx={{ ml: '2rem', fontFamily: 'mabry-bold' }}>
                                  {items?.menuProps?.text}
                                </Typography>
                              </ListItemButton>
                            </List>
                          </Collapse>
                        </Box>
                      ) : (
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
                      ),
                    )
                  ) : (
                    <></>
                  )}
                </List>
              </Grid>
              <Grid sx={{ mb: '4rem', pl: '1rem', pr: '1rem' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar className={styles.avatar} src={user?.avatar} />
                    <Box
                      sx={{
                        width: '7rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography component="div" fontFamily="mabry-bold">
                        {user?.name || '-'}
                      </Typography>
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
                      setAnchorElement(event.currentTarget);
                    }}
                    size="small"
                    aria-controls={openProfile ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={openProfile ? 'true' : undefined}
                    sx={{ position: 'relative', padding: '0' }}
                  >
                    <UnfoldMoreIcon />
                  </IconButton>
                </Box>
                <Menu
                  anchorEl={anchorElement}
                  id="account-menu"
                  open={openProfile}
                  onClose={() => {
                    setAnchorElement(null);
                  }}
                  sx={{ position: 'absolute', top: '-5.8rem', left: '-5rem' }}
                >
                  <MenuItem
                    onClick={() => {
                      setAnchorElement(null);

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
    </MyContext.Provider>
  );
}
