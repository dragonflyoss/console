import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Grid,
  IconButton,
  Pagination,
  Paper,
  Skeleton,
  Snackbar,
  Tooltip,
  Typography,
  Stack,
  Autocomplete,
  TextField,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { getSchedulers, getSeedPeers, getClusters, getClustersResponse } from '../../lib/api';
import styles from './index.module.css';
import { useEffect, useMemo, useState } from 'react';
import { getDatetime, getPaginatedList } from '../../lib/utils';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../lib/constants';

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

export default function Clusters() {
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [clusterIsLoading, setClusterIsLoading] = useState(true);
  const [clusterPage, setClusterPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchClusters, setSearchClusters] = useState('');
  const [clusterCount, setClusterCount] = useState<getClustersResponse[]>([]);
  const [cluster, setCluster] = useState<getClustersResponse[]>([]);
  const [scheduler, setScheduler] = useState([{}]);
  const [seedPeer, setSeedPeer] = useState([{}]);
  const [allClusters, setAllClusters] = useState<getClustersResponse[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async function () {
      try {
        setIsLoading(true);
        setClusterIsLoading(true);

        const [cluster, scheduler, seedPeer] = await Promise.all([
          getClusters({ page: 1, per_page: MAX_PAGE_SIZE }),
          getSchedulers({ page: 1, per_page: MAX_PAGE_SIZE }),
          getSeedPeers({ page: 1, per_page: MAX_PAGE_SIZE }),
        ]);

        setCluster(cluster);
        setScheduler(scheduler);
        setSeedPeer(seedPeer);
        setClusterCount(cluster);
        setIsLoading(false);
        setClusterIsLoading(false);
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
    cluster.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    cluster.sort((a, b) => {
      if (a.is_default && !b.is_default) {
        return -1;
      } else if (!a.is_default && b.is_default) {
        return 1;
      } else {
        return 0;
      }
    });

    const totalPage = Math.ceil(cluster.length / DEFAULT_PAGE_SIZE);
    const currentPageData = getPaginatedList(cluster, clusterPage, DEFAULT_PAGE_SIZE);

    setTotalPages(totalPage);
    setAllClusters(currentPageData);
  }, [cluster, clusterPage]);

  const numberOfDefaultClusters =
    Array.isArray(clusterCount) && clusterCount?.filter((item: any) => item?.is_default === true).length;

  const numberOfActiveSchedulers =
    Array.isArray(scheduler) && scheduler?.filter((item: any) => item?.state === 'active').length;

  const numberOfActiveSeedPeers =
    Array.isArray(seedPeer) && seedPeer?.filter((item: any) => item?.state === 'active').length;

  const searchCluster = async (event: any) => {
    try {
      setClusterIsLoading(true);
      const cluster = searchClusters
        ? await getClusters({ page: 1, per_page: MAX_PAGE_SIZE, name: searchClusters })
        : await getClusters({ page: 1, per_page: MAX_PAGE_SIZE });

      setCluster(cluster);
      setClusterPage(1);
      setClusterIsLoading(false);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(true);
        setErrorMessageText(error.message);
      }
    }
  };

  const searchClusterKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const submitButton = document.getElementById('submit-button');
      submitButton?.click();
    }
  };

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorMessage(false);
  };

  return (
    <Box flex="1">
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
      <ThemeProvider theme={theme}>
        <Box className={styles.clusterTitle}>
          <Breadcrumbs aria-label="breadcrumb">
            <Typography variant="h5" color="text.primary">
              Cluster
            </Typography>
          </Breadcrumbs>
          <Button
            size="small"
            sx={{ background: 'var(--button-color)', borderRadius: '0' }}
            variant="contained"
            onClick={() => {
              navigate(`/clusters/new`);
            }}
          >
            <AddIcon fontSize="small" sx={{ mr: '0.4rem' }} />
            Add cluster
          </Button>
        </Box>
        <Grid className={styles.clusterHeaderContainer}>
          <Paper variant="outlined" className={styles.clusterContainer}>
            <Box p="1rem">
              <Box display="flex">
                <Box className={styles.clusterIconContainer}>
                  <Box component="img" className={styles.clusterSmallCircleIcon} src="/icons/cluster/round.svg" />
                  <Box component="img" className={styles.clusterBigCircleIcon} src="/icons/cluster/round.svg" />
                  <Box component="img" className={styles.clusterIcon} src="/icons/cluster/cluster.svg" />
                </Box>
                <Typography variant="h6" className={styles.clusterIconTitle}>
                  Cluster
                </Typography>
              </Box>
              <Box className={styles.clusterContentContainer}>
                <Box marginLeft="0.6rem">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h5" sx={{ mr: '1rem' }}>
                      {isLoading ? <Skeleton sx={{ width: '1rem' }} /> : clusterCount?.length || ''}
                    </Typography>
                    <span>number of clusters</span>
                  </Box>
                  <Grid className={styles.clusterBottomContainer}>
                    <Box component="img" className={styles.clusterBottomIcon} src="/icons/cluster/default.svg" />
                    <Box className={styles.clusterBottomContentContainer}>
                      <span className={styles.clusterBottomContent}>
                        {isLoading ? <Skeleton sx={{ width: '1rem' }} /> : numberOfDefaultClusters || 0}
                      </span>
                      <span className={styles.clusterBottomContentMsg}>default</span>
                    </Box>
                  </Grid>
                </Box>
                <Box component="img" src="/icons/cluster/statistics.svg" />
              </Box>
            </Box>
          </Paper>
          <Paper variant="outlined" className={styles.clusterContainer}>
            <Box p="1rem">
              <Box display="flex">
                <Box className={styles.clusterIconContainer}>
                  <Box component="img" className={styles.clusterSmallCircleIcon} src="/icons/cluster/round.svg" />
                  <Box component="img" className={styles.clusterBigCircleIcon} src="/icons/cluster/round.svg" />
                  <Box component="img" className={styles.clusterIcon} src="/icons/cluster/scheduler.svg" />
                </Box>
                <Typography variant="h6" className={styles.clusterIconTitle}>
                  Scheduler
                </Typography>
              </Box>
              <Box className={styles.clusterContentContainer}>
                <Box sx={{ ml: '0.6rem' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h5" sx={{ mr: '1rem' }}>
                      {isLoading ? <Skeleton sx={{ width: '1rem' }} /> : scheduler?.length || ''}
                    </Typography>
                    <span>number of schedulers</span>
                  </Box>
                  <Grid className={styles.clusterBottomContainer}>
                    <Box component="img" className={styles.clusterBottomIcon} src="/icons/cluster/active.svg" />
                    <Box className={styles.clusterBottomContentContainer}>
                      <span className={styles.clusterBottomContent}>
                        {isLoading ? <Skeleton sx={{ width: '1rem' }} /> : numberOfActiveSchedulers || 0}
                      </span>
                      <span className={styles.clusterBottomContentMsg}>active</span>
                    </Box>
                  </Grid>
                </Box>
                <Box component="img" src="/icons/cluster/statistics.svg" />
              </Box>
            </Box>
          </Paper>
          <Paper variant="outlined" className={styles.seedPeerContainer}>
            <Box p="1rem">
              <Box display="flex">
                <Box className={styles.clusterIconContainer}>
                  <Box component="img" className={styles.clusterSmallCircleIcon} src="/icons/cluster/round.svg" />
                  <Box component="img" className={styles.clusterBigCircleIcon} src="/icons/cluster/round.svg" />
                  <Box component="img" className={styles.clusterIcon} src="/icons/cluster/seed-peer.svg" />
                </Box>
                <Typography variant="h6" className={styles.seedPseerIconTitle}>
                  Seed Peer
                </Typography>
              </Box>
              <Box className={styles.clusterContentContainer}>
                <Box sx={{ ml: '0.6rem' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h5" sx={{ mr: '1rem' }}>
                      {isLoading ? <Skeleton sx={{ width: '1rem' }} /> : seedPeer.length || ''}
                    </Typography>
                    <span>number of seed peers</span>
                  </Box>
                  <Grid className={styles.clusterBottomContainer}>
                    <Box component="img" className={styles.clusterBottomIcon} src="/icons/cluster/active.svg" />
                    <Box className={styles.clusterBottomContentContainer}>
                      <span className={styles.clusterBottomContent}>
                        {isLoading ? <Skeleton sx={{ width: '1rem' }} /> : numberOfActiveSeedPeers || 0}
                      </span>
                      <span className={styles.clusterBottomContentMsg}>active</span>
                    </Box>
                  </Grid>
                </Box>
                <Box component="img" src="/icons/cluster/statistics.svg" />
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Box className={styles.searchContainer}>
          <Stack spacing={2} sx={{ width: '20rem' }}>
            <Autocomplete
              size="small"
              color="secondary"
              id="free-solo-demo"
              freeSolo
              onKeyDown={searchClusterKeyDown}
              inputValue={searchClusters}
              onInputChange={(_event, newInputValue) => {
                setSearchClusters(newInputValue);
              }}
              options={(Array.isArray(clusterCount) && clusterCount.map((option) => option?.name)) || ['']}
              renderInput={(params) => <TextField {...params} label="Search" />}
            />
          </Stack>
          <IconButton
            type="button"
            aria-label="search"
            id="submit-button"
            size="small"
            onClick={searchCluster}
            sx={{ width: '3rem' }}
          >
            <SearchIcon sx={{ color: 'rgba(0,0,0,0.6)' }} />
          </IconButton>
        </Box>
        <Grid item xs={12} className={styles.clusterListContainer} component="form" noValidate>
          {Array.isArray(allClusters) &&
            allClusters.map((item) => (
              <Box
                key={item.id}
                sx={{
                  maxWidth: '28rem',
                  width: '33.333%',
                  pr: '1rem',
                  pb: '1rem',
                  ':nth-of-type(3n)': {
                    pr: '0rem ',
                  },
                  [theme.breakpoints.up('xl')]: {
                    ':nth-of-type(3n)': {
                      pr: '1rem !important',
                    },
                  },
                }}
              >
                <Paper variant="outlined">
                  <Box className={styles.clusterListContent}>
                    <Box display="flex">
                      <span className={styles.idText}>ID&nbsp;:&nbsp;</span>
                      {clusterIsLoading ? (
                        <Skeleton sx={{ width: '1rem' }} />
                      ) : (
                        <span className={styles.idText}>{item.id}</span>
                      )}
                    </Box>
                    {clusterIsLoading ? (
                      <Skeleton sx={{ width: '4rem', height: '1.4rem', mt: '0.8rem', mb: '0.8rem' }} />
                    ) : (
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        sx={{
                          mt: '0.8rem',
                          mb: '0.8rem',
                          width: item.is_default ? '4rem' : '6rem',
                          height: '1.4rem',
                          background: item.is_default ? 'var(--description-color)' : 'var(--button-color)',
                          color: item.is_default ? '#FFFFFF' : '#FFFFFF',
                        }}
                      >
                        <Typography variant="body2" fontFamily="system-ui">
                          {`${item.is_default ? 'Default' : 'Non-Default'}`}
                        </Typography>
                      </Box>
                    )}
                    <Typography variant="h6">
                      {clusterIsLoading ? <Skeleton sx={{ width: '6rem' }} /> : item.name}
                    </Typography>
                    <Box display="flex" mt="0.4rem">
                      <Tooltip title={item.bio || '-'} placement="top">
                        <Typography variant="body2" className={styles.descriptionText}>
                          {clusterIsLoading ? <Skeleton sx={{ width: '6rem' }} /> : item.bio || '-'}
                        </Typography>
                      </Tooltip>
                    </Box>
                    <Box className={styles.creatTimeContainer}>
                      <Chip
                        avatar={<MoreTimeIcon />}
                        label={clusterIsLoading ? <Skeleton sx={{ width: '6rem' }} /> : getDatetime(item.created_at)}
                        variant="outlined"
                        size="small"
                      />
                      <IconButton
                        className={styles.buttonContent}
                        sx={{
                          '&.MuiButton-root': {
                            backgroundColor: '#fff',
                            padding: 0,
                          },
                        }}
                        onClick={() => {
                          navigate(`/clusters/${item.id}`);
                        }}
                      >
                        <ArrowCircleRightIcon fontSize="large" sx={{ color: 'var(--button-color)' }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            ))}
        </Grid>
        {totalPages > 1 ? (
          <Box display="flex" justifyContent="flex-end" sx={{ marginTop: theme.spacing(2) }}>
            <Pagination
              count={totalPages}
              page={clusterPage}
              onChange={(_event: any, newPage: number) => {
                setClusterPage(newPage);
              }}
              color="primary"
              size="small"
            />
          </Box>
        ) : (
          <></>
        )}
      </ThemeProvider>
    </Box>
  );
}
