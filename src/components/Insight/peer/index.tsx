import {
  Box,
  Button,
  Paper,
  Typography,
  Divider,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  Breadcrumbs,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  LinearProgress,
  createTheme,
  ThemeProvider,
  Skeleton,
  Snackbar,
  Alert,
  Tooltip as MuiTooltip,
  Chip,
} from '@mui/material';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Chart,
} from 'chart.js';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Bar, Pie } from 'react-chartjs-2';
import { getPeers, getPeersResponse } from '../../../lib/api';
import GetAppIcon from '@mui/icons-material/GetApp';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useEffect, useMemo, useState } from 'react';
import { MAX_PAGE_SIZE } from '../../../lib/constants';
import styles from './inde.module.css';
import { LoadingButton } from '@mui/lab';
import { exportCSVFile } from '../../../lib/utils';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);
Chart.defaults.font.family = 'mabry-light';

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1135,
      xl: 1441,
    },
  },
  palette: {
    secondary: {
      main: '#2E8F79',
    },
    primary: {
      main: '#1C293A',
    },
  },
});

export default function Peer() {
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [peer, setPeer] = useState<getPeersResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openExport, setOpenExport] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);
  const [cluster, setCluster] = useState([{ name: '', count: 0 }]);
  const [gitVersion, setGitVersion] = useState([{ name: '', count: 0 }]);
  const [gitCommit, setGitCommit] = useState([{ name: '', count: 0 }]);
  const [clusterActive, setClusterActive] = useState(0);
  const [gitVersionActive, setGitVersionActive] = useState(0);
  const [gitCommitActive, setGitCommitActive] = useState(0);
  const [gitVersionCount, setGitVersionCount] = useState(0);
  const [gitCommitCount, setGitCommitCount] = useState(0);
  const [selectedClusterValue, setSelectedClusterValue] = useState(['']);
  const [selectedGitVersionValue, setSelectedGitVersionValue] = useState(['']);
  const [selectedGitVersion, setSelectedGitVersion] = useState<string>('All');
  const [selectedGitCommit, setSelectedGitCommit] = useState<string>('All');
  const [selectedGitCommitByVersion, setSelectedGitGitCommitByVersion] = useState<string>('All');
  const [exportCluster, setExportCluster] = useState<getPeersResponse[]>([]);
  const [exportGitVersion, setExportGitVersion] = useState<getPeersResponse[]>([]);
  const [exportGitCommit, setExportGitCommit] = useState<getPeersResponse[]>([]);
  const [exportSelectedCluster, setExportSelectedCluster] = useState<string>('All');
  const [exportSelectedVersion, setExportSelectedVersion] = useState<string>('All');
  const [exportSelectedCommit, setExportSelectedCommit] = useState<string>('All');
  const [exportSelectedGitVersion, setExportSelectedGitVersion] = useState(['']);
  const [exportSelectedGitCommit, setExportSelectedGitCommit] = useState(['']);

  useEffect(() => {
    (async function () {
      try {
        setIsLoading(true);
        const peer = await getPeers({ page: 1, per_page: MAX_PAGE_SIZE });
        const clusterValue = Array.from(new Set(peer.map((item) => item.scheduler_cluster.name)));

        setPeer(peer);
        setSelectedClusterValue(clusterValue);

        const gitVersionCount = new Set(peer.map((item) => item.git_version)).size;
        const gitCommitCount = new Set(peer.map((item) => item.git_commit)).size;

        setGitVersionCount(gitVersionCount);
        setGitCommitCount(gitCommitCount);

        const clusterNameCountMap: { [name: string]: number } = {};

        peer.forEach((obj) => {
          const clusterName = obj.scheduler_cluster.name;
          if (clusterNameCountMap[clusterName]) {
            clusterNameCountMap[clusterName]++;
          } else {
            clusterNameCountMap[clusterName] = 1;
          }
        });

        const cluster = Object.entries(
          peer.reduce<{ [key: string]: number }>((acc, curr) => {
            const { scheduler_cluster } = curr;
            if (acc[scheduler_cluster?.name]) {
              acc[scheduler_cluster?.name] += 1;
            } else {
              acc[scheduler_cluster?.name] = 1;
            }
            return acc;
          }, {}),
        ).map(([name, count]) => ({ name, count }));

        setCluster(cluster);

        const gitVersion = Object.entries(
          peer.reduce<{ [key: string]: number }>((acc, curr) => {
            const { git_version } = curr;
            if (acc[git_version]) {
              acc[git_version] += 1;
            } else {
              acc[git_version] = 1;
            }
            return acc;
          }, {}),
        ).map(([name, count]) => ({ name, count }));

        setGitVersion(gitVersion);

        const getCommit = Object.entries(
          peer.reduce<{ [key: string]: number }>((acc, curr) => {
            const { git_commit } = curr;
            if (acc[git_commit]) {
              acc[git_commit] += 1;
            } else {
              acc[git_commit] = 1;
            }
            return acc;
          }, {}),
        ).map(([name, count]) => ({ name, count }));

        setGitCommit(getCommit);

        const active = (peer.filter((item) => item.state === 'active').length / peer.length) * 100;

        setClusterActive(Number(active.toFixed(2)));
        setIsLoading(false);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
          setIsLoading(false);
        }
      }
    })();
  }, []);

  useMemo(() => {
    if (selectedGitVersion === 'All') {
      const gitVersion = Object.entries(
        peer.reduce<{ [key: string]: number }>((acc, curr) => {
          const { git_version } = curr;
          if (acc[git_version]) {
            acc[git_version] += 1;
          } else {
            acc[git_version] = 1;
          }
          return acc;
        }, {}),
      ).map(([name, count]) => ({ name, count }));

      const active = (peer.filter((item) => item.state === 'active').length / peer.length) * 100;

      setGitVersion(gitVersion);
      setGitVersionActive(Number(active.toFixed(2)));
    } else {
      const filteredByCluster = selectedGitVersion
        ? peer.filter((item) => item.scheduler_cluster.name === selectedGitVersion)
        : peer;

      const gitVersion = Object.entries(
        filteredByCluster.reduce<{ [key: string]: number }>((acc, curr) => {
          const { git_version } = curr;
          if (acc[git_version]) {
            acc[git_version] += 1;
          } else {
            acc[git_version] = 1;
          }
          return acc;
        }, {}),
      ).map(([name, count]) => ({ name, count }));

      const active =
        (filteredByCluster.filter((item) => item.state === 'active').length / filteredByCluster.length) * 100;

      setGitVersion(gitVersion);
      setGitVersionActive(Number(active.toFixed(2)));
    }
  }, [selectedGitVersion, peer]);

  useMemo(() => {
    if (selectedGitCommit === 'All') {
      const filteredByCluster = selectedGitCommit
        ? peer.filter((item) => item.scheduler_cluster.name === selectedGitCommit)
        : peer;

      const gitVersionValue = Array.from(new Set(filteredByCluster.map((item) => item.git_version)));

      const gitCommit = Object.entries(
        peer.reduce<{ [key: string]: number }>((acc, curr) => {
          const { git_commit } = curr;
          if (acc[git_commit]) {
            acc[git_commit] += 1;
          } else {
            acc[git_commit] = 1;
          }
          return acc;
        }, {}),
      ).map(([name, count]) => ({ name, count }));

      const active = (peer.filter((item) => item.state === 'active').length / peer.length) * 100;

      setGitCommit(gitCommit);
      setSelectedGitVersionValue(gitVersionValue);
      setGitCommitActive(Number(active.toFixed(2)));
    } else if (selectedGitCommit === 'All' || selectedGitCommitByVersion === 'All') {
      const filteredByCluster = selectedGitCommit
        ? peer.filter((item) => item.scheduler_cluster.name === selectedGitCommit)
        : peer;

      const gitVersionValue = Array.from(new Set(filteredByCluster.map((item) => item.git_version)));

      const gitCommit = Object.entries(
        filteredByCluster.reduce<{ [key: string]: number }>((acc, curr) => {
          const { git_commit } = curr;
          if (acc[git_commit]) {
            acc[git_commit] += 1;
          } else {
            acc[git_commit] = 1;
          }
          return acc;
        }, {}),
      ).map(([name, count]) => ({ name, count }));

      const active =
        (filteredByCluster.filter((item) => item.state === 'active').length / filteredByCluster.length) * 100;

      setGitCommit(gitCommit);
      setSelectedGitVersionValue(gitVersionValue);
      setGitCommitActive(Number(active.toFixed(2)));
    } else {
      const filteredByCluster = selectedGitCommit
        ? peer.filter((item) => item.scheduler_cluster.name === selectedGitCommit)
        : peer;

      const filteredByVersion = selectedGitCommitByVersion
        ? filteredByCluster.filter((item) => item.git_version === selectedGitCommitByVersion)
        : filteredByCluster;

      const gitVersionValue = Array.from(new Set(filteredByCluster.map((item) => item.git_version)));

      setSelectedGitVersionValue(gitVersionValue);

      const gitCommit = Object.entries(
        filteredByVersion.reduce<{ [key: string]: number }>((acc, curr) => {
          const { git_commit } = curr;
          if (acc[git_commit]) {
            acc[git_commit] += 1;
          } else {
            acc[git_commit] = 1;
          }
          return acc;
        }, {}),
      ).map(([name, count]) => ({ name, count }));

      setGitCommit(gitCommit);

      const active =
        (filteredByVersion.filter((item) => item.state === 'active').length / filteredByVersion.length) * 100;

      setGitCommitActive(Number(active.toFixed(2)));
    }
  }, [selectedGitCommit, selectedGitCommitByVersion, peer]);

  useMemo(() => {
    const filteredByCluster = exportSelectedCluster
      ? peer.filter((item) => item.scheduler_cluster.name === exportSelectedCluster)
      : peer;
    const gitVersionValue = Array.from(new Set(filteredByCluster.map((item) => item.git_version)));

    setExportCluster(filteredByCluster);
    setExportSelectedGitVersion(gitVersionValue);

    const filteredByVersion = exportSelectedVersion
      ? filteredByCluster.filter((item) => item.git_version === exportSelectedVersion)
      : filteredByCluster;
    const gitCommitValue = Array.from(new Set(filteredByVersion.map((item) => item.git_commit)));

    setExportGitVersion(filteredByVersion);
    setExportSelectedGitCommit(gitCommitValue);

    const filteredByCommit = exportSelectedCommit
      ? filteredByVersion.filter((item) => item.git_commit === exportSelectedCommit)
      : filteredByVersion;

    setExportGitCommit(filteredByCommit);
  }, [exportSelectedCluster, exportSelectedVersion, exportSelectedCommit, peer]);

  const barOptions = {
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(0, 0, 0, 0)' },
      },
    },
  };

  const clusterBar = {
    labels: cluster.map((item) => item.name),
    datasets: [
      {
        data: cluster.map((item) => item.count),
        backgroundColor: 'rgba(46,143,121,0.6)',
        borderColor: 'rgb(46,143,121)',
        borderWidth: 1,
        borderRadius: 5,
        hoverBackgroundColor: 'rgb(46,143,121)',
        barPercentage: 0.6,
      },
    ],
  };

  const doughnutOptions = {
    plugins: {
      legend: {
        position: 'bottom' as 'bottom',
      },
    },
  };

  const clusterDoughnut = {
    labels: cluster.map((item) => item.name),
    datasets: [
      {
        data: cluster.map((item) => item.count),
        backgroundColor: [
          'rgb(36,110,93)',
          'rgb(46,143,121)',
          'rgba(46,143,121,0.7)',
          'rgba(46,143,121,0.4)',
          'rgba(46,143,121,0.1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const gitVersionBar = {
    labels: gitVersion.map((item) => item.name),
    datasets: [
      {
        data: gitVersion.map((item) => item.count),
        backgroundColor: 'rgba(46,143,121,0.6)',
        borderColor: 'rgb(46,143,121)',
        borderWidth: 1,
        borderRadius: 5,
        hoverBackgroundColor: 'rgb(46,143,121)',
        barPercentage: 0.6,
      },
    ],
  };

  const gitVersionDoughnut = {
    labels: gitVersion.map((item) => item.name),
    datasets: [
      {
        label: 'Git Version',
        data: gitVersion.map((item) => item.count),
        backgroundColor: [
          'rgb(36,110,93)',
          'rgb(46,143,121)',
          'rgba(46,143,121,0.7)',
          'rgba(46,143,121,0.4)',
          'rgba(46,143,121,0.1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const gitCommitBar = {
    labels: gitCommit.map((item) => item.name),
    datasets: [
      {
        data: gitCommit.map((item) => item.count),
        backgroundColor: 'rgba(46,143,121,0.6)',
        borderColor: 'rgb(46,143,121)',
        borderWidth: 1,
        borderRadius: 5,
        hoverBackgroundColor: 'rgb(46,143,121)',
        barPercentage: 0.6,
      },
    ],
  };

  const gitCommitDoughnut = {
    labels: gitCommit.map((item) => item.name),
    datasets: [
      {
        label: 'Git Commit',
        data: gitCommit.map((item) => item.count),
        backgroundColor: [
          'rgb(36,110,93)',
          'rgb(46,143,121)',
          'rgba(46,143,121,0.7)',
          'rgba(46,143,121,0.4)',
          'rgba(46,143,121,0.1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const ExportCsv = async () => {
    setLoadingButton(true);

    const headers = [
      { key: 'id', label: 'id' },
      { key: 'created_at', label: 'createdAt' },
      { key: 'updated_at', label: 'updatedAt' },
      { key: 'is_del', label: 'isDel' },
      { key: 'host_name', label: 'hostname' },
      { key: 'type', label: 'type' },
      { key: 'idc', label: 'idc' },
      { key: 'location', label: 'location' },
      { key: 'ip', label: 'ip' },
      { key: 'port', label: 'port' },
      { key: 'download_port', label: 'downloadPort' },
      { key: 'object_storage_port', label: 'objectStoragePort' },
      { key: 'state', label: 'state' },
      { key: 'os', label: 'os' },
      { key: 'platform', label: 'platform' },
      { key: 'platform_family', label: 'platformFamily' },
      { key: 'platform_version', label: 'platformVersion' },
      { key: 'kernel_version', label: 'kernelVersion' },
      { key: 'git_version', label: 'gitVersion' },
      { key: 'git_commit', label: 'gitCommit' },
      { key: 'build_platform', label: 'buildPlatform' },
      { key: 'scheduler_cluster.id', label: 'schedulerCluster.id' },
      { key: 'scheduler_cluster.name', label: 'schedulerCluster.name' },
      { key: 'scheduler_cluster.created_at', label: 'schedulerCluster.createdAt' },
      { key: 'scheduler_cluster.updated_at', label: 'schedulerCluster.updatedAt' },
      { key: 'scheduler_cluster.is_del', label: 'schedulerCluster.isDel' },
      { key: 'scheduler_cluster.bio', label: 'schedulerCluster.bio' },
      { key: 'scheduler_cluster.is_default', label: 'schedulerCluster.isDefault' },
      { key: 'scheduler_cluster.seed_peer_clusters', label: 'schedulerCluster.seedPeerClusters' },
      { key: 'scheduler_cluster.peers', label: 'schedulerCluster.peers' },
      { key: 'scheduler_cluster.jobs', label: 'schedulerCluster.jobs' },
      {
        key: 'scheduler_cluster.scopes.location',
        label: 'schedulerCluster.scopes.location',
      },
      {
        key: 'scheduler_cluster.scopes.idc',
        label: 'schedulerCluster.scopes.idc',
      },
      {
        key: 'scheduler_cluster.scopes.cidrs',
        label: 'schedulerCluster.scopes.cidrs',
      },
      {
        key: 'scheduler_cluster.config.candidate_parent_limit',
        label: 'schedulerCluster.config.candidateParentLimit',
      },
      {
        key: 'scheduler_cluster.config.filter_parent_limit',
        label: 'schedulerCluster.config.filterParentLimit',
      },
      {
        key: 'scheduler_cluster.client_config.concurrent_piece_count',
        label: 'schedulerCluster.clientConfig concurrentPieceCount',
      },
      { key: 'scheduler_cluster.client_config.load_limit', label: 'schedulerCluster.clientConfig.loadLimit' },
    ];
    try {
      if (exportSelectedVersion === 'All' && exportSelectedCommit === 'All' && exportSelectedCluster === 'All') {
        exportCSVFile(headers, peer, 'Peer Data');
        setLoadingButton(false);
        setOpenExport(false);
        setExportSelectedCluster('All');
        setExportSelectedVersion('All');
        setExportSelectedCommit('All');
      } else if (exportSelectedVersion === 'All' && exportSelectedCommit === 'All') {
        exportCSVFile(headers, exportCluster, 'Peer Data');
        setLoadingButton(false);
        setOpenExport(false);
        setExportSelectedCluster('All');
        setExportSelectedVersion('All');
        setExportSelectedCommit('All');
      } else if (exportSelectedCommit === 'All') {
        exportCSVFile(headers, exportGitVersion, 'Peer Data');
        setLoadingButton(false);
        setOpenExport(false);
        setExportSelectedCluster('All');
        setExportSelectedVersion('All');
        setExportSelectedCommit('All');
      } else {
        exportCSVFile(headers, exportGitCommit, 'Peer Data');
        setLoadingButton(false);
        setOpenExport(false);
        setExportSelectedCluster('All');
        setExportSelectedVersion('All');
        setExportSelectedCommit('All');
      }
    } catch (error) {
      setErrorMessage(true);
      setErrorMessageText('Export failed');
      setExportSelectedCluster('All');
      setExportSelectedVersion('All');
      setExportSelectedCommit('All');
      setLoadingButton(false);
    }
  };

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorMessage(false);
    setOpenExport(false);
    setExportSelectedCluster('All');
    setExportSelectedVersion('All');
    setExportSelectedCommit('All');
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
        <Typography color="inherit">insight</Typography>
        <Typography color="text.primary">peers</Typography>
      </Breadcrumbs>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '2rem' }}>
        <Typography variant="h5" fontFamily="mabry-bold" color="text.primary">
          Peers
        </Typography>
        <Button
          size="small"
          sx={{
            background: 'var(--button-color)',
            borderRadius: '0',
            ':hover': {
              backgroundColor: 'var(--button-color)',
              borderColor: 'var(--button-color)',
            },
          }}
          variant="contained"
          onClick={() => {
            setOpenExport(true);
          }}
          startIcon={<GetAppIcon />}
        >
          Export
        </Button>
      </Box>
      <Box sx={{ display: 'flex', mb: '2rem' }}>
        <Box sx={{ width: '33.33%', mr: '1rem' }}>
          <Paper variant="outlined" sx={{ p: '1rem' }}>
            <Box className={styles.navigationContent}>
              <Box>
                <Typography variant="subtitle1" fontFamily="mabry-bold" className={styles.navigationTitle}>
                  Total
                </Typography>
                <Typography variant="h5">{isLoading ? <Skeleton width="6rem" /> : peer.length}</Typography>
                <Typography variant="body1" sx={{ color: '#8a8a8a' }}>
                  number of peers
                </Typography>
              </Box>
              <Box component="img" className={styles.navigationIcon} src="/icons/insight/peer/statistics.svg" />
            </Box>
          </Paper>
        </Box>
        <Box sx={{ width: '33.33%', mr: '1rem' }}>
          <Paper variant="outlined" sx={{ p: '1rem' }}>
            <Box className={styles.navigationContent}>
              <Box>
                <Typography variant="subtitle1" fontFamily="mabry-bold" className={styles.navigationTitle}>
                  Git Version
                </Typography>
                <Typography variant="h5">{isLoading ? <Skeleton width="6rem" /> : gitVersionCount}</Typography>
                <Typography variant="body1" sx={{ color: '#8a8a8a' }}>
                  number of git versions
                </Typography>
              </Box>
              <Box component="img" className={styles.navigationIcon} src="/icons/insight/peer/statistics.svg" />
            </Box>
          </Paper>
        </Box>
        <Box sx={{ width: '33.33%' }}>
          <Paper variant="outlined" sx={{ p: '1rem' }}>
            <Box className={styles.navigationContent}>
              <Box>
                <Typography variant="subtitle1" fontFamily="mabry-bold" className={styles.navigationTitle}>
                  Git Commit
                </Typography>
                <Typography variant="h5">{isLoading ? <Skeleton width="6rem" /> : gitCommitCount}</Typography>
                <Typography variant="body1" sx={{ color: '#8a8a8a' }}>
                  number of git commits
                </Typography>
              </Box>
              <Box component="img" className={styles.navigationIcon} src="/icons/insight/peer/statistics.svg" />
            </Box>
          </Paper>
        </Box>
      </Box>
      <ThemeProvider theme={theme}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <Box
            sx={{
              mb: '2rem',
              width: '100% ',
              [theme.breakpoints.up('xl')]: {
                width: '49% ',
              },
            }}
          >
            <Box className={styles.dashboard}>
              <Paper variant="outlined" className={styles.barContainer}>
                <Box className={styles.barTitle}>
                  <Box>
                    <Typography variant="subtitle1" component="span" sx={{ fontWeight: 500 }}>
                      Peer Statistics&nbsp;
                    </Typography>
                    <Typography variant="subtitle1" component="span" sx={{ fontWeight: 500, color: '#8a8a8a' }}>
                      by Scheduler Cluster
                    </Typography>
                  </Box>
                  <MuiTooltip title="Number of peer under different scheduler clusters" placement="top">
                    <ErrorOutlineIcon className={styles.descriptionIcon} />
                  </MuiTooltip>
                </Box>
                <Bar options={barOptions} data={clusterBar} />
              </Paper>
              <Paper variant="outlined" className={styles.doughnutContainer}>
                <Box>
                  <Box className={styles.doughnutTitle}>
                    <Box>
                      <Typography variant="subtitle2" component="span" sx={{ fontWeight: 500 }}>
                        Peer Statistics&nbsp;
                      </Typography>
                      <Typography variant="subtitle2" component="span" sx={{ fontWeight: 500, color: '#8a8a8a' }}>
                        by Scheduler Cluster
                      </Typography>
                    </Box>
                    <MuiTooltip
                      title="Number of peer and active proportion under different scheduler cluster"
                      placement="top"
                    >
                      <ErrorOutlineIcon className={styles.descriptionIcon} />
                    </MuiTooltip>
                  </Box>
                  <Pie data={clusterDoughnut} options={doughnutOptions} />
                </Box>
                <Box className={styles.activeContainer}>
                  <Box component="img" className={styles.activeIcon} src="/icons/insight/peer/active.svg" />
                  <Box sx={{ width: '100%' }}>
                    <Box className={styles.activeContent}>
                      <Typography variant="subtitle2" fontFamily="mabry-light">
                        Active
                      </Typography>
                      <Typography variant="subtitle1" fontFamily="mabry-bold">
                        {isLoading ? <Skeleton width="2rem" /> : clusterActive ? `${clusterActive}%` : '0'}
                      </Typography>
                    </Box>
                    <LinearProgress
                      sx={{
                        bgcolor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: 'var(--description-color)',
                        },
                      }}
                      variant="determinate"
                      value={clusterActive ? clusterActive : 0}
                    />
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>
          <Box
            sx={{
              mb: '2rem',
              width: '100% ',
              [theme.breakpoints.up('xl')]: {
                width: '49% ',
              },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: '1rem' }}>
              <FormControl sx={{ width: '10rem' }} size="small">
                <InputLabel id="states-select">Clusters</InputLabel>
                <Select
                  id="states-select"
                  label="changeGitVersion"
                  value={selectedGitVersion}
                  onChange={(e) => setSelectedGitVersion(e.target.value)}
                >
                  <Typography variant="body1" fontFamily="mabry-bold" sx={{ ml: '1rem', mt: '0.4rem', mb: '0.4rem' }}>
                    Filter by cluster
                  </Typography>
                  <Divider />
                  <MenuItem key="All" value="All">
                    All
                  </MenuItem>
                  {selectedClusterValue.map((item) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box className={styles.dashboard}>
              <Paper variant="outlined" className={styles.barContainer}>
                <Box className={styles.barTitle}>
                  <Box>
                    <Typography variant="subtitle1" component="span" sx={{ fontWeight: 500 }}>
                      Peer Statistics&nbsp;
                    </Typography>
                    <Typography variant="subtitle1" component="span" sx={{ fontWeight: 500, color: '#8a8a8a' }}>
                      by Git Version
                    </Typography>
                  </Box>
                  <MuiTooltip title="Number of peer under different git version" placement="top">
                    <ErrorOutlineIcon className={styles.descriptionIcon} />
                  </MuiTooltip>
                </Box>
                <Box className={styles.barContent}>
                  <Bar options={barOptions} data={gitVersionBar} />
                </Box>
              </Paper>
              <Paper variant="outlined" className={styles.doughnutContainer}>
                <Box>
                  <Box className={styles.doughnutTitle}>
                    <Box>
                      <Typography variant="subtitle2" component="span" sx={{ fontWeight: 500 }}>
                        Peer Statistics&nbsp;
                      </Typography>
                      <Typography variant="subtitle2" component="span" sx={{ fontWeight: 500, color: '#8a8a8a' }}>
                        by Git Version
                      </Typography>
                    </Box>
                    <MuiTooltip
                      title="Number of peer and active proportion under different git version"
                      placement="top"
                    >
                      <ErrorOutlineIcon className={styles.descriptionIcon} />
                    </MuiTooltip>
                  </Box>
                  <Pie data={gitVersionDoughnut} options={doughnutOptions} />
                </Box>
                <Box className={styles.activeContainer}>
                  <Box component="img" className={styles.activeIcon} src="/icons/insight/peer/active.svg" />
                  <Box sx={{ width: '100%' }}>
                    <Box className={styles.activeContent}>
                      <Typography variant="subtitle2" fontFamily="mabry-light">
                        Active
                      </Typography>
                      <Typography variant="subtitle1" fontFamily="mabry-bold">
                        {isLoading ? <Skeleton width="2rem" /> : gitVersionActive ? `${gitVersionActive}%` : '0'}
                      </Typography>
                    </Box>
                    <LinearProgress
                      sx={{
                        bgcolor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: 'var(--description-color)',
                        },
                      }}
                      variant="determinate"
                      value={gitVersionActive ? gitVersionActive : 0}
                    />
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>
          <Box
            sx={{
              mb: '2rem',
              width: '100% ',
              [theme.breakpoints.up('xl')]: {
                width: '49% ',
              },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: '1rem' }}>
              <Box>
                <FormControl sx={{ width: '10rem', mr: '1rem' }} size="small">
                  <InputLabel id="states-select">Clusters</InputLabel>
                  <Select
                    id="states-select"
                    value={selectedGitCommit}
                    label="changeGitVersion"
                    onChange={(e) => {
                      setSelectedGitCommit(e.target.value);
                      setSelectedGitGitCommitByVersion('All');
                    }}
                  >
                    <Typography variant="body2" fontFamily="mabry-bold" sx={{ ml: '1rem', mt: '0.4rem', mb: '0.4rem' }}>
                      Filter by cluster
                    </Typography>
                    <Divider />
                    <MenuItem key="All" value="All">
                      All
                    </MenuItem>
                    {selectedClusterValue.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl sx={{ width: '10rem' }} size="small">
                  <InputLabel id="states-select">Git Version</InputLabel>
                  <Select
                    id="states-select"
                    value={selectedGitCommitByVersion}
                    label="changeGitCommit"
                    onChange={(e) => {
                      setSelectedGitGitCommitByVersion(e.target.value);
                    }}
                  >
                    <Typography variant="body2" fontFamily="mabry-bold" sx={{ ml: '1rem', mt: '0.4rem', mb: '0.4rem' }}>
                      Filter by git version
                    </Typography>
                    <Divider />
                    <MenuItem key="All" value="All">
                      All
                    </MenuItem>
                    {selectedGitVersionValue.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
            <Box className={styles.dashboard}>
              <Paper variant="outlined" className={styles.barContainer}>
                <Box className={styles.barTitle}>
                  <Box>
                    <Typography variant="subtitle1" component="span" sx={{ fontWeight: 500 }}>
                      Peer Statistics&nbsp;
                    </Typography>
                    <Typography variant="subtitle1" component="span" sx={{ fontWeight: 500, color: '#8a8a8a' }}>
                      by Git Commit
                    </Typography>
                  </Box>
                  <MuiTooltip title="Number of peer under different git commit" placement="top">
                    <ErrorOutlineIcon className={styles.descriptionIcon} />
                  </MuiTooltip>
                </Box>
                <Box className={styles.barContent}>
                  <Bar options={barOptions} data={gitCommitBar} />
                </Box>
              </Paper>
              <Paper variant="outlined" className={styles.doughnutContainer}>
                <Box>
                  <Box className={styles.doughnutTitle}>
                    <Box>
                      <Typography variant="subtitle2" component="span" sx={{ fontWeight: 500 }}>
                        Peer Statistics&nbsp;
                      </Typography>
                      <Typography variant="subtitle2" component="span" sx={{ fontWeight: 500, color: '#8a8a8a' }}>
                        by Git Commit
                      </Typography>
                    </Box>
                    <MuiTooltip title="Number of peer and active proportion under different git commit" placement="top">
                      <ErrorOutlineIcon className={styles.descriptionIcon} />
                    </MuiTooltip>
                  </Box>
                  <Pie data={gitCommitDoughnut} options={doughnutOptions} />
                </Box>
                <Box className={styles.activeContainer}>
                  <Box component="img" className={styles.activeIcon} src="/icons/insight/peer/active.svg" />
                  <Box sx={{ width: '100%' }}>
                    <Box className={styles.activeContent}>
                      <Typography variant="subtitle2" fontFamily="mabry-light">
                        Active
                      </Typography>
                      <Typography variant="subtitle1" fontFamily="mabry-bold">
                        {isLoading ? <Skeleton width="2rem" /> : gitCommitActive ? `${gitCommitActive}%` : '0'}
                      </Typography>
                    </Box>
                    <LinearProgress
                      sx={{
                        bgcolor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: 'var(--description-color)',
                        },
                      }}
                      variant="determinate"
                      value={gitCommitActive}
                    />
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
        <Dialog
          open={openExport}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Export</DialogTitle>
          <DialogContent>
            <Box
              noValidate
              component="form"
              sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: '0.4rem' }}
            >
              <FormControl sx={{ width: '23rem', mb: '1rem' }} size="small">
                <InputLabel id="states-select">Clusters</InputLabel>
                <Select
                  id="states-select"
                  value={exportSelectedCluster}
                  label="changeCluster"
                  onChange={(e) => setExportSelectedCluster(e.target.value)}
                >
                  <Typography variant="body1" fontFamily="mabry-bold" sx={{ ml: '1rem', mt: '0.4rem', mb: '0.4rem' }}>
                    Filter by cluster
                  </Typography>
                  <Divider />
                  <MenuItem key="All" value="All">
                    All
                  </MenuItem>
                  {selectedClusterValue.map((item) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ display: 'flex' }}>
                <FormControl sx={{ width: '11rem' }} size="small">
                  <InputLabel id="states-select">Git Version</InputLabel>
                  <Select
                    id="states-select"
                    value={exportSelectedVersion}
                    label="changeGitVersion"
                    onChange={(e) => setExportSelectedVersion(e.target.value)}
                  >
                    <Typography variant="body1" fontFamily="mabry-bold" sx={{ ml: '1rem', mt: '0.4rem', mb: '0.4rem' }}>
                      Filter by git version
                    </Typography>
                    <Divider />
                    <MenuItem key="All" value="All">
                      All
                    </MenuItem>
                    {exportSelectedGitVersion.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl sx={{ width: '11rem', ml: '1rem' }} size="small">
                  <InputLabel id="states-select">Git Commit</InputLabel>
                  <Select
                    id="states-select"
                    value={exportSelectedCommit}
                    label="changeGitCommit"
                    onChange={(e) => setExportSelectedCommit(e.target.value)}
                  >
                    <Typography variant="body1" fontFamily="mabry-bold" sx={{ ml: '1rem', mt: '0.4rem', mb: '0.4rem' }}>
                      Filter by git commit
                    </Typography>
                    <Divider />
                    <MenuItem key="All" value="All">
                      All
                    </MenuItem>
                    {exportSelectedGitCommit.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ display: 'flex', justifyContent: 'space-evenly', pb: '1.2rem' }}>
            <LoadingButton
              loading={loadingButton}
              endIcon={<CancelIcon sx={{ color: 'var(--button-color)' }} />}
              size="small"
              variant="outlined"
              loadingPosition="end"
              sx={{
                '&.MuiLoadingButton-root': {
                  color: 'var(--calcel-size-color)',
                  borderRadius: 0,
                  borderColor: 'var(--calcel-color)',
                },
                ':hover': {
                  backgroundColor: 'var( --calcel-hover-corlor)',
                  borderColor: 'var( --calcel-hover-corlor)',
                },
                '&.MuiLoadingButton-loading': {
                  backgroundColor: 'var(--button-loading-color)',
                  color: 'var(--button-loading-size-color)',
                  borderColor: 'var(--button-loading-color)',
                },
                mr: '1rem',
                width: '8rem',
              }}
              onClick={() => {
                setOpenExport(false);
                setExportSelectedCluster('All');
                setExportSelectedVersion('All');
                setExportSelectedCommit('All');
              }}
            >
              Cancel
            </LoadingButton>
            <LoadingButton
              loading={loadingButton}
              endIcon={<CheckCircleIcon />}
              size="small"
              variant="outlined"
              type="submit"
              loadingPosition="end"
              sx={{
                '&.MuiLoadingButton-root': {
                  backgroundColor: 'var(--save-color)',
                  borderRadius: 0,
                  color: 'var(--save-size-color)',
                  borderColor: 'var(--save-color)',
                },
                ':hover': { backgroundColor: 'var(--save-hover-corlor)', borderColor: 'var(--save-hover-corlor)' },
                '&.MuiLoadingButton-loading': {
                  backgroundColor: 'var(--button-loading-color)',
                  color: 'var(--button-loading-size-color)',
                  borderColor: 'var(--button-loading-color)',
                },
                width: '8rem',
              }}
              onClick={ExportCsv}
            >
              Save
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </Box>
  );
}
