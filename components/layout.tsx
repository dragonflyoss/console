import styles from './layout.module.scss';
import { Avatar, Backdrop, Divider, Grid, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import * as React from 'react';
import { styled } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import { ListItemButton, ListItemIcon } from '@mui/material';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Logout, PersonAdd } from '@mui/icons-material';
import { decode } from 'jsonwebtoken';
import Cookies from 'js-cookie';
import { GetuserRoles, GetusersInfo, signOut } from 'lib/api';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import Link from 'next/link';

type LayoutProps = {
  children: React.ReactNode;
};
const APP_BAR_DESKTOP = '2rem';

const Main = styled('div')(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  minHeight: '100%',
  height: '100vh',
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.up('lg')]: {
    paddingTop: APP_BAR_DESKTOP,
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
}));

export default function Layout({ children }: LayoutProps) {
  const [role, setRole] = useState('guest');
  const [pageLoding, setPageLoding] = useState(false);
  const [userObject, setUserObject] = useState({ name: '', email: '' });
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    const userInfo: any = decode(Cookies.get('jwt') || 'jwt');
    const userID: string = userInfo?.id;

    if (userID) {
      GetusersInfo(userID).then(async (response) => {
        setUserObject(await response.json());
      });
      GetuserRoles(userID).then(async (response) => {
        const res = await response.json();
        setRole(res[0] || 'guest');
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

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handProfile = () => {
    setAnchorEl(null);
    router.push(`/profile`);
  };

  const handleLogout = () => {
    signOut();
    setPageLoding(true);
    router.push('/signin');
  };
  const pathname = router.pathname.split('/');

  const menuItems = [
    {
      label: 'clusters',
      href: '/clusters',
      text: 'Cluster',
      icon: (
        <Box component="img" sx={{ width: '1.6rem', height: '1.6rem' }} src="/favicon/clusterIcon/clusterIcon.svg" />
      ),
    },
    {
      label: 'users',
      href: '/users',
      text: 'User',
      icon: <Box component="img" sx={{ width: '1.6rem', height: '1.6rem' }} src="/favicon/clusterIcon/userIcon.svg" />,
    },
  ];
  const menuList =
    role === 'root'
      ? menuItems
      : menuItems.filter((item) => {
          return item.label !== 'users';
        });

  const mainListItems = (
    <List component="nav" aria-label="main mailbox folders" sx={{ width: '100%' }}>
      {menuList.map((item) => {
        return (
          <ListItemButton
            key={item.href}
            selected={pathname[1] === item.label}
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
            <Typography variant="subtitle1" sx={{ fontFamily: 'MabryPro-Bold', ml: '0.4rem' }}>
              {item.text}
            </Typography>
          </ListItemButton>
        );
      })}
    </List>
  );

  return (
    <section>
      <Backdrop
        open={pageLoding}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: 'rgba(0,0,0,0.3)' }}
      >
        <Box component="img" sx={{ width: '4rem', height: '4rem' }} src="/favicon/clusterIcon/pageLoading.svg" />
      </Backdrop>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <CssBaseline />
        <Box className={styles.page}>
          <Box
            sx={{
              height: '100vh',
              width: '14rem',
              backgroundColor: 'rgba(254,252,251,86%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Grid sx={{ ml: '1rem', mr: '1rem' }}>
              <Grid sx={{ display: 'flex', alignItems: 'center', ml: '0.4rem', mt: '2rem' }}>
                <picture>
                  <div>
                    <Box
                      component="img"
                      sx={{
                        width: '1.8rem',
                        height: '1.8rem',
                        mr: '0.8rem',
                      }}
                      src="/images/login/logoIcon.svg"
                    />
                  </div>
                </picture>
                <Typography variant="h6" gutterBottom sx={{ fontFamily: 'MabryPro-Bold' }}>
                  Dragonfly
                </Typography>
              </Grid>
              {mainListItems}
            </Grid>
            <Grid sx={{ mb: '4rem' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    sx={{ width: '2.6rem', height: '2.6rem', ml: '0.6rem', mr: '0.6rem', background: '#1C293A' }}
                  ></Avatar>
                  <Box sx={{ width: '7rem' }}>
                    <Typography fontFamily="MabryPro-Bold">{userObject?.name || '-'}</Typography>
                    <Tooltip title={userObject?.email || '-'} placement="top">
                      <Typography
                        component="div"
                        variant="caption"
                        sx={{ width: '7rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                      >
                        {userObject?.email || '-'}
                      </Typography>
                    </Tooltip>
                  </Box>
                </Box>
                <IconButton
                  onClick={handleClick}
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
                onClose={handleClose}
                sx={{ position: 'absolute', top: '-5.5rem', left: '-4.8rem' }}
              >
                <MenuItem onClick={handProfile}>
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
        </Box>
        <Divider orientation="vertical" flexItem />
        <Main>{children}</Main>
      </Box>
    </section>
  );
}
