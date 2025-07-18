import { Breadcrumbs, styled, Typography, Link as RouterLink } from '@mui/material';
import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import * as React from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab, { TabProps } from '@mui/material/Tab';
import { useEffect, useState } from 'react';
import styles from './index.module.css';
import { ReactComponent as ClearIcon } from '../../../assets/images/resource/task/clear-cache.svg';
import { ReactComponent as ExecutionsIcon } from '../../../assets/images/resource/task/executions.svg';
import Clear from './clear';
import Executions from './executions';

import { TabContext, TabPanel } from '@mui/lab';

export default function NavTabs() {
  const [value, setValue] = useState('1');

  const location = useLocation();
  const params = useParams();
  const breadcrumbsColor = location.pathname.split('/').length || 0;

  const handleChange = (event: React.SyntheticEvent, newValue: React.SetStateAction<string>) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (params.key === 'clear') {
      setValue('1');
    }
    if (params.key === 'executions') {
      setValue('2');
    }
  }, [params]);

  type StyledTabProps = Omit<TabProps, 'component'> & {
    component?: React.ElementType;
    to: string;
  };

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

  return (
    <Box>
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
        <Typography color="text.primary">Task</Typography>
        {params.key === 'executions' ? (
          <RouterLink
            component={Link}
            underline="hover"
            color={breadcrumbsColor === 5 ? 'text.primary' : 'inherit'}
            to={`/resource/task/executions`}
          >
            Executions
          </RouterLink>
        ) : (
          <Typography color="inherit">Clear</Typography>
        )}
        {params?.id ? <Typography color="inherit">{params?.id || '-'}</Typography> : ''}
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
            icon={<ClearIcon className={styles.tabIcon} />}
            iconPosition="start"
            label="Clear"
            component={Link}
            to="/resource/task/clear"
            sx={{ textTransform: 'none' }}
            id="tab-clear"
            value="1"
          />
          <AntTab
            icon={<ExecutionsIcon className={styles.tabIcon} />}
            iconPosition="start"
            label="Executions"
            component={Link}
            to="/resource/task/executions"
            id="tab-executions"
            value="2"
          />
        </AntTabs>
        <TabPanel value="1" key="1" sx={{ p: 0 }}>
          <Clear />
        </TabPanel>
        <TabPanel value="2" key="1" sx={{ p: 0 }}>
          <Executions />
        </TabPanel>
      </TabContext>
    </Box>
  );
}
