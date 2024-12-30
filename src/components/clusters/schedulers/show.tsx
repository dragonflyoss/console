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
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import { getScheduler, getSchedulerResponse } from '../../../lib/api';
import { getDatetime } from '../../../lib/utils';
import styles from './show.module.css';
import _ from 'lodash';
import { useParams, Link, useLocation } from 'react-router-dom';
import Card from '../../card';

export default function Schedulers() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [scheduler, setScheduler] = useState<getSchedulerResponse>();

  const params = useParams();
  const location = useLocation();
  const pathSegments = location.pathname.split('/');
  const clusterID = pathSegments[pathSegments.length - 3];

  const schedulerLabel = [
    {
      label: 'Port',
      name: 'port',
    },
    {
      label: 'State',
      name: 'state',
    },
    {
      label: 'Features',
      name: 'features',
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
          const scheduler = await getScheduler(params.id);

          setScheduler(scheduler);
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
          {`scheduler-cluster-${clusterID}`}
        </RouterLink>
        <RouterLink component={Link} underline="hover" color="inherit" to={`/clusters/${clusterID}/schedulers`}>
          {`schedulers`}
        </RouterLink>
        <Typography color="text.primary">{scheduler?.host_name || '-'}</Typography>
      </Breadcrumbs>
      <Typography variant="h6" sx={{ p: '1rem 0 2rem 0', fontFamily: 'mabry-bold' }}>
        Scheduler
      </Typography>
      <Card className={styles.container}>
        <Box className={styles.headerContainer}>
          <Box className={styles.headerContent}>
            <Box component="img" className={styles.headerIcon} src="/icons/cluster/scheduler/scheduler-id.svg" />
            <Typography className={styles.headerTitle} variant="body1" component="div">
              ID
            </Typography>
          </Box>
          <Typography id="id" component="div" variant="body1" className={styles.headerText}>
            {isLoading ? <Skeleton data-testid="isloading" sx={{ width: '8rem' }} /> : scheduler?.id || '-'}
          </Typography>
        </Box>
        <Box className={styles.headerContainer}>
          <Box className={styles.headerContent}>
            <Box component="img" className={styles.headerIcon} src="/icons/cluster/scheduler/hostname.svg" />
            <Typography className={styles.headerTitle} variant="body1" component="div">
              Hostname
            </Typography>
          </Box>
          <Tooltip title={scheduler?.host_name || '-'} placement="top">
            <Typography id="hostname" component="div" variant="body1" className={styles.hostname}>
              {isLoading ? <Skeleton data-testid="isloading" sx={{ width: '8rem' }} /> : scheduler?.host_name || '-'}
            </Typography>
          </Tooltip>
        </Box>
        <Box className={styles.headerContainer}>
          <Box className={styles.headerContent}>
            <Box component="img" className={styles.headerIcon} src="/icons/cluster/scheduler/cluster-id.svg" />
            <Typography className={styles.headerTitle} variant="body1" component="div">
              Cluster ID
            </Typography>
          </Box>
          <Box id="cluster-id" className={styles.clusterID}>
            <Typography component="div" variant="body2" className={styles.headerText}>
              {isLoading ? (
                <Skeleton data-testid="isloading" sx={{ width: '8rem' }} />
              ) : (
                scheduler?.scheduler_cluster_id || '-'
              )}
            </Typography>
          </Box>
        </Box>
        <Box className={styles.headerContainer}>
          <Box className={styles.headerContent}>
            <Box component="img" className={styles.headerIcon} src="/icons/cluster/scheduler/scheduler-ip.svg" />
            <Typography className={styles.headerTitle} variant="body1" component="div">
              IP
            </Typography>
          </Box>
          <Typography id="ip" component="div" variant="body1" className={styles.headerText}>
            {isLoading ? <Skeleton data-testid="isloading" sx={{ width: '8rem' }} /> : scheduler?.ip || '-'}
          </Typography>
        </Box>
        <Box className={styles.headerContainer}>
          <Box className={styles.headerContent}>
            <Box component="img" className={styles.headerIcon} src="/icons/cluster/scheduler/status.svg" />
            <Typography className={styles.headerTitle} variant="body1" component="div">
              Status
            </Typography>
          </Box>
          <Typography component="div" variant="body1" className={styles.headerText}>
            {isLoading ? (
              <Skeleton data-testid="isloading" sx={{ width: '8rem' }} />
            ) : scheduler?.state ? (
              <Chip
                label={_.upperFirst(scheduler?.state)}
                size="small"
                variant="outlined"
                id="status"
                sx={{
                  borderRadius: '0.25rem',
                  backgroundColor: scheduler?.state === 'active' ? 'var(--description-color)' : 'var(--button-color)',
                  color: scheduler?.state === 'active' ? '#FFFFFF' : '#FFFFFF',
                  borderColor: scheduler?.state === 'active' ? 'var(--description-color)' : 'var(--button-color)',
                  fontWeight: 'bold',
                }}
              />
            ) : (
              <Typography id="status" component="div">
                -
              </Typography>
            )}
          </Typography>
        </Box>
        <Box className={styles.headerContainer}>
          <Box className={styles.headerContent}>
            <Box component="img" className={styles.headerIcon} src="/icons/cluster/scheduler/features.svg" />
            <Typography className={styles.headerTitle} variant="body1" component="div">
              Features
            </Typography>
          </Box>
          <Box id="features" component="div" className={styles.headerText}>
            {isLoading ? (
              <Skeleton data-testid="isloading" sx={{ width: '8rem' }} />
            ) : scheduler?.features ? (
              scheduler?.features?.map((items: string, id: any) => (
                <Chip
                  key={id}
                  label={_.upperFirst(items) || ''}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderRadius: '0.25rem',
                    background: 'var(--button-color)',
                    color: '#FFFFFF',
                    mr: '0.4rem',
                    borderColor: 'var(--button-color)',
                    fontWeight: 'bold',
                  }}
                />
              ))
            ) : (
              '-'
            )}
          </Box>
        </Box>
        <Box className={styles.headerContainer}>
          <Box className={styles.headerContent}>
            <Box component="img" className={styles.headerIcon} src="/icons/cluster/scheduler/port.svg" />
            <Typography className={styles.headerTitle} variant="body1" component="div">
              Port
            </Typography>
          </Box>
          <Typography id="port" component="div" variant="body1" className={styles.headerText}>
            {isLoading ? <Skeleton data-testid="isloading" sx={{ width: '8rem' }} /> : scheduler?.port || '-'}
          </Typography>
        </Box>
        <Box className={styles.headerContainer}>
          <Box className={styles.headerContent}>
            <Box component="img" className={styles.headerIcon} src="/icons/cluster/scheduler/created-at.svg" />
            <Typography className={styles.headerTitle} variant="body1" component="div">
              Created At
            </Typography>
          </Box>
          <Typography id="created-at" component="div" variant="body1" className={styles.headerText}>
            {isLoading ? (
              <Skeleton data-testid="isloading" sx={{ width: '8rem' }} />
            ) : scheduler?.created_at ? (
              <Chip
                avatar={<MoreTimeIcon />}
                label={getDatetime(scheduler?.created_at || '')}
                variant="outlined"
                size="small"
              />
            ) : (
              '-'
            )}
          </Typography>
        </Box>
        <Box className={styles.headerContainer}>
          <Box className={styles.headerContent}>
            <Box component="img" className={styles.headerIcon} src="/icons/cluster/scheduler/updated-at.svg" />
            <Typography className={styles.headerTitle} variant="body1" component="div">
              Updated At
            </Typography>
          </Box>
          <Typography id="updated-at" component="div" variant="body1" className={styles.headerText}>
            {isLoading ? (
              <Skeleton data-testid="isloading" sx={{ width: '8rem' }} />
            ) : scheduler?.updated_at ? (
              <Chip
                avatar={<MoreTimeIcon />}
                label={getDatetime(scheduler?.updated_at)}
                variant="outlined"
                size="small"
              />
            ) : (
              '-'
            )}
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}
