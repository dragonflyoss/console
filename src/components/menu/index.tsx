import styles from './index.module.css';
import {
  Alert,
  Avatar,
  Collapse,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  linearProgressClasses,
  Menu,
  MenuItem,
  Snackbar,
  Typography,
  Link as RouterLink,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import { ListItemButton, ListItemIcon } from '@mui/material';
import { createContext, useEffect, useState } from 'react';
import { Logout, PersonAdd } from '@mui/icons-material';
import { getUserRoles, getUser, signOut, getUserResponse } from '../../lib/api';
import { getJwtPayload, setPageTitle } from '../../lib/utils';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { ROLE_ROOT, ROLE_GUEST } from '../../lib/constants';
import { ReactComponent as Cluster } from '../../assets/images/menu/cluster.svg';
import { ReactComponent as Developer } from '../../assets/images/menu/developer.svg';
import { ReactComponent as Job } from '../../assets/images/menu/job.svg';
import { ReactComponent as User } from '../../assets/images/menu/user.svg';
import { ReactComponent as Logo } from '../../assets/images/menu/logo.svg';
import { ReactComponent as Expand } from '../../assets/images/menu/expand.svg';
import { ReactComponent as Closure } from '../../assets/images/menu/closure.svg';
import { ReactComponent as SidebarExpand } from '../../assets/images/menu/sidebar-expand.svg';
import { ReactComponent as SidebarClosure } from '../../assets/images/menu/sidebar-closure.svg';
import { DarkMode, ShrinkDarkMode } from '../dark-layout';
import Card from '../card';
import _ from 'lodash';

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

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  borderRadius: 5,
  height: '3px',
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: 'rgba(0, 167, 111, 0.4)',
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 3,
    backgroundColor: 'var(--palette-description-color)',
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
  const [progress, setProgress] = useState(0);
  const [expandedMenu, setExpandedMenu] = useState<any | null>(null);
  const [compactLayout, setCompactLayout] = useState(() => {
    const storedValue = localStorage.getItem('compactLayout');
    return storedValue === 'true';
  });

  const openProfile = Boolean(anchorElement);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    (async function () {
      try {
        setPageLoding(true);
        setProgress(0);

        const interval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 30) {
              clearInterval(interval);
              return prev;
            }
            return prev + 10;
          });
        }, 10);

        const payload = getJwtPayload();
        setPageTitle(location.pathname);

        if (payload?.id) {
          const [user, userRoles] = await Promise.all([getUser(payload?.id), getUserRoles(payload?.id)]);
          setUser(user);
          setRole(userRoles.includes(ROLE_ROOT) ? ROLE_ROOT : ROLE_GUEST);

          clearInterval(interval);
          setProgress(30);

          const secondInterval = setInterval(() => {
            setProgress((prev) => {
              if (prev > 200) {
                clearInterval(secondInterval);
                setPageLoding(false);
                return prev;
              }
              return prev + 10;
            });
          }, 20);
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
  }, [location.pathname, navigate, location.state?.firstLogin]);

  const handleMouseLeave = () => {
    setExpandedMenu(null);
  };

  useEffect(() => {
    localStorage.setItem('compactLayout', compactLayout ? 'true' : 'false');
  }, [compactLayout]);

  const handleUserUpdate = (newUser: getUserResponse) => {
    setUser(newUser);
  };

  const menu = [
    {
      label: 'clusters',
      href: '/clusters',
      text: 'Cluster',
      icon: <Cluster className={styles.menuIcon} />,
    },
    {
      label: 'developer',
      href: '/tokens',
      text: 'Developer',
      icon: <Developer className={styles.menuIcon} />,
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
      icon: <Job className={styles.menuIcon} />,
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
  ];

  if (role === ROLE_ROOT) {
    menu.push({
      label: 'users',
      href: '/users',
      text: 'User',
      icon: <User className={styles.menuIcon} />,
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
      <Box className={styles.pageContainer}>
        {pageLoding ? (
          <Box className={styles.pageloading}>
            <BorderLinearProgress id="page-loading" variant="determinate" value={progress} />
          </Box>
        ) : (
          <></>
        )}
        <Snackbar
          open={firstLogin}
          autoHideDuration={60000}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          onClose={handleClose}
          sx={{ alignItems: 'center' }}
          id="change-password-warning"
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
          <Box>
            <CssBaseline />
            <Box className={styles.container}>
              <Box className={styles.navigationBarContainer}>
                {compactLayout ? (
                  <Grid
                    sx={{
                      width: '4rem',
                      pl: '1.2rem',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: '1.5rem 0 1rem 0' }}>
                        <IconButton
                          onClick={() => {
                            setCompactLayout((e: any) => !e);
                          }}
                        >
                          <Expand id="expand" className={styles.expandIcon} />
                        </IconButton>
                      </Box>
                      <List component="nav" aria-label="main mailbox folders" className={styles.shrinkLiMenu}>
                        {menu.map((items, index) => {
                          return items?.menuProps ? (
                            <ListItemButton
                              id={items.label}
                              key={index}
                              selected={(location.pathname.split('/')[1] || '') === items.label}
                              onMouseEnter={() => {
                                setExpandedMenu(items.label);
                              }}
                              sx={{
                                '&.Mui-selected': {
                                  backgroundColor: 'var(--palette-menu-background-color)',
                                  color: 'var(--palette-secondary-dark)',
                                },
                                '&.Mui-selected:hover': {
                                  backgroundColor: 'var(--palette-hover-menu-background-color)',
                                  color: 'var(--palette-secondary-dark)',
                                },
                                borderRadius: '0.6rem',
                                color: 'var(--palette-sidebar-menu-color)',
                                p: '0.5rem',
                                justifyContent: 'center',
                                position: 'relative !important',
                                width: '2.4rem',
                                height: '2.4rem',
                              }}
                            >
                              {items.icon}
                              {items?.menuProps && expandedMenu === items.label && (
                                <Box
                                  id={items.label}
                                  key={items.label}
                                  onMouseLeave={handleMouseLeave}
                                  sx={{
                                    position: 'absolute ',
                                    left: '60px',
                                  }}
                                  className={styles.shrinkMenu}
                                >
                                  {items.menuProps.map((subItem) => (
                                    <MenuItem
                                      id={subItem.label}
                                      sx={{ borderRadius: 'var(--menu-border-radius)' }}
                                      key={subItem.label}
                                      onClick={() => {
                                        setExpandedMenu(null);
                                      }}
                                      component={Link}
                                      to={subItem.href}
                                    >
                                      <Typography variant="body2" className={styles.avatarMenu}>
                                        {subItem.text}
                                      </Typography>
                                    </MenuItem>
                                  ))}
                                </Box>
                              )}
                            </ListItemButton>
                          ) : (
                            <ListItemButton
                              id={items.label}
                              key={index}
                              selected={(location.pathname.split('/')[1] || '') === items.label}
                              component={Link}
                              to={items.href}
                              className={
                                (location.pathname.split('/')[1] || '') === items.label ? styles.listButton : ''
                              }
                              onMouseEnter={handleMouseLeave}
                              sx={{
                                '&.Mui-selected': {
                                  backgroundColor: 'var(--palette-menu-background-color)',
                                  color: 'var(--palette-secondary-dark)',
                                },
                                '&.Mui-selected:hover': {
                                  backgroundColor: 'var(--palette-hover-menu-background-color)',
                                  color: 'var(--palette-secondary-dark)',
                                },
                                borderRadius: '0.6rem',
                                color: 'var(--palette-sidebar-menu-color)',
                                p: '0.5rem',
                                justifyContent: 'center',
                                width: '2.4rem',
                                height: '2.4rem',
                              }}
                            >
                              {items.icon}
                            </ListItemButton>
                          );
                        })}
                      </List>
                    </Box>
                    <Box className={styles.shrinkSidebarUser}>
                      <ShrinkDarkMode className={styles.shrinkDarkMode} />
                      <IconButton
                        id="unfold-more"
                        className={styles.avatarButton}
                        onClick={(event: any) => {
                          setAnchorElement(event.currentTarget);
                        }}
                        sx={{ p: '0.3rem' }}
                      >
                        <Box className={styles.avatarWrapper} />
                        <Avatar className={styles.avatar} src={user?.avatar} />
                      </IconButton>
                      <Menu
                        anchorEl={anchorElement}
                        id="account-menu"
                        open={openProfile}
                        onClose={() => {
                          setAnchorElement(null);
                        }}
                        anchorOrigin={{
                          vertical: 'top',
                          horizontal: 'left',
                        }}
                        transformOrigin={{
                          vertical: 'bottom',
                          horizontal: 'left',
                        }}
                        sx={{
                          '& .MuiMenu-paper': {
                            boxShadow: 'var(--custom-shadows-dropdown)',
                            borderRadius: 'var(--menu-border-radius)',
                          },
                          '& .MuiMenu-list': {
                            width: '14rem',
                            p: '0',
                          },
                        }}
                      >
                        <Box className={styles.profileMenu}>
                          <Box className={styles.avatarContainer}>
                            <Avatar className={styles.menuAvatar} src={user?.avatar} />
                            <Typography variant="body1" className={styles.menuUserName}>
                              {user?.name}
                            </Typography>
                            <Tooltip title={user?.email || '-'} placement="top">
                              <Typography variant="body1" className={styles.menuUserEmail}>
                                {user?.email || '-'}
                              </Typography>
                            </Tooltip>
                          </Box>
                          <Divider
                            sx={{
                              borderStyle: 'dashed',
                              borderColor: 'var(--palette-palette-divider)',
                              borderWidth: '0px 0px thin',
                              m: '0.2rem 0',
                            }}
                          />
                          <MenuItem
                            id="profile-menu"
                            onClick={() => {
                              setAnchorElement(null);
                              navigate('/profile');
                            }}
                            sx={{ borderRadius: 'var(--menu-border-radius)' }}
                          >
                            <ListItemIcon>
                              <PersonAdd fontSize="small" className={styles.menuItemIcon} />
                            </ListItemIcon>
                            <Typography variant="body2" className={styles.avatarMenu}>
                              Profile
                            </Typography>
                          </MenuItem>
                          <MenuItem
                            sx={{ borderRadius: 'var(--menu-border-radius)' }}
                            id="logout-menu"
                            onClick={handleLogout}
                          >
                            <ListItemIcon>
                              <Logout fontSize="small" className={styles.menuItemIcon} />
                            </ListItemIcon>
                            <Typography variant="body2" className={styles.avatarMenu}>
                              Logout
                            </Typography>
                          </MenuItem>
                        </Box>
                      </Menu>
                    </Box>
                  </Grid>
                ) : (
                  <Grid
                    sx={{
                      width: '13.5rem',
                      pl: '1.2rem',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Box className={styles.sidebarTitle}>
                        <RouterLink id="dragonfly" href="/" color="inherit" underline="none" className={styles.title}>
                          <Logo className={styles.logo} />
                          <Typography variant="h6" sx={{ fontFamily: 'mabry-bold', pl: '0.6rem' }}>
                            Dragonfly
                          </Typography>
                        </RouterLink>
                        <IconButton
                          onClick={() => {
                            setCompactLayout((e: any) => !e);
                          }}
                        >
                          <Closure id="closure" className={styles.expandIcon} />
                        </IconButton>
                      </Box>
                      <List component="nav" aria-label="main mailbox folders" className={styles.liMenu}>
                        {menu.map((items) =>
                          items?.menuProps ? (
                            <Box key={items.href}>
                              <ListItemButton
                                id={items.label}
                                selected={(location.pathname.split('/')[1] || '') === items.label}
                                onClick={() => {
                                  items?.setExpand(!items?.expand);
                                }}
                                className={
                                  (location.pathname.split('/')[1] || '') === items.label ? styles.listButton : ''
                                }
                                sx={{
                                  '&.Mui-selected': {
                                    backgroundColor: 'var(--palette-menu-background-color)',
                                    color: 'var(--palette-secondary-dark)',
                                  },
                                  '&.Mui-selected:hover': {
                                    color: 'var(--palette-secondary-dark)',
                                  },
                                  borderRadius: '0.6rem',
                                  color: 'var(--palette-sidebar-menu-color)',
                                  p: '0.5rem 0.7rem',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <Box display="flex" alignItems="center">
                                  {items.icon}
                                  <Typography variant="body1" className={styles.menuText}>
                                    {items.text}
                                  </Typography>
                                </Box>
                                {items.expand ? (
                                  <SidebarClosure className={styles.sidebarExpand} />
                                ) : (
                                  <SidebarExpand className={styles.sidebarExpand} />
                                )}
                              </ListItemButton>
                              <Collapse in={items.expand} timeout="auto" unmountOnExit sx={{ position: 'relative' }}>
                                <List component="ul" disablePadding className={styles.list}>
                                  {items.menuProps?.map((item) => {
                                    return (
                                      <ListItemButton
                                        className={styles.expandable}
                                        id={item.label}
                                        selected={(location.pathname.split('/')[2] || '') === item.label}
                                        component={Link}
                                        to={item.href || ''}
                                        sx={{
                                          '&.Mui-selected': {
                                            backgroundColor: 'var(--palette-menu-background-color)',
                                            color: 'var(--palette-secondary-dark)',
                                          },
                                          '&.Mui-selected:hover': {
                                            color: 'var(--palette-secondary-dark)',
                                          },
                                          borderRadius: '0.6rem',
                                          p: '0.4rem 0.7rem',
                                          color: 'var(--palette-sidebar-menu-color)',
                                        }}
                                      >
                                        <Typography variant="body1" sx={{ fontFamily: 'mabry-bold' }}>
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
                              id={items.label}
                              key={items.href}
                              selected={(location.pathname.split('/')[1] || '') === items.label}
                              component={Link}
                              to={items.href}
                              className={
                                (location.pathname.split('/')[1] || '') === items.label ? styles.listButton : ''
                              }
                              sx={{
                                '&.Mui-selected': {
                                  backgroundColor: 'var(--palette-menu-background-color)',
                                  color: 'var(--palette-secondary-dark)',
                                },
                                '&.Mui-selected:hover': {
                                  color: 'var(--palette-secondary-dark)',
                                },
                                borderRadius: '0.6rem',
                                color: 'var(--palette-sidebar-menu-color)',
                                p: '0.5rem 0.7rem',
                              }}
                            >
                              {items.icon}
                              <Typography variant="body1" className={styles.menuText}>
                                {items.text}
                              </Typography>
                            </ListItemButton>
                          ),
                        )}
                      </List>
                    </Box>
                    <Box>
                      <DarkMode className={styles.darkMode} />
                      <Card className={styles.sidebarUser}>
                        <IconButton
                          onClick={(event: any) => {
                            setAnchorElement(event.currentTarget);
                          }}
                          id="unfold-more"
                          className={styles.avatarButton}
                          sx={{ p: '0.3rem' }}
                        >
                          <Box className={styles.avatarWrapper} />
                          <Avatar className={styles.avatar} src={user?.avatar} />
                        </IconButton>
                        <Box
                          sx={{
                            pl: '0.5rem',
                          }}
                        >
                          <Typography variant="body1" id="menu-name" component="div" fontFamily="mabry-bold">
                            {user?.name || '-'}
                          </Typography>
                          <Tooltip title={user?.email || '-'} placement="top">
                            <Typography
                              id="menu-email"
                              component="div"
                              variant="caption"
                              sx={{
                                width: '7.2rem',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {user?.email || '-'}
                            </Typography>
                          </Tooltip>
                        </Box>
                        <Menu
                          anchorEl={anchorElement}
                          id="account-menu"
                          open={openProfile}
                          onClose={() => {
                            setAnchorElement(null);
                          }}
                          anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                          }}
                          transformOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                          }}
                          sx={{
                            '& .MuiMenu-paper': {
                              boxShadow: 'var(--custom-shadows-dropdown)',
                              borderRadius: 'var(--menu-border-radius);',
                            },
                            '& .MuiMenu-list': {
                              width: '14rem',
                              p: '0',
                            },
                          }}
                        >
                          <Box className={styles.profileMenu}>
                            <Box className={styles.avatarContainer}>
                              <Avatar className={styles.menuAvatar} src={user?.avatar} />
                              <Typography variant="body1" className={styles.menuUserName}>
                                {user?.name}
                              </Typography>
                              <Tooltip title={user?.email || '-'} placement="top">
                                <Typography variant="body1" className={styles.menuUserEmail}>
                                  {user?.email || '-'}
                                </Typography>
                              </Tooltip>
                            </Box>
                            <Divider
                              sx={{
                                borderStyle: 'dashed',
                                borderColor: 'var(--palette-palette-divider)',
                                borderWidth: '0px 0px thin',
                                m: '0.2rem 0',
                              }}
                            />
                            <MenuItem
                              id="profile-menu"
                              onClick={() => {
                                setAnchorElement(null);
                                navigate('/profile');
                              }}
                              sx={{ borderRadius: 'var(--menu-border-radius)' }}
                            >
                              <ListItemIcon>
                                <PersonAdd fontSize="small" className={styles.menuItemIcon} />
                              </ListItemIcon>
                              <Typography variant="body2" className={styles.avatarMenu}>
                                Profile
                              </Typography>
                            </MenuItem>
                            <MenuItem
                              sx={{ borderRadius: 'var(--menu-border-radius)' }}
                              id="logout-menu"
                              onClick={handleLogout}
                            >
                              <ListItemIcon>
                                <Logout fontSize="small" className={styles.menuItemIcon} />
                              </ListItemIcon>
                              <Typography variant="body2" className={styles.avatarMenu}>
                                Logout
                              </Typography>
                            </MenuItem>
                          </Box>
                        </Menu>
                      </Card>
                    </Box>
                  </Grid>
                )}
              </Box>
              <Box
                id="main"
                className={styles.layout}
                sx={{ paddingLeft: compactLayout ? '4rem !important' : '13.5rem !important' }}
              >
                <main onMouseEnter={handleMouseLeave} className={styles.main}>
                  <Outlet />
                </main>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </MyContext.Provider>
  );
}
