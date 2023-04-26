import styles from './layout.module.css';
import { Avatar, Breadcrumbs, Grid, Typography } from '@mui/material';
import * as React from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import Header from './header';
import { useState } from 'react';
import { useRouter } from 'next/router';
const mdTheme = createTheme();
type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const { asPath } = useRouter();
  const str = asPath.split('/');

  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const handleListItemClick = (_event: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
    setSelectedIndex(index);
  };
  const mainListItems = (
    <>
      <List component="nav" aria-label="main mailbox folders" sx={{ width: '100%' }}>
        <Link href="/cluster" className={styles.link}>
          <ListItemButton
            selected={selectedIndex === 0}
            onClick={(event) => handleListItemClick(event, 0)}
            sx={{ flexDirection: 'column' }}
          >
            <ListItemIcon></ListItemIcon>
            <ListItemText primary="Cluster" />
          </ListItemButton>
        </Link>
        <Divider />
        <Link href="/security" className={styles.link}>
          <ListItemButton
            selected={selectedIndex === 1}
            onClick={(event) => handleListItemClick(event, 1)}
            sx={{ flexDirection: 'column' }}
          >
            <ListItemIcon></ListItemIcon>
            <ListItemText primary="Security" />
          </ListItemButton>
        </Link>
        <Divider />
        <Link href="/job" className={styles.link}>
          <ListItemButton
            selected={selectedIndex === 2}
            onClick={(event) => handleListItemClick(event, 2)}
            sx={{ flexDirection: 'column' }}
          >
            <ListItemIcon></ListItemIcon>
            <ListItemText primary="Job" />
          </ListItemButton>
        </Link>
        <Divider />
        <Link href="/user" className={styles.link}>
          <ListItemButton
            selected={selectedIndex === 3}
            onClick={(event) => handleListItemClick(event, 3)}
            sx={{ flexDirection: 'column' }}
          >
            <ListItemIcon></ListItemIcon>
            <ListItemText primary="User" />
          </ListItemButton>
        </Link>
      </List>
    </>
  );

  const drawerWidth = '15rem';

  // const menuList = (
  //   <>
  //     <MenuList>
  //       <Link href="/cluster" className={styles.link}>
  //         <MenuItem>
  //           <ListItemIcon></ListItemIcon>
  //           <ListItemText>cluster</ListItemText>
  //         </MenuItem>
  //       </Link>
  //       <Link href="/job" className={styles.link}>
  //         <MenuItem>
  //           <ListItemIcon></ListItemIcon>
  //           <ListItemText>job</ListItemText>
  //         </MenuItem>
  //       </Link>
  //       <Link href="/user" className={styles.link}>
  //         <MenuItem>
  //           <ListItemIcon></ListItemIcon>
  //           <ListItemText>cluster</ListItemText>
  //         </MenuItem>
  //       </Link>{' '}
  //       <Link href="/cluster" className={styles.link}>
  //         <MenuItem>
  //           <ListItemIcon></ListItemIcon>
  //           <ListItemText>cluster</ListItemText>
  //         </MenuItem>
  //       </Link>
  //     </MenuList>
  //   </>
  // );
  const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
    },
  }));
  function handleClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    event.preventDefault();
    console.info('You clicked a breadcrumb.');
  }

  return (
    <div className={styles.page}>
      <ThemeProvider theme={mdTheme}>
        <Header />
        <Box sx={{ display: 'flex' }}>
          <CssBaseline />

          <Drawer
            variant="permanent"
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
            }}
          >
            <Divider />
            <Grid
              sx={{
                height: '8rem',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                flexDirection: 'column',
              }}
            >
              <Avatar src="" sx={{ mt: 2, width: '3rem', height: '3rem' }} />
              <Typography variant="subtitle2" gutterBottom>
                root
              </Typography>
            </Grid>
            <Divider />
            <List sx={{ width: '100%', display: 'flex' }} component="nav">
              {mainListItems}
            </List>
          </Drawer>
          <Box
            component="main"
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
              flexGrow: 1,
              height: '100vh',
              overflow: 'hidden',
              padding: 0,
            }}
          >
            <Container maxWidth="lg" >
              <Breadcrumbs aria-label="breadcrumb" sx={{m:1}}>
                <Link underline="hover" color="inherit" href={`/${str[1]}`}>
                  {str[1]}
                </Link>
                {str[2] ? (
                  <Link underline="hover" color="inherit" href={`/${str[1]}/${str[2]}`}>
                    {str[2]}
                  </Link>
                ) : null}
                {str[3] ? (
                  <Typography key="3" color="text.primary">
                    {str[3]}
                  </Typography>
                ) : null}
              </Breadcrumbs>
              <Grid container>
                <Grid item xs={12}>
                  <Paper
                    sx={{
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      height: '90vh',
                    }}
                  >
                  {children}
                  </Paper>
                </Grid>

              </Grid>
            </Container>
          </Box>
        </Box>
      </ThemeProvider>
    </div>
  );
}
