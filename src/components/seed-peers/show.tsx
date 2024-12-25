import Paper from '@mui/material/Paper';
import {
  Alert,
  Box,
  Breadcrumbs,
  Chip,
  Link as RouterLink,
  Skeleton,
  Snackbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { getSeedPeer, getSeedPeerResponse } from '../../lib/api';
import { getDatetime } from '../../lib/utils';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import styles from './show.module.css';
import _ from 'lodash';
import { useParams, Link, useLocation } from 'react-router-dom';
import Card from '../card';

export default function SeedPeer() {
  const [isLoading, setIsLoading] = useState(false);
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
        setIsLoading(true);

        if (typeof params.id === 'string') {
          const seedPeer = await getSeedPeer(params.id);
          setSeedPeer(seedPeer);
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
  }, [params.id]);

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
      <Breadcrumbs
        separator={
          <Box
            sx={{ width: '0.3rem', height: '0.3rem', backgroundColor: '#919EAB', borderRadius: '50%', m: '0 0.4rem' }}
          />
        }
        aria-label="breadcrumb"
        sx={{ mb: '1rem' }}
      >
        <RouterLink component={Link} underline="hover" color="inherit" to={`/clusters`}>
          clusters
        </RouterLink>
        <RouterLink component={Link} underline="hover" color="inherit" to={`/clusters/${clusterID}`}>
          {`seed-peer-cluster-${clusterID}`}
        </RouterLink>
        <RouterLink component={Link} underline="hover" color="inherit" to={`/clusters/${clusterID}/seed-peers`}>
          seed-peers
        </RouterLink>
        <Typography color="text.primary">{seedPeer?.host_name || '-'}</Typography>
      </Breadcrumbs>
      <Typography variant="h6" sx={{ p: '1rem 0 2rem 0', fontFamily: 'mabry-bold' }}>
        Seed-Peer
      </Typography>
      <Card className={styles.container}>
        <Box className={styles.headerContainer}>
          <Box className={styles.headerContent}>
            <Box component="img" className={styles.headerIcon} src="/icons/cluster/scheduler/scheduler-id.svg" />
            <Typography className={styles.headerTitle} variant="body1" component="div">
              ID
            </Typography>
          </Box>
          <Typography id="id" component="div" variant="body1" fontFamily="mabry-bold">
            {isLoading ? <Skeleton data-testid="isloading" sx={{ width: '8rem' }} /> : seedPeer?.id || '-'}
          </Typography>
        </Box>
        <Box className={styles.headerContainer}>
          <Box className={styles.headerContent}>
            <Box component="img" className={styles.headerIcon} src="/icons/cluster/scheduler/hostname.svg" />
            <Typography className={styles.headerTitle} variant="body1" component="div">
              Hostname
            </Typography>
          </Box>
          <Typography
            id="hostname"
            component="div"
            variant="body1"
            fontFamily="mabry-bold"
            className={styles.hostname}
          >
            {isLoading ? <Skeleton data-testid="isloading" sx={{ width: '8rem' }} /> : seedPeer?.host_name || '-'}
          </Typography>
        </Box>
        <Box className={styles.headerContainer}>
          <Box className={styles.headerContent}>
            <Box component="img" className={styles.headerIcon} src="/icons/cluster/scheduler/scheduler-ip.svg" />
            <Typography className={styles.headerTitle} variant="body1" component="div">
              IP
            </Typography>
          </Box>
          <Typography id="ip" component="div" variant="body1" fontFamily="mabry-bold">
            {isLoading ? <Skeleton data-testid="isloading" sx={{ width: '8rem' }} /> : seedPeer?.ip || '-'}
          </Typography>
        </Box>
        <Box className={styles.headerContainer}>
          <Box className={styles.headerContent}>
            <Box component="img" className={styles.headerIcon} src="/icons/cluster/scheduler/cluster-id.svg" />
            <Typography className={styles.headerTitle} variant="body1" component="div">
              Cluster ID
            </Typography>
          </Box>
          <Typography id="cluster-id" component="div" variant="body1" fontFamily="mabry-bold">
            {isLoading ? (
              <Skeleton data-testid="isloading" sx={{ width: '8rem' }} />
            ) : (
              seedPeer?.seed_peer_cluster_id || '-'
            )}
          </Typography>
        </Box>
        <Box className={styles.headerContainer}>
          <Box className={styles.headerContent}>
            <Box component="img" className={styles.headerIcon} src="/icons/cluster/seed-peer/seed-peer-type.svg" />
            <Typography className={styles.headerTitle} variant="body1" component="div">
              Type
            </Typography>
          </Box>
          <Typography id="type" component="div" variant="body1" fontFamily="mabry-bold">
            {isLoading ? (
              <Skeleton data-testid="isloading" sx={{ width: '8rem' }} />
            ) : (
              _.upperFirst(seedPeer?.type) || '-'
            )}
          </Typography>
        </Box>
        <Box className={styles.headerContainer}>
          <Box className={styles.headerContent}>
            <Box component="img" className={styles.headerIcon} src="/icons/cluster/scheduler/status.svg" />
            <Typography className={styles.headerTitle} variant="body1" component="div">
              Status
            </Typography>
          </Box>
          <Typography component="div" variant="body1" fontFamily="mabry-bold">
            {isLoading ? (
              <Skeleton data-testid="isloading" sx={{ width: '8rem' }} />
            ) : seedPeer?.state ? (
              <Chip
                label={_.upperFirst(seedPeer?.state)}
                size="small"
                id="status"
                variant="outlined"
                sx={{
                  borderRadius: '0.25rem',
                  backgroundColor: seedPeer?.state === 'active' ? 'var(--description-color)' : 'var(--button-color)',
                  color: seedPeer?.state === 'active' ? '#FFFFFF' : '#FFFFFF',
                  borderColor: seedPeer?.state === 'active' ? 'var(--description-color)' : 'var(--button-color)',
                  fontWeight: 'bold',
                }}
              />
            ) : (
              '-'
            )}
          </Typography>
        </Box>
        <Box className={styles.headerContainer}>
          <Box className={styles.headerContent}>
            <Box component="img" className={styles.headerIcon} src="/icons/cluster/scheduler/port.svg" />
            <Typography className={styles.headerTitle} variant="body1" component="div">
              Port
            </Typography>
          </Box>
          <Typography id="port" component="div" variant="body1" fontFamily="mabry-bold">
            {isLoading ? <Skeleton data-testid="isloading" sx={{ width: '8rem' }} /> : seedPeer?.port || '-'}
          </Typography>
        </Box>
        <Box className={styles.headerContainer}>
          <Box className={styles.headerContent}>
            <Box
              component="img"
              className={styles.headerIcon}
              src="/icons/cluster/seed-peer/seed-peer-download-port.svg"
            />
            <Typography className={styles.headerTitle} variant="body1" component="div">
              Download Port
            </Typography>
          </Box>
          <Typography id="download-port" component="div" variant="body1" fontFamily="mabry-bold">
            {isLoading ? <Skeleton data-testid="isloading" sx={{ width: '8rem' }} /> : seedPeer?.download_port || '-'}
          </Typography>
        </Box>
        <Box className={styles.headerContainer}>
          <Box className={styles.headerContent}>
            <Box component="img" className={styles.headerIcon} src="/icons/cluster/seed-peer/object-storage-port.svg" />
            <Typography className={styles.headerTitle} variant="body1" component="div">
              Object Storage Port
            </Typography>
          </Box>
          <Typography id="object-storage-port" component="div" variant="body1" fontFamily="mabry-bold">
            {isLoading ? (
              <Skeleton data-testid="isloading" sx={{ width: '8rem' }} />
            ) : (
              seedPeer?.object_storage_port || '-'
            )}
          </Typography>
        </Box>
        <Box className={styles.headerContainer}>
          <Box className={styles.headerContent}>
            <Box component="img" className={styles.headerIcon} src="/icons/cluster/scheduler/created-at.svg" />
            <Typography className={styles.headerTitle} variant="body1" component="div">
              Created At
            </Typography>
          </Box>
          <Box id="created-at" component="div">
            {isLoading ? (
              <Skeleton data-testid="isloading" sx={{ width: '8rem' }} />
            ) : seedPeer?.created_at ? (
              <Chip
                avatar={<MoreTimeIcon />}
                label={getDatetime(seedPeer?.created_at || '')}
                variant="outlined"
                size="small"
              />
            ) : (
              '-'
            )}
          </Box>
        </Box>
        <Box className={styles.headerContainer}>
          <Box className={styles.headerContent}>
            <Box component="img" className={styles.headerIcon} src="/icons/cluster/scheduler/updated-at.svg" />
            <Typography className={styles.headerTitle} variant="body1" component="div">
              Updated At
            </Typography>
          </Box>
          <Box id="updated-at" component="div">
            {isLoading ? (
              <Skeleton data-testid="isloading" sx={{ width: '8rem' }} />
            ) : seedPeer?.updated_at ? (
              <Chip
                avatar={<MoreTimeIcon />}
                label={getDatetime(seedPeer?.updated_at || '')}
                variant="outlined"
                size="small"
              />
            ) : (
              '-'
            )}
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
