import {
  Breadcrumbs,
  createTheme,
  styled,
  ThemeProvider,
  Typography,
  Link as RouterLink,
  Snackbar,
  Alert,
} from '@mui/material';
import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import * as React from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab, { TabProps } from '@mui/material/Tab';
import { createContext, useEffect, useState } from 'react';
import { getCluster, getClusterResponse } from '../../lib/api';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e8f79',
    },
  },
  typography: {
    fontFamily: 'mabry-light,sans-serif',
  },
});

interface MyContextType {
  cluster: getClusterResponse;
  isLoading: boolean;
}

export const MyContext = createContext<MyContextType>({
  cluster: {
    id: 0,
    name: '',
    bio: '',
    scopes: {
      idc: '',
      location: '',
      cidrs: [],
      hostnames: [],
    },
    scheduler_cluster_id: 0,
    seed_peer_cluster_id: 0,
    scheduler_cluster_config: {
      candidate_parent_limit: 0,
      filter_parent_limit: 0,
      job_rate_limit: 0,
    },
    seed_peer_cluster_config: {
      load_limit: 0,
    },
    peer_cluster_config: {
      load_limit: 0,
    },
    created_at: '',
    updated_at: '',
    is_default: false,
  },
  isLoading: false,
});

type StyledTabProps = Omit<TabProps, 'component'> & {
  component?: React.ElementType;
  to: any;
};

export default function NavTabs() {
  const [value, setValue] = useState(0);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [errorMessage, setErrorMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cluster, setCluster] = useState<getClusterResponse>({
    id: 0,
    name: '',
    bio: '',
    scopes: {
      idc: '',
      location: '',
      cidrs: [],
      hostnames: [],
    },
    scheduler_cluster_id: 0,
    seed_peer_cluster_id: 0,
    scheduler_cluster_config: {
      candidate_parent_limit: 0,
      filter_parent_limit: 0,
      job_rate_limit: 0,
    },
    seed_peer_cluster_config: {
      load_limit: 0,
    },
    peer_cluster_config: {
      load_limit: 0,
    },
    created_at: '',
    updated_at: '',
    is_default: false,
  });
  const location = useLocation();
  const params = useParams();

  useEffect(() => {
    (async function () {
      try {
        setIsLoading(true);
        if (typeof params.id === 'string') {
          const cluster = await getCluster(params.id);

          setCluster(cluster);
          setIsLoading(false);
        }
      } catch (error) {
        if (error instanceof Error) {
          setIsLoading(false);
          setErrorMessage(true);
          setErrorMessageText(error.message);
        }
      }
    })();
  }, [params.id]);

  useEffect(() => {
    if (location.pathname.split('/')[3] === 'schedulers') {
      setValue(1);
    } else if (location.pathname.split('/')[3] === 'seed-peers') {
      setValue(2);
    } else if (location.pathname.split('/')[3] === 'peers') {
      setValue(3);
    } else {
      setValue(0);
    }
  }, [location.pathname]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const AntTab = styled((props: StyledTabProps) => <Tab disableRipple iconPosition="start" {...props} />)(
    ({ theme }) => ({
      textTransform: 'none',
      minWidth: 0,
      [theme.breakpoints.up('sm')]: {
        minWidth: 0,
      },
      fontWeight: theme.typography.fontWeightRegular,
      marginRight: theme.spacing(1),
      color: 'rgba(0, 0, 0, 0.85)',
      fontSize: '0.9rem',
      '&:hover': {
        color: 'primary',
        opacity: 1,
      },
      '&.Mui-selected': {
        color: '#000',
        fontFamily: 'mabry-bold',
      },
    }),
  );

  const AntTabs = styled(Tabs)({
    borderBottom: '1px solid #e8e8e8',
    '& .MuiTabs-indicator': {
      backgroundColor: 'primary',
    },
  });

  const tabList = [
    {
      id: 'tab-cluster',
      icon: <Box component="img" sx={{ width: '1.3rem' }} src="/icons/cluster/tab-cluster.svg" />,
      label: 'Cluster',
      component: Link,
      to: `/clusters/${params.id}`,
    },
    {
      id: 'tab-cluster',
      icon: <Box component="img" sx={{ width: '1.3rem' }} src="/icons/cluster/scheduler/tab-scheduler.svg" />,
      label: 'Schedulers',
      component: Link,
      to: `/clusters/${params.id}/schedulers`,
    },
    {
      id: 'tab-cluster',
      icon: <Box component="img" sx={{ width: '1.3rem' }} src="/icons/cluster/seed-peer/tab-seed-peer.svg" />,
      label: 'Seed Peers',
      component: Link,
      to: `/clusters/${params.id}/seed-peers`,
    },
    {
      id: 'tab-cluster',
      icon: <Box component="img" sx={{ width: '1.3rem' }} src="/icons/cluster/peer/tab-peer.svg" />,
      label: 'Peers',
      component: Link,
      to: `/clusters/${params.id}/peers`,
    },
  ];

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorMessage(false);
  };

  return (
    <MyContext.Provider value={{ cluster, isLoading }}>
      <ThemeProvider theme={theme}>
        <Snackbar
          open={errorMessage}
          autoHideDuration={3000}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert id="errorMessage" onClose={handleClose} severity="error" sx={{ width: '100%' }}>
            {errorMessageText}
          </Alert>
        </Snackbar>
        <Breadcrumbs
          separator={
            <Box
              sx={{ width: '0.3rem', height: '0.3rem', backgroundColor: '#919EAB', borderRadius: '50%', m: '0 0.4rem' }}
            />
          }
          aria-label="breadcrumb"
          sx={{ mb: '1rem' }}
        >
          <RouterLink underline="hover" component={Link} color="text.primary" to={`/clusters`}>
            clusters
          </RouterLink>
          <RouterLink component={Link} underline="hover" color="text.primary" to={`clusters/${params.id}`}>
            {cluster?.name || '-'}
          </RouterLink>
          {location.pathname.split('/')[3] && (
            <Typography color="inherit">{location.pathname.split('/')[3]}</Typography>
          )}
        </Breadcrumbs>
        <AntTabs
          value={value}
          onChange={handleChange}
          aria-label="nav tabs example"
          sx={{ mb: '2rem' }}
          scrollButtons="auto"
        >
          {tabList.map((item) => {
            return <AntTab {...item} />;
          })}
        </AntTabs>
        <Outlet />
      </ThemeProvider>
    </MyContext.Provider>
  );
}
