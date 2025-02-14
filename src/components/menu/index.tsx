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
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import { ListItemButton, ListItemIcon } from '@mui/material';
import { createContext, useContext, useEffect, useState } from 'react';
import { ExpandLess, ExpandMore, Logout, PersonAdd } from '@mui/icons-material';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import { getUserRoles, getUser, signOut, getUserResponse } from '../../lib/api';
import { getJwtPayload, setPageTitle } from '../../lib/utils';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { ROLE_ROOT, ROLE_GUEST } from '../../lib/constants';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { ColorModeContext } from '../../App';
import { ReactComponent as Cluster } from '../../assets/images/menu/cluster.svg';
import { ReactComponent as SelectedCluster } from '../../assets/images/menu/selected-cluster.svg';
import { ReactComponent as Developer } from '../../assets/images/menu/developer.svg';
import { ReactComponent as SelectedDeveloper } from '../../assets/images/menu/selected-developer.svg';
import { ReactComponent as Job } from '../../assets/images/menu/job.svg';
import { ReactComponent as SelectedJob } from '../../assets/images/menu/selected-job.svg';
import { ReactComponent as User } from '../../assets/images/menu/user.svg';
import { ReactComponent as SelectedUser } from '../../assets/images/menu/selected-user.svg';
import { ReactComponent as Logo } from '../../assets/images/header/logo.svg';
import { ReactComponent as Github } from '../../assets/images/header/github.svg';
import { ReactComponent as Expand } from '../../assets/images/menu/expand.svg';
import { ReactComponent as Closure } from '../../assets/images/menu/closure.svg';

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
    backgroundColor: 'var(--description-color)',
  },
}));

// const Main = styled('div')(({ theme }) => ({
//   flexGrow: 1,
//   // overflow: 'auto',
//   paddingBottom: theme.spacing(8),
//   [theme.breakpoints.up('lg')]: {
//     paddingTop: '1.5rem',

//     paddingRight: theme.spacing(4),
//   },
//   fontFamily: 'mabry-light,sans-serif',
// }));

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
  const [anchorEl, setAnchorEl] = useState(null);
  const [expandedMenu, setExpandedMenu] = useState<any | null>(null);
  const [compactLayout, setCompactLayout] = useState(() => {
    const storedValue = localStorage.getItem('compactLayout');
    return storedValue === 'true';
  });
  const openProfile = Boolean(anchorElement);
  const location = useLocation();
  const navigate = useNavigate();

  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  useEffect(() => {
    (async function () {
      try {
        setPageLoding(true);
        setProgress(0);

        // const instance = localStorage.getItem('compactLayout');

        // if (instance) {
        //   setCompactLayout(instance === 'true');
        // }
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
    setAnchorEl(null);
    setExpandedMenu(null);
  };

  // useEffect(() => {
  //   localStorage.setItem('compactLayout', compactLayout ? 'true' : 'false');
  // }, [compactLayout]);

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
          <Box className={styles.container}>
            <CssBaseline />
            <Box className={styles.navigationBarContainer}>
              {compactLayout ? (
                <List component="nav" aria-label="main mailbox folders">
                  <RouterLink href="/clusters" color="inherit" underline="none" className={styles.shrinkTitle}>
                    <Logo className={styles.logo} />
                  </RouterLink>
                  {menu.map((items, index) => {
                    return items?.menuProps ? (
                      <>
                        <ListItemButton
                          className={styles.menu}
                          key={index}
                          selected={(location.pathname.split('/')[1] || '') === items.label}
                          onClick={(event: any) => {
                            setAnchorEl(event.currentTarget);
                            setExpandedMenu(items.label);
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
                            height: '4rem',
                            width: '5.4rem',
                            borderRadius: '0.2rem',
                            m: '0.4rem',
                            color: 'var(--palette-text-secondary)',
                            justifyContent: 'center',
                            position: 'relative',
                          }}
                        >
                          <ChevronRightOutlinedIcon className={styles.shrinkChevronRightOutlinedIcon} />
                          <Box className={styles.shrinkMenuContainer}>
                            {items.icon}
                            <Typography variant="caption" display="block" className={styles.shrinkMenuText}>
                              {items.text}
                            </Typography>
                          </Box>
                        </ListItemButton>
                        {items?.menuProps && expandedMenu === items.label && (
                          <Menu
                            anchorEl={anchorEl}
                            id={items.label}
                            open={Boolean(anchorEl)}
                            onClose={handleMouseLeave}
                            anchorOrigin={{
                              vertical: 'bottom',
                              horizontal: 'right',
                            }}
                            sx={{
                              '& .MuiMenu-paper': {
                                boxShadow: 'var(--palette-menu-shadow);',
                                borderRadius: '0.6rem',
                              },
                              '& .MuiMenu-list': {
                                width: '8rem',
                                p: '0',
                              },
                            }}
                          >
                            <Box className={styles.profileMenu}>
                              {items.menuProps.map((subItem) => (
                                <MenuItem
                                  sx={{ borderRadius: 'var(--menu-border-radius);' }}
                                  key={subItem.label}
                                  onClick={() => {
                                    setAnchorEl(null);
                                    setExpandedMenu(null);
                                  }}
                                  component={Link}
                                  to={subItem.href}
                                >
                                  {subItem.text}
                                </MenuItem>
                              ))}
                            </Box>
                          </Menu>
                        )}
                      </>
                    ) : (
                      <ListItemButton
                        className={styles.menu}
                        key={index}
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
                          height: '4rem',
                          width: '5.4rem',
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
              ) : (
                <Grid sx={{ pl: '1rem', pr: '1rem' }}>
                  <List component="nav" aria-label="main mailbox folders">
                    <RouterLink href="/clusters" color="inherit" underline="none" className={styles.title}>
                      <Logo className={styles.logo} />
                      <Typography variant="h6" sx={{ fontFamily: 'mabry-bold', ml: '0.8rem' }}>
                        Dragonfly
                      </Typography>
                    </RouterLink>
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
                              color: 'var(--palette-text-secondary)',
                            }}
                          >
                            {items.icon}
                            <Typography variant="subtitle1" className={styles.menuText}>
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
                                        backgroundColor: 'var(--menu-selected-background-color)',
                                        color: 'var(--description-color)',
                                      },
                                      '&.Mui-selected:hover': {
                                        backgroundColor: 'var(--menu-selected-background-color)',
                                        color: 'var(--description-color)',
                                      },
                                      height: '2.4rem',
                                      borderRadius: '0.2rem',
                                      pl: '1rem',
                                      mt: '0.8rem',
                                      color: 'var(--palette-text-secondary)',
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
                            color: 'var(--palette-text-secondary)',
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
              <Box className={styles.compactLayout}>
                <IconButton
                  id="expand"
                  // className={styles.compactLayout}
                  sx={{
                    p: 0,
                  }}
                  onClick={() => {
                    setCompactLayout((e: any) => !e);
                  }}
                >
                  {compactLayout ? <Expand className={styles.expandIcon} /> : <Closure className={styles.expandIcon} />}
                </IconButton>
              </Box>
            </Box>
            <Box
              component="main"
              className={styles.main}
              sx={{ paddingLeft: compactLayout ? '7rem !important' : '16rem !important' }}
            >
              <header className={styles.header}>
                <Box sx={{ display: 'flex' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton onClick={colorMode.toggleColorMode} color="inherit">
                        {theme.palette.mode === 'dark' ? (
                          <Brightness7Icon sx={{ width: '1.8rem', height: '1.8rem' }} />
                        ) : (
                          <Brightness4Icon sx={{ width: '1.8rem', height: '1.8rem' }} />
                        )}
                      </IconButton>
                      <a href="https://github.com/dragonflyoss/dragonfly" rel="noopener" target="_blank">
                        <IconButton>
                          <Github className={styles.github} />
                        </IconButton>
                      </a>
                      <Avatar
                        className={styles.avatar}
                        src={user?.avatar}
                        onClick={(event: any) => {
                          setAnchorElement(event.currentTarget);
                        }}
                      />
                    </Box>
                  </Box>
                  <Menu
                    anchorEl={anchorElement}
                    id="account-menu"
                    open={openProfile}
                    onClose={() => {
                      setAnchorElement(null);
                    }}
                    // sx={{
                    //   position: 'absolute',
                    //   top: '0',
                    //   right: '-2rem',
                    //   '& .MuiMenu-paper': {
                    //     boxShadow: 'var(--palette-menu-shadow);',
                    //   },
                    //   '& .MuiMenu-list': {
                    //     p: 0,
                    //     minWidth: '8rem',
                    //   },

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
                          borderColor: 'var(--palette-divider)',
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
                        <Typography variant="body2" className={styles.menuText}>
                          Profile
                        </Typography>
                      </MenuItem>
                      <MenuItem id="logout-menu" onClick={handleLogout}>
                        <ListItemIcon>
                          <Logout fontSize="small" className={styles.menuItemIcon} />
                        </ListItemIcon>
                        <Typography variant="body2" className={styles.menuText}>
                          Logout
                        </Typography>
                      </MenuItem>
                    </Box>
                  </Menu>
                </Box>
              </header>
              <Box sx={{ padding: '1rem 2rem' }}>
                <Outlet />
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </MyContext.Provider>
  );
}
