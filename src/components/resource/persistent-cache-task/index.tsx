import { Breadcrumbs, styled, Typography, Link as RouterLink, Snackbar, Alert } from '@mui/material';
import { Link, useLocation, useParams } from 'react-router-dom';
import * as React from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab, { TabProps } from '@mui/material/Tab';
import { createContext, useEffect, useState } from 'react';
import { ReactComponent as Visualization } from '../../../assets/images/resource/persistent-cache-task/analytics.svg';
import { ReactComponent as Task } from '../../../assets/images/resource/persistent-cache-task/task.svg';
import { getPersistentCacheTasks, getPersistentCacheTasksResponse } from '../../../lib/api';
import { MAX_PAGE_SIZE } from '../../../lib/constants';
import { TabContext, TabPanel } from '@mui/lab';
import Information from './information';
import Analytics from './analytics';
import styles from './index.module.css';

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

export const DataContext = createContext({ setDeleteTask: (value: boolean) => {} });

export default function PersistentCacheTask() {
  const [value, setValue] = useState('1');
  const [errorMessage, setErrorMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [deleteTask, setDeleteTask] = useState(false);
  const [persistentCacheTasks, setPersistentCacheTasks] = useState<getPersistentCacheTasksResponse[]>();

  const location = useLocation();
  const params = useParams();
  const breadcrumbsColor = location.pathname.split('/').length || 0;

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
  }, [params?.id, deleteTask]);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <DataContext.Provider value={{ setDeleteTask }}>
      <Snackbar
        open={errorMessage}
        autoHideDuration={3000}
        onClose={() => {
          setErrorMessage(false);
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          id="error-message"
          onClose={() => {
            setErrorMessage(false);
          }}
          severity="error"
          sx={{ width: '100%' }}
        >
          {errorMessageText}
        </Alert>
      </Snackbar>
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
          {params?.id ? (
            <Typography color="inherit" id="scheduler-cluster-id">
              scheduler-cluster-{params?.id || '-'}
            </Typography>
          ) : (
            ''
          )}
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
              icon={<Task className={styles.tabIcon} />}
              iconPosition="start"
              label="Tasks"
              sx={{ textTransform: 'none' }}
              id="tab-profile"
              value="1"
            />
            <AntTab
              key="2"
              icon={<Visualization className={styles.tabIcon} />}
              iconPosition="start"
              label="Analytics"
              id="tab-analytics"
              value="2"
            />
          </AntTabs>
          <TabPanel value="1" key="1" sx={{ p: 0 }}>
            <Information
              persistentCacheTasks={persistentCacheTasks || []}
              isLoading={isLoading}
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
