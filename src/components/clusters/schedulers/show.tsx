import { Box, Breadcrumbs, Chip, Link as RouterLink, Skeleton, Tooltip, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import { getScheduler, getSchedulerResponse } from '../../../lib/api';
import { getDatetime } from '../../../lib/utils';
import styles from './show.module.css';
import _ from 'lodash';
import { useParams, Link, useLocation } from 'react-router-dom';
import Card from '../../card';
import { ReactComponent as ID } from '../../../assets/images/cluster/scheduler/scheduler-id.svg';
import { ReactComponent as Hostname } from '../../../assets/images/cluster/scheduler/hostname.svg';
import { ReactComponent as ClusterID } from '../../../assets/images/cluster/scheduler/cluster-id.svg';
import { ReactComponent as IP } from '../../../assets/images/cluster/scheduler/scheduler-ip.svg';
import { ReactComponent as Status } from '../../../assets/images/cluster/scheduler/status.svg';
import { ReactComponent as Features } from '../../../assets/images/cluster/scheduler/features.svg';
import { ReactComponent as Port } from '../../../assets/images/cluster/scheduler/port.svg';
import { ReactComponent as CreatedAt } from '../../../assets/images/cluster/scheduler/created-at.svg';
import { ReactComponent as UpdatedAt } from '../../../assets/images/cluster/scheduler/updated-at.svg';
import ErrorHandler from '../../error-handler';

export default function Schedulers() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [scheduler, setScheduler] = useState<getSchedulerResponse>();

  const params = useParams();
  const location = useLocation();
  const pathSegments = location.pathname.split('/');
  const clusterID = pathSegments[pathSegments.length - 3];

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
      <ErrorHandler errorMessage={errorMessage} errorMessageText={errorMessageText} onClose={handleClose} />
      <Typography variant="h5">Scheduler</Typography>
      <Breadcrumbs
        separator={
          <Box
            sx={{ width: '0.3rem', height: '0.3rem', backgroundColor: '#919EAB', borderRadius: '50%', m: '0 0.4rem' }}
          />
        }
        aria-label="breadcrumb"
        sx={{ mb: '2rem', mt: '1rem' }}
      >
        <RouterLink id="cluster" component={Link} underline="hover" color="inherit" to={`/clusters`}>
          clusters
        </RouterLink>
        <RouterLink id="cluster-id" component={Link} underline="hover" color="inherit" to={`/clusters/${clusterID}`}>
          {`scheduler-cluster-${clusterID}`}
        </RouterLink>
        <RouterLink
          id="scheduler"
          component={Link}
          underline="hover"
          color="inherit"
          to={`/clusters/${clusterID}/schedulers`}
        >
          {`schedulers`}
        </RouterLink>
        <Typography id="scheduler-host-name" color="text.primary">
          {scheduler?.host_name || '-'}
        </Typography>
      </Breadcrumbs>
      <Card className={styles.container}>
        <Box className={styles.headerContainer}>
          <Box className={styles.headerContent}>
            <ID className={styles.headerIcon} />
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
            <Hostname className={styles.headerIcon} />
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
            <ClusterID className={styles.headerIcon} />
            <Typography className={styles.headerTitle} variant="body1" component="div">
              Cluster ID
            </Typography>
          </Box>
          <Box id="cluster-id" className={styles.clusterID}>
            <Typography component="div" variant="body2" fontFamily="mabry-bold" className={styles.headerText}>
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
            <IP className={styles.headerIcon} />
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
            <Status className={styles.headerIcon} />
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
                  backgroundColor:
                    scheduler?.state === 'active' ? 'var(--palette-text-color)' : 'var(--palette-dark-300Channel)',
                  color: scheduler?.state === 'active' ? '#FFFFFF' : '#FFFFFF',
                  borderColor:
                    scheduler?.state === 'active' ? 'var(--palette-text-color)' : 'var(--palette-dark-300Channel)',
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
            <Features className={styles.headerIcon} />
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
                    background: 'var(--palette-dark-300Channel)',
                    color: '#FFFFFF',
                    mr: '0.4rem',
                    borderColor: 'var(--palette-dark-300Channel)',
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
            <Port className={styles.headerIcon} />
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
            <CreatedAt className={styles.headerIcon} />
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
            <UpdatedAt className={styles.headerIcon} />
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
