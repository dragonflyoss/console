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
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import {
  getSchedulers,
  getSeedPeers,
  getClusters,
  getClustersResponse,
  getSchedulersResponse,
  getSeedPeersResponse,
} from '../../lib/api';
import styles from './index.module.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fuzzySearch, getDatetime, getPaginatedList, useQuery } from '../../lib/utils';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import { useLocation, useNavigate } from 'react-router-dom';
import { MAX_PAGE_SIZE } from '../../lib/constants';
import Card from '../card';
import debounce from 'lodash/debounce';
import SearchCircularProgress from '../circular-progress';

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
  typography: {
    fontFamily: 'mabry-light,sans-serif',
  },
});

export default function Clusters() {
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [clusterIsLoading, setClusterIsLoading] = useState(true);
  const [clusterPage, setClusterPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(9);
  const [searchClusters, setSearchClusters] = useState('');
  const [searchIconISLodaing, setSearchIconISLodaing] = useState(false);
  const [clusterCount, setClusterCount] = useState<getClustersResponse[]>([]);
  const [cluster, setCluster] = useState<getClustersResponse[]>([]);
  const [scheduler, setScheduler] = useState<getSchedulersResponse[]>([]);
  const [seedPeer, setSeedPeer] = useState<getSeedPeersResponse[]>([]);
  const [allClusters, setAllClusters] = useState<getClustersResponse[]>([]);
  const navigate = useNavigate();
  const query = useQuery();
  const page = query.get('page') ? parseInt(query.get('page') as string, 10) || 1 : 1;
  const search = query.get('search') ? (query.get('search') as string) : '';
  const location = useLocation();

  useEffect(() => {
    (async function () {
      try {
        setIsLoading(true);
        setClusterIsLoading(true);
        setClusterPage(page);

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
  }, [page]);

  useEffect(() => {
    if (Array.isArray(cluster) && cluster.length > 0) {
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

      const updatePageSize = () => {
        if (window.matchMedia('(max-width: 1440px)').matches) {
          setPageSize(9);
        } else if (window.matchMedia('(max-width: 1600px)').matches) {
          setPageSize(9);
        } else if (window.matchMedia('(max-width: 1920px)').matches) {
          setPageSize(12);
        } else if (window.matchMedia('(max-width: 2048px)').matches) {
          setPageSize(12);
        } else if (window.matchMedia('(max-width: 2560px)').matches) {
          setPageSize(15);
        }
      };

      updatePageSize();

      window.addEventListener('resize', updatePageSize);

      const totalPage = Math.ceil(cluster.length / pageSize);

      const currentPageData = getPaginatedList(cluster, clusterPage, pageSize);

      setTotalPages(totalPage);
      setAllClusters(currentPageData);
    } else if (cluster === null || cluster) {
      setTotalPages(1);
      setAllClusters([]);
    }
  }, [cluster, clusterPage, pageSize]);

  const numberOfDefaultClusters =
    Array.isArray(clusterCount) && clusterCount?.filter((item: any) => item?.is_default === true).length;

  const numberOfActiveSchedulers =
    Array.isArray(scheduler) && scheduler?.filter((item: any) => item?.state === 'active').length;

  const numberOfActiveSeedPeers =
    Array.isArray(seedPeer) && seedPeer?.filter((item: any) => item?.state === 'active').length;

  const debounced = useMemo(
    () =>
      debounce(async (currentSearch) => {
        if (currentSearch && clusterCount.length > 0) {
          const clusters = fuzzySearch(currentSearch, clusterCount);

          setCluster(clusters);
          setSearchIconISLodaing(false);
        } else if (currentSearch === '' && clusterCount.length > 0) {
          setCluster(clusterCount);
          setSearchIconISLodaing(false);
        }
      }, 500),
    [clusterCount],
  );

  const handleInputChange = useCallback(
    (newSearch: any) => {
      setSearchClusters(newSearch);
      setSearchIconISLodaing(true);
      debounced(newSearch);

      const queryString = newSearch ? `?search=${newSearch}` : '';
      navigate(`${location.pathname}${queryString}`);
    },
    [debounced, location.pathname, navigate],
  );

  useEffect(() => {
    if (search) {
      setSearchClusters(search);
      debounced(search);
    }
  }, [search, debounced]);

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorMessage(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Snackbar
        open={errorMessage}
        autoHideDuration={30000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
          {errorMessageText}
        </Alert>
      </Snackbar>
      <Box className={styles.clusterTitle}>
        <Breadcrumbs
          separator={
            <Box
              sx={{ width: '0.3rem', height: '0.3rem', backgroundColor: '#919EAB', borderRadius: '50%', m: '0 0.4rem' }}
            />
          }
          aria-label="breadcrumb"
        >
          <Typography variant="h5" color="text.primary">
            Cluster
          </Typography>
        </Breadcrumbs>
        <Button
          id="create-cluster"
          size="small"
          sx={{ background: 'var(--button-color)' }}
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
        <Box className={styles.clusterContainer}>
          <Card>
            <Box p="1.2rem">
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
                    <Typography id="total-clusters" variant="h5" sx={{ mr: '0.8rem' }}>
                      {isLoading ? (
                        <Skeleton data-testid="isloading" sx={{ width: '1rem' }} />
                      ) : (
                        clusterCount?.length || 0
                      )}
                    </Typography>
                    <Typography variant="subtitle2">number of clusters</Typography>
                  </Box>
                  <Grid className={styles.clusterBottomContainer}>
                    <Box component="img" className={styles.clusterBottomIcon} src="/icons/cluster/default.svg" />
                    <Box className={styles.clusterBottomContentContainer}>
                      <span id="default-clusters" className={styles.clusterBottomContent}>
                        {isLoading ? (
                          <Skeleton data-testid="isloading" sx={{ width: '1rem' }} />
                        ) : (
                          numberOfDefaultClusters || 0
                        )}
                      </span>
                      <span className={styles.clusterBottomContentMsg}>default</span>
                    </Box>
                  </Grid>
                </Box>
                <Box component="img" src="/icons/peer/statistics.svg" />
              </Box>
            </Box>
          </Card>
        </Box>
        <Box className={styles.clusterContainer}>
          <Card>
            <Box p="1.2rem">
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
                    <Typography id="total-schedulers" variant="h5" sx={{ mr: '0.8rem' }}>
                      {isLoading ? <Skeleton data-testid="isloading" sx={{ width: '1rem' }} /> : scheduler?.length || 0}
                    </Typography>
                    <Typography variant="subtitle2">number of schedulers</Typography>
                  </Box>
                  <Grid className={styles.clusterBottomContainer}>
                    <Box component="img" className={styles.clusterBottomIcon} src="/icons/cluster/active.svg" />
                    <Box className={styles.clusterBottomContentContainer}>
                      <span id="active-schedulers" className={styles.clusterBottomContent}>
                        {isLoading ? (
                          <Skeleton data-testid="isloading" sx={{ width: '1rem' }} />
                        ) : (
                          numberOfActiveSchedulers || 0
                        )}
                      </span>
                      <span className={styles.clusterBottomContentMsg}>active</span>
                    </Box>
                  </Grid>
                </Box>
                <Box component="img" src="/icons/peer/statistics.svg" />
              </Box>
            </Box>
          </Card>
        </Box>
        <Box className={styles.seedPeerContainer}>
          <Card>
            <Box p="1.2rem">
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
                    <Typography id="total-seed-peer" variant="h5" sx={{ mr: '0.8rem' }}>
                      {isLoading ? <Skeleton data-testid="isloading" sx={{ width: '1rem' }} /> : seedPeer.length || 0}
                    </Typography>
                    <Typography variant="subtitle2">number of seed peers</Typography>
                  </Box>
                  <Grid className={styles.clusterBottomContainer}>
                    <Box component="img" className={styles.clusterBottomIcon} src="/icons/cluster/active.svg" />
                    <Box className={styles.clusterBottomContentContainer}>
                      <span id="active-seed-peer" className={styles.clusterBottomContent}>
                        {isLoading ? (
                          <Skeleton data-testid="isloading" sx={{ width: '1rem' }} />
                        ) : (
                          numberOfActiveSeedPeers || 0
                        )}
                      </span>
                      <span className={styles.clusterBottomContentMsg}>active</span>
                    </Box>
                  </Grid>
                </Box>
                <Box component="img" src="/icons/peer/statistics.svg" />
              </Box>
            </Box>
          </Card>
        </Box>
      </Grid>
      <Box className={styles.searchContainer}>
        <Stack spacing={2} sx={{ width: '20rem' }}>
          <Autocomplete
            color="secondary"
            id="free-solo-demo"
            size="small"
            freeSolo
            inputValue={searchClusters}
            onInputChange={(_event, newInputValue) => {
              handleInputChange(newInputValue);
            }}
            options={(Array.isArray(clusterCount) && clusterCount.map((option) => option?.name)) || ['']}
            renderInput={(params) => (
              <TextField
                {...params}
                sx={{ padding: 0 }}
                label="Search"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: searchIconISLodaing ? (
                    <Box
                      sx={{
                        width: '2.2rem',
                        height: '2.2rem',
                        pl: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <SearchCircularProgress />
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        width: '2.2rem',
                        height: '2.2rem',
                        pl: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <SearchIcon sx={{ color: '#919EAB' }} />
                    </Box>
                  ),
                }}
              />
            )}
          />
        </Stack>
      </Box>
      <Box>
        {isLoading ? (
          <Box id="clusters" className={styles.clusterCard}>
            <Card>
              <Box className={styles.clusterListContent}>
                <Box p="1.2rem 1.2rem 0 1.2rem">
                  <Box display="flex" mb="0.5rem">
                    <img className={styles.idIcon} src="/icons/cluster/id.svg" alt="" />
                    <Skeleton data-testid="isloading" sx={{ width: '1rem' }} />
                  </Box>
                  <Typography variant="h6" mb="0.5rem" className={styles.nameText}>
                    <Skeleton data-testid="isloading" sx={{ width: '6rem' }} />
                  </Typography>
                  <Box display="flex">
                    <Skeleton data-testid="isloading" sx={{ width: '6rem' }} />
                  </Box>
                </Box>
                <Divider
                  sx={{
                    borderStyle: 'dashed',
                    borderColor: 'rgba(145 158 171 / 0.2)',
                    borderWidth: '0px 0px thin',
                    m: '1rem 0',
                  }}
                />
                <Box p="0 1.2rem 1.2rem 1.2rem">
                  <Skeleton data-testid="isloading" sx={{ width: '4rem', height: '1.4rem', mb: '0.8rem' }} />
                  <Box className={styles.creatTimeContainer}>
                    <Skeleton data-testid="isloading" sx={{ width: '6rem' }} />
                    <Skeleton variant="circular" width={40} height={40} />
                  </Box>
                </Box>
              </Box>
            </Card>
          </Box>
        ) : Array.isArray(clusterCount) && clusterCount.length === 0 ? (
          <Card className={styles.noData}>
            <Box component="img" className={styles.nodataIcon} src="/icons/cluster/scheduler/ic-content.svg" />
            <Typography variant="h6" className={styles.nodataText}>
              No data
            </Typography>
          </Card>
        ) : Array.isArray(allClusters) && allClusters.length === 0 ? (
          <Box id="no-clusters" className={styles.noClusterContainer}>
            <Box component="img" className={styles.noClusterIcon} src="/icons/cluster/no-cluster.svg" />
            <Box fontSize="1.2rem">
              No results for&nbsp;
              <Typography variant="h6" component="span">
                "{searchClusters || ''}"
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box id="clustersCard" className={styles.cardCantainer}>
            {Array.isArray(allClusters) &&
              allClusters.map((item) => (
                <Card key={item.id} id="clusters" className={styles.card}>
                  <Box className={styles.clusterListContent}>
                    <Box p="1.2rem 1.2rem 0 1.2rem">
                      <Box display="flex" mb="0.5rem">
                        <img className={styles.idIcon} src="/icons/cluster/id.svg" alt="" />
                        {clusterIsLoading ? (
                          <Skeleton data-testid="isloading" sx={{ width: '1rem' }} />
                        ) : (
                          <Typography id={`cluster-id-${item.id}`} variant="subtitle1" className={styles.idText}>
                            {item.id}
                          </Typography>
                        )}
                      </Box>
                      <Typography
                        id={`cluster-name-${item.id || 0}`}
                        variant="h6"
                        mb="0.5rem"
                        className={styles.nameText}
                      >
                        {clusterIsLoading ? <Skeleton data-testid="isloading" sx={{ width: '6rem' }} /> : item.name}
                      </Typography>
                      <Box display="flex">
                        <Tooltip title={item.bio || '-'} placement="top">
                          <Typography
                            id={`cluster-description-${item.id || 0}`}
                            variant="caption"
                            className={styles.descriptionText}
                          >
                            {clusterIsLoading ? (
                              <Skeleton data-testid="isloading" sx={{ width: '6rem' }} />
                            ) : (
                              item.bio || '-'
                            )}
                          </Typography>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Divider
                      sx={{
                        borderStyle: 'dashed',
                        borderColor: 'var(--palette-divider)',
                        borderWidth: '0px 0px thin',
                        m: '1rem 0',
                      }}
                    />
                    <Box p="0 1.2rem 1.2rem 1.2rem">
                      {clusterIsLoading ? (
                        <Skeleton data-testid="isloading" sx={{ width: '4rem', height: '1.4rem', mb: '0.8rem' }} />
                      ) : (
                        <Paper
                          elevation={0}
                          id={`default-cluster-${item.id || 0}`}
                          sx={{
                            height: '1.4rem',
                            background: item.is_default ? 'var(--description-color)' : 'var(--button-color)',
                            color: item.is_default ? '#FFFFFF' : '#FFFFFF',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.4rem',
                          }}
                        >
                          <Typography variant="subtitle2">{`${
                            item.is_default ? 'Default' : 'Non-Default'
                          }`}</Typography>
                        </Paper>
                      )}
                      <Box className={styles.creatTimeContainer}>
                        <Chip
                          avatar={<MoreTimeIcon />}
                          label={
                            clusterIsLoading ? (
                              <Skeleton data-testid="isloading" sx={{ width: '6rem' }} />
                            ) : (
                              getDatetime(item.created_at)
                            )
                          }
                          variant="outlined"
                          size="small"
                        />
                        <IconButton
                          id={`show-cluster-${item.id}`}
                          className={styles.buttonContent}
                          sx={{
                            '&.MuiButton-root': {
                              backgroundColor: '#fff',
                              p: 0,
                            },
                            p: 0,
                          }}
                          onClick={() => {
                            navigate(`/clusters/${item.id}`);
                          }}
                        >
                          <ArrowCircleRightIcon fontSize="large" sx={{ color: 'var(--button-color)' }} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              ))}
          </Box>
        )}
      </Box>
      {totalPages > 1 ? (
        <Box display="flex" justifyContent="flex-end" sx={{ marginTop: theme.spacing(2) }}>
          <Pagination
            count={totalPages}
            page={clusterPage}
            onChange={(_event: any, newPage: number) => {
              setClusterPage(newPage);
              const queryParts = [];
              if (search) {
                queryParts.push(`search=${search}`);
              }
              if (newPage > 1) {
                queryParts.push(`page=${newPage}`);
              }

              const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

              navigate(`/clusters${queryString}`);
            }}
            color="primary"
            size="small"
            id="clusterPagination"
          />
        </Box>
      ) : (
        <></>
      )}
    </ThemeProvider>
  );
}
