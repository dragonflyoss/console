import {
  Breadcrumbs,
  Typography,
  Link as RouterLink,
  Divider,
  Paper,
  Stack,
  Autocomplete,
  TextField,
  Skeleton,
  Chip,
  IconButton,
  debounce,
  Box,
  Snackbar,
  Alert,
  Pagination,
} from '@mui/material';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './index.module.css';
import { ReactComponent as ID } from '../../../assets/images/cluster/scheduler/scheduler-id.svg';
import { ReactComponent as ArrowCircleRightIcon } from '../../../assets/images/cluster/arrow-circle-right.svg';
import { ReactComponent as ClusterID } from '../../../assets/images/resource/persistent-cache-task/id.svg';
import { ReactComponent as IcContent } from '../../../assets/images/cluster/scheduler/ic-content.svg';
import { ReactComponent as NoCluster } from '../../../assets/images/cluster/no-cluster.svg';
import { ReactComponent as Cluster } from '../../../assets/images/cluster/cluster.svg';
import { ReactComponent as Location } from '../../../assets/images/profile/location.svg';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import { getClusters, getClusterResponse } from '../../../lib/api';
import { MAX_PAGE_SIZE } from '../../../lib/constants';
import Card from '../../card';
import SearchIcon from '@mui/icons-material/Search';
import { fuzzySearch, getDatetime, getPaginatedList, useQuery } from '../../../lib/utils';
import SearchCircularProgress from '../../circular-progress';

export default function PersistentCacheTask() {
  const [cluster, setCluster] = useState<getClusterResponse[]>([]);
  const [errorMessage, setErrorMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [clusterPage, setClusterPage] = useState(1);
  const [searchIconISLodaing, setSearchIconISLodaing] = useState(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);
  const [clusterCount, setClusterCount] = useState<getClusterResponse[]>([]);
  const [searchClusters, setSearchClusters] = useState('');
  const [allClusters, setAllClusters] = useState<getClusterResponse[]>([]);

  const navigate = useNavigate();

  const location = useLocation();
  const params = useParams();
  const query = useQuery();

  const page = query.get('page') ? parseInt(query.get('page') as string, 10) || 1 : 1;
  const search = query.get('search') ? (query.get('search') as string) : '';

  useEffect(() => {
    (async function () {
      try {
        setClusterPage(page);
        setIsLoading(true);
        const cluster = await getClusters({ page: 1, per_page: MAX_PAGE_SIZE });
        setCluster(cluster);
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
      debounced(search);
      setSearchClusters(search);
    }
  }, [search, debounced]);

  const handleClose = () => {
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
        <Alert id="error-message" onClose={handleClose} severity="error" sx={{ width: '100%' }}>
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
      >
        <Typography color="text.primary">Resource</Typography>
        <Typography color="text.primary">Persistent Cache Task</Typography>
        {params?.id ? <Typography color="inherit">{params?.id || '-'}</Typography> : ''}
      </Breadcrumbs>
      <Typography variant="body2" mb="1.5rem" mt="1rem" color="var(--palette-text-palette-text-secondary)">
        Persistent cache tasks are divided according to the scheduler cluster granularity.
      </Typography>
      <Box className={styles.searchContainer}>
        <Stack spacing={2} sx={{ width: '20rem' }}>
          <Autocomplete
            color="secondary"
            id="search-cluster"
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
        </Stack>
      </Box>
      {isLoading ? (
        <Box id="clustersCard" className={styles.loadingCard}>
          <Card>
            <Box className={styles.clusterNameWrapper}>
              <Box display="flex" mb="0.5rem" alignItems="center">
                <ClusterID className={styles.idIcon} />
                <Skeleton data-testid="isloading" sx={{ width: '1rem', ml: '0.4rem' }} />
              </Box>
              <Typography variant="h6" mb="0.5rem" className={styles.nameText}>
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
        <Card id="no-date" className={styles.noData}>
          <IcContent className={styles.nodataIcon} />
          <Typography id="no-date-text" variant="h6" className={styles.nodataText}>
            You have no clusters.
          </Typography>
        </Card>
      ) : Array.isArray(allClusters) && allClusters.length === 0 ? (
        <Box id="no-clusters" className={styles.noClusterContainer}>
          <NoCluster className={styles.noClusterIcon} />
          <Box fontSize="1.2rem">
            No results for&nbsp;
            <Typography variant="h6" component="span">
              "{searchClusters || ''}"
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box id="clusters-card" className={styles.cardCantainer}>
          {Array.isArray(allClusters) &&
            allClusters.map((item) => (
              <Card key={item.id} id="clusters" className={styles.card} onClick={(event) => {}}>
                <Box p="1.2rem">
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Paper
                      variant="outlined"
                      sx={{
                        backgroundColor: 'var(--palette-background-paper)',
                        boxShadow: 'var(--palette-card-box-shadow)',
                        borderRadius: '0.6rem',
                        transition: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                        zIndex: 0,
                        color: 'var(--palette-color)',
                        backgroundImage: 'none',
                        overflow: 'hidden',
                        padding: '0.3rem',
                        display: 'inline-flex',
                      }}
                    >
                      <Cluster className={styles.cluster} />
                    </Paper>
                    <Paper
                      elevation={0}
                      id={`default-cluster-${item.id || 0}`}
                      sx={{
                        background: item.is_default
                          ? 'var(--palette-grey-background-color)'
                          : 'var(--palette-background-inactive)',
                        color: item.is_default ? 'var(--palette-text-color)' : 'var(--palette-table-title-text-color)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.2rem 0.4rem',
                      }}
                    >
                      <Typography fontSize="0.7rem" fontFamily="mabry-bold">{`${
                        item.is_default ? 'Default' : 'Non-Default'
                      }`}</Typography>
                    </Paper>
                  </Box>
                  <RouterLink
                    component={Link}
                    to={`/resource/persistent-cache-task/clusters/${item?.id}`}
                    underline="hover"
                  >
                    <Typography id={`cluster-name-${item.id || 0}`} variant="subtitle1" className={styles.nameText}>
                      {item.name}
                    </Typography>
                  </RouterLink>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        borderRadius: '0.3rem',
                        background: 'var(--palette-background-inactive)',
                        border: '0',
                        fontFamily: 'mabry-bold',
                        display: 'inline-flex',
                        p: '0.1rem 0.4rem',
                        alignItems: 'center',
                        mr: '0.4rem',
                      }}
                    >
                      <ID className={styles.statusIcon} />
                      <Typography id={`cluster-id-${item.id}`} variant="caption" className={styles.idText}>
                        {item.scheduler_cluster_id}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        borderRadius: '0.3rem',
                        background: 'var(--palette-background-inactive)',
                        border: '0',
                        fontFamily: 'mabry-bold',
                        display: 'inline-flex',
                        p: '0.1rem 0.4rem',
                        alignItems: 'center',
                      }}
                    >
                      <Location className={styles.statusIcon} />
                      <Typography id={`cluster-id-${item.id}`} variant="caption" className={styles.idText}>
                        {item?.scopes?.location || '-'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: 'var(--palette-dark-100Channel)',
                    p: '0.2rem 1.2rem',
                  }}
                >
                  <Chip
                    avatar={<MoreTimeIcon />}
                    label={getDatetime(item.created_at)}
                    variant="outlined"
                    size="small"
                    id={`crate-at${item?.id}`}
                    sx={{ fontSize: '0.75rem' }}
                  />
                  <IconButton
                    id={`show-cluster-${item.id}`}
                    className={styles.buttonContent}
                    onClick={() => {
                      navigate(`/resource/persistent-cache-task/clusters/${item?.id}`);
                    }}
                  >
                    <ArrowCircleRightIcon className={styles.arrowCircleRightIcon} />
                  </IconButton>
                </Box>
              </Card>
            ))}
        </Box>
      )}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="flex-end" sx={{ marginTop: '2rem' }}>
          <Pagination
            count={totalPages}
            page={clusterPage}
            onChange={(_event: any, newPage: number) => {
              setClusterPage(newPage);
              const queryParts = [];

              if (newPage > 1) {
                queryParts.push(`page=${newPage}`);
              }

              const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

              navigate(`/resource/persistent-cache-task${queryString}`);
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
