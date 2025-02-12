import { Breadcrumbs, createTheme, styled, ThemeProvider, Typography, Link as RouterLink } from '@mui/material';
import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import * as React from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab, { TabProps } from '@mui/material/Tab';
import { useEffect } from 'react';
import styles from './index.module.css';
import { ReactComponent as Clear } from '../../../assets/images/job/task/clear-cache.svg';
import { ReactComponent as Executions } from '../../../assets/images/job/task/executions.svg';

export default function NavTabs() {
  const [value, setValue] = React.useState(1);

  const location = useLocation();
  const params = useParams();
  const breadcrumbsColor = location.pathname.split('/').length || 0;

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (location.pathname.split('/')[3] === 'clear') {
      setValue(0);
    } else {
      setValue(1);
    }
  }, [location.pathname]);

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
    fontWeight: theme.typography.fontWeightRegular,
    marginRight: theme.spacing(1),
    color: 'var(--palette-text-secondary)',
    fontSize: '0.9rem',
    '&:hover': {
      color: 'primary',
      opacity: 1,
    },
    '&.Mui-selected': {
      color: 'var(--palette-text-secondary)',
      fontFamily: 'mabry-bold',
    },
  }));

  const AntTabs = styled(Tabs)({
    borderBottom: '1px solid var(--palette-tab-border-color)',
    '& .MuiTabs-indicator': {
      backgroundColor: 'var(--description-color)',
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
        <Typography>jobs</Typography>
        <Typography>task</Typography>
        {location.pathname.split('/')[3] === 'executions' ? (
          <RouterLink
            component={Link}
            underline="hover"
            color={breadcrumbsColor === 5 ? 'text.primary' : 'inherit'}
            to={`/jobs/task/executions`}
          >
            executions
          </RouterLink>
        ) : (
          <Typography color="inherit">{location.pathname.split('/')[3]}</Typography>
        )}
        {params?.id ? <Typography color="inherit"> {params?.id}</Typography> : ''}
      </Breadcrumbs>
      <AntTabs
        value={value}
        onChange={handleChange}
        aria-label="nav tabs example"
        sx={{ mb: '2rem' }}
        scrollButtons="auto"
      >
        <AntTab
          icon={<Clear className={styles.tabIcon} />}
          iconPosition="start"
          label="Clear"
          component={Link}
          to="/jobs/task/clear"
          sx={{ textTransform: 'none' }}
          id="tab-clear"
        />
        <AntTab
          icon={<Executions className={styles.tabIcon} />}
          iconPosition="start"
          label="Executions"
          component={Link}
          to="/jobs/task/executions"
          id="tab-executions"
        />
      </AntTabs>
      <Outlet />
    </Box>
  );
}
