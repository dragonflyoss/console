import {
  Breadcrumbs,
  styled,
  Typography,
  Link as RouterLink,
  Divider,
  Menu,
  MenuItem,
  Paper,
  toggleButtonGroupClasses,
  ToggleButtonGroup,
  Button,
  Stack,
  Autocomplete,
  TextField,
  InputBase,
  InputAdornment,
  Skeleton,
  Tooltip,
  Chip,
  IconButton,
  ToggleButton,
  List,
  ListItemButton,
  ListItemText,
  debounce,
  ListItemIcon,
} from '@mui/material';
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import * as React from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab, { TabProps } from '@mui/material/Tab';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

import styles from './index.module.css';

import { ReactComponent as CreateAt } from '../../../assets/images/resource/persistent-cache-task/create-at.svg';
import { ReactComponent as ClusterID } from '../../../assets/images/cluster/id.svg';
import { ReactComponent as IcContent } from '../../../assets/images/cluster/scheduler/ic-content.svg';
import { ReactComponent as NoCluster } from '../../../assets/images/cluster/no-cluster.svg';
import { ReactComponent as ArrowCircleRightIcon } from '../../../assets/images/cluster/arrow-circle-right.svg';
import { ReactComponent as Location } from '../../../assets/images/cluster/location.svg';
import { ReactComponent as Status } from '../../../assets/images/cluster/status.svg';

import {
  getClusters,
  getClustersResponse,
  getPersistentCacheTasks,
  getPersistentCacheTasksResponse,
} from '../../../lib/api';
import { MAX_PAGE_SIZE } from '../../../lib/constants';
import Card from '../../card';
import SearchIcon from '@mui/icons-material/Search';

import { fuzzySearch, getDatetime, getPaginatedList, useQuery } from '../../../lib/utils';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import SearchCircularProgress from '../../circular-progress';

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  [`& .${toggleButtonGroupClasses.grouped}`]: {
    margin: theme.spacing(0.5),
    border: 0,
    borderRadius: theme.shape.borderRadius,
    [`&.${toggleButtonGroupClasses.disabled}`]: {
      border: 0,
    },
  },
  [`& .${toggleButtonGroupClasses.middleButton},& .${toggleButtonGroupClasses.lastButton}`]: {
    marginLeft: -1,
    borderLeft: '1px solid transparent',
  },
}));

type StyledTabProps = Omit<TabProps, 'component'> & {};

export default function PersistentCacheTask() {
  const [value, setValue] = useState('1');
  const [cluster, setCluster] = useState<getClustersResponse[]>([]);
  const [errorMessage, setErrorMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [clusterPage, setClusterPage] = useState(1);
  const [searchIconISLodaing, setSearchIconISLodaing] = useState(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(9);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [className, setClassName] = useState('');
  const [isDefault, setISDefault] = useState('all');
  const [anchorElement, setAnchorElement] = useState(null);
  const [selectedRow, setSelectedRow] = useState<getClustersResponse>();

  const [clusterCount, setClusterCount] = useState<getClustersResponse[]>([]);
  // const [delete, setDelete] = useState(false);

  const [searchClusters, setSearchClusters] = useState('');
  const [allClusters, setAllClusters] = useState<getClustersResponse[]>([]);

  const [persistentCacheTasks, setPersistentCacheTasks] = useState<getPersistentCacheTasksResponse[]>();

  const navigate = useNavigate();

  const open = Boolean(anchorEl);
  const location = useLocation();
  const params = useParams();
  const breadcrumbsColor = location.pathname.split('/').length || 0;
  const query = useQuery();

  const state = query.get('is_default') ? (query.get('is_default') as string) : 'all';
  const search = query.get('search') ? (query.get('search') as string) : '';

  useEffect(() => {
    (async function () {
      try {
        const cluster = await getClusters({ page: 1, per_page: MAX_PAGE_SIZE });
        setCluster(cluster);
        setClusterCount(cluster);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
        }
      }
    })();
  }, []);

  // useEffect(() => {
  //   (async function () {
  //     try {
  //       if (params?.id) {
  //         setIsLoading(true);
  //         const persistentCacheTasks = await getPersistentCacheTasks({
  //           page: 1,
  //           per_page: MAX_PAGE_SIZE,
  //           scheduler_cluster_id: String(params?.id),
  //         });

  //         setPersistentCacheTasks(persistentCacheTasks);
  //         setIsLoading(false);
  //       }
  //     } catch (error) {
  //       if (error instanceof Error) {
  //         setErrorMessage(true);
  //         setErrorMessageText(error.message);
  //         setIsLoading(false);
  //       }
  //     }
  //   })();
  // }, [params?.id, cluster]);

  useEffect(() => {
    setISDefault(state);

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

      const isDefaultCluster =
        (isDefault !== 'all' &&
          Array.isArray(cluster) &&
          cluster.filter((item) => {
            if (isDefault === 'default') return item.is_default === true;
            if (isDefault === 'non-default') return item.is_default === false;
            return true;
          })) ||
        cluster;

      const totalPage = Math.ceil(isDefaultCluster.length / pageSize);

      const currentPageData = getPaginatedList(isDefaultCluster, clusterPage, pageSize);

      setTotalPages(totalPage);
      setAllClusters(currentPageData);
    } else if (cluster === null || cluster) {
      setTotalPages(1);
      setAllClusters([]);
    }
  }, [cluster, clusterPage, pageSize, isDefault, state]);

  const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // const handleMenuItemClick = (e: { id: number; name: string }) => {
  //   setClassName(e.name);
  //   setCluterId(e.id);
  //   setAnchorEl(null);
  // };

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

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

  const statusList = [
    { lable: 'All', name: 'all' },
    { lable: 'Default', name: 'default' },
    { lable: 'Non-default', name: 'non-default' },
  ];

  const handleMenuItemClick = (isDefault: any) => {
    // setStatus(event.name);
    const queryParts: any[] = [];

    setISDefault(isDefault.name);

    if (isDefault.name !== 'all') {
      queryParts.push(`is_default=${isDefault.name}`);
    }

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

    navigate(`/resource/persistent-cache-task${queryString}`);

    // setSeedPeerPage(1);
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setAnchorElement(null);
  };

  return (
    <Box>
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
            id="free-solo-demo"
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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <List component="nav" aria-label="Device settings">
            <ListItemButton
              id="lock-button"
              aria-haspopup="listbox"
              aria-controls="lock-menu"
              aria-label="when device is locked"
              aria-expanded={open ? 'true' : undefined}
              onClick={handleClickListItem}
            >
              <ListItemText sx={{ pr: '0.6rem' }}>
                <Typography variant="body1" fontFamily="mabry-bold">
                  {`Filter : ${statusList.find((item) => item.name === isDefault)?.lable || 'All'}`}
                </Typography>
              </ListItemText>
              {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
          </List>
          <Menu
            id="lock-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'lock-button',
              role: 'listbox',
            }}
            sx={{
              '& .MuiMenu-paper': {
                boxShadow: 'var(--custom-shadows-dropdown)',
                borderRadius: '0.6rem',
              },
              '& .MuiMenu-list': {
                p: 0,
                width: '11rem',
              },
            }}
          >
            <Box className={styles.menu}>
              <Typography variant="body1" fontFamily="mabry-bold" sx={{ m: '0.4rem 1rem' }}>
                Filter by is default
              </Typography>
              <Divider sx={{ mb: '0.2rem' }} />
              {statusList.map((item) => (
                <MenuItem
                  className={styles.menuItem}
                  key={item.name}
                  value={item.name}
                  onClick={() => handleMenuItemClick(item)}
                >
                  {item.lable}
                </MenuItem>
              ))}
            </Box>
          </Menu>
        </Box>
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
        <Card className={styles.noData}>
          <IcContent className={styles.nodataIcon} />
          <Typography variant="h6" className={styles.nodataText}>
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
        <Box id="clustersCard" className={styles.cardCantainer}>
          {Array.isArray(allClusters) &&
            allClusters.map((item) => (
              <Card key={item.id} id="clusters" className={styles.card}>
                <Box className={styles.clusterNameWrapper}>
                  <IconButton
                    id={`operation-${item?.id}`}
                    onClick={(event: any) => {
                      setAnchorElement(event.currentTarget);
                      //   setSchedulerSelectedRow(item);
                      //   setSchedulerSelectedID(item.id);

                      setSelectedRow(item);
                    }}
                    size="small"
                    // aria-controls={Boolean(anchorElement) ? item?.id : ''}
                    aria-haspopup="true"
                    // aria-expanded={Boolean(anchorElement) ? 'true' : ''}
                    className={styles.moreVertIcon}
                  >
                    <MoreVertIcon sx={{ color: 'var(--palette-color)' }} />
                  </IconButton>
                  <Menu
                    anchorEl={anchorElement}
                    // id={schedulerSelectedRow?.host_name}
                    open={Boolean(anchorElement)}
                    onClose={handleClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    sx={{
                      '& .MuiMenu-paper': {
                        boxShadow: 'var(--custom-shadows-dropdown)',
                        borderRadius: '0.6rem',
                      },
                      '& .MuiMenu-list': {
                        width: '8rem',
                        p: '0',
                      },
                    }}
                  >
                    <Box className={styles.menu}>
                      <div className={styles.span} />
                      <MenuItem
                        className={styles.menuItem}
                        id={`view-${selectedRow?.id}`}
                        onClick={() => {
                          navigate(`/resource/persistent-cache-task/clusters/${selectedRow?.id}`);

                          setAnchorElement(null);
                        }}
                      >
                        <ListItemIcon>
                          <RemoveRedEyeIcon fontSize="small" className={styles.menuItemIcon} />
                        </ListItemIcon>
                        <Typography variant="body2" className={styles.menuText}>
                          View
                        </Typography>
                      </MenuItem>
                    </Box>
                  </Menu>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: '0.5rem' }}>
                    <Chip
                      label={`${item.is_default ? 'Default' : 'Non-Default'}`}
                      size="small"
                      variant="outlined"
                      id={`default-cluster-${item.id || 0}`}
                      sx={{
                        borderRadius: '0.4rem',
                        backgroundColor: item.is_default
                          ? 'var(--palette-grey-background-color)'
                          : 'var(--palette-background-inactive)',
                        color: item.is_default
                          ? 'var(--palette-description-color)'
                          : 'var(--palette-table-title-text-color)',
                        border: 0,
                        fontFamily: 'mabry-bold',
                      }}
                    />
                  </Box>
                  <RouterLink
                    component={Link}
                    to={`/resource/persistent-cache-task/clusters/${item.id}`}
                    underline="hover"
                  >
                    <Typography
                      id={`cluster-name-${item.id || 0}`}
                      variant="h6"
                      mb="0.5rem"
                      className={styles.nameText}
                    >
                      {item.name}
                    </Typography>
                  </RouterLink>
                  {/* <Box display="flex" m="0.5rem 0">
                      <Tooltip title={item.bio || '-'} placement="top">
                        <Typography
                          id={`cluster-description-${item.id || 0}`}
                          variant="caption"
                          className={styles.descriptionText}
                        >
                          {item.bio || '-'}
                        </Typography>
                      </Tooltip>
                    </Box> */}
                </Box>

                <Divider className={styles.divider} />
                <Box className={styles.clusterDefaultWrapper}>
                  <Box className={styles.creatTimeContainer}>
                    <ClusterID className={styles.cardIcon} />
                    <Typography id={`cluster-id-${item.id}`} variant="body2" className={styles.idText}>
                      {item.id}
                    </Typography>
                  </Box>
                  <Box className={styles.creatTimeContainer}>
                    <Location className={styles.cardIcon} />
                    <Typography id={`cluster-id-${item.id}`} variant="body2" className={styles.idText}>
                      {item?.scopes?.location || '-'}
                    </Typography>
                  </Box>
                  <Box className={styles.creatTimeContainer}>
                    <CreateAt className={styles.cardIcon} />
                    <Typography id={`cluster-id-${item.id}`} variant="body2" className={styles.idText}>
                      {getDatetime(item.created_at)}
                    </Typography>
                  </Box>

                  {/* <Box className={styles.creatTimeContainer}>
                        <IconButton
                          id={`show-cluster-${item.id}`}
                          className={styles.buttonContent}
                          onClick={() => {
                            navigate(`/resource/persistent-cache-task/clusters/${item.id}`);
                          }}
                        >
                          <ArrowCircleRightIcon className={styles.arrowCircleRightIcon} />
                        </IconButton>
                      </Box> */}
                </Box>
              </Card>
            ))}
        </Box>
      )}
    </Box>
  );
}
