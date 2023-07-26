import Layout from 'components/layout';
import { NextPageWithLayout } from '../../../_app';
import * as React from 'react';
import Paper from '@mui/material/Paper';
import { Alert, Box, Breadcrumbs, Chip, Link as RouterLink, Skeleton, Snackbar, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { ReactElement, useEffect, useState } from 'react';
import { getSeedPeerID, getCluster } from 'lib/api';
import { datetime } from 'lib/utils';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import HistoryIcon from '@mui/icons-material/History';
import styles from './index.module.css';
import Link from 'next/link';
import _ from 'lodash';

const SeedPeer: NextPageWithLayout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [cluster, setCluster] = useState({ name: '', id: '' });
  const [seedPeer, setSeedPeer] = useState({
    id: '',
    host_name: '',
    ip: '',
    port: '',
    download_port: '',
    object_storage_port: '',
    type: '',
    state: '',
    idc: '',
    lcoation: '',
    created_at: '',
    updated_at: '',
    seed_peer_cluster_id: '',
  });

  const { query } = useRouter();

  const seedPeersLabel = [
    {
      label: 'Port',
      name: 'port',
    },
    {
      label: 'Download Port',
      name: 'download_port',
    },
    {
      label: 'Object Storage Port',
      name: 'object_storage_port',
    },
    {
      label: 'Type',
      name: 'type',
    },
    {
      label: 'State',
      name: 'state',
    },

    {
      label: 'IDC',
      name: 'idc',
    },

    {
      label: 'Location',
      name: 'location',
    },
    {
      label: 'Created At',
      name: 'created_at',
    },
    {
      label: 'Updated At',
      name: 'updated_at',
    },
  ];

  useEffect(() => {
    (async function () {
      try {
        setIsLoading(true);

        if (typeof query.slug === 'string' && typeof query.id === 'string') {
          const [getClusters, getSeedPeer] = await Promise.all([getCluster(query.slug), getSeedPeerID(query.id)]);

          setCluster(await getClusters.json());
          setSeedPeer(await getSeedPeer.json());
          setIsLoading(false);
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
          setIsLoading(false);
        }
      }
    })();
  }, [query.id, query.slug]);

  const handleClose = (_: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorMessage(false);
  };

  return (
    <Box>
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
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: '1rem' }}>
        <RouterLink component={Link} underline="hover" color="inherit" href={`/clusters`}>
          clusters
        </RouterLink>
        <RouterLink component={Link} underline="hover" color="inherit" href={`/clusters/${cluster?.id}`}>
          {cluster?.name}
        </RouterLink>
        <Typography color="text.primary" fontFamily="mabry-bold">
          {seedPeer?.host_name}
        </Typography>
      </Breadcrumbs>
      <Typography variant="h5" fontFamily="mabry-bold" sx={{ pb: '1rem' }}>
        Seed-Peer
      </Typography>
      <Box className={styles.container}>
        <Paper variant="outlined" className={styles.headerContainer}>
          <Box className={styles.headerContent}>
            <Box component="img" className={styles.headerIcon} src="/icons/cluster/scheduler-id.svg" />
            <Typography className={styles.headerTitle} variant="subtitle1" component="div">
              ID
            </Typography>
          </Box>
          <Typography component="div" variant="subtitle1" fontFamily="mabry-bold">
            {isLoading ? <Skeleton sx={{ width: '8rem' }} /> : seedPeer?.id}
          </Typography>
        </Paper>
        <Paper variant="outlined" className={styles.headerContainer}>
          <Box className={styles.headerContent}>
            <Box component="img" className={styles.headerIcon} src="/icons/cluster/hostname.svg" />
            <Typography className={styles.headerTitle} variant="subtitle1" component="div">
              Hostname
            </Typography>
          </Box>
          <Typography component="div" variant="subtitle1" fontFamily="mabry-bold">
            {isLoading ? <Skeleton sx={{ width: '8rem' }} /> : seedPeer?.host_name}
          </Typography>
        </Paper>
        <Paper variant="outlined" className={styles.headerContainer}>
          <Box className={styles.headerContent}>
            <Box component="img" className={styles.headerIcon} src="/icons/cluster/scheduler-ip.svg" />
            <Typography className={styles.headerTitle} variant="subtitle1" component="div">
              IP
            </Typography>
          </Box>
          <Typography component="div" variant="subtitle1" fontFamily="mabry-bold">
            {isLoading ? <Skeleton sx={{ width: '8rem' }} /> : seedPeer?.ip}
          </Typography>
        </Paper>
        <Paper variant="outlined" className={styles.clusterIDContaine}>
          <Box className={styles.clusterIDContent}>
            <Box component="img" className={styles.headerIcon} src="/icons/cluster/cluster-id.svg" />
            <Typography className={styles.clusterIDTitle} variant="subtitle1" component="div">
              Cluster ID
            </Typography>
          </Box>
          <Typography component="div" variant="subtitle1" fontFamily="mabry-bold">
            {isLoading ? <Skeleton sx={{ width: '8rem' }} /> : seedPeer?.seed_peer_cluster_id}
          </Typography>
        </Paper>
      </Box>
      <Paper variant="outlined" className={styles.seedPeerContainer}>
        {seedPeersLabel.map((item: any) => {
          return (
            <Box key={item.label} className={styles.seedPeerContent}>
              <Typography variant="subtitle1" component="div" mb="1rem">
                {item.label}
              </Typography>
              {isLoading ? (
                <Skeleton sx={{ width: '80%' }} />
              ) : (
                <>
                  {item.name == 'created_at' ? (
                    <Chip
                      avatar={<MoreTimeIcon />}
                      label={datetime(seedPeer?.[item.name as keyof typeof seedPeer])}
                      variant="outlined"
                      size="small"
                    />
                  ) : item.name == 'updated_at' ? (
                    <Chip
                      avatar={<HistoryIcon />}
                      label={datetime(seedPeer[item.name as keyof typeof seedPeer])}
                      variant="outlined"
                      size="small"
                    />
                  ) : item.name == 'state' ? (
                    <Chip
                      label={_.upperFirst(seedPeer?.[item.name as keyof typeof seedPeer]) || ''}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderRadius: '0%',
                        backgroundColor:
                          seedPeer?.[item.name as keyof typeof seedPeer] === 'active'
                            ? 'var(--description-color)'
                            : 'var(--button-color)',
                        color: seedPeer?.[item.name as keyof typeof seedPeer] === 'active' ? '#FFFFFF' : '#FFFFFF',
                        borderColor:
                          seedPeer?.[item.name as keyof typeof seedPeer] === 'active'
                            ? 'var(--description-color)'
                            : 'var(--button-color)',
                        fontWeight: 'bold',
                      }}
                    />
                  ) : item.name == 'type' ? (
                    <Typography component="div" variant="subtitle1" fontFamily="mabry-bold">
                      {_.upperFirst(seedPeer?.[item.name as keyof typeof seedPeer]) || ''}
                    </Typography>
                  ) : (
                    <Typography component="div" variant="subtitle1" fontFamily="mabry-bold">
                      {seedPeer?.[item.name as keyof typeof seedPeer] || '-'}
                    </Typography>
                  )}
                </>
              )}
            </Box>
          );
        })}
      </Paper>
    </Box>
  );
};

export default SeedPeer;

SeedPeer.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
