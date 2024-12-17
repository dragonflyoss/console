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
import HistoryIcon from '@mui/icons-material/History';
import { getScheduler, getSchedulerResponse } from '../../lib/api';
import { getDatetime } from '../../lib/utils';
import styles from './show.module.css';
import _ from 'lodash';
import { useParams, Link, useLocation } from 'react-router-dom';
import Card from '../card';

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
      <Typography variant="h6" sx={{ pb: '1rem' }}>
        Scheduler
      </Typography>
      <Box className={styles.container}>
        <Card className={styles.headerContainer}>
          <Box className={styles.headerContent}>
            <Box component="img" className={styles.headerIcon} src="/icons/cluster/scheduler/scheduler-id.svg" />
            <Typography className={styles.headerTitle} variant="subtitle1" component="div">
              ID
            </Typography>
          </Box>
          <Typography component="div" variant="subtitle1" className={styles.headerText}>
            {isLoading ? <Skeleton data-testid="isloading" sx={{ width: '8rem' }} /> : scheduler?.id || '-'}
          </Typography>
        </Card>
        <Card className={styles.headerContainer}>
          <Box className={styles.headerContent}>
            <Box component="img" className={styles.headerIcon} src="/icons/cluster/scheduler/hostname.svg" />
            <Typography className={styles.headerTitle} variant="subtitle1" component="div">
              Hostname
            </Typography>
          </Box>
          <Tooltip title={scheduler?.host_name || '-'} placement="top">
            <Typography component="div" variant="subtitle1" className={styles.hostname}>
              {isLoading ? <Skeleton data-testid="isloading" sx={{ width: '8rem' }} /> : scheduler?.host_name || '-'}
            </Typography>
          </Tooltip>
        </Card>
        <Card className={styles.headerContainer}>
          <Box className={styles.headerContent}>
            <Box component="img" className={styles.headerIcon} src="/icons/cluster/scheduler/scheduler-ip.svg" />
            <Typography className={styles.headerTitle} variant="subtitle1" component="div">
              IP
            </Typography>
          </Box>
          <Typography component="div" variant="subtitle1" className={styles.headerText}>
            {isLoading ? <Skeleton data-testid="isloading" sx={{ width: '8rem' }} /> : scheduler?.ip || '-'}
          </Typography>
        </Card>
        <Card className={styles.clusterIDContaine}>
          <Box className={styles.clusterIDContent}>
            <Box component="img" className={styles.headerIcon} src="/icons/cluster/scheduler/cluster-id.svg" />
            <Typography className={styles.clusterIDTitle} variant="subtitle1" component="div">
              Cluster ID
            </Typography>
          </Box>
          <Typography component="div" variant="subtitle1" className={styles.headerText}>
            {isLoading ? (
              <Skeleton data-testid="isloading" sx={{ width: '8rem' }} />
            ) : (
              scheduler?.scheduler_cluster_id || '-'
            )}
          </Typography>
        </Card>
      </Box>
      <Card className={styles.schedulerContainer}>
        {schedulerLabel.map((item) => {
          return (
            <Box key={item.label} className={styles.schedulerContent}>
              <Typography variant="subtitle1" component="div" className={styles.text}>
                {item.label}
              </Typography>
              {isLoading ? (
                <Skeleton data-testid="isloading" sx={{ width: '80%' }} />
              ) : (
                <>
                  {item.name === 'created_at' ? (
                    scheduler?.[item?.name] ? (
                      <Chip
                        avatar={<MoreTimeIcon />}
                        label={getDatetime(scheduler?.[item?.name])}
                        variant="outlined"
                        size="small"
                      />
                    ) : (
                      '-'
                    )
                  ) : item.name === 'updated_at' ? (
                    scheduler?.[item?.name] ? (
                      <Chip
                        avatar={<HistoryIcon />}
                        label={getDatetime(scheduler?.[item?.name])}
                        variant="outlined"
                        size="small"
                      />
                    ) : (
                      '-'
                    )
                  ) : item.name === 'state' ? (
                    scheduler?.[item.name] ? (
                      <Chip
                        label={_.upperFirst(scheduler?.[item.name]) || ''}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderRadius: '0%',
                          backgroundColor:
                            scheduler?.[item?.name] === 'active' ? 'var(--description-color)' : 'var(--button-color)',
                          color: scheduler?.[item?.name] === 'active' ? '#FFFFFF' : '#FFFFFF',
                          borderColor:
                            scheduler?.[item?.name] === 'active' ? 'var(--description-color)' : 'var(--button-color)',
                          fontWeight: 'bold',
                        }}
                      />
                    ) : (
                      '-'
                    )
                  ) : item.name === 'features' ? (
                    scheduler?.[item?.name] ? (
                      scheduler?.[item?.name]?.map((items: string, id: any) => (
                        <Chip
                          key={id}
                          label={_.upperFirst(items) || ''}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderRadius: '0%',
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
                    )
                  ) : (
                    <Typography component="div" variant="subtitle1" className={styles.headerText}>
                      {scheduler?.[item?.name as keyof typeof scheduler] || '-'}
                    </Typography>
                  )}
                </>
              )}
            </Box>
          );
        })}
      </Card>
    </Box>
  );
}
