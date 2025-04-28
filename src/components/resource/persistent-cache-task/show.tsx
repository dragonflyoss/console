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
} from '@mui/material';
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import * as React from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab, { TabProps } from '@mui/material/Tab';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import styles from './index.module.css';
// import { ReactComponent as Clear } from '../../../assets/images/resource/persistent-cache-task';
import { ReactComponent as Visualization } from '../../../assets/images/resource/persistent-cache-task/analytics.svg';
import { ReactComponent as Content } from '../../../assets/images/resource/persistent-cache-task/content.svg';
import { ReactComponent as Select } from '../../../assets/images/resource/persistent-cache-task/select-task.svg';
import { ReactComponent as ClusterID } from '../../../assets/images/cluster/id.svg';
import { ReactComponent as IcContent } from '../../../assets/images/cluster/scheduler/ic-content.svg';
import { ReactComponent as NoCluster } from '../../../assets/images/cluster/no-cluster.svg';
import { ReactComponent as ArrowCircleRightIcon } from '../../../assets/images/cluster/arrow-circle-right.svg';

import {
  getClusters,
  getClustersResponse,
  getPersistentCacheTasks,
  getPersistentCacheTasksResponse,
} from '../../../lib/api';
import { MAX_PAGE_SIZE } from '../../../lib/constants';
import { TabContext, TabPanel } from '@mui/lab';
import Information from './information';
import Analytics from './analytics';
import Card from '../../card';
import { fuzzySearch, getDatetime, getPaginatedList } from '../../../lib/utils';
import MoreTimeIcon from '@mui/icons-material/MoreTime';

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
  const [cluster, setCluster] = useState<getClustersResponse[]>([]);
  const [errorMessage, setErrorMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [clusterPage, setClusterPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(9);
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
  const [allClusters, setAllClusters] = useState<getClustersResponse[]>([]);

  const [persistentCacheTasks, setPersistentCacheTasks] = useState<getPersistentCacheTasksResponse[]>();

  const navigate = useNavigate();

  const open = Boolean(anchorEl);
  const location = useLocation();
  const params = useParams();
  const breadcrumbsColor = location.pathname.split('/').length || 0;

  //   useEffect(() => {
  //     (async function () {
  //       try {
  //         const cluster = await getClusters({ page: 1, per_page: MAX_PAGE_SIZE });
  //         setCluster(cluster);
  //         setClusterCount(cluster);
  //       } catch (error) {
  //         if (error instanceof Error) {
  //           setErrorMessage(true);
  //           setErrorMessageText(error.message);
  //         }
  //       }
  //     })();
  //   }, []);

  useEffect(() => {
    (async function () {
      try {
        if (params?.id) {
          localStorage.setItem('cluster-id', String(params?.id));
          setIsLoading(true);
          const persistentCacheTasks = await getPersistentCacheTasks({
            page: 1,
            per_page: MAX_PAGE_SIZE,
            scheduler_cluster_id: String(params?.id),
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
  }, [params?.id, cluster, deleteTask]);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  //   );

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
          <Typography color="text.primary">Resource</Typography>

          <RouterLink
            component={Link}
            underline="hover"
            color={breadcrumbsColor === 5 ? 'text.primary' : 'inherit'}
            to={`/resource/persistent-cache-task`}
          >
            Persistent Cache Task
          </RouterLink>
          {params?.id ? <Typography color="inherit">scheduler-cluster-{params?.id || '-'}</Typography> : ''}
        </Breadcrumbs>

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
              label="Tasks"
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
      </Box>
    </DataContext.Provider>
  );
}
