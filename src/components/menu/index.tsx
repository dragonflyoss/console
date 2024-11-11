import styles from './index.module.css';
import {
  Alert,
  Avatar,
  Backdrop,
  Collapse,
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
import { createContext, useEffect, useState } from 'react';
import { ExpandLess, ExpandMore, Logout, PersonAdd } from '@mui/icons-material';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import { getUserRoles, getUser, signOut, getUserResponse } from '../../lib/api';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { getJwtPayload, setPageTitle } from '../../lib/utils';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { ROLE_ROOT, ROLE_GUEST } from '../../lib/constants';
import LoadingBackdrop from '../loading-backdrop';

interface MyContextType {
  user: getUserResponse;
  role: string;
  handleUserUpdate: (newUser: getUserResponse) => void;
}

export const MyContext = createContext<MyContextType>({
  user: {
    id: 0,
    created_at: '',
    updated_at: '',
    is_del: 0,
    email: '',
    name: '',
    avatar: '',
    phone: '',
    state: '',
    location: '',
    bio: '',
  },
  role: '',
  handleUserUpdate: () => {
    return;
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

export default function Layout(props: any) {
  const [role, setRole] = useState('');
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [pageLoding, setPageLoding] = useState(false);
  const [user, setUser] = useState<getUserResponse>({
    id: 0,
    created_at: '',
    updated_at: '',
    is_del: 0,
    email: '',
    name: '',
    avatar: '',
    phone: '',
    state: '',
    location: '',
    bio: '',
  });
  const [anchorElement, setAnchorElement] = useState(null);
  const [firstLogin, setFirstLogin] = useState(false);
  const [expandDeveloper, setExpandDeveloper] = useState(false);
  const [expandJob, setExpandJob] = useState(false);
  const [expandInsight, setExpandInsight] = useState(false);

  const openProfile = Boolean(anchorElement);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    (async function () {
      setPageLoding(true);
      try {
        const payload = getJwtPayload();
        setPageTitle(location.pathname);

        if (payload?.id) {
          const [user, userRoles] = await Promise.all([getUser(payload?.id), getUserRoles(payload?.id)]);
          setUser(user);
          setRole(userRoles.includes(ROLE_ROOT) ? ROLE_ROOT : ROLE_GUEST);
          setPageLoding(false);
        } else {
          setPageLoding(false);
          navigate('/signin');
        }
      } catch (error) {
        if (error instanceof Error) {
          setPageLoding(false);
          setErrorMessage(true);
          setErrorMessageText(error.message);
        }
      }
    })();

    if (location.state?.firstLogin) {
      setFirstLogin(true);
    }
  }, [location, navigate]);

  const handleUserUpdate = (newUser: getUserResponse) => {
    setUser(newUser);
  };

  const menu = [
    {
      label: 'clusters',
      href: '/clusters',
      text: 'Cluster',
      icon: <Box component="img" className={styles.menuIcon} src="/icons/cluster/cluster.svg" />,
      selectedIcon: <Box component="img" className={styles.menuIcon} src="/icons/cluster/selected-cluster.svg" />,
    },
    {
      label: 'developer',
      href: '/tokens',
      text: 'Developer',
      icon: <Box component="img" className={styles.menuIcon} src="/icons/tokens/developer.svg" />,
      selectedIcon: <Box component="img" className={styles.menuIcon} src="/icons/tokens/selected-developer.svg" />,
      expand: expandDeveloper,
      setExpand: setExpandDeveloper,
      menuProps: [
        {
          label: 'personal-access-tokens',
          href: '/developer/personal-access-tokens',
          text: 'Tokens',
        },
      ],
    },
    {
      label: 'jobs',
      href: '/jobs',
      text: 'Job',
      icon: <Box component="img" className={styles.menuIcon} src="/icons/job/preheat/job.svg" />,
      selectedIcon: <Box component="img" className={styles.menuIcon} src="/icons/job/preheat/selected-job.svg" />,
      expand: expandJob,
      setExpand: setExpandJob,
      menuProps: [
        {
          label: 'preheats',
          href: '/jobs/preheats',
          text: 'Preheat',
        },
        {
          label: 'task',
          href: '/jobs/task/clear',
          text: 'Task',
        },
      ],
    },
    {
      label: 'insight',
      href: '/insight',
      text: 'Insight',
      icon: <Box component="img" className={styles.menuIcon} src="/icons/insight/insight.svg" />,
      selectedIcon: <Box component="img" className={styles.menuIcon} src="/icons/insight/selected-insight.svg" />,
      expand: expandInsight,
      setExpand: setExpandInsight,
      menuProps: [
        {
          label: 'peers',
          href: '/insight/peers',
          text: 'Peer',
        },
      ],
    },
  ];

  if (role === ROLE_ROOT) {
    menu.push({
      label: 'users',
      href: '/users',
      text: 'User',
      icon: <Box component="img" className={styles.menuIcon} src="/icons/user/user.svg" />,
      selectedIcon: <Box component="img" className={styles.menuIcon} src="/icons/user/selected-user.svg" />,
    });
  }

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
    <MyContext.Provider value={{ user, role, handleUserUpdate }}>
      <LoadingBackdrop open={pageLoding} />
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
                {menu.map((items) =>
                  items?.menuProps ? (
                    <Box key={items.href} className={styles.menu}>
                      <ListItemButton
                        selected={(location.pathname.split('/')[1] || '') === items.label}
                        onClick={() => {
                          items?.setExpand(!items?.expand);
                        }}
                        sx={{
                          '&.Mui-selected': {
                            backgroundColor: 'var(--menu-background-color)',
                            color: 'var(--description-color)',
                          },
                          '&.Mui-selected:hover': {
                            backgroundColor: 'var(--hover-menu-background-color)',
                            color: 'var(--description-color)',
                          },
                          height: '2.6rem',
                          borderRadius: '0.2rem',
                        }}
                      >
                        {(location.pathname.split('/')[1] || '') === items.label ? items.selectedIcon : items.icon}
                        <Typography variant="subtitle1" sx={{ fontFamily: 'mabry-bold', ml: '0.4rem', width: '100%' }}>
                          {items.text}
                        </Typography>
                        {items.expand ? <ExpandMore /> : <ChevronRightOutlinedIcon />}
                      </ListItemButton>
                      <Collapse in={items.expand} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                          {items.menuProps?.map((item) => {
                            return (
                              <ListItemButton
                                className={styles.expandMenu}
                                selected={(location.pathname.split('/')[2] || '') === item.label}
                                component={Link}
                                to={item.href || ''}
                                sx={{
                                  '&.Mui-selected': {
                                    backgroundColor: '#fff',
                                    color: 'var(--description-color)',
                                  },
                                  '&.Mui-selected:hover': {
                                    backgroundColor: '#fff',
                                    color: 'var(--description-color)',
                                  },
                                  height: '2.4rem',
                                  borderRadius: '0.2rem',
                                  pl: '1rem',
                                  mt: '0.8rem',
                                }}
                              >
                                <Typography variant="body1" sx={{ fontFamily: 'mabry-bold', ml: '2rem' }}>
                                  {item.text}
                                </Typography>
                              </ListItemButton>
                            );
                          })}
                        </List>
                      </Collapse>
                    </Box>
                  ) : (
                    <ListItemButton
                      className={styles.menu}
                      key={items.href}
                      selected={(location.pathname.split('/')[1] || '') === items.label}
                      component={Link}
                      to={items.href}
                      sx={{
                        '&.Mui-selected': {
                          backgroundColor: 'var(--menu-background-color)',
                          color: 'var(--description-color)',
                        },
                        '&.Mui-selected:hover': {
                          backgroundColor: 'var(--hover-menu-background-color)',
                          color: 'var(--description-color)',
                        },
                        height: '2.6rem',
                        borderRadius: '0.2rem',
                        mb: '0.4rem',
                        mt: '0.4rem',
                      }}
                    >
                      {(location.pathname.split('/')[1] || '') === items.label ? items.selectedIcon : items.icon}
                      <Typography variant="subtitle1" sx={{ fontFamily: 'mabry-bold', ml: '0.4rem' }}>
                        {items.text}
                      </Typography>
                    </ListItemButton>
                  ),
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
                  id="unfold-more"
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
                  id="profile-menu"
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
                <MenuItem id="logout-menu" onClick={handleLogout}>
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
    </MyContext.Provider>
  );
}
