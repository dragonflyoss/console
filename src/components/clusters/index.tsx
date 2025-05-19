import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Pagination,
  Paper,
  Skeleton,
  Snackbar,
  Tooltip,
  Typography,
  Autocomplete,
  TextField,
  Divider,
  Link as RouterLink,
} from '@mui/material';
import {
  getSchedulers,
  getSeedPeers,
  getClusters,
  getClusterResponse,
  getSchedulersResponse,
  getSeedPeersResponse,
} from '../../lib/api';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import styles from './index.module.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fuzzySearch, getDatetime, getPaginatedList, useQuery } from '../../lib/utils';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MAX_PAGE_SIZE } from '../../lib/constants';
import Card from '../card';
import debounce from 'lodash/debounce';
import SearchCircularProgress from '../circular-progress';
import { ReactComponent as Round } from '../../assets/images/cluster/round.svg';
import { ReactComponent as Default } from '../../assets/images/cluster/default.svg';
import { ReactComponent as Statistics } from '../../assets/images/cluster/peer/statistics.svg';
import { ReactComponent as Active } from '../../assets/images/cluster/active.svg';
import { ReactComponent as ClusterID } from '../../assets/images/cluster/id.svg';
import { ReactComponent as IcContent } from '../../assets/images/cluster/scheduler/ic-content.svg';
import { ReactComponent as NoCluster } from '../../assets/images/cluster/no-cluster.svg';
import { ReactComponent as Cluster } from '../../assets/images/cluster/cluster.svg';
import { ReactComponent as Scheduler } from '../../assets/images/cluster/scheduler.svg';
import { ReactComponent as SeedPeer } from '../../assets/images/cluster/seed-peer.svg';

export default function Clusters() {
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [clusterPage, setClusterPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(9);
  const [searchClusters, setSearchClusters] = useState('');
  const [searchIconISLodaing, setSearchIconISLodaing] = useState(false);
  const [clusterCount, setClusterCount] = useState<getClusterResponse[]>([]);
  const [cluster, setCluster] = useState<getClusterResponse[]>([]);
  const [scheduler, setScheduler] = useState<getSchedulersResponse[]>([]);
  const [seedPeer, setSeedPeer] = useState<getSeedPeersResponse[]>([]);
  const [allClusters, setAllClusters] = useState<getClusterResponse[]>([]);
  const navigate = useNavigate();
  const query = useQuery();
  const page = query.get('page') ? parseInt(query.get('page') as string, 10) || 1 : 1;
  const search = query.get('search') ? (query.get('search') as string) : '';
  const location = useLocation();

  useEffect(() => {
    (async function () {
      try {
        setIsLoading(true);
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
    <Box>
      <Snackbar
        open={errorMessage}
        autoHideDuration={30000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert id="error-message" onClose={handleClose} severity="error" sx={{ width: '100%' }}>
          {errorMessageText}
        </Alert>
      </Snackbar>
      <Box className={styles.clusterTitle}>
        <Typography variant="h5">Cluster</Typography>
        <Button
          id="create-cluster"
          size="small"
          sx={{
            background: 'var(--palette-button-color)',
            color: 'var(--palette-button-text-color)',
            ':hover': { backgroundColor: 'var(--palette-hover-button-text-color)' },
          }}
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
        <Card className={styles.clusterContainer}>
          <Box display="flex" alignItems="flex-end">
            <Box className={styles.clusterIconContainer}>
              <Round className={styles.clusterSmallCircleIcon} />
              <Round className={styles.clusterBigCircleIcon} />
              <Cluster className={styles.clusterIcon} />
            </Box>
            <Typography variant="body1" className={styles.clusterIconTitle}>
              Cluster
            </Typography>
          </Box>
          <Box className={styles.clusterContentContainer}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography id="total-clusters" variant="h5" sx={{ mr: '0.6rem' }}>
                  {isLoading ? <Skeleton data-testid="isloading" sx={{ width: '1rem' }} /> : clusterCount?.length || 0}
                </Typography>
                <Typography variant="body2">number of clusters</Typography>
              </Box>
              <Grid className={styles.clusterBottomContainer}>
                <Default className={styles.clusterBottomIcon} />
                <Box className={styles.clusterBottomContentContainer}>
                  <Typography variant="body2" id="default-clusters" className={styles.clusterBottomContent}>
                    {isLoading ? (
                      <Skeleton data-testid="isloading" sx={{ width: '1rem' }} />
                    ) : (
                      numberOfDefaultClusters || 0
                    )}
                  </Typography>
                  <Typography className={styles.clusterBottomContentMsg} variant="body2" display="block">
                    default
                  </Typography>
                </Box>
              </Grid>
            </Box>
            <Statistics className={styles.statistics} />
          </Box>
        </Card>
        <Card className={styles.clusterContainer}>
          <Box display="flex" alignItems="flex-end">
            <Box className={styles.clusterIconContainer}>
              <Round className={styles.clusterSmallCircleIcon} />
              <Round className={styles.clusterBigCircleIcon} />
              <Scheduler className={styles.clusterIcon} />
            </Box>
            <Typography variant="body1" className={styles.clusterIconTitle}>
              Scheduler
            </Typography>
          </Box>
          <Box className={styles.clusterContentContainer}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography id="total-schedulers" variant="h5" sx={{ mr: '0.6rem' }}>
                  {isLoading ? <Skeleton data-testid="isloading" sx={{ width: '1rem' }} /> : scheduler?.length || 0}
                </Typography>
                <Typography variant="body2">number of schedulers</Typography>
              </Box>
              <Grid className={styles.clusterBottomContainer}>
                <Active className={styles.clusterBottomIcon} />
                <Box className={styles.clusterBottomContentContainer}>
                  <Typography variant="body2" id="active-schedulers" className={styles.clusterBottomContent}>
                    {isLoading ? (
                      <Skeleton data-testid="isloading" sx={{ width: '1rem' }} />
                    ) : (
                      numberOfActiveSchedulers || 0
                    )}
                  </Typography>
                  <Typography className={styles.clusterBottomContentMsg} variant="body2" display="block">
                    active
                  </Typography>
                </Box>
              </Grid>
            </Box>
            <Statistics className={styles.statistics} />
          </Box>
        </Card>
        <Card className={styles.clusterContainer}>
          <Box display="flex" alignItems="flex-end">
            <Box className={styles.clusterIconContainer}>
              <Round className={styles.clusterSmallCircleIcon} />
              <Round className={styles.clusterBigCircleIcon} />
              <SeedPeer className={styles.clusterIcon} />
            </Box>
            <Typography variant="body1" className={styles.seedPseerIconTitle}>
              Seed Peer
            </Typography>
          </Box>
          <Box className={styles.clusterContentContainer}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography id="total-seed-peer" variant="h5" sx={{ mr: '0.6rem' }}>
                  {isLoading ? <Skeleton data-testid="isloading" sx={{ width: '1rem' }} /> : seedPeer.length || 0}
                </Typography>
                <Typography variant="body2">number of seed peers</Typography>
              </Box>
              <Grid className={styles.clusterBottomContainer}>
                <Active className={styles.clusterBottomIcon} />
                <Box className={styles.clusterBottomContentContainer}>
                  <Typography variant="body2" id="active-seed-peer" className={styles.clusterBottomContent}>
                    {isLoading ? (
                      <Skeleton data-testid="isloading" sx={{ width: '1rem' }} />
                    ) : (
                      numberOfActiveSeedPeers || 0
                    )}
                  </Typography>
                  <Typography className={styles.clusterBottomContentMsg} variant="body2">
                    active
                  </Typography>
                </Box>
              </Grid>
            </Box>
            <Statistics className={styles.statistics} />
          </Box>
        </Card>
      </Grid>
      <Box className={styles.searchContainer}>
        <Autocomplete
          sx={{ width: '20rem' }}
          color="secondary"
          id="search-wrapper"
          size="small"
          freeSolo
          inputValue={searchClusters}
          onInputChange={(_event, newInputValue) => {
            handleInputChange(newInputValue);
          }}
          options={(Array.isArray(clusterCount) && clusterCount?.map((option) => option?.name)) || ['']}
          renderInput={(params) => (
            <TextField
              {...params}
              sx={{ padding: 0 }}
              label="Search"
              InputProps={{
                ...params.InputProps,
                startAdornment: searchIconISLodaing ? (
                  <Box className={styles.searchIconContainer}>
                    <SearchCircularProgress />
                  </Box>
                ) : (
                  <Box className={styles.searchIconContainer}>
                    <SearchIcon sx={{ color: '#919EAB' }} />
                  </Box>
                ),
              }}
            />
          )}
        />
      </Box>
      <Box>
        {isLoading ? (
          <Box id="clustersCard" className={styles.loadingCard}>
            <Card>
              <Box className={styles.clusterNameWrapper}>
                <Box display="flex" mb="0.5rem" alignItems="flex-start">
                  <ClusterID className={styles.idIcon} />
                  <Skeleton data-testid="isloading" sx={{ width: '1rem', ml: '0.4rem' }} />
                </Box>
                <Typography variant="h6" className={styles.nameText}>
                  <Skeleton data-testid="isloading" sx={{ width: '6rem' }} />
                </Typography>
                <Box display="flex">
                  <Skeleton data-testid="isloading" sx={{ width: '15rem' }} />
                </Box>
              </Box>
              <Divider className={styles.divider} />
              <Box className={styles.clusterDefaultWrapper}>
                <Skeleton data-testid="isloading" sx={{ width: '4rem', height: '1.4rem', mb: '0.8rem' }} />
                <Box className={styles.creatTimeContainer}>
                  <Skeleton data-testid="isloading" sx={{ width: '6rem' }} />
                  <Skeleton variant="circular" width={40} height={40} />
                </Box>
              </Box>
            </Card>
          </Box>
        ) : Array.isArray(clusterCount) && clusterCount.length === 0 ? (
          <Card className={styles.noData}>
            <IcContent className={styles.nodataIcon} />
            <Typography variant="h6" className={styles.nodataText}>
              You have no clusters.
            </Typography>
          </Card>
        ) : Array.isArray(allClusters) && allClusters.length === 0 ? (
          <Box id="no-clusters" className={styles.noClusterContainer}>
            <NoCluster className={styles.noClusterIcon} />
            <Box id="no-results" fontSize="1.2rem">
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
                  <Box className={styles.clusterNameWrapper}>
                    <Box display="flex" mb="0.5rem" alignItems="flex-start">
                      <ClusterID className={styles.idIcon} />
                      <Typography
                        component="div"
                        id={`cluster-id-${item.id}`}
                        variant="body1"
                        className={styles.idText}
                      >
                        {item.id}
                      </Typography>
                    </Box>
                    <RouterLink component={Link} to={`/clusters/${item.id}`} underline="hover">
                      <Typography id={`cluster-name-${item.id || 0}`} variant="h6" className={styles.nameText}>
                        {item.name}
                      </Typography>
                    </RouterLink>
                    <Tooltip title={item.bio || '-'} placement="top">
                      <Typography
                        id={`cluster-description-${item.id || 0}`}
                        variant="caption"
                        className={styles.descriptionText}
                        component="div"
                      >
                        {item.bio || '-'}
                      </Typography>
                    </Tooltip>
                  </Box>
                  <Divider className={styles.divider} />
                  <Box className={styles.clusterDefaultWrapper}>
                    <Paper
                      elevation={0}
                      id={`default-cluster-${item.id || 0}`}
                      sx={{
                        height: '1.4rem',
                        background: item.is_default
                          ? 'var(--palette-description-color)'
                          : 'var(--palette-dark-300Channel)',
                        color: '#FFFFFF',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.4rem',
                      }}
                    >
                      <Typography variant="body2">{`${item.is_default ? 'Default' : 'Non-Default'}`}</Typography>
                    </Paper>
                    <Box className={styles.creatTimeContainer}>
                      <Chip
                        avatar={<MoreTimeIcon />}
                        label={getDatetime(item.created_at)}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  </Box>
                </Card>
              ))}
          </Box>
        )}
      </Box>
      {totalPages > 1 && (
        <Box display="flex" justifyContent="flex-end" sx={{ marginTop: '2rem' }}>
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
      )}
    </Box>
  );
}
