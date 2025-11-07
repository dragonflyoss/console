import {
  Box,
  Button,
  Typography,
  Divider,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  Dialog,
  DialogContent,
  LinearProgress,
  Skeleton,
  Tooltip as MuiTooltip,
  IconButton,
  Link,
  useTheme,
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
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Bar, Pie } from 'react-chartjs-2';
import { getPeers, getPeersResponse, getSyncPeers } from '../../../lib/api';
import GetAppIcon from '@mui/icons-material/GetApp';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { useContext, useEffect, useState } from 'react';
import { MAX_PAGE_SIZE } from '../../../lib/constants';
import styles from './inde.module.css';
import { exportCSVFile } from '../../../lib/utils';
import { CancelLoadingButton, SavelLoadingButton } from '../../loading-button';
import { MyContext } from '../../clusters/show';
import _ from 'lodash';
import Card from '../../card';
import { ReactComponent as RefreshLoading } from '../../../assets/images/cluster/peer/refresh-loading.svg';
import { ReactComponent as Refresh } from '../../../assets/images/cluster/peer/refresh.svg';
import { ReactComponent as RefreshDialog } from '../../../assets/images/cluster/peer/refresh-dialog.svg';
import { ReactComponent as DeleteWarning } from '../../../assets/images/cluster/delete-warning.svg';
import { ReactComponent as Total } from '../../../assets/images/cluster/peer/total.svg';
import { ReactComponent as GitVersion } from '../../../assets/images/cluster/peer/git-versions.svg';
import { ReactComponent as GitCommit } from '../../../assets/images/cluster/peer/git-commits.svg';
import { ReactComponent as Active } from '../../../assets/images/cluster/peer/active.svg';
import { ReactComponent as Export } from '../../../assets/images/cluster/peer/export.svg';
import { ReactComponent as ExportFile } from '../../../assets/images/cluster/peer/export-file.svg';
import { ReactComponent as Count } from '../../../assets/images/cluster/scheduler/number.svg';
import ErrorHandler from '../../error-handler';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);
Chart.defaults.font.family = 'mabry-light';

export default function Peer() {
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [peer, setPeer] = useState<getPeersResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openExport, setOpenExport] = useState(false);
  const [openRefresh, setOpenRefresh] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [gitVersion, setGitVersion] = useState([{ name: '', count: 0 }]);
  const [gitCommit, setGitCommit] = useState([{ name: '', count: 0 }]);
  const [gitVersionActive, setGitVersionActive] = useState(0);
  const [gitCommitActive, setGitCommitActive] = useState(0);
  const [gitVersionCount, setGitVersionCount] = useState(0);
  const [gitCommitCount, setGitCommitCount] = useState(0);
  const [selectedGitVersions, setSelectedGitVersions] = useState(['']);
  const [selectedGitCommitByVersion, setSelectedGitGitCommitByVersion] = useState<string>('All');
  const [exportGitVersion, setExportGitVersion] = useState<getPeersResponse[]>([]);
  const [exportGitCommit, setExportGitCommit] = useState<getPeersResponse[]>([]);
  const [exportSelectedVersion, setExportSelectedVersion] = useState<string>('All');
  const [exportSelectedCommit, setExportSelectedCommit] = useState<string>('All');
  const [exportSelectedGitVersion, setExportSelectedGitVersion] = useState(['']);
  const [exportSelectedGitCommit, setExportSelectedGitCommit] = useState(['']);
  const [disabled, setDisabled] = useState(false);

  const { cluster } = useContext(MyContext);
  const theme = useTheme();

  useEffect(() => {
    (async function () {
      try {
        setIsLoading(true);

        if (cluster.scheduler_cluster_id) {
          const peer = await getPeers({
            page: 1,
            per_page: MAX_PAGE_SIZE,
            scheduler_cluster_id: cluster.scheduler_cluster_id,
          });

          setPeer(peer);

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
  }, [cluster.scheduler_cluster_id]);

  useEffect(() => {
    const gitVersionCount = new Set(peer.map((item) => item.git_version)).size;
    const gitCommitCount = new Set(peer.map((item) => item.git_commit)).size;

    setGitVersionCount(gitVersionCount);
    setGitCommitCount(gitCommitCount);

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
  }, [peer]);

  useEffect(() => {
    if (selectedGitCommitByVersion === 'All') {
      const gitVersion = Array.from(new Set(peer.map((item) => item.git_version)));

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
      setSelectedGitVersions(gitVersion);
      setGitCommitActive(Number(active.toFixed(2)));
    } else {
      const filteredByVersion = selectedGitCommitByVersion
        ? peer.filter((item) => item.git_version === selectedGitCommitByVersion)
        : peer;

      const gitVersion = Array.from(new Set(peer.map((item) => item.git_version)));

      setSelectedGitVersions(gitVersion);

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
  }, [selectedGitCommitByVersion, peer]);

  useEffect(() => {
    const gitVersion = Array.from(new Set(peer.map((item) => item.git_version)));

    setExportSelectedGitVersion(gitVersion);

    const filteredByVersion = exportSelectedVersion
      ? peer.filter((item) => item.git_version === exportSelectedVersion)
      : peer;
    const gitCommit = Array.from(new Set(filteredByVersion.map((item) => item.git_commit)));

    setExportGitVersion(filteredByVersion);
    setExportSelectedGitCommit(gitCommit);

    const filteredByCommit = exportSelectedCommit
      ? filteredByVersion.filter((item) => item.git_commit === exportSelectedCommit)
      : filteredByVersion;

    setExportGitCommit(filteredByCommit);
  }, [exportSelectedVersion, exportSelectedCommit, peer]);

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

  const doughnutOptions = {
    plugins: {
      legend: {
        position: 'bottom' as 'bottom',
      },
    },
  };

  const gitVersionBar = {
    labels: gitVersion.map((item) => item.name),
    datasets: [
      {
        data: gitVersion.map((item) => item.count),
        backgroundColor: theme.palette.mode === 'dark' ? '#01A76F' : 'rgb(31, 125, 83)',
        borderRadius: 5,
        barPercentage: 0.6,
      },
    ],
  };

  const doughnutBackgroundColor = [
    'rgb(31, 125, 83)',
    'rgba(31, 125, 83,0.8)',
    'rgba(31, 125, 83,0.6)',
    'rgba(31, 125, 83,0.4)',
    'rgba(31, 125, 83,0.2)',
  ];

  const darkDoughnutBackgroundColor = ['#01A76F', '#5BE49B', '#C8FAD6', '#004B50', '#007868'];

  const gitVersionDoughnut = {
    labels: gitVersion.map((item) => item.name),
    datasets: [
      {
        label: 'Git Version',
        data: gitVersion.map((item) => item.count),
        backgroundColor: theme.palette.mode === 'dark' ? darkDoughnutBackgroundColor : doughnutBackgroundColor,
        borderWidth: 0,
        borderColor: 'rgba(255, 255, 255, 0.6)',
      },
    ],
  };

  const gitCommitBar = {
    labels: gitCommit.map((item) => item.name),
    datasets: [
      {
        data: gitCommit.map((item) => item.count),
        backgroundColor: theme.palette.mode === 'dark' ? '#01A76F' : 'rgb(31, 125, 83)',
        borderWidth: 0,
        borderRadius: 5,
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
        backgroundColor: theme.palette.mode === 'dark' ? darkDoughnutBackgroundColor : doughnutBackgroundColor,
        borderWidth: 0,
        borderColor: 'rgba(255, 255, 255, 0.6)',
      },
    ],
  };

  const ExportCSV = async () => {
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
      { key: 'scheduler_cluster.client_config.load_limit', label: 'schedulerCluster.clientConfig.loadLimit' },
    ];
    try {
      if (peer.length === 0) {
        throw Error;
      }

      if (exportSelectedVersion === 'All' && exportSelectedCommit === 'All') {
        exportCSVFile(headers, peer, 'Peer Data');
        setLoadingButton(false);
        setOpenExport(false);
        setExportSelectedVersion('All');
        setExportSelectedCommit('All');
      } else if (exportSelectedCommit === 'All') {
        exportCSVFile(headers, exportGitVersion, 'Peer Data');
        setLoadingButton(false);
        setOpenExport(false);
        setExportSelectedVersion('All');
        setExportSelectedCommit('All');
      } else {
        exportCSVFile(headers, exportGitCommit, 'Peer Data');
        setLoadingButton(false);
        setOpenExport(false);
        setExportSelectedVersion('All');
        setExportSelectedCommit('All');
      }
    } catch (error) {
      setErrorMessage(true);
      setErrorMessageText('Export failed');
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
    setExportSelectedVersion('All');
    setExportSelectedCommit('All');
    setOpenRefresh(false);
  };

  const handleRefresh = async () => {
    setOpenRefresh(false);
    setRefresh(true);
    setDisabled(true);

    const params = {
      type: 'sync_peers',
      scheduler_cluster_ids: [cluster.scheduler_cluster_id],
    };

    try {
      await getSyncPeers(params);

      const peer = await getPeers({
        page: 1,
        per_page: MAX_PAGE_SIZE,
        scheduler_cluster_id: cluster.scheduler_cluster_id,
      });
      setPeer(peer);

      setRefresh(false);
      setDisabled(false);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(true);
        setErrorMessageText(error.message);
        setIsLoading(false);
        setRefresh(false);
        setDisabled(false);
      }
    }
  };

  return (
    <Box>
      <ErrorHandler errorMessage={errorMessage} errorMessageText={errorMessageText} onClose={handleClose} />
      <Box className={styles.header}>
        <Box className={styles.headerTitle}>
          <Typography variant="h6" fontFamily="mabry-bold" pr="0.4rem">
            Peers
          </Typography>
          <MuiTooltip
            title={
              <Typography variant="body2">
                Peer statistics are only supported in the Rust client, refer to&nbsp;
                <Link
                  underline="hover"
                  href="https://github.com/dragonflyoss/client"
                  target="_blank"
                  style={{ color: 'var(--palette-menu-color)' }}
                >
                  dragonflyoss/client
                </Link>
                .
              </Typography>
            }
            placement="top"
          >
            <HelpOutlineOutlinedIcon className={styles.descriptionIcon} />
          </MuiTooltip>
        </Box>
        <Box>
          <Button
            id="refresh"
            disabled={disabled}
            size="small"
            sx={{
              background: 'var(--palette-button-color)',
              ':hover': {
                backgroundColor: 'var( --palette-hover-button-text-color)',
                borderColor: 'var( --palette-hover-button-text-color)',
              },
              color: 'var(--palette-button-text-color)',
              mr: '1rem',
            }}
            variant="contained"
            onClick={() => {
              setOpenRefresh(true);
            }}
            startIcon={
              refresh ? <RefreshLoading className={styles.refreshIcon} /> : <Refresh className={styles.refreshIcon} />
            }
          >
            refresh
          </Button>
          <Button
            id="export"
            size="small"
            sx={{
              background: 'var(--palette-button-color)',
              ':hover': {
                backgroundColor: 'var( --palette-hover-button-text-color)',
                borderColor: 'var( --palette-hover-button-text-color)',
              },
              color: 'var(--palette-button-text-color)',
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
      </Box>
      <Box className={styles.navigationContainer}>
        <Card className={styles.navigationWrapper}>
          <Box className={styles.navigationContent}>
            <Box>
              <Typography variant="subtitle2" fontFamily="mabry-bold" color="var(--palette-table-title-text-color)">
                Total
              </Typography>
              {isLoading ? (
                <Skeleton height={40} data-testid="cluster-loading" width="2rem" />
              ) : (
                <Typography id="total" variant="h5" fontFamily="mabry-bold" p="0.5rem 0">
                  {peer.length}
                </Typography>
              )}
              <Box className={styles.navigationCount}>
                <span className={styles.navigationCountIcon}>
                  <Count />
                </span>
                <Typography variant="body2" color="var(--palette-table-title-text-color)">
                  number of peers
                </Typography>
              </Box>
            </Box>
            <Box className={styles.navigation}></Box>
            <Total className={styles.navigationIcon} />
          </Box>
        </Card>
        <Card className={styles.navigationWrapper}>
          <Box className={styles.navigationContent}>
            <Box>
              <Typography variant="subtitle2" fontFamily="mabry-bold" color="var(--palette-table-title-text-color)">
                Git Version
              </Typography>
              {isLoading ? (
                <Skeleton height={40} data-testid="cluster-loading" width="2rem" />
              ) : (
                <Typography id="git-version" variant="h5" fontFamily="mabry-bold" p="0.5rem 0">
                  {gitVersionCount}
                </Typography>
              )}
              <Box className={styles.navigationCount}>
                <span className={styles.navigationCountIcon}>
                  <Count />
                </span>
                <Typography variant="body2" color="var(--palette-table-title-text-color)">
                  number of git versions
                </Typography>
              </Box>
            </Box>
            <Box className={styles.navigation} />
            <GitVersion className={styles.navigationIcon} />
          </Box>
        </Card>
        <Card className={styles.navigationWrapper}>
          <Box className={styles.navigationContent}>
            <Box>
              <Typography variant="subtitle2" fontFamily="mabry-bold" color="var(--palette-table-title-text-color)">
                Git Commit
              </Typography>
              {isLoading ? (
                <Skeleton height={40} data-testid="cluster-loading" width="2rem" />
              ) : (
                <Typography id="git-commit" variant="h5" fontFamily="mabry-bold" p="0.5rem 0">
                  {gitCommitCount}
                </Typography>
              )}
              <Box className={styles.navigationCount}>
                <span className={styles.navigationCountIcon}>
                  <Count />
                </span>
                <Typography variant="body2" color="var(--palette-table-title-text-color)">
                  number of git commits
                </Typography>
              </Box>
            </Box>
            <Box className={styles.navigation} />
            <GitCommit className={styles.navigationIcon} />
          </Box>
        </Card>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <Box className={styles.visualizationWrapper}>
          <Box className={styles.dashboard}>
            <Card className={styles.barContainer}>
              <Box className={styles.barTitle}>
                <Box>
                  <Typography variant="subtitle1" component="span" sx={{ fontFamily: 'mabry-bold' }}>
                    Peer Statistics&nbsp;
                  </Typography>
                  <Typography variant="subtitle1" component="span" sx={{ fontFamily: 'mabry-bold', color: '#8a8a8a' }}>
                    by Git Version
                  </Typography>
                </Box>
                <MuiTooltip title="Number of peer under different git version" placement="top">
                  <HelpOutlineOutlinedIcon className={styles.descriptionIcon} />
                </MuiTooltip>
              </Box>
              <Box className={styles.barContent}>
                <Bar options={barOptions} data={gitVersionBar} />
              </Box>
            </Card>
            <Card className={styles.doughnutContainer}>
              <Box>
                <Box className={styles.doughnutTitle}>
                  <Box>
                    <Typography variant="subtitle2" component="span" sx={{ fontFamily: 'mabry-bold' }}>
                      Peer Statistics&nbsp;
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      component="span"
                      sx={{ fontFamily: 'mabry-bold', color: '#8a8a8a' }}
                    >
                      by Git Version
                    </Typography>
                  </Box>
                  <MuiTooltip title="Number of peer and active proportion under different git version" placement="top">
                    <HelpOutlineOutlinedIcon className={styles.descriptionIcon} />
                  </MuiTooltip>
                </Box>
                <Divider className={styles.divider} />
                <Box className={styles.pieWrapper}>
                  <Pie data={gitVersionDoughnut} options={doughnutOptions} />
                </Box>
              </Box>
              <Box className={styles.activeContainer}>
                <Active className={styles.activeIcon} />
                <Box sx={{ width: '100%' }}>
                  <Box className={styles.activeContent}>
                    <Typography variant="subtitle2" fontFamily="mabry-light">
                      Active
                    </Typography>
                    <Typography id="git-version-active" variant="subtitle1" fontFamily="mabry-bold">
                      {isLoading ? <Skeleton width="2rem" /> : gitVersionActive ? `${gitVersionActive}%` : '0'}
                    </Typography>
                  </Box>
                  <LinearProgress
                    sx={{
                      bgcolor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'var(--palette-description-color)',
                      },
                    }}
                    variant="determinate"
                    value={gitVersionActive ? gitVersionActive : 0}
                  />
                </Box>
              </Box>
            </Card>
          </Box>
        </Box>
        <Box className={styles.visualizationWrapperCommit}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: '1rem' }}>
            <Box>
              <FormControl sx={{ width: '10rem' }} size="small">
                <InputLabel id="git-version-select">Git Version</InputLabel>
                <Select
                  id="git-version-select"
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
                  {selectedGitVersions.map((item) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
          <Box className={styles.dashboard}>
            <Card className={styles.barContainer}>
              <Box className={styles.barTitle}>
                <Box>
                  <Typography variant="subtitle1" component="span" sx={{ fontFamily: 'mabry-bold' }}>
                    Peer Statistics&nbsp;
                  </Typography>
                  <Typography variant="subtitle1" component="span" sx={{ fontFamily: 'mabry-bold', color: '#8a8a8a' }}>
                    by Git Commit
                  </Typography>
                </Box>
                <MuiTooltip title="Number of peer under different git commit" placement="top">
                  <HelpOutlineOutlinedIcon className={styles.descriptionIcon} />
                </MuiTooltip>
              </Box>
              <Box className={styles.barContent}>
                <Bar options={barOptions} data={gitCommitBar} />
              </Box>
            </Card>
            <Card className={styles.doughnutContainer}>
              <Box>
                <Box className={styles.doughnutTitle}>
                  <Box>
                    <Typography variant="subtitle2" component="span" sx={{ fontFamily: 'mabry-bold' }}>
                      Peer Statistics&nbsp;
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      component="span"
                      sx={{ fontFamily: 'mabry-bold', color: '#8a8a8a' }}
                    >
                      by Git Commit
                    </Typography>
                  </Box>
                  <MuiTooltip title="Number of peer and active proportion under different git commit" placement="top">
                    <HelpOutlineOutlinedIcon className={styles.descriptionIcon} />
                  </MuiTooltip>
                </Box>
                <Divider className={styles.divider} />
                <Box className={styles.pieWrapper}>
                  <Pie data={gitCommitDoughnut} options={doughnutOptions} />
                </Box>
              </Box>
              <Box className={styles.activeContainer}>
                <Active className={styles.activeIcon} />
                <Box sx={{ width: '100%' }}>
                  <Box className={styles.activeContent}>
                    <Typography variant="subtitle2" fontFamily="mabry-light">
                      Active
                    </Typography>
                    <Typography id="git-commit-active" variant="subtitle1" fontFamily="mabry-bold">
                      {isLoading ? <Skeleton width="2rem" /> : gitCommitActive ? `${gitCommitActive}%` : '0'}
                    </Typography>
                  </Box>
                  <LinearProgress
                    sx={{
                      bgcolor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'var(--palette-description-color)',
                      },
                    }}
                    variant="determinate"
                    value={gitCommitActive}
                  />
                </Box>
              </Box>
            </Card>
          </Box>
        </Box>
      </Box>
      <Dialog
        open={openExport}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          '& .MuiDialog-paper': {
            minWidth: '32rem',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: '1rem' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Export className={styles.exportIcon} />
            <Typography variant="h6" fontFamily="mabry-bold" pl="0.5rem">
              Export
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            id="close-export"
            onClick={() => {
              setOpenExport(false);
              setExportSelectedVersion('All');
              setExportSelectedCommit('All');
            }}
            sx={{
              color: (theme) => theme.palette.grey[500],
              p: 0,
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              pb: '1rem',
            }}
          >
            <ExportFile className={styles.exportFileICon} />
            <Typography variant="subtitle1" fontFamily="mabry-bold">
              Export Your Data With Fun
            </Typography>
          </Box>
          <Box
            noValidate
            component="form"
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: '1rem' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControl sx={{ width: '14rem' }} size="small">
                <InputLabel id="git-version-label">Git Version</InputLabel>
                <Select
                  id="export-git-version"
                  value={exportSelectedVersion}
                  label="changeGitVersion"
                  onChange={(e) => setExportSelectedVersion(e.target.value)}
                >
                  <Typography variant="body1" fontFamily="mabry-bold" sx={{ ml: '1rem', mt: '0.4rem', mb: '0.4rem' }}>
                    Filter by git version
                  </Typography>
                  <Divider />
                  <MenuItem id="all" key="All" value="All">
                    All
                  </MenuItem>
                  {exportSelectedGitVersion.map((item) => (
                    <MenuItem id={`select-${item}`} key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ width: '14rem', ml: '1rem' }} size="small">
                <InputLabel id="git-commit-label">Git Commit</InputLabel>
                <Select
                  id="export-git-commit"
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
                    <MenuItem id={`select-${item}`} key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: '2rem' }}>
            <CancelLoadingButton
              id="cancel"
              loading={loadingButton}
              onClick={() => {
                setOpenExport(false);
                setExportSelectedVersion('All');
                setExportSelectedCommit('All');
              }}
            />
            <SavelLoadingButton
              loading={loadingButton}
              endIcon={<CheckCircleIcon />}
              id="save"
              text="Save"
              onClick={ExportCSV}
            />
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog
        open={openRefresh}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          '& .MuiDialog-paper': {
            minWidth: '34rem',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: '1rem' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <RefreshDialog className={styles.exportIcon} />
            <Typography id="refresh-title" variant="h6" fontFamily="mabry-bold" pl="0.5rem">
              Refresh
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            id="close-delete-icon"
            onClick={() => {
              setOpenRefresh(false);
            }}
            sx={{
              color: (theme) => theme.palette.grey[500],
              p: 0,
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <DialogContent>
          <Box display="flex" alignItems="flex-start" pb="1rem">
            <DeleteWarning className={styles.deleteWarning} />
            <Box>
              <Typography variant="body1" fontFamily="mabry-bold" component="span" sx={{ color: '#D81E06' }}>
                WARNING:&nbsp;
              </Typography>
              <Typography variant="body1" component="span" sx={{ color: '#D81E06' }}>
                This action CANNOT be undone.
              </Typography>
            </Box>
          </Box>
          The peer data will be forced to refresh.
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: '2rem' }}>
            <CancelLoadingButton
              id="cancel"
              loading={loadingButton}
              onClick={() => {
                setOpenRefresh(false);
              }}
            />
            <SavelLoadingButton
              loading={loadingButton}
              endIcon={<CheckCircleIcon />}
              id="save"
              text="Save"
              onClick={handleRefresh}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
