import { Alert, Box, Breadcrumbs, Card, Snackbar, styled, Tab, TabProps, Tabs, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import styles from './index.module.css';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ReactComponent as Job } from '../../assets/images/gc/job.svg';
import { ReactComponent as Audit } from '../../assets/images/gc/audit.svg';

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
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [value, setValue] = useState(1);

  const location = useLocation();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (location.pathname.split('/')[2] === 'audit') {
      setValue(0);
    } else {
      setValue(1);
    }
  }, [location.pathname]);

  const handleClose = (_event: any, reason?: string) => {};
  return (
    <Box>
      <Snackbar
        open={successMessage}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          Submission successful!
        </Alert>
      </Snackbar>
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
        <Typography color="text.primary">{location.pathname.split('/')[2] === 'audit' ? 'Audit' : 'Job'}</Typography>
      </Breadcrumbs>
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
        />
        <AntTab
          icon={<Job className={styles.tabIcon} />}
          iconPosition="start"
          label="Job"
          component={Link}
          to="/gc/job"
          sx={{ textTransform: 'none' }}
          id="tab-clear"
        />
      </AntTabs>
      <Outlet />
    </Box>
  );
}
