import * as React from 'react';
import Paper from '@mui/material/Paper';
import { Alert, Box, Breadcrumbs, Chip, Link as RouterLink, Skeleton, Snackbar, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import HistoryIcon from '@mui/icons-material/History';
import { getScheduler } from '../../lib/api';
import { getDatetime } from '../../lib/utils';
import styles from './show.module.css';
import _ from 'lodash';
import { useParams, Link } from 'react-router-dom';

export default function Schedulers() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [schedule, setSchedule] = useState({
    id: 0,
    host_name: '',
    ip: '',
    scheduler_cluster_id: 0,
    port: '',
    state: '',
    idc: '',
    features: [''],
    location: '',
    created_at: '',
    updated_at: '',
  });

  const params = useParams();

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
          const response = await getScheduler(params.id);
          setSchedule(response);
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
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: '1rem' }}>
        <RouterLink component={Link} underline="hover" color="inherit" to={`/clusters`}>
          clusters
        </RouterLink>
        <RouterLink
          component={Link}
          underline="hover"
          color="inherit"
          to={`/clusters/${schedule.scheduler_cluster_id}`}
        >
          {`scheduler-cluster-${schedule.scheduler_cluster_id}`}
        </RouterLink>
        <Typography color="text.primary">schedulers</Typography>
        <Typography color="text.primary" fontFamily="mabry-bold">
          {schedule?.host_name}
        </Typography>
      </Breadcrumbs>
      <Typography variant="h5" fontFamily="mabry-bold" sx={{ pb: '1rem' }}>
        Scheduler
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
            {isLoading ? <Skeleton sx={{ width: '8rem' }} /> : schedule?.id || '-'}
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
            {isLoading ? <Skeleton sx={{ width: '8rem' }} /> : schedule?.host_name || '-'}
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
            {isLoading ? <Skeleton sx={{ width: '8rem' }} /> : schedule?.ip}
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
            {isLoading ? <Skeleton sx={{ width: '8rem' }} /> : schedule?.scheduler_cluster_id}
          </Typography>
        </Paper>
      </Box>
      <Paper variant="outlined" className={styles.schedulerContainer}>
        {schedulerLabel.map((item) => {
          return (
            <Box key={item.label} className={styles.lschedulerContent}>
              <Typography variant="subtitle1" component="div" mb="1rem">
                {item.label}
              </Typography>
              {isLoading ? (
                <Skeleton sx={{ width: '80%' }} />
              ) : (
                <>
                  {item.name === 'created_at' ? (
                    <Chip
                      avatar={<MoreTimeIcon />}
                      label={getDatetime(schedule?.[item?.name] || '')}
                      variant="outlined"
                      size="small"
                    />
                  ) : item.name === 'updated_at' ? (
                    <Chip
                      avatar={<HistoryIcon />}
                      label={getDatetime(schedule?.[item?.name])}
                      variant="outlined"
                      size="small"
                    />
                  ) : item.name === 'state' ? (
                    <Chip
                      label={_.upperFirst(schedule?.[item.name]) || ''}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderRadius: '0%',
                        backgroundColor:
                          schedule?.[item?.name] === 'active' ? 'var(--description-color)' : 'var(--button-color)',
                        color: schedule?.[item?.name] === 'active' ? '#FFFFFF' : '#FFFFFF',
                        borderColor:
                          schedule?.[item?.name] === 'active' ? 'var(--description-color)' : 'var(--button-color)',
                        fontWeight: 'bold',
                      }}
                    />
                  ) : item.name === 'features' ? (
                    <>
                      {schedule?.[item?.name]?.map((items: string, id: any) => (
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
                      ))}
                    </>
                  ) : (
                    <Typography component="div" variant="subtitle1" fontFamily="mabry-bold">
                      {schedule?.[item?.name as keyof typeof schedule] || '-'}
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
