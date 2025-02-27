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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import { ListItemButton, ListItemIcon } from '@mui/material';
import { createContext, useEffect, useState } from 'react';
import { ExpandMore, Logout, PersonAdd } from '@mui/icons-material';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import { getUserRoles, getUser, signOut, getUserResponse } from '../../lib/api';
import { getJwtPayload, setPageTitle } from '../../lib/utils';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { ROLE_ROOT, ROLE_GUEST } from '../../lib/constants';
import { ReactComponent as Cluster } from '../../assets/images/menu/cluster.svg';
import { ReactComponent as SelectedCluster } from '../../assets/images/menu/selected-cluster.svg';
import { ReactComponent as Developer } from '../../assets/images/menu/developer.svg';
import { ReactComponent as SelectedDeveloper } from '../../assets/images/menu/selected-developer.svg';
import { ReactComponent as Job } from '../../assets/images/menu/job.svg';
import { ReactComponent as SelectedJob } from '../../assets/images/menu/selected-job.svg';
import { ReactComponent as User } from '../../assets/images/menu/user.svg';
import { ReactComponent as SelectedUser } from '../../assets/images/menu/selected-user.svg';
import { ReactComponent as Logo } from '../../assets/images/header/logo.svg';
import { ReactComponent as Expand } from '../../assets/images/menu/expand.svg';
import { ReactComponent as Closure } from '../../assets/images/menu/closure.svg';
import HeaderLayout from '../dark-layout';

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
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: 'rgba(0, 167, 111, 0.4)',
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 3,
    backgroundColor: 'var(--palette--description-color)',
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
      selectedIcon: <SelectedCluster className={styles.selectedMenuIcon} />,
    },
    {
      label: 'developer',
      href: '/tokens',
      text: 'Developer',
      icon: <Developer className={styles.menuIcon} />,
      selectedIcon: <SelectedDeveloper className={styles.selectedMenuIcon} />,
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
      selectedIcon: <SelectedJob className={styles.selectedMenuIcon} />,
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
      selectedIcon: <SelectedUser className={styles.selectedMenuIcon} />,
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
            <header className={styles.header}>
              <RouterLink id="dragonfly" href="/" color="inherit" underline="none" className={styles.title}>
                <Logo className={styles.logo} />
                <Typography variant="h6" sx={{ fontFamily: 'mabry-bold', ml: '0.8rem' }}>
                  Dragonfly
                </Typography>
              </RouterLink>
              <Box sx={{ display: 'flex' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <HeaderLayout className={styles.headerContent} />
                    <IconButton
                      id="unfold-more"
                      sx={{
                        position: 'relative',
                        transition: 'transform 0.6s ease',
                        '&:hover': {
                          transform: 'scale(1.07)',
                        },
                        ml: '0.3rem',
                        p: '0.3rem',
                      }}
                    >
                      <Box
                        sx={{
                          background: 'conic-gradient( #73bafb, #ffd666, #73bafb)',
                          width: '2rem',
                          height: '2rem',
                          animation: 'rotate 4s linear infinite',
                          '@keyframes rotate': {
                            '0%': {
                              transform: 'rotate(0deg)',
                            },
                            '100%': {
                              transform: 'rotate(360deg)',
                            },
                          },
                          position: 'absolute',
                          borderRadius: '50%',
                        }}
                      />
                      <Avatar
                        className={styles.avatar}
                        src={user?.avatar}
                        onClick={(event: any) => {
                          setAnchorElement(event.currentTarget);
                        }}
                        sx={{
                          '& .MuiAvatar-fallback': {
                            color: '#1c293a',
                          },
                        }}
                      />
                    </IconButton>
                  </Box>
                </Box>
                <Menu
                  anchorEl={anchorElement}
                  id="account-menu"
                  open={openProfile}
                  onClose={() => {
                    setAnchorElement(null);
                  }}
                  sx={{
                    '& .MuiMenu-paper': {
                      boxShadow: 'var(--palette-menu-shadow);',
                      borderRadius: 'var(--menu-border-radius);',
                    },
                    '& .MuiMenu-list': {
                      minWidth: '8rem',
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
                      <Typography variant="body1" className={styles.menuUserEmail}>
                        {user?.email || '-'}
                      </Typography>
                    </Box>
                    <Divider
                      sx={{
                        borderStyle: 'dashed',
                        borderColor: 'var(--palette--palette-divider)',
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
                    >
                      <ListItemIcon>
                        <PersonAdd fontSize="small" className={styles.menuItemIcon} />
                      </ListItemIcon>
                      <Typography variant="body2" className={styles.avatarMenu}>
                        Profile
                      </Typography>
                    </MenuItem>
                    <MenuItem id="logout-menu" onClick={handleLogout}>
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
            </header>
            <Box className={styles.container}>
              <Box className={styles.navigationBarContainer}>
                <Box className={styles.compactLayout}>
                  <IconButton
                    sx={{
                      backgroundColor: 'var(--palette-background-rotation)',
                      border: '1px solid  rgba(var(--palette-dark-500Channel)/0.3)',
                      width: '0.8rem',
                      height: '2rem',
                      p: '0',
                      ':hover': {
                        backgroundColor: 'var(--palette-background--hover-rotation)',
                      },
                      borderRadius: '2rem',
                    }}
                    onClick={() => {
                      setCompactLayout((e: any) => !e);
                    }}
                  >
                    {compactLayout ? (
                      <Expand id="expand" className={styles.expandIcon} />
                    ) : (
                      <Closure id="closure" className={styles.expandIcon} />
                    )}
                  </IconButton>
                </Box>
                {compactLayout ? (
                  <Grid sx={{ width: '6rem' }}>
                    <List component="nav" aria-label="main mailbox folders">
                      {menu.map((items, index) => {
                        return items?.menuProps ? (
                          <>
                            <ListItemButton
                              id={items.label}
                              key={index}
                              selected={(location.pathname.split('/')[1] || '') === items.label}
                              onMouseEnter={(event: any) => {
                                setExpandedMenu(items.label);
                              }}
                              sx={{
                                '&.Mui-selected': {
                                  backgroundColor: 'var(--palette--menu-background-color)',
                                  color: 'var(--palette--description-color)',
                                },
                                '&.Mui-selected:hover': {
                                  backgroundColor: 'var(--palette--hover-menu-background-color)',
                                  color: 'var(--palette--description-color)',
                                },
                                height: '4rem',
                                borderRadius: '0.2rem',
                                m: '0.4rem',
                                color: 'var(--palette-text-secondary)',
                                justifyContent: 'center',
                                position: 'relative !important',
                              }}
                            >
                              <ChevronRightOutlinedIcon className={styles.shrinkChevronRightOutlinedIcon} />
                              <Box className={styles.shrinkMenuContainer}>
                                {items.icon}
                                <Typography variant="caption" display="block" className={styles.shrinkMenuText}>
                                  {items.text}
                                </Typography>
                              </Box>
                              {items?.menuProps && expandedMenu === items.label && (
                                <Box
                                  id={items.label}
                                  key={items.label}
                                  onMouseLeave={handleMouseLeave}
                                  sx={{
                                    position: 'absolute ',
                                    left: '6rem',
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
                          </>
                        ) : (
                          <ListItemButton
                            id={items.label}
                            key={index}
                            selected={(location.pathname.split('/')[1] || '') === items.label}
                            component={Link}
                            to={items.href}
                            onMouseEnter={handleMouseLeave}
                            sx={{
                              '&.Mui-selected': {
                                backgroundColor: 'var(--palette--menu-background-color)',
                                color: 'var(--palette--description-color)',
                              },
                              '&.Mui-selected:hover': {
                                backgroundColor: 'var(--palette--hover-menu-background-color)',
                                color: 'var(--palette--description-color)',
                              },
                              height: '4rem',

                              borderRadius: '0.2rem',
                              m: '0.4rem',
                              color: 'var(--palette-text-secondary)',
                              justifyContent: 'center',
                            }}
                          >
                            <Box className={styles.shrinkMenuContainer}>
                              {items.icon}
                              <Typography variant="caption" display="block" className={styles.shrinkMenuText}>
                                {items.text}
                              </Typography>
                            </Box>
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Grid>
                ) : (
                  <Grid sx={{ width: '15rem', p: '0 1rem' }}>
                    <List component="nav" aria-label="main mailbox folders">
                      {menu.map((items) =>
                        items?.menuProps ? (
                          <Box key={items.href}>
                            <ListItemButton
                              id={items.label}
                              selected={(location.pathname.split('/')[1] || '') === items.label}
                              onClick={() => {
                                items?.setExpand(!items?.expand);
                              }}
                              sx={{
                                '&.Mui-selected': {
                                  backgroundColor: 'var(--palette--menu-background-color)',
                                  color: 'var(--palette--description-color)',
                                },
                                '&.Mui-selected:hover': {
                                  backgroundColor: 'var(--palette--hover-menu-background-color)',
                                  color: 'var(--palette--description-color)',
                                },
                                height: '2.6rem',
                                borderRadius: '0.2rem',
                                color: 'var(--palette-text-secondary)',
                                m: '0.8rem 0',
                                justifyContent: 'space-between',
                              }}
                            >
                              <Box display="flex" alignItems="center">
                                {items.icon}
                                <Typography variant="subtitle1" className={styles.menuText}>
                                  {items.text}
                                </Typography>
                              </Box>
                              {items.expand ? <ExpandMore /> : <ChevronRightOutlinedIcon />}
                            </ListItemButton>
                            <Collapse in={items.expand} timeout="auto" unmountOnExit>
                              <List component="div" disablePadding>
                                {items.menuProps?.map((item) => {
                                  return (
                                    <ListItemButton
                                      id={item.label}
                                      selected={(location.pathname.split('/')[2] || '') === item.label}
                                      component={Link}
                                      to={item.href || ''}
                                      sx={{
                                        '&.Mui-selected': {
                                          backgroundColor: 'var(--palette-color-neutral-200)',
                                          color: 'var(--palette--description-color)',
                                        },
                                        '&.Mui-selected:hover': {
                                          backgroundColor: 'var(--palette-color-neutral-200)',
                                          color: 'var(--palette--description-color)',
                                        },
                                        height: '2.4rem',
                                        borderRadius: '0.2rem',
                                        mb: '0.5rem',
                                        color: 'var(--palette-text-secondary)',
                                      }}
                                    >
                                      <Typography variant="body1" sx={{ fontFamily: 'mabry-bold', ml: '2.2rem' }}>
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
                            sx={{
                              '&.Mui-selected': {
                                backgroundColor: 'var(--palette--menu-background-color)',
                                color: 'var(--palette--description-color)',
                              },
                              '&.Mui-selected:hover': {
                                backgroundColor: 'var(--palette--hover-menu-background-color)',
                                color: 'var(--palette--description-color)',
                              },
                              height: '2.6rem',
                              borderRadius: '0.2rem',
                              color: 'var(--palette-text-secondary)',
                              m: '0.8rem 0',
                            }}
                          >
                            {items.icon}
                            <Typography variant="subtitle1" className={styles.menuText}>
                              {items.text}
                            </Typography>
                          </ListItemButton>
                        ),
                      )}
                    </List>
                  </Grid>
                )}
              </Box>
              <Box
                className={styles.layout}
                sx={{ paddingLeft: compactLayout ? '6rem !important' : '15rem !important' }}
              >
                <main className={styles.main}>
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
