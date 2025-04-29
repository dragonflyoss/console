import {
  Breadcrumbs,
  Typography,
  Box,
  Skeleton,
  Chip,
  Link as RouterLink,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  Snackbar,
  Alert,
  Paper,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getPersistentCacheTask, getPersistentCacheTasksResponse } from '../../../../lib/api';
import Card from '../../../card';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import { ReactComponent as ID } from '../../../../assets/images/job/preheat/id.svg';
import { ReactComponent as Status } from '../../../../assets/images/job/preheat/status.svg';
import { ReactComponent as Tag } from '../../../../assets/images/resource/persistent-cache-task/detail-tag.svg';
import { ReactComponent as Application } from '../../../../assets/images/resource/persistent-cache-task/detail-application.svg';
import { ReactComponent as PersistentReplicaCount } from '../../../../assets/images/resource/persistent-cache-task/detail-persistent-replica-count.svg';
import { ReactComponent as PieceLength } from '../../../../assets/images/resource/persistent-cache-task/detail-piece-length.svg';
import { ReactComponent as CreatedAt } from '../../../../assets/images/resource/persistent-cache-task/create-at.svg';
import { ReactComponent as ContentLength } from '../../../../assets/images/resource/persistent-cache-task/detail-content-length.svg';
import { ReactComponent as TotalPieceLength } from '../../../../assets/images/resource/persistent-cache-task/tab-total-piece-length.svg';
// import { ReactComponent as PersistentReplicaCount } from '../../../../assets/images/resource/persistent-cache-task/tab-persistent-replica-count.svg';

import { formatSize, getDatetime } from '../../../../lib/utils';
import styles from './show.module.css';
import _ from 'lodash';

export default function PersistentCachetask() {
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [persistentCacheTask, setPersistentCacheTask] = useState<getPersistentCacheTasksResponse>();

  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    (async function () {
      try {
        const clusterID = location?.pathname.split('/')[4];

        if (clusterID && params?.id) {
          const persistentCacheTask = await getPersistentCacheTask(params?.id, { scheduler_cluster_id: clusterID });
          setPersistentCacheTask(persistentCacheTask);
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
        }
      }
    })();
  }, [navigate, params?.id, location?.pathname]);

  const peers = [
    {
      block_parents: ['<string>', '<string>'],
      cost: 9223372036854776000,
      created_at: '<string>',
      finished_pieces: {},
      host: {
        announce_interval: 3600000000000,
        build: {
          git_commit: '<string>',
          git_version: '<string>',
          go_version: '<string>',
          platform: '<string>',
        },
        cpu: {
          logical_count: '<integer>',
          percent: 69,
          physical_count: '<integer>',
          process_percent: '<number>',
          times: {
            guest: '<number>',
            guest_nice: '<number>',
            idle: '<number>',
            iowait: '<number>',
            irq: '<number>',
            nice: '<number>',
            softirq: '<number>',
            steal: '<number>',
            system: '<number>',
            user: '<number>',
          },
        },
        created_at: '<string>',
        disable_shared: '<boolean>',
        disk: {
          free: '<integer>',
          inodes_free: '<integer>',
          inodes_total: '<integer>',
          inodes_used: '<integer>',
          inodes_used_percent: '<number>',
          read_bandwidth: '<integer>',
          total: '<integer>',
          used: 21474836480,
          used_percent: '<number>',
          write_bandwidth: '<integer>',
        },
        download_port: 4000,
        hostname: 'hostname-1',
        id: '<string>',
        ip: '10.244.3.8',
        kernel_version: '<string>',
        memory: {
          available: '<integer>',
          free: '<integer>',
          process_used_percent: '<number>',
          total: '<integer>',
          used: 122,
          used_percent: '<number>',
        },
        network: {
          download_rate: 1000,
          download_rate_limit: '<integer>',
          idc: '<string>',
          location: '<string>',
          tcp_connection_count: '<integer>',
          upload_rate: '<integer>',
          upload_rate_limit: '<integer>',
          upload_tcp_connection_count: '<integer>',
        },
        os: 'Linux',
        platform: 'Linux',
        platform_family: '<string>',
        platform_version: '<string>',
        port: 4001,
        scheduler_cluster_id: '<integer>',
        type: 'super',
        updated_at: '<string>',
      },
      id: '1',
      persistent: false,
      state: 'Succeeded',
      updated_at: '<string>',
    },
    {
      block_parents: ['<string>', '<string>'],
      cost: 1000,
      created_at: '<string>',
      finished_pieces: {},
      host: {
        announce_interval: 3600000000000,
        build: {
          git_commit: '<string>',
          git_version: '<string>',
          go_version: '<string>',
          platform: '<string>',
        },
        cpu: {
          logical_count: '<integer>',
          percent: '<number>',
          physical_count: '<integer>',
          process_percent: '<number>',
          times: {
            guest: '<number>',
            guest_nice: '<number>',
            idle: '<number>',
            iowait: '<number>',
            irq: '<number>',
            nice: '<number>',
            softirq: '<number>',
            steal: '<number>',
            system: '<number>',
            user: '<number>',
          },
        },
        created_at: '<string>',
        disable_shared: '<boolean>',
        disk: {
          free: '<integer>',
          inodes_free: '<integer>',
          inodes_total: '<integer>',
          inodes_used: '<integer>',
          inodes_used_percent: '<number>',
          read_bandwidth: '<integer>',
          total: '<integer>',
          used: '<integer>',
          used_percent: '<number>',
          write_bandwidth: '<integer>',
        },
        download_port: '<integer>',
        hostname: '<string>',
        id: '<string>',
        ip: '<string>',
        kernel_version: '<string>',
        memory: {
          available: '<integer>',
          free: '<integer>',
          process_used_percent: '<number>',
          total: '<integer>',
          used: '<integer>',
          used_percent: '<number>',
        },
        network: {
          download_rate: '<integer>',
          download_rate_limit: '<integer>',
          idc: '<string>',
          location: '<string>',
          tcp_connection_count: '<integer>',
          upload_rate: '<integer>',
          upload_rate_limit: '<integer>',
          upload_tcp_connection_count: '<integer>',
        },
        os: '<string>',
        platform: '<string>',
        platform_family: '<string>',
        platform_version: '<string>',
        port: '<integer>',
        scheduler_cluster_id: '<integer>',
        type: '<string>',
        updated_at: '<string>',
      },
      id: '1',
      persistent: true,
      state: 'succeeded',
      updated_at: '<string>',
    },
  ];

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorMessage(false);
  };

  return (
    <div>
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
      <Typography variant="h5" mb="1rem">
        Persistent Cache Tasks
      </Typography>
      <Breadcrumbs
        separator={
          <Box
            sx={{ width: '0.3rem', height: '0.3rem', backgroundColor: '#919EAB', borderRadius: '50%', m: '0 0.4rem' }}
          />
        }
        aria-label="breadcrumb"
        sx={{ mb: '1.5rem' }}
      >
        <Typography color="text.primary">Resource</Typography>
        <RouterLink component={Link} underline="hover" color="text.primary" to={`/resource/persistent-cache-task`}>
          Persistent Cache Task
        </RouterLink>
        {params?.id ? (
          <RouterLink
            component={Link}
            underline="hover"
            color="text.primary"
            to={`/resource/persistent-cache-task/clusters/${location?.pathname.split('/')[4]}`}
          >
            scheduler-cluster-{location?.pathname.split('/')[4]}
          </RouterLink>
        ) : (
          ''
        )}
        {params?.id ? <Typography color="inherit">{params?.id || '-'}</Typography> : ''}
      </Breadcrumbs>
      <Card className={styles.container}>
        <Box p="1.5rem">
          {/* <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" fontFamily="mabry-bold" mr="1rem">
              Detail
            </Typography>
           
          </Box> */}
          <Box className={styles.statusContent}>
            {isLoading ? (
              <Skeleton data-testid="preheat-isloading" sx={{ width: '4rem' }} />
            ) : persistentCacheTask?.state ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '0.3rem',
                  p: '0.2rem 0.5rem',
                  backgroundColor:
                    persistentCacheTask?.state === 'Succeeded'
                      ? 'var(--palette-grey-background-color)'
                      : 'rgba(255 86 48 /0.16)',
                  color: persistentCacheTask?.state === 'Succeeded' ? 'var(--palette-text-color)' : '#D42536',
                }}
                id="status"
              >
                <Box
                  sx={{
                    width: '0.4rem',
                    height: '0.4rem',
                    backgroundColor:
                      persistentCacheTask?.state === 'Succeeded' ? 'var(--palette-text-color)' : '#D42536',
                    borderRadius: '50%',
                    mr: '0.6rem',
                    mb: '0.1rem',
                  }}
                />
                <Typography variant="body2" fontFamily="mabry-bold">
                  {(persistentCacheTask?.state &&
                    (persistentCacheTask?.state === 'Succeeded' ? 'SUCCESS' : 'FAILURE')) ||
                    ''}
                </Typography>
              </Box>
            ) : (
              '-'
            )}
          </Box>
          <Typography id="id" variant="body1" className={styles.idContent}>
            {isLoading ? (
              <Skeleton data-testid="preheat-isloading" sx={{ width: '2rem' }} />
            ) : (
              persistentCacheTask?.id || 0
            )}
          </Typography>
        </Box>
        <Divider
          sx={{
            borderStyle: 'dashed',
            borderColor: 'var(--palette-palette-divider)',
            borderWidth: '0px 0px thin',
          }}
        />
        <Box className={styles.informationWrapper}>
          <Box className={styles.informationContainer}>
            <Box className={styles.informationTitle}>
              <Application className={styles.informationTitleIcon} />
              <Box className={styles.informationContentWrapper}>
                <Typography variant="body2" component="div" className={styles.informationTitleText}>
                  Application
                </Typography>
                <Box className={styles.informationContent} sx={{ display: 'flex', flexWrap: 'wrap' }}>
                  <Typography id="application" variant="body1" className={styles.informationContent}>
                    {isLoading ? (
                      <Skeleton data-testid="execution-isloading" sx={{ width: '4rem' }} />
                    ) : (
                      persistentCacheTask?.application || '-'
                    )}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
          <Box className={styles.informationContainer}>
            <Box className={styles.informationTitle}>
              <Tag className={styles.informationTitleIcon} />
              <Box className={styles.informationContentWrapper}>
                <Typography variant="body2" component="div" className={styles.informationTitleText}>
                  Tag
                </Typography>
                <Box className={styles.informationContent}>
                  {isLoading ? (
                    <Skeleton data-testid="execution-isloading" sx={{ width: '4rem' }} />
                  ) : persistentCacheTask?.tag ? (
                    <Chip
                      id="tag"
                      label={persistentCacheTask?.tag}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderRadius: '0.3rem',
                        background: 'var(--palette-button-color)',
                        color: '#FFFFFF',
                        mr: '0.4rem',
                        borderColor: 'var(--palette-button-color)',
                        fontWeight: 'bold',
                      }}
                    />
                  ) : (
                    <Typography id="tag" variant="body1" className={styles.informationContent}>
                      -
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
          <Box className={styles.informationContainer}>
            <Box className={styles.informationTitle}>
              <TotalPieceLength className={styles.informationTitleIcon} />
              <Box className={styles.informationContentWrapper}>
                <Typography variant="body2" component="div" className={styles.informationTitleText}>
                  Total Piece Length
                </Typography>
                <Typography id="piece-length" variant="body1" className={styles.informationContent}>
                  {isLoading ? <Skeleton sx={{ width: '4rem' }} /> : persistentCacheTask?.total_piece_count || '-'}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box className={styles.informationContainer}>
            <Box className={styles.informationTitle}>
              <PersistentReplicaCount className={styles.informationTitleIcon} />
              <Box className={styles.informationContentWrapper}>
                <Typography variant="body2" component="div" className={styles.informationTitleText}>
                  Persistent Replica Count
                </Typography>
                <Typography id="piece-length" variant="body1" className={styles.informationContent}>
                  {isLoading ? (
                    <Skeleton sx={{ width: '4rem' }} />
                  ) : (
                    persistentCacheTask?.persistent_replica_count || '-'
                  )}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box className={styles.informationContainer}>
            <Box className={styles.informationTitle}>
              <PieceLength className={styles.informationTitleIcon} />
              <Box className={styles.informationContentWrapper}>
                <Typography variant="body2" component="div" className={styles.informationTitleText}>
                  Piece Length
                </Typography>
                <Typography id="piece-length" variant="body1" className={styles.informationContent}>
                  {isLoading ? (
                    <Skeleton sx={{ width: '4rem' }} />
                  ) : persistentCacheTask?.piece_length ? (
                    `${Number(persistentCacheTask?.piece_length) / 1024 / 1024} MiB`
                  ) : (
                    '-'
                  )}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box className={styles.informationContainer}>
            <Box className={styles.informationTitle}>
              <ContentLength className={styles.informationTitleIcon} />
              <Box className={styles.informationContentWrapper}>
                <Typography variant="body2" component="div" className={styles.informationTitleText}>
                  Content Length
                </Typography>
                <Typography id="piece-length" variant="body1" className={styles.informationContent}>
                  {isLoading ? (
                    <Skeleton sx={{ width: '4rem' }} />
                  ) : persistentCacheTask?.piece_length ? (
                    formatSize(String(persistentCacheTask?.content_length))
                  ) : (
                    '-'
                  )}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box className={styles.informationContainer}>
            <Box className={styles.informationTitle}>
              <CreatedAt className={styles.informationTitleIcon} />
              <Box className={styles.informationContentWrapper}>
                <Typography variant="body2" component="div" className={styles.informationTitleText}>
                  Created At
                </Typography>{' '}
                {isLoading ? (
                  <Skeleton data-testid="preheat-isloading" sx={{ width: '4rem' }} />
                ) : persistentCacheTask?.created_at ? (
                  // <Chip
                  //   id="created-at"
                  //   avatar={<MoreTimeIcon />}
                  //   label={getDatetime(persistentCacheTask?.created_at)}
                  //   variant="outlined"
                  //   size="small"
                  // />

                  <Typography id="created-at" variant="body1" className={styles.informationContent}>
                    {getDatetime(persistentCacheTask?.created_at)}
                  </Typography>
                ) : (
                  <Typography id="created-at" variant="body1" className={styles.informationContent}>
                    -
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
        <Divider
          sx={{
            borderStyle: 'dashed',
            borderColor: 'var(--palette-palette-divider)',
            borderWidth: '0px 0px thin',
          }}
        />
        <Box p="1.5rem">
          <Typography variant="h6" fontFamily="mabry-bold" mb="1rem">
            Peers
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              backgroundColor: 'var(--palette-background-paper)',
              // boxShadow: 'var(--palette-card-box-shadow)',
              // borderRadius: '0.6rem',
              // transition: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 0,
              color: 'var(--palette-color)',
              backgroundImage: 'none',
              overflow: 'hidden',
            }}
          >
            <Table sx={{ minWidth: 650 }} aria-label="a dense table" id="seed-peer-table">
              <TableHead sx={{ backgroundColor: 'var(--palette-table-title-color)' }}>
                <TableRow>
                  <TableCell align="center" className={styles.tableHeader}>
                    <Typography variant="subtitle1" className={styles.tableHeaderText}>
                      ID
                    </Typography>
                  </TableCell>
                  <TableCell align="center" className={styles.tableHeader}>
                    <Typography variant="subtitle1" className={styles.tableHeaderText}>
                      Hostname
                    </Typography>
                  </TableCell>
                  <TableCell align="center" className={styles.tableHeader}>
                    <Typography variant="subtitle1" className={styles.tableHeaderText}>
                      OS
                    </Typography>
                  </TableCell>
                  <TableCell align="center" className={styles.tableHeader}>
                    <Typography variant="subtitle1" className={styles.tableHeaderText}>
                      Platform
                    </Typography>
                  </TableCell>
                  <TableCell align="center" className={styles.tableHeader}>
                    <Typography variant="subtitle1" className={styles.tableHeaderText}>
                      Persistent
                    </Typography>
                  </TableCell>
                  <TableCell align="center" className={styles.tableHeader}>
                    <Typography variant="subtitle1" className={styles.tableHeaderText}>
                      Type
                    </Typography>
                  </TableCell>
                  <TableCell align="center" className={styles.tableHeader}>
                    <Typography variant="subtitle1" className={styles.tableHeaderText}>
                      IP
                    </Typography>
                  </TableCell>
                  <TableCell align="center" className={styles.tableHeader}>
                    <Typography variant="subtitle1" className={styles.tableHeaderText}>
                      Port
                    </Typography>
                  </TableCell>
                  <TableCell align="center" className={styles.tableHeader}>
                    <Typography variant="subtitle1" className={styles.tableHeaderText}>
                      Download port
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody id="seed-peer-table-body">
                {Array.isArray(peers) &&
                  peers.map((item: any) => {
                    return (
                      <TableRow
                        key={item?.id}
                        //   selected={seedPeerSelectedRow === item}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                          ':hover': { backgroundColor: 'var(--palette-action-hover)' },
                        }}
                        className={styles.tableRow}
                      >
                        <TableCell id={`id-${item?.id}`} align="center">
                          {item?.id}
                        </TableCell>
                        <TableCell id={`hostname-${item?.host_name}`} align="center">
                          {item?.host?.hostname}
                        </TableCell>
                        <TableCell id={`ip-${item?.id}`} align="center">
                          {item?.host?.os}
                        </TableCell>
                        <TableCell id={`download-port-${item?.id}`} align="center">
                          {item?.host?.platform}
                        </TableCell>
                        <TableCell id={`type-${item?.id}`} align="center">
                          <Chip
                            id="tag"
                            label={item?.persistent ? 'Yes' : 'No'}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderRadius: '0.3rem',
                              background: item?.persistent
                                ? 'var(--palette-description-color)'
                                : 'var(--palette-table-title-text-color)',
                              color: '#FFFFFF',
                              mr: '0.4rem',
                              // borderColor: 'var(--palette-button-color)',
                              border: 'none',
                              fontWeight: 'bold',
                            }}
                          />
                        </TableCell>
                        <TableCell id={`state-${item?.id}`} align="center">
                          {_.upperFirst(item?.host?.type)}
                        </TableCell>
                        <TableCell id={`state-${item?.id}`} align="center">
                          {item?.host?.ip}
                        </TableCell>

                        <TableCell id={`port-${item?.id}`} align="center">
                          {item?.host?.port}
                        </TableCell>
                        <TableCell id={`state-${item?.id}`} align="center">
                          {item?.host?.download_port}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      </Card>
    </div>
  );
}
