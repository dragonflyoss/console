import { Breadcrumbs, Button, createTheme, styled, ThemeProvider, Typography, Link as RouterLink } from '@mui/material';
import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import * as React from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab, { TabProps } from '@mui/material/Tab';
import { useEffect } from 'react';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e8f79',
    },
  },
});

export default function NavTabs() {
  const [value, setValue] = React.useState(1);

  const location = useLocation();
  const params = useParams();

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
    color: 'rgba(0, 0, 0, 0.85)',
    fontSize: '0.9rem',
    '&:hover': {
      color: 'primary',
      opacity: 1,
    },
    '&.Mui-selected': {
      color: '#000',
      fontFamily: 'mabry-bold',
    },
  }));

  const AntTabs = styled(Tabs)({
    borderBottom: '1px solid #e8e8e8',
    '& .MuiTabs-indicator': {
      backgroundColor: 'primary',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Breadcrumbs
        separator={
          <Box
            sx={{ width: '0.3rem', height: '0.3rem', backgroundColor: '#919EAB', borderRadius: '50%', m: '0 0.4rem' }}
          />
        }
        aria-label="breadcrumb"
        sx={{ mb: '1rem' }}
      >
        <Typography color="text.primary">jobs</Typography>
        <Typography color="text.primary">task</Typography>
        {location.pathname.split('/')[3] === 'executions' ? (
          <RouterLink component={Link} underline="hover" color="inherit" to={`/jobs/task/executions`}>
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
          icon={<Box component="img" sx={{ width: '1.5rem' }} src="/icons/job/task/clear-cache.svg" />}
          iconPosition="start"
          label="Clear"
          component={Link}
          to="/jobs/task/clear"
          sx={{ textTransform: 'none' }}
          id="tab-clear"
        />
        <AntTab
          icon={<Box component="img" sx={{ width: '1.5rem' }} src="/icons/job/task/executions.svg" />}
          iconPosition="start"
          label="Executions"
          component={Link}
          to="/jobs/task/executions"
          id="tab-executions"
        />
      </AntTabs>
      <Outlet />
    </ThemeProvider>
  );
}
