import { Alert, Box, Breadcrumbs, Card, Snackbar, styled, Tab, TabProps, Tabs, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import styles from './index.module.css';
import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import { ReactComponent as Job } from '../../assets/images/gc/job.svg';
import { ReactComponent as Audit } from '../../assets/images/gc/audit.svg';
import { TabContext, TabPanel } from '@mui/lab';
import AuditGC from './audit';
import JobGC from './job';

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

export default function ClearingJob() {
  const [value, setValue] = useState('1');

  const params = useParams();

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (params.key === 'audit') {
      setValue('1');
    }
    if (params.key === 'job') {
      setValue('2');
    }
  }, [params]);

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
        <Typography color="text.primary">Garbage Collection</Typography>
        <Typography color="text.primary">{params.key === 'audit' ? 'Audit' : 'Job'}</Typography>
      </Breadcrumbs>
      <TabContext value={value}>
        <AntTabs
          value={value}
          onChange={handleChange}
          aria-label="nav tabs example"
          sx={{ mb: '2rem', mt: '1rem' }}
          scrollButtons="auto"
        >
          <AntTab
            icon={<Audit className={styles.tabIcon} />}
            iconPosition="start"
            label="Audit"
            component={Link}
            to="/gc/audit"
            id="tab-executions"
            value="1"
          />
          <AntTab
            icon={<Job className={styles.tabIcon} />}
            iconPosition="start"
            label="Job"
            component={Link}
            to="/gc/job"
            sx={{ textTransform: 'none' }}
            id="tab-clear"
            value="2"
          />
        </AntTabs>
        <TabPanel value="1" key="1" sx={{ p: 0 }}>
          <AuditGC />
        </TabPanel>
        <TabPanel value="2" key="2" sx={{ p: 0 }}>
          <JobGC />
        </TabPanel>
      </TabContext>
    </Box>
  );
}
