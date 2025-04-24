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
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getPersistentCacheTask, getPersistentCacheTasksResponse } from '../../../../../lib/api';
import Card from '../../../../card';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import { ReactComponent as ID } from '../../../../../assets/images/job/preheat/id.svg';
import { ReactComponent as Status } from '../../../../../assets/images/job/preheat/status.svg';
import { ReactComponent as Tag } from '../../../../../assets/images/job/preheat/tag.svg';
import { ReactComponent as Application } from '../../../../../assets/images/job/task/type.svg';
import { ReactComponent as PieceLength } from '../../../../../assets/images/job/preheat/piece-length.svg';
import { ReactComponent as CreatedAt } from '../../../../../assets/images/job/preheat/created-at.svg';
import { ReactComponent as ContentLength } from '../../../../../assets/images/job/resource/persistent-cache-task/tab-content-length.svg';
import { ReactComponent as TotalPieceLength } from '../../../../../assets/images/job/resource/persistent-cache-task/tab-total-piece-length.svg';
import { ReactComponent as PersistentReplicaCount } from '../../../../../assets/images/job/resource/persistent-cache-task/tab-persistent-replica-count.svg';

import { formatSize, getDatetime } from '../../../../../lib/utils';
import styles from './show.module.css';
import _ from 'lodash';

export default function PersistentCachetask() {
  const [errorMessage, setErrorMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [persistentCacheTask, setPersistentCacheTask] = useState<getPersistentCacheTasksResponse>();

  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    (async function () {
      try {
        const clusterID = localStorage.getItem('cluster-id');
        if (clusterID) {
          if (params?.id) {
            const persistentCacheTask = await getPersistentCacheTask(params?.id, { scheduler_cluster_id: clusterID });
            setPersistentCacheTask(persistentCacheTask);
          }
        } else {
          navigate('/jobs/resource/persistent-cache-task');
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
        }
      }
    })();
  });

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
          used: 203111,
          used_percent: '<number>',
          write_bandwidth: '<integer>',
        },
        download_port: '<integer>',
        hostname: 'hostname',
        id: '<string>',
        ip: '<string>',
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
          download_rate: 1000000,
          download_rate_limit: '<integer>',
          idc: '<string>',
          location: '<string>',
          tcp_connection_count: '<integer>',
          upload_rate: '<integer>',
          upload_rate_limit: '<integer>',
          upload_tcp_connection_count: '<integer>',
        },
        os: 'Linux',
        platform: 'max',
        platform_family: '<string>',
        platform_version: '<string>',
        port: 8001,
        scheduler_cluster_id: '<integer>',
        type: '<string>',
        updated_at: '<string>',
      },
      id: '1',
      persistent: '<boolean>',
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
      persistent: '<boolean>',
      state: 'succeeded',
      updated_at: '<string>',
    },
  ];

  return (
    <div>
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
        sx={{ mb: '1rem' }}
      >
        <Typography color="text.primary">Job</Typography>
        <Typography color="text.primary">Resource</Typography>
        <RouterLink component={Link} underline="hover" color="text.primary" to={`/jobs/resource/persistent-cache-task`}>
          Persistent Cache Task
        </RouterLink>
        {params?.id ? <Typography color="inherit">{params?.id || '-'}</Typography> : ''}
      </Breadcrumbs>

      <Card className={styles.container}>
        <Box className={styles.informationContainer}>
          <Box className={styles.informationTitle}>
            <ID className={styles.informationTitleIcon} />
            <Typography variant="body1" fontFamily="mabry-bold" component="div" className={styles.informationTitleText}>
              ID
            </Typography>
          </Box>
          <Typography id="id" variant="body1" className={styles.informationContent}>
            {isLoading ? (
              <Skeleton data-testid="preheat-isloading" sx={{ width: '2rem' }} />
            ) : (
              persistentCacheTask?.id || 0
            )}
          </Typography>
        </Box>
        <Box className={styles.informationContainer}>
          <Box className={styles.informationTitle}>
            <Status className={styles.informationTitleIcon} />
            <Typography variant="body1" fontFamily="mabry-bold" component="div" className={styles.informationTitleText}>
              Status
            </Typography>
          </Box>
          <Box className={styles.statusContent}>
            {isLoading ? (
              <Skeleton data-testid="preheat-isloading" sx={{ width: '4rem' }} />
            ) : persistentCacheTask?.state ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '2rem',
                    borderRadius: '0.3rem',
                    p: '0.4rem 0.6rem',

                    backgroundColor: persistentCacheTask?.state === 'Succeeded' ? '#228B22' : '#D42536',
                  }}
                  id="status"
                >
                  <Typography
                    variant="body2"
                    fontFamily="mabry-bold"
                    sx={{
                      color: '#FFF',
                    }}
                  >
                    {persistentCacheTask?.state || ''}
                  </Typography>
                </Box>
              </Box>
            ) : (
              '-'
            )}
          </Box>
        </Box>
        <Box className={styles.informationContainer}>
          <Box className={styles.informationTitle}>
            <Tag className={styles.informationTitleIcon} />
            <Typography variant="body1" component="div" className={styles.informationTitleText}>
              Tag
            </Typography>
          </Box>
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
        <Box className={styles.informationContainer}>
          <Box className={styles.informationTitle}>
            <Application className={styles.informationTitleIcon} />
            <Typography variant="body1" component="div" className={styles.informationTitleText}>
              Application
            </Typography>
          </Box>
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
        <Box className={styles.informationContainer}>
          <Box className={styles.informationTitle}>
            <PieceLength className={styles.informationTitleIcon} />
            <Typography variant="body1" fontFamily="mabry-bold" component="div" className={styles.informationTitleText}>
              Piece Length
            </Typography>
          </Box>
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
        <Box className={styles.informationContainer}>
          <Box className={styles.informationTitle}>
            <ContentLength className={styles.informationTitleIcon} />
            <Typography variant="body1" fontFamily="mabry-bold" component="div" className={styles.informationTitleText}>
              Content Length
            </Typography>
          </Box>
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
        <Box className={styles.informationContainer}>
          <Box className={styles.informationTitle}>
            <TotalPieceLength className={styles.informationTitleIcon} />
            <Typography variant="body1" fontFamily="mabry-bold" component="div" className={styles.informationTitleText}>
              Total Piece Length
            </Typography>
          </Box>
          <Typography id="piece-length" variant="body1" className={styles.informationContent}>
            {isLoading ? <Skeleton sx={{ width: '4rem' }} /> : persistentCacheTask?.total_piece_count || '-'}
          </Typography>
        </Box>
        <Box className={styles.informationContainer}>
          <Box className={styles.informationTitle}>
            <PersistentReplicaCount className={styles.informationTitleIcon} />
            <Typography variant="body1" fontFamily="mabry-bold" component="div" className={styles.informationTitleText}>
              Persistent Replica Count
            </Typography>
          </Box>
          <Typography id="piece-length" variant="body1" className={styles.informationContent}>
            {isLoading ? <Skeleton sx={{ width: '4rem' }} /> : persistentCacheTask?.persistent_replica_count || '-'}
          </Typography>
        </Box>
        <Box className={styles.informationContainer}>
          <Box className={styles.informationTitle}>
            <CreatedAt className={styles.informationTitleIcon} />
            <Typography variant="body1" fontFamily="mabry-bold" component="div" className={styles.informationTitleText}>
              Created At
            </Typography>
          </Box>
          {isLoading ? (
            <Skeleton data-testid="preheat-isloading" sx={{ width: '4rem' }} />
          ) : persistentCacheTask?.created_at ? (
            <Chip
              id="created-at"
              avatar={<MoreTimeIcon />}
              label={getDatetime(persistentCacheTask?.created_at)}
              variant="outlined"
              size="small"
            />
          ) : (
            <Typography id="created-at" variant="body1" className={styles.informationContent}>
              -
            </Typography>
          )}
        </Box>
      </Card>

      <Typography variant="h6" fontFamily="mabry-bold" m="2.5rem 0 1.5rem 0">
        Peers
      </Typography>
      <Card>
        <Box width="100%">
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
                    os
                  </Typography>
                </TableCell>
                <TableCell align="center" className={styles.tableHeader}>
                  <Typography variant="subtitle1" className={styles.tableHeaderText}>
                    port
                  </Typography>
                </TableCell>
                <TableCell align="center" className={styles.tableHeader}>
                  <Typography variant="subtitle1" className={styles.tableHeaderText}>
                    platform
                  </Typography>
                </TableCell>

                <TableCell align="center" className={styles.tableHeader}>
                  <Typography variant="subtitle1" className={styles.tableHeaderText}>
                    cpu
                  </Typography>
                </TableCell>
                <TableCell align="center" className={styles.tableHeader}>
                  <Typography variant="subtitle1" className={styles.tableHeaderText}>
                    Disk used
                  </Typography>
                </TableCell>
                <TableCell align="center" className={styles.tableHeader}>
                  <Typography variant="subtitle1" className={styles.tableHeaderText}>
                    memory used
                  </Typography>
                </TableCell>
                <TableCell align="center" className={styles.tableHeader}>
                  <Typography variant="subtitle1" className={styles.tableHeaderText}>
                    network download rate
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
                        <RouterLink
                          component={Link}
                          to={`/clusters/${params.id}/seed-peers/${item?.id}`}
                          underline="hover"
                          color="var(--palette-description-color)"
                        >
                          {item?.host?.hostname}
                        </RouterLink>
                      </TableCell>
                      <TableCell id={`ip-${item?.id}`} align="center">
                        {item?.host?.os}
                      </TableCell>
                      <TableCell id={`port-${item?.id}`} align="center">
                        {item?.host?.port}
                      </TableCell>
                      <TableCell id={`download-port-${item?.id}`} align="center">
                        {item?.host?.platform}
                      </TableCell>
                      <TableCell id={`type-${item?.id}`} align="center">
                        {/* {_.upperFirst(item?.type) || ''} */}
                        {item?.host?.cpu?.percent}%
                      </TableCell>
                      <TableCell id={`state-${item?.id}`} align="center">
                        {item?.host?.disk?.used}
                      </TableCell>
                      <TableCell id={`state-${item?.id}`} align="center">
                        {item?.host?.memory?.used}
                      </TableCell>
                      <TableCell id={`state-${item?.id}`} align="center">
                        {item?.host?.network?.download_rate}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </Box>
      </Card>
    </div>
  );
}
