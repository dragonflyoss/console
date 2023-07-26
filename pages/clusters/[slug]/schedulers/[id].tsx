import Layout from 'components/layout';
import { NextPageWithLayout } from '../../../_app';
import * as React from 'react';
import Paper from '@mui/material/Paper';
import { Alert, Box, Breadcrumbs, Chip, Link as RouterLink, Skeleton, Snackbar, Typography } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactElement, useEffect, useState } from 'react';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import HistoryIcon from '@mui/icons-material/History';
import { getSchedulerID, getCluster } from 'lib/api';
import { datetime } from 'lib/utils';
import styles from './index.module.css';

const Scheduler: NextPageWithLayout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [cluster, setCluster] = useState({ name: '', id: '' });
  const [schedule, setSchedule] = useState({
    id: '',
    host_name: '',
    ip: '',
    SchedulerClusterID: '',
    port: '',
    state: '',
    idc: '',
    features: [],
    lcoation: '',
    created_at: '',
    updated_at: '',
  });
  const { query } = useRouter();

  const schedulerLabel = [
    {
      label: 'Port',
      name: 'port',
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
      setIsLoading(true);
      try {
        if (typeof query.slug === 'string' && typeof query.id === 'string') {
          const [getClusters, getSchedulers] = await Promise.all([getCluster(query.slug), getSchedulerID(query.id)]);

          setCluster(await getClusters.json());
          setSchedule(await getSchedulers.json());
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
        <Paper variant="outlined" className={styles.clusterIdContaine}>
          <Box className={styles.clusterIdContent}>
            <Box component="img" className={styles.headerIcon} src="/icons/cluster/cluster-id.svg" />
            <Typography className={styles.clusterIdTitle} variant="subtitle1" component="div">
              Cluster ID
            </Typography>
          </Box>
          <Typography component="div" variant="subtitle1" fontFamily="mabry-bold">
            {isLoading ? <Skeleton sx={{ width: '8rem' }} /> : schedule?.SchedulerClusterID}
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
                  {item.name == 'created_at' ? (
                    <Chip
                      avatar={<MoreTimeIcon />}
                      label={datetime(schedule?.[item?.name] || '')}
                      variant="outlined"
                      size="small"
                    />
                  ) : item.name == 'updated_at' ? (
                    <Chip
                      avatar={<HistoryIcon />}
                      label={datetime(schedule?.[item?.name])}
                      variant="outlined"
                      size="small"
                    />
                  ) : item.name == 'state' ? (
                    <Chip
                      label={`${schedule?.[item.name]?.charAt(0).toUpperCase()}${schedule?.[item.name]?.slice(1)}`}
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
                  ) : item.name == 'features' ? (
                    <>
                      {schedule?.[item?.name]?.map((items: string, id: any) => (
                        <Chip
                          key={id}
                          label={`${items.charAt(0).toUpperCase()}${items.slice(1)}`}
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
};

export default Scheduler;

Scheduler.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
