import Layout from 'components/layout';
import { NextPageWithLayout } from '../../../_app';
import * as React from 'react';
import Paper from '@mui/material/Paper';
import { Alert, Box, Breadcrumbs, Chip, Link as RouterLink, Skeleton, Snackbar, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getSeedPeerID, getClusterInformation } from 'lib/api';
import { dateTimeFormat } from 'components/dataTime';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import HistoryIcon from '@mui/icons-material/History';
import styles from './index.module.scss';
import Link from 'next/link';

const Security: NextPageWithLayout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [InformationList, setInformationList] = useState({ Name: '', ID: '' });
  const [seedPeerObject, setSeedPeerObject] = useState<any>({
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
    SeedPeerClusterID: '',
  });
  const router = useRouter();
  const { pathname } = router;
  const routerName = pathname.split('/')[1];
  const { query } = useRouter();

  useEffect(() => {
    setIsLoading(true);

    if (query.postid) {
      getClusterInformation(query.postid).then(async (response) => {
        if (response.status === 200) {
          setInformationList(await response.json());
        } else {
          setErrorMessage(true);
          setErrorMessageText(response.statusText);
        }
      });
    }

    if (query.id) {
      getSeedPeerID(query.id).then(async (response) => {
        if (response.status === 200) {
          setSeedPeerObject(await response.json());
        } else {
          setErrorMessage(true);
          setErrorMessageText(response.statusText);
        }
      });
    }

    setIsLoading(false);
  }, [query.id, query.postid]);

  const seedPeersLIst = [
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
        <RouterLink component={Link} underline="hover" color="inherit" href={`/${routerName}/${InformationList?.ID}`}>
          {InformationList?.Name}
        </RouterLink>
        <Typography color="text.primary" fontFamily="MabryPro-Bold">
          {seedPeerObject?.host_name}
        </Typography>
      </Breadcrumbs>
      <Typography variant="h5" fontFamily="MabryPro-Bold" sx={{ pb: '1rem' }}>
        Seed-Peer
      </Typography>
      <Box className={styles.container}>
        <Paper variant="outlined" className={styles.headerContainer}>
          <Box className={styles.headerContent}>
            <Box component="img" className={styles.headerIcon} src="/favicon/cluster/scheduler-id.svg" />
            <Typography className={styles.headerTitle} variant="subtitle1" component="div">
              ID
            </Typography>
          </Box>
          <Typography component="div" variant="subtitle1" fontFamily="MabryPro-Bold">
            {isLoading ? <Skeleton sx={{ width: '8rem' }} /> : seedPeerObject?.id}
          </Typography>
        </Paper>
        <Paper variant="outlined" className={styles.headerContainer}>
          <Box className={styles.headerContent}>
            <Box component="img" className={styles.headerIcon} src="/favicon/cluster/hostname.svg" />
            <Typography className={styles.headerTitle} variant="subtitle1" component="div">
              Hostname
            </Typography>
          </Box>
          <Typography component="div" variant="subtitle1" fontFamily="MabryPro-Bold">
            {isLoading ? <Skeleton sx={{ width: '8rem' }} /> : seedPeerObject?.host_name}
          </Typography>
        </Paper>
        <Paper variant="outlined" className={styles.headerContainer}>
          <Box className={styles.headerContent}>
            <Box component="img" className={styles.headerIcon} src="/favicon/cluster/scheduler-ip.svg" />
            <Typography className={styles.headerTitle} variant="subtitle1" component="div">
              IP
            </Typography>
          </Box>
          <Typography component="div" variant="subtitle1" fontFamily="MabryPro-Bold">
            {isLoading ? <Skeleton sx={{ width: '8rem' }} /> : seedPeerObject?.ip}
          </Typography>
        </Paper>
        <Paper variant="outlined" className={styles.clusterIDContaine}>
          <Box className={styles.clusterIDContent}>
            <Box component="img" className={styles.headerIcon} src="/favicon/cluster/clusterID.svg" />
            <Typography className={styles.clusterIDTitle} variant="subtitle1" component="div">
              Cluster ID
            </Typography>
          </Box>
          <Typography component="div" variant="subtitle1" fontFamily="MabryPro-Bold">
            {isLoading ? <Skeleton sx={{ width: '8rem' }} /> : seedPeerObject?.SeedPeerClusterID}
          </Typography>
        </Paper>
      </Box>
      <Paper variant="outlined" className={styles.lowerContainer}>
        {seedPeersLIst.map((item: any) => {
          return (
            <Box key={item.label} className={styles.lowerContent}>
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
                      label={dateTimeFormat(seedPeerObject?.[item.name])}
                      variant="outlined"
                      size="small"
                    />
                  ) : item.name == 'updated_at' ? (
                    <Chip
                      avatar={<HistoryIcon />}
                      label={dateTimeFormat(seedPeerObject[item.name])}
                      variant="outlined"
                      size="small"
                    />
                  ) : item.name == 'state' ? (
                    <Chip
                      label={`${seedPeerObject?.[item.name]?.charAt(0).toUpperCase()}${seedPeerObject?.[
                        item.name
                      ]?.slice(1)}`}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderRadius: '0%',
                        backgroundColor: seedPeerObject?.[item.name] === 'active' ? '#2E8F79' : '#1C293A',
                        color: seedPeerObject?.[item.name] === 'active' ? '#FFFFFF' : '#FFFFFF',
                        borderColor: seedPeerObject?.[item.name] === 'active' ? '#2E8F79' : '#1C293A',
                        fontWeight: 'bold',
                      }}
                    />
                  ) : item.name == 'type' ? (
                    <Typography component="div" variant="subtitle1" fontFamily="MabryPro-Bold">
                      {`${seedPeerObject?.[item.name]?.charAt(0).toUpperCase()}${seedPeerObject?.[item.name]?.slice(
                        1,
                      )}`}
                    </Typography>
                  ) : (
                    <Typography component="div" variant="subtitle1" fontFamily="MabryPro-Bold">
                      {seedPeerObject?.[item.name] || '-'}
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
