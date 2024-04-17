import Paper from '@mui/material/Paper';
import { Alert, Box, Breadcrumbs, Chip, Link as RouterLink, Skeleton, Snackbar, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { getSeedPeer, getSeedPeerResponse } from '../../lib/api';
import { getDatetime } from '../../lib/utils';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import HistoryIcon from '@mui/icons-material/History';
import styles from './show.module.css';
import _ from 'lodash';
import { useParams, Link, useLocation } from 'react-router-dom';
import LoadingBackdrop from '../loading-backdrop';

export default function SeedPeer() {
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoding, setPageLoding] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [seedPeer, setSeedPeer] = useState<getSeedPeerResponse>();

  const params = useParams();

  const location = useLocation();
  const pathSegments = location.pathname.split('/');
  const clusterID = pathSegments[pathSegments.length - 3];

  const seedPeerLabel = [
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
        setPageLoding(true);
        setIsLoading(true);

        if (typeof params.id === 'string') {
          const seedPeer = await getSeedPeer(params.id);
          setSeedPeer(seedPeer);
          setPageLoding(false);
          setIsLoading(false);
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
          setPageLoding(false);
          setIsLoading(false);
        }
      }
    })();
  }, [params.id]);

  const handleClose = (_: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorMessage(false);
  };

  return (
    <Box>
      <LoadingBackdrop open={pageLoding} />
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
        <RouterLink component={Link} underline="hover" color="inherit" to={`/clusters`}>
          clusters
        </RouterLink>
        <RouterLink component={Link} underline="hover" color="inherit" to={`/clusters/${clusterID}`}>
          {`seed-peer-cluster-${clusterID}`}
        </RouterLink>
        <Typography color="inherit">seed-peers</Typography>
        <Typography color="text.primary">{seedPeer?.host_name || '-'}</Typography>
      </Breadcrumbs>
      <Typography variant="h5" sx={{ pb: '1rem' }}>
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
            {isLoading ? <Skeleton sx={{ width: '8rem' }} /> : seedPeer?.id || '-'}
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
            {isLoading ? <Skeleton sx={{ width: '8rem' }} /> : seedPeer?.host_name || '-'}
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
            {isLoading ? <Skeleton sx={{ width: '8rem' }} /> : seedPeer?.ip || '-'}
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
            {isLoading ? <Skeleton sx={{ width: '8rem' }} /> : seedPeer?.seed_peer_cluster_id || '-'}
          </Typography>
        </Paper>
      </Box>
      <Paper variant="outlined" className={styles.seedPeerContainer}>
        {seedPeerLabel.map((item) => {
          return (
            <Box key={item.label} className={styles.seedPeerContent}>
              <Typography variant="subtitle1" component="div" mb="1rem">
                {item.label}
              </Typography>
              {isLoading ? (
                <Skeleton sx={{ width: '80%' }} />
              ) : (
                <>
                  {item.name === 'created_at' ? (
                    seedPeer?.[item?.name] ? (
                      <Chip
                        avatar={<MoreTimeIcon />}
                        label={getDatetime(seedPeer?.[item?.name])}
                        variant="outlined"
                        size="small"
                      />
                    ) : (
                      '-'
                    )
                  ) : item.name === 'updated_at' ? (
                    seedPeer?.[item?.name] ? (
                      <Chip
                        avatar={<HistoryIcon />}
                        label={getDatetime(seedPeer?.[item?.name])}
                        variant="outlined"
                        size="small"
                      />
                    ) : (
                      '-'
                    )
                  ) : item.name === 'state' ? (
                    seedPeer?.[item?.name] ? (
                      <Chip
                        label={_.upperFirst(seedPeer?.[item?.name])}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderRadius: '0%',
                          backgroundColor:
                            seedPeer?.[item.name] === 'active' ? 'var(--description-color)' : 'var(--button-color)',
                          color: seedPeer?.[item.name] === 'active' ? '#FFFFFF' : '#FFFFFF',
                          borderColor:
                            seedPeer?.[item.name] === 'active' ? 'var(--description-color)' : 'var(--button-color)',
                          fontWeight: 'bold',
                        }}
                      />
                    ) : (
                      '-'
                    )
                  ) : item.name === 'type' ? (
                    <Typography component="div" variant="subtitle1" fontFamily="mabry-bold">
                      {_.upperFirst(seedPeer?.[item.name]) || '-'}
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
}
