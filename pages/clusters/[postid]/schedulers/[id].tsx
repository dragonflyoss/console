import Layout from 'components/layout';
import { NextPageWithLayout } from '../../../_app';
import * as React from 'react';
import Paper from '@mui/material/Paper';
import { Alert, Box, Breadcrumbs, Chip, Link as RouterLink, Skeleton, Snackbar, Typography } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import HistoryIcon from '@mui/icons-material/History';
import { GetSchedulers, getInformation } from 'lib/api';
import { dateTimeFormat } from 'components/dataTime';
import styles from './index.module.scss';

const Security: NextPageWithLayout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [scheduleObject, setScheduleObject] = useState<any>({
    id: '',
    host_name: '',
    ip: '',
    SchedulerClusterID: '',
  });
  const [informationObject, setInformationObject] = useState({ Name: '', ID: '' });
  const router = useRouter();
  const { pathname } = router;
  const routerName = pathname.split('/')[1];
  const { query } = useRouter();

  useEffect(() => {
    setIsLoading(true);

    if (query.postid) {
      getInformation(query.postid).then(async (response) => {
        if (response.status === 200) {
          setInformationObject(await response.json());
        } else {
          setErrorMessage(true);
          setErrorMessageText(response.statusText);
        }
      });
    }

    if (query.id) {
      GetSchedulers(query.id).then(async (response) => {
        if (response.status === 200) {
          setScheduleObject(await response.json());
        } else {
          setErrorMessage(true);
          setErrorMessageText(response.statusText);
        }
      });
    }

    setIsLoading(false);
  }, [query.id, query.postid]);

  const SchedulerList = [
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
        <RouterLink component={Link} underline="hover" color="inherit" href={`/${routerName}`}>
          {routerName}
        </RouterLink>
        <RouterLink component={Link} underline="hover" color="inherit" href={`/${routerName}/${informationObject?.ID}`}>
          {informationObject?.Name}
        </RouterLink>
        <Typography color="text.primary" fontFamily="MabryPro-Bold">
          {scheduleObject?.host_name}
        </Typography>
      </Breadcrumbs>
      <Typography variant="h5" fontFamily="MabryPro-Bold" sx={{ pb: '1rem' }}>
        Scheduler
      </Typography>
      <Box className={styles.schedulerHeaderContainer}>
        <Paper variant="outlined" className={styles.schedulerHeaderContent}>
          <Box className={styles.schedulerHeaderTitleContainer}>
            <Box component="img" className={styles.headerIcon} src="/favicon/clusterIcon/schedulerID.svg" />
            <Typography className={styles.schedulerHeaderTitle} variant="subtitle1" component="div">
              ID
            </Typography>
          </Box>
          <Typography component="div" variant="subtitle1" fontFamily="MabryPro-Bold">
            {isLoading ? <Skeleton sx={{ width: '8rem' }} /> : scheduleObject?.id}
          </Typography>
        </Paper>
        <Paper variant="outlined" className={styles.schedulerHeaderContent}>
          <Box className={styles.schedulerHeaderTitleContainer}>
            <Box component="img" className={styles.headerIcon} src="/favicon/clusterIcon/schedulerHostname.svg" />
            <Typography className={styles.schedulerHeaderTitle} variant="subtitle1" component="div">
              Hostname
            </Typography>
          </Box>
          <Typography component="div" variant="subtitle1" fontFamily="MabryPro-Bold">
            {isLoading ? <Skeleton sx={{ width: '8rem' }} /> : scheduleObject?.host_name}
          </Typography>
        </Paper>
        <Paper variant="outlined" className={styles.schedulerHeaderContent}>
          <Box className={styles.schedulerHeaderTitleContainer}>
            <Box component="img" className={styles.headerIcon} src="/favicon/clusterIcon/schedulerIP.svg" />
            <Typography className={styles.schedulerHeaderTitle} variant="subtitle1" component="div">
              IP
            </Typography>
          </Box>
          <Typography component="div" variant="subtitle1" fontFamily="MabryPro-Bold">
            {isLoading ? <Skeleton sx={{ width: '8rem' }} /> : scheduleObject?.ip}
          </Typography>
        </Paper>
        <Paper variant="outlined" className={styles.portContent}>
          <Box className={styles.portTitleContainer}>
            <Box component="img" className={styles.headerIcon} src="/favicon/clusterIcon/clusterID.svg" />
            <Typography className={styles.portTitle} variant="subtitle1" component="div">
              Cluster ID
            </Typography>
          </Box>
          <Typography component="div" variant="subtitle1" fontFamily="MabryPro-Bold">
            {isLoading ? <Skeleton sx={{ width: '8rem' }} /> : scheduleObject?.SchedulerClusterID}
          </Typography>
        </Paper>
      </Box>
      <Paper variant="outlined" className={styles.schedulerContainer}>
        {SchedulerList.map((item) => {
          return (
            <Box key={item.label} className={styles.schedulerContent}>
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
                      label={dateTimeFormat(scheduleObject?.[item?.name] || '')}
                      variant="outlined"
                      size="small"
                    />
                  ) : item.name == 'updated_at' ? (
                    <Chip
                      avatar={<HistoryIcon />}
                      label={dateTimeFormat(scheduleObject?.[item?.name])}
                      variant="outlined"
                      size="small"
                    />
                  ) : item.name == 'state' ? (
                    <Chip
                      label={`${scheduleObject?.[item?.name]?.charAt(0).toUpperCase()}${scheduleObject?.[
                        item?.name
                      ]?.slice(1)}`}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderRadius: '0%',
                        backgroundColor: scheduleObject?.[item?.name] === 'active' ? '#2E8F79' : '#1C293A',
                        color: scheduleObject?.[item?.name] === 'active' ? '#FFFFFF' : '#FFFFFF',
                        borderColor: scheduleObject?.[item?.name] === 'active' ? '#2E8F79' : '#1C293A',
                        fontWeight: 'bold',
                      }}
                    />
                  ) : item.name == 'features' ? (
                    <>
                      {scheduleObject?.[item?.name]?.map((items: string, id: any) => (
                        <Chip
                          key={id}
                          label={`${items.charAt(0).toUpperCase()}${items.slice(1)}`}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderRadius: '0%',
                            background: '#1C293A',
                            color: '#FFFFFF',
                            mr: '0.4rem',
                            borderColor: '#1C293A',
                            fontWeight: 'bold',
                          }}
                        />
                      ))}
                    </>
                  ) : (
                    <Typography component="div" variant="subtitle1" fontFamily="MabryPro-Bold">
                      {scheduleObject?.[item?.name] || '-'}
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

export default Security;
Security.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};
