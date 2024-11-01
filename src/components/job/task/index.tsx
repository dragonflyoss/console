import { Breadcrumbs, Button, createTheme, styled, ThemeProvider, Typography, Link as RouterLink } from '@mui/material';
import { Link, Outlet, useLocation, useParams } from 'react-router-dom';

import * as React from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab, { TabProps } from '@mui/material/Tab';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import { useEffect } from 'react';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e8f79',
    },
  },
  typography: {
    fontFamily: 'mabry-light,sans-serif',
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
    // fontFamily: [
    //   '-apple-system',
    //   'BlinkMacSystemFont',
    //   '"Segoe UI"',
    //   'Roboto',
    //   '"Helvetica Neue"',
    //   'Arial',
    //   'sans-serif',
    //   '"Apple Color Emoji"',
    //   '"Segoe UI Emoji"',
    //   '"Segoe UI Symbol"',
    // ].join(','),
    '&:hover': {
      color: 'primary',
      opacity: 1,
    },
    '&.Mui-selected': {
      color: '#000',
      // fontWeight: theme.typography.fontWeightMedium,
      fontFamily: 'mabry-bold',
    },
    // '&.Mui-focusVisible': {
    //   backgroundColor: '#000',
    // },
    
  }));

  const AntTabs = styled(Tabs)({
    borderBottom: '1px solid #e8e8e8',
    '& .MuiTabs-indicator': {
      backgroundColor: 'primary',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: '1rem' }}>
        <Typography color="inherit">jobs</Typography>
        <Typography color="inherit">task</Typography>
        {location.pathname.split('/')[3] === 'executions' ? (
          <RouterLink component={Link} underline="hover" color="inherit" to={`/jobs/task/executions`}>
            executions
          </RouterLink>
        ) : (
          <Typography color="text.primary">{location.pathname.split('/')[3]}</Typography>
        )}
        {params?.id ? <Typography color="text.primary"> {params?.id}</Typography> : ''}
      </Breadcrumbs>
      {/* <Typography variant="h5" p="1rem 0">
        Task
      </Typography> */}
      <AntTabs
        value={value}
        onChange={handleChange}
        aria-label="nav tabs example"
        // role="navigation"
        sx={{ mb: '2rem' }}
        // textColor="primary"
        // indicatorColor="primary"
        scrollButtons="auto"
      >
        <AntTab
          icon={<Box component="img" sx={{ width: '1.5rem' }} src="/icons/job/task/clear-cache.svg" />}
          iconPosition="start"
          label="Clear"
          component={Link}
          to="/jobs/task/clear"
          sx={{ textTransform: 'none' }}
        />
        <AntTab
          icon={<Box component="img" sx={{ width: '1.5rem' }} src="/icons/job/task/executions.svg" />}
          iconPosition="start"
          label="Executions"
          component={Link}
          to="/jobs/task/executions"
        />
      </AntTabs>
      <Outlet />
    </ThemeProvider>
  );
}
