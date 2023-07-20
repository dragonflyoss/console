import Layout from 'components/layout';
import { NextPageWithLayout } from '../_app';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Grid,
  IconButton,
  InputBase,
  Pagination,
  Paper,
  Skeleton,
  Snackbar,
  Tooltip,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { GetScheduler, GetSeedPeer, getClusters, getClustersSearch } from 'lib/api';
import styles from './index.module.scss';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { dateTimeFormat } from 'components/dataTime';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import parseLinkHeader from 'parse-link-header';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  palette: {
    secondary: {
      main: '#2E8F79',
    },
    primary: {
      main: '#1C293A',
    },
  },
});

const Security: NextPageWithLayout = () => {
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [numberOfClusters, setNumberOfClusters] = useState([]);
  const [scheduleList, setSchedleList] = useState([]);
  const [seedPeerList, setSeedPeerList] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [text, setText] = useState('');
  const [clusterList, setClusterList] = useState([
    {
      ID: '',
      Name: '',
      Scopes: {
        idc: '',
        location: '',
        cidrs: null,
      },
      CreatedAt: '2023-07-06T08:12:08Z',
      IsDefault: true,
    },
  ]);
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);

    getClusters().then(async (response) => {
      if (response.status == 200) {
        setNumberOfClusters(await response.json());
      } else {
        setErrorMessage(true);
        setErrorMessageText(response.statusText);
      }
    });

    GetScheduler().then(async (response) => {
      if (response.status == 200) {
        setSchedleList(await response.json());
      } else {
        setErrorMessage(true);
        setErrorMessageText(response.statusText);
      }
    });

    GetSeedPeer().then(async (response) => {
      if (response.status == 200) {
        setSeedPeerList(await response.json());
      } else {
        setErrorMessage(true);
        setErrorMessageText(response.statusText);
      }
    });

    getClustersSearch({ page: page, per_page: pageSize }).then(async (response) => {
      const linkHeader = response.headers.get('Link');
      const links = parseLinkHeader(linkHeader);
      setTotalPages(Number(links?.last?.page));
      setClusterList(await response.json());
    });

    setIsLoading(false);
  }, [page, pageSize]);

  const defaultCluster: any =
    Array.isArray(numberOfClusters) &&
    numberOfClusters?.filter((item: any) => {
      return item?.IsDefault == true;
    });

  const scheduleActive: any =
    Array.isArray(scheduleList) &&
    scheduleList?.filter((item: any) => {
      return item?.state == 'active';
    });

  const seedPeerActive: any =
    Array.isArray(seedPeerList) &&
    seedPeerList?.filter((item: any) => {
      return item?.state == 'active';
    });

  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const submitButton = document.getElementById('submit-button');
      submitButton?.click();
    }
  };

  const handleClick = async () => {
    await getClustersSearch({ page: 1, per_page: pageSize, name: text }).then(async (response) => {
      setClusterList(await response.json());
    });
  };

  const handleChangePage = (_event: any, newPage: any) => {
    setPage(newPage);
  };

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorMessage(false);
  };

  return (
    <Grid>
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
      <ThemeProvider theme={theme}>
        <Box className={styles.clusterTitle}>
          <Breadcrumbs aria-label="breadcrumb">
            <Typography variant="h5" color="text.primary" fontFamily="MabryPro-Bold">
              Cluster
            </Typography>
          </Breadcrumbs>
          <Button
            size="small"
            sx={{ '&.MuiButton-root': { backgroundColor: '#1C293A', borderRadius: 0 } }}
            variant="contained"
            onClick={() => {
              router.push(`/clusters/new`);
            }}
          >
            <AddIcon fontSize="small" sx={{ mr: '0.4rem' }} />
            Add cluster
          </Button>
        </Box>
        <Grid className={styles.clusterHeaderContainer}>
          <Paper variant="outlined" className={styles.clusterContainer}>
            <Box p="1rem">
              <Box display="flex">
                <Box className={styles.clusterHeaderIconWarp}>
                  <Box component="img" className={styles.clusterIconMadoka} src="/favicon/clusterIcon/roundIcon.svg" />
                  <Box
                    component="img"
                    className={styles.clusterIconGreatCircle}
                    src="/favicon/clusterIcon/roundIcon.svg"
                  />
                  <Box component="img" className={styles.clusterIcon} src="/favicon/clusterIcon/clusterIcon.svg" />
                </Box>
                <Typography variant="h6" fontFamily="MabryPro-Bold" className={styles.clusterIconTitle}>
                  Cluster
                </Typography>
              </Box>
              <Box className={styles.clusterContentContainer}>
                <Box marginLeft="0.6rem">
                  <Box className={styles.clusterTopWrap}>
                    <Typography variant="h5" fontFamily="MabryPro-Bold" sx={{ mr: '1rem' }}>
                      {isLoading ? <Skeleton sx={{ width: '1rem' }} /> : numberOfClusters.length}
                    </Typography>
                    <span>number of cluster</span>
                  </Box>
                  <Grid className={styles.clusterBottomWrap}>
                    <Box
                      component="img"
                      className={styles.clusterBottomIcon}
                      src="/favicon/clusterIcon/defaultIcon.svg"
                    />
                    <Box className={styles.clusterBottomContentContainer}>
                      <span className={styles.clusterBottomContent}>
                        {isLoading ? <Skeleton sx={{ width: '1rem' }} /> : defaultCluster?.length}
                      </span>
                      <span className={styles.clusterBottomContentMsg}>default</span>
                    </Box>
                  </Grid>
                </Box>
                <Box component="img" src="/favicon/clusterIcon/statisticsIcon.svg" />
              </Box>
            </Box>
          </Paper>
          <Paper variant="outlined" className={styles.clusterContainer}>
            <Box p="1rem">
              <Box display="flex">
                <Box className={styles.clusterHeaderIconWarp}>
                  <Box component="img" className={styles.clusterIconMadoka} src="/favicon/clusterIcon/roundIcon.svg" />
                  <Box
                    component="img"
                    className={styles.clusterIconGreatCircle}
                    src="/favicon/clusterIcon/roundIcon.svg"
                  />
                  <Box component="img" className={styles.clusterIcon} src="/favicon/clusterIcon/schedulerIcon.svg" />
                </Box>
                <Typography variant="h6" className={styles.clusterIconTitle} fontFamily="MabryPro-Bold">
                  Scheduler
                </Typography>
              </Box>
              <Box className={styles.clusterContentContainer}>
                <Box sx={{ ml: '0.6rem' }}>
                  <Box className={styles.clusterTopWrap}>
                    <Typography variant="h5" fontFamily="MabryPro-Bold" sx={{ mr: '1rem' }}>
                      {isLoading ? <Skeleton sx={{ width: '1rem' }} /> : scheduleList?.length}
                    </Typography>
                    <span>number of cluster</span>
                  </Box>

                  <Grid className={styles.clusterBottomWrap}>
                    <Box
                      component="img"
                      className={styles.clusterBottomIcon}
                      src="/favicon/clusterIcon/activeIcon.svg"
                    />
                    <Box className={styles.clusterBottomContentContainer}>
                      <span className={styles.clusterBottomContent}>
                        {isLoading ? <Skeleton sx={{ width: '1rem' }} /> : scheduleActive?.length}
                      </span>
                      <span className={styles.clusterBottomContentMsg}>active</span>
                    </Box>
                  </Grid>
                </Box>
                <Box component="img" src="/favicon/clusterIcon/statisticsIcon.svg" />
              </Box>
            </Box>
          </Paper>
          <Paper variant="outlined" className={styles.seedPseerContainer}>
            <Box p="1rem">
              <Box display="flex">
                <Box className={styles.clusterHeaderIconWarp}>
                  <Box component="img" className={styles.clusterIconMadoka} src="/favicon/clusterIcon/roundIcon.svg" />
                  <Box
                    component="img"
                    className={styles.clusterIconGreatCircle}
                    src="/favicon/clusterIcon/roundIcon.svg"
                  />
                  <Box component="img" className={styles.clusterIcon} src="/favicon/clusterIcon/seedPeerIcon.svg" />
                </Box>
                <Typography variant="h6" fontFamily="MabryPro-Bold" className={styles.seedPseerIconTitle}>
                  Seed peer
                </Typography>
              </Box>
              <Box className={styles.clusterContentContainer}>
                <Box sx={{ ml: '0.6rem' }}>
                  <Box className={styles.clusterTopWrap}>
                    <Typography variant="h5" fontFamily="MabryPro-Bold" sx={{ mr: '1rem' }}>
                      {isLoading ? <Skeleton sx={{ width: '1rem' }} /> : seedPeerList.length}
                    </Typography>
                    <span>number of cluster</span>
                  </Box>
                  <Grid className={styles.clusterBottomWrap}>
                    <Box
                      component="img"
                      className={styles.clusterBottomIcon}
                      src="/favicon/clusterIcon/activeIcon.svg"
                    />
                    <Box className={styles.clusterBottomContentContainer}>
                      <span className={styles.clusterBottomContent}>
                        {isLoading ? <Skeleton sx={{ width: '1rem' }} /> : seedPeerActive?.length}
                      </span>
                      <span className={styles.clusterBottomContentMsg}>active</span>
                    </Box>
                  </Grid>
                </Box>
                <Box component="img" src="/favicon/clusterIcon/statisticsIcon.svg" />
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Paper variant="outlined" className={styles.searchContainer}>
          <InputBase
            name="Name"
            placeholder="Search"
            color="secondary"
            value={text}
            onKeyDown={handleKeyDown}
            onChange={(event) => setText(event.target.value)}
            sx={{ ml: 1, flex: 1 }}
            inputProps={{ 'aria-label': 'search google maps' }}
          />
          <IconButton
            type="button"
            aria-label="search"
            id="submit-button"
            size="small"
            onClick={handleClick}
            sx={{ width: '3rem' }}
          >
            <SearchIcon sx={{ color: 'rgba(0,0,0,0.6)' }} />
          </IconButton>
        </Paper>
        <Grid item xs={12} className={styles.paperContainer} component="form" noValidate>
          {Array.isArray(clusterList) &&
            clusterList.map((item: any, id: React.Key | null | undefined) => (
              <Paper
                key={id}
                variant="outlined"
                sx={{
                  mr: '1rem',
                  mb: '1rem',
                  maxWidth: '27rem',
                  width: '32.4%',
                  ':nth-of-type(3n)': {
                    mr: '0rem',
                  },
                  [theme.breakpoints.up('xl')]: {
                    ':nth-of-type(3n)': {
                      mr: '1rem !important',
                    },
                  },
                }}
              >
                <Box className={styles.paperContent}>
                  <Box display="flex">
                    <span className={styles.IDText}>ID&nbsp;:&nbsp;</span>
                    {isLoading ? <Skeleton sx={{ width: '1rem' }} /> : <span className={styles.IDText}>{item.ID}</span>}
                  </Box>
                  {isLoading ? (
                    <Skeleton sx={{ width: '4rem', height: '1.4rem', mt: '0.8rem', mb: '0.8rem' }} />
                  ) : (
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      sx={{
                        mt: '0.8rem',
                        mb: '0.8rem',
                        width: item.IsDefault ? '4rem' : '6rem',
                        height: '1.4rem',
                        background: item.IsDefault ? '#2E8F79' : '#1C293A',
                        color: item.IsDefault ? '#FFFFFF' : '#FFFFFF',
                      }}
                    >
                      <Typography variant="body2" fontFamily="system-ui">
                        {`${item.IsDefault ? 'Default' : 'Non-Default'}`}
                      </Typography>
                    </Box>
                  )}
                  <Typography variant="h6" component="div" fontFamily="MabryPro-Bold">
                    {isLoading ? <Skeleton sx={{ width: '6rem' }} /> : item.Name}
                  </Typography>
                  <Box display="flex" mt="0.4rem">
                    <Box display="flex" className={styles.LoctionContainer}>
                      <Typography variant="body2" component="div" fontFamily="MabryPro-Bold">
                        IDC&nbsp;:&nbsp;
                      </Typography>
                      <Tooltip title={item.Scopes.idc || '-'} placement="top">
                        <Typography variant="body2" component="div" className={styles.LoctionText}>
                          {isLoading ? <Skeleton sx={{ width: '6rem' }} /> : item.Scopes.idc || '-'}
                        </Typography>
                      </Tooltip>
                    </Box>
                    <Box display="flex" className={styles.LoctionContainer}>
                      <Typography variant="body2" component="div" fontFamily="MabryPro-Bold">
                        Location&nbsp;:&nbsp;
                      </Typography>
                      <Tooltip title={item.Scopes.location || '-'} placement="top">
                        <Typography variant="body2" component="div" className={styles.LoctionText}>
                          {isLoading ? <Skeleton sx={{ width: '6rem' }} /> : item.Scopes.location || '-'}
                        </Typography>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Box className={styles.creatTimeContainer}>
                    <Chip
                      avatar={<MoreTimeIcon />}
                      label={isLoading ? <Skeleton sx={{ width: '6rem' }} /> : dateTimeFormat(item.CreatedAt)}
                      variant="outlined"
                      size="small"
                    />
                    <IconButton
                      className={styles.buttonContent}
                      sx={{
                        '&.MuiButton-root': {
                          backgroundColor: '#fff',
                          padding: 0,
                        },
                      }}
                      onClick={() => {
                        router.push(`/clusters/${item.ID}`);
                      }}
                    >
                      <ArrowCircleRightIcon fontSize="large" sx={{ color: '#1C293A' }} />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            ))}
        </Grid>
        <Box display="flex" justifyContent="flex-end" sx={{ marginTop: theme.spacing(2) }}>
          <Pagination count={totalPages} page={page} onChange={handleChangePage} color="primary" size="small" />
        </Box>
      </ThemeProvider>
    </Grid>
  );
};

export default Security;
Security.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};
