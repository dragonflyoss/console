import { Breadcrumbs, styled, Typography, Link as RouterLink } from '@mui/material';
import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import * as React from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab, { TabProps } from '@mui/material/Tab';
import { useEffect } from 'react';
import styles from './index.module.css';
import { ReactComponent as Clear } from '../../../assets/images/resource/task/clear-cache.svg';
import { ReactComponent as Executions } from '../../../assets/images/resource/task/executions.svg';

export default function NavTabs() {
  const [value, setValue] = React.useState(1);

  const location = useLocation();
  const params = useParams();
  const breadcrumbsColor = location.pathname.split('/').length || 0;

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (location.pathname.split('/')[3] === 'clear') {
      setValue(0);
    } else {
      setValue(1);
    }
  }, [location.pathname]);

  type StyledTabProps = Omit<TabProps, 'component'> & {
    component?: React.ElementType;
    to: string;
  };

  const AntTab = styled((props: StyledTabProps) => <Tab disableRipple {...props} />)(({ theme }) => ({
    textTransform: 'none',
    minWidth: 0,
    [theme.breakpoints.up('sm')]: {
      minWidth: 0,
    },
    minHeight: '3rem',
    fontWeight: theme.typography.fontWeightRegular,
    color: 'var(--palette-grey-tab)',
    padding: '0',
    marginRight: '2rem',
    fontSize: '0.9rem',
    fontFamily: 'mabry-bold',
    '&:hover': {
      color: 'primary',
      opacity: 1,
    },
    '&.Mui-selected': {
      color: 'var(--palette-description-color)',
      fontFamily: 'mabry-bold',
    },
  }));

  const AntTabs = styled(Tabs)({
    borderBottom: '1px solid var(--palette-tab-border-color)',
    '& .MuiTabs-indicator': {
      backgroundColor: 'var(--palette-description-color)',
      borderRadius: '1rem',
    },
  });

  const image = {
    peers: [
      {
        peer: [
          {
            ip: '172.18.0.2',
            hostname: 'kind-worker',
            layers: [
              {
                url: 'https://ghcr.io/v2/dragonflyoss/scheduler/blobs/sha256:f1f1039835051ecc04909f939530e86a20f02d2ce5ad7a81c0fa3616f7303944',
              },
              {
                url: 'https://ghcr.io/v2/dragonflyoss/scheduler/blobs/sha256:871ab018db94b4ae7b137764837bc4504393a60656ba187189e985cd809064f7',
              },
              {
                url: 'https://ghcr.io/v2/dragonflyoss/scheduler/blobs/sha256:f1a1d290795d904815786e41d39a41dc1af5de68a9e9020baba8bd83b32d8f95',
              },
            ],
          },
          {
            ip: '172.18.0.4',
            hostname: 'kind-worker2',
            layers: [
              {
                url: 'https://ghcr.io/v2/dragonflyoss/scheduler/blobs/sha256:f1f1039835051ecc04909f939530e86a20f02d2ce5ad7a81c0fa3616f7303944',
              },
              {
                url: 'https://ghcr.io/v2/dragonflyoss/scheduler/blobs/sha256:871ab018db94b4ae7b137764837bc4504393a60656ba187189e985cd809064f7',
              },
            ],
          },
          {
            ip: '172.18.0.2',
            hostname: 'kind-worker',
            layers: [
              {
                url: 'https://ghcr.io/v2/dragonflyoss/scheduler/blobs/sha256:f1f1039835051ecc04909f939530e86a20f02d2ce5ad7a81c0fa3616f7303944',
              },
              {
                url: 'https://ghcr.io/v2/dragonflyoss/scheduler/blobs/sha256:871ab018db94b4ae7b137764837bc4504393a60656ba187189e985cd809064f7',
              },
              {
                url: 'https://ghcr.io/v2/dragonflyoss/scheduler/blobs/sha256:f1a1d290795d904815786e41d39a41dc1af5de68a9e9020baba8bd83b32d8f95',
              },
            ],
          },
          {
            ip: '172.18.0.4',
            hostname: 'kind-worker2',
            layers: [
              {
                url: 'https://ghcr.io/v2/dragonflyoss/scheduler/blobs/sha256:f1f1039835051ecc04909f939530e86a20f02d2ce5ad7a81c0fa3616f7303944',
              },
              {
                url: 'https://ghcr.io/v2/dragonflyoss/scheduler/blobs/sha256:871ab018db94b4ae7b137764837bc4504393a60656ba187189e985cd809064f7',
              },
            ],
          },
          {
            ip: '172.18.0.2',
            hostname: 'kind-worker',
            layers: [
              {
                url: 'https://ghcr.io/v2/dragonflyoss/scheduler/blobs/sha256:f1f1039835051ecc04909f939530e86a20f02d2ce5ad7a81c0fa3616f7303944',
              },
              {
                url: 'https://ghcr.io/v2/dragonflyoss/scheduler/blobs/sha256:871ab018db94b4ae7b137764837bc4504393a60656ba187189e985cd809064f7',
              },
              {
                url: 'https://ghcr.io/v2/dragonflyoss/scheduler/blobs/sha256:f1a1d290795d904815786e41d39a41dc1af5de68a9e9020baba8bd83b32d8f95',
              },
            ],
          },
          {
            ip: '172.18.0.4',
            hostname: 'kind-worker2',
            layers: [
              {
                url: 'https://ghcr.io/v2/dragonflyoss/scheduler/blobs/sha256:f1f1039835051ecc04909f939530e86a20f02d2ce5ad7a81c0fa3616f7303944',
              },
              {
                url: 'https://ghcr.io/v2/dragonflyoss/scheduler/blobs/sha256:871ab018db94b4ae7b137764837bc4504393a60656ba187189e985cd809064f7',
              },
            ],
          },
        ],
        scheduler_cluster_id: 1,
      },
      {
        peer: [
          {
            ip: '172.18.0.3',
            hostname: 'kind-worker3',
            layers: [
              {
                url: 'https://ghcr.io/v2/dragonflyoss/scheduler/blobs/sha256:f1f1039835051ecc04909f939530e86a20f02d2ce5ad7a81c0fa3616f7303944',
              },
              {
                url: 'https://ghcr.io/v2/dragonflyoss/scheduler/blobs/sha256:871ab018db94b4ae7b137764837bc4504393a60656ba187189e985cd809064f7',
              },
            ],
          },
        ],
        scheduler_cluster_id: 2,
      },
    ],
  };

  const images = {
    peers: [
      {
        ip: '172.18.0.2',
        hostname: 'kind-worker',
        layers: [
          {
            url: 'https://ghcr.io/v2/dragonflyoss/scheduler/blobs/sha256:f1f1039835051ecc04909f939530e86a20f02d2ce5ad7a81c0fa3616f7303944',
          },
          {
            url: 'https://ghcr.io/v2/dragonflyoss/scheduler/blobs/sha256:871ab018db94b4ae7b137764837bc4504393a60656ba187189e985cd809064f7',
          },
          {
            url: 'https://ghcr.io/v2/dragonflyoss/scheduler/blobs/sha256:f1a1d290795d904815786e41d39a41dc1af5de68a9e9020baba8bd83b32d8f95',
          },
        ],
      },
      {
        ip: '172.18.0.4',
        hostname: 'kind-worker2',
        layers: [
          {
            url: 'https://ghcr.io/v2/dragonflyoss/scheduler/blobs/sha256:f1f1039835051ecc04909f939530e86a20f02d2ce5ad7a81c0fa3616f7303944',
          },
          {
            url: 'https://ghcr.io/v2/dragonflyoss/scheduler/blobs/sha256:871ab018db94b4ae7b137764837bc4504393a60656ba187189e985cd809064f7',
          },
        ],
        scheduler_cluster_id: 1,
      },
      {
        ip: '172.18.0.3',
        hostname: 'kind-worker3',
        layers: [
          {
            url: 'https://ghcr.io/v2/dragonflyoss/scheduler/blobs/sha256:f1f1039835051ecc04909f939530e86a20f02d2ce5ad7a81c0fa3616f7303944',
          },
          {
            url: 'https://ghcr.io/v2/dragonflyoss/scheduler/blobs/sha256:871ab018db94b4ae7b137764837bc4504393a60656ba187189e985cd809064f7',
          },
        ],
        scheduler_cluster_id: 2,
      },
    ],
  };

  return (
    <Box>
      <Breadcrumbs
        separator={
          <Box
            sx={{ width: '0.3rem', height: '0.3rem', backgroundColor: '#919EAB', borderRadius: '50%', m: '0 0.4rem' }}
          />
        }
        aria-label="breadcrumb"
        sx={{ mb: '1rem' }}
      >
        <Typography color="text.primary">Resource</Typography>
        <Typography color="text.primary">Task</Typography>
        {location.pathname.split('/')[3] === 'executions' ? (
          <RouterLink
            component={Link}
            underline="hover"
            color={breadcrumbsColor === 5 ? 'text.primary' : 'inherit'}
            to={`/resource/task/executions`}
          >
            Executions
          </RouterLink>
        ) : (
          <Typography color="inherit">Clear</Typography>
        )}
        {params?.id ? <Typography color="inherit">{params?.id || '-'}</Typography> : ''}
      </Breadcrumbs>
      <AntTabs
        value={value}
        onChange={handleChange}
        aria-label="nav tabs example"
        sx={{ mb: '2rem' }}
        scrollButtons="auto"
      >
        <AntTab
          icon={<Clear className={styles.tabIcon} />}
          iconPosition="start"
          label="Clear"
          component={Link}
          to="/resource/task/clear"
          sx={{ textTransform: 'none' }}
          id="tab-clear"
        />
        <AntTab
          icon={<Executions className={styles.tabIcon} />}
          iconPosition="start"
          label="Executions"
          component={Link}
          to="/resource/task/executions"
          id="tab-executions"
        />
      </AntTabs>
      <Outlet />
    </Box>
  );
}
