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
  List,
  ListItemButton,
  ListItemText,
  Button,
  Stack,
  Autocomplete,
  debounce,
  TextField,
} from '@mui/material';
import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import * as React from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab, { TabProps } from '@mui/material/Tab';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import styles from './index.module.css';
import { ReactComponent as Clear } from '../../../../assets/images/job/task/clear-cache.svg';
import { ReactComponent as Visualization } from '../../../../assets/images/job/resource/persistent-cache-task/analytics.svg';
import { ReactComponent as Content } from '../../../../assets/images/job/resource/persistent-cache-task/content.svg';
import { ReactComponent as Select } from '../../../../assets/images/job/resource/persistent-cache-task/select-task.svg';

import {
  getClusters,
  getClustersResponse,
  getPersistentCacheTasks,
  getPersistentCacheTasksResponse,
} from '../../../../lib/api';
import { MAX_PAGE_SIZE } from '../../../../lib/constants';
import { TabContext, TabPanel } from '@mui/lab';
import Information from './information';
import Analytics from './analytics';
import Card from '../../../card';
import { fuzzySearch } from '../../../../lib/utils';
import { set } from 'lodash';

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

const AntTab = styled((props: StyledTabProps) => <Tab disableRipple {...props} />)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 0,
  [theme.breakpoints.up('sm')]: {
    minWidth: 0,
  },
  minHeight: '3rem',
  fontWeight: theme.typography.fontWeightRegular,
  color: 'var(--palette-grey-tab)',
  padding: '0',
  marginRight: '2rem',
  fontSize: '0.9rem',
  fontFamily: 'mabry-bold',
  '&:hover': {
    color: 'primary',
    opacity: 1,
  },
  '&.Mui-selected': {
    color: 'var(--palette-description-color)',
    fontFamily: 'mabry-bold',
  },
}));

const AntTabs = styled(Tabs)({
  borderBottom: '1px solid var(--palette-tab-border-color)',
  '& .MuiTabs-indicator': {
    backgroundColor: 'var(--palette-description-color)',
    borderRadius: '1rem',
  },
});

interface cluster {
  id: number;
  name: string;
}

export const DataContext = createContext({ setDeleteTask: (value: boolean) => {} });

export default function PersistentCacheTask() {
  const [value, setValue] = useState('1');
  const [cluster, setCluster] = useState<cluster[]>([]);
  const [errorMessage, setErrorMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [className, setClassName] = useState('');
  const [clusterID, setCluterId] = useState(() => {
    const clusterID = localStorage.getItem('cluster-id');
    return clusterID || 0;
  });

  const [clusterCount, setClusterCount] = useState<getClustersResponse[]>([]);
  // const [delete, setDelete] = useState(false);

  const [searchClusters, setSearchClusters] = useState('');
  const [deleteTask, setDeleteTask] = useState(false);
  const [persistentCacheTasks, setPersistentCacheTasks] = useState<getPersistentCacheTasksResponse[]>();

  const open = Boolean(anchorEl);
  const location = useLocation();
  const params = useParams();
  const breadcrumbsColor = location.pathname.split('/').length || 0;

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

  useEffect(() => {
    (async function () {
      try {
        if (Number(clusterID) > 0) {
          localStorage.setItem('cluster-id', String(clusterID));
          setIsLoading(true);
          const persistentCacheTasks = await getPersistentCacheTasks({
            page: 1,
            per_page: MAX_PAGE_SIZE,
            scheduler_cluster_id: String(clusterID),
          });

          setPersistentCacheTasks(persistentCacheTasks);
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
  }, [clusterID, cluster, deleteTask]);

  const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (e: { id: number; name: string }) => {
    setClassName(e.name);
    setCluterId(e.id);
    setAnchorEl(null);
  };

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  useEffect(() => {
    // if (location.pathname.split('/')[3] === 'persistent-cache-task') {
    //   setValue(1);
    // } else {
    //   setValue(2);
    // }
  }, [location.pathname]);

  // const debounced = useMemo(
  //   () =>
  //     debounce(async (currentSearch) => {
  //       if (currentSearch) {
  //         const clusters = fuzzySearch(currentSearch, clusterCount);

  //         setCluster(clusters);
  //         // setSearchIconISLodaing(false);
  //       } else if (currentSearch === '') {
  //         setCluster(clusterCount);
  //         // setSearchIconISLodaing(false);
  //       }
  //     }, 500),
  //   [],
  // );

  const handleInputChange = useCallback(
    (newSearch: any) => {
      // console.log(newSearch);

      setSearchClusters(newSearch);

      // debounced(newSearch);

      const queryString = newSearch ? `?search=${newSearch}` : '';
      // navigate(`${location.pathname}${queryString}`);
    },

    [location.pathname],
  );

  const handleSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (searchClusters !== '') {
      const clusterID = cluster.find((item) => item.name === searchClusters)?.id;

      if (clusterID && clusterID !== 0) {
        setCluterId(clusterID);
      }
    }
  };

  return (
    <DataContext.Provider value={{ setDeleteTask }}>
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
          sx={{ mb: '1rem' }}
        >
          <Typography color="text.primary">Job</Typography>
          <Typography color="text.primary">Resource</Typography>
          <Typography color="text.primary">Persistent Cache Task</Typography>
          {params?.id ? <Typography color="inherit">{params?.id || '-'}</Typography> : ''}
        </Breadcrumbs>
        {clusterID === 0 ? (
          <Box className={styles.noData}>
            <Select className={styles.nodataIcon} />
            <Box className={styles.searchContainer} component="form" onSubmit={handleSubmit}>
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
                  renderInput={(params) => <TextField {...params} sx={{ padding: 0 }} label="Scheduler cluster" />}
                />
              </Stack>
              <Button
                id="new-preheat"
                size="small"
                type="submit"
                sx={{
                  background: 'var(--palette-button-color)',
                  color: 'var(--palette-button-text-color)',
                  ':hover': { backgroundColor: 'var(--palette-hover-button-text-color)' },
                  ml: '1rem',
                }}
                // startIcon={<AddIcon />}
                variant="contained"
              >
                Find
              </Button>
            </Box>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Button
                id="new-preheat"
                size="small"
                sx={{
                  background: 'var(--palette-button-color)',
                  color: 'var(--palette-button-text-color)',
                  ':hover': { backgroundColor: 'var(--palette-hover-button-text-color)' },
                  textTransform: 'none',
                }}
                // startIcon={<AddIcon />}
                // variant="text"
                onClick={handleClickListItem}
              >
                <Typography variant="body2" fontFamily="mabry-bold" sx={{ pr: '0.4rem' }}>
                  {cluster.length > 0 && cluster.find((item) => item.id === Number(clusterID))?.name}
                </Typography>

                {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </Button>
              <Menu
                id="lock-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={() => {
                  setAnchorEl(null);
                }}
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
                    width: '10rem',
                  },
                }}
              >
                <Box className={styles.menu}>
                  <Typography variant="body1" fontFamily="mabry-bold" sx={{ m: '0.4rem 1rem' }}>
                    Filter by cluster
                  </Typography>
                  <Divider sx={{ mb: '0.2rem' }} />
                  {cluster.map((item, index) => (
                    <MenuItem
                      className={styles.menuItem}
                      key={item.name}
                      value={item.name}
                      onClick={() => handleMenuItemClick(item)}
                    >
                      {item?.name}
                    </MenuItem>
                  ))}
                </Box>
              </Menu>
            </Box>
            <TabContext value={value}>
              <AntTabs
                value={value}
                onChange={handleChange}
                aria-label="nav tabs example"
                sx={{ mb: '2rem' }}
                scrollButtons="auto"
              >
                <AntTab
                  key="1"
                  icon={<Content className={styles.tabIcon} />}
                  iconPosition="start"
                  label="Content"
                  //   component={Link}
                  //   to="/jobs/resource/persistent-cache-task"
                  sx={{ textTransform: 'none' }}
                  id="tab-profile"
                  value="1"
                />
                <AntTab
                  key="2"
                  icon={<Visualization className={styles.tabIcon} />}
                  iconPosition="start"
                  label="Analytics"
                  //   component={Link}
                  //   to="/jobs/resource/persistent-cache-task/visualization"
                  id="tab-analytics"
                  value="2"
                />
              </AntTabs>
              <TabPanel value="1" key="1" sx={{ p: 0 }}>
                <Information
                  persistentCacheTasks={persistentCacheTasks || []}
                  isLoading={isLoading}
                  clusterID={clusterID}
                  deleteTask={deleteTask}
                />
              </TabPanel>
              <TabPanel value="2" key="2" sx={{ p: 0 }}>
                <Analytics persistentCacheTasks={persistentCacheTasks || []} isLoading={isLoading} />
              </TabPanel>
            </TabContext>
          </>
        )}

        {/* <Outlet /> */}
      </Box>
    </DataContext.Provider>
  );
}
