import {
  Box,
  Chip,
  Divider,
  Paper,
  Typography,
  Breadcrumbs,
  Link as RouterLink,
  Tooltip,
  Snackbar,
  Alert,
  Skeleton,
  IconButton,
  Drawer,
  AccordionDetails,
  AccordionSummary,
  Accordion,
  ThemeProvider,
  createTheme,
  styled,
  tooltipClasses,
  TooltipProps,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { getJob, getJobResponse } from '../../../lib/api';
import { useParams, Link } from 'react-router-dom';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import { getBJTDatetime } from '../../../lib/utils';
import styles from './show.module.css';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import Card from '../../card';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1C293A',
    },
  },
  typography: {
    fontFamily: 'mabry-light,sans-serif',
  },
});

const CustomWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: '40rem',
  },
});

export default function ShowPreheat() {
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shouldPoll, setShouldPoll] = useState(false);
  const [errorLog, setErrorLog] = useState(false);
  const [preheat, setPreheat] = useState<getJobResponse>();

  const params = useParams();

  useEffect(() => {
    setIsLoading(true);
    (async function () {
      try {
        if (typeof params.id === 'string') {
          const job = await getJob(params.id);

          setPreheat(job);
          setIsLoading(false);
          if (job.result.state !== 'SUCCESS' && job.result.state !== 'FAILURE') {
            setShouldPoll(true);
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
          setIsLoading(false);
        }
      }
    })();
  }, [params.id]);

  useEffect(() => {
    if (shouldPoll) {
      const pollingInterval = setInterval(() => {
        const pollPreheat = async () => {
          try {
            if (typeof params.id === 'string') {
              const job = await getJob(params.id);
              setPreheat(job);

              if ((job?.result?.state && job?.result?.state === 'SUCCESS') || job?.result?.state === 'FAILURE') {
                setShouldPoll(false);
              }
            }
          } catch (error) {
            if (error instanceof Error) {
              setErrorMessage(true);
              setErrorMessageText(error.message);
              setShouldPoll(false);
              setIsLoading(false);
            }
          }
        };

        pollPreheat();
      }, 60000);

      return () => {
        clearInterval(pollingInterval);
      };
    }
  }, [shouldPoll, params.id]);

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorMessage(false);
    setErrorLog(false);
  };

  const scopeList = [
    { label: 'Single Seed Peer', name: 'single_seed_peer' },
    { label: 'All Seed Peers', name: 'all_seed_peers' },
    { label: 'All Peers', name: 'all_peers' },
  ];

  const scope = preheat?.args?.scope && scopeList.find((item) => item.name === preheat?.args?.scope);

  return (
    <ThemeProvider theme={theme}>
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
        <Typography>jobs</Typography>
        <RouterLink component={Link} underline="hover" color="inherit" to={`/jobs/preheats`}>
          preheats
        </RouterLink>
        <Typography color="text.primary" fontFamily="mabry-bold">
          {preheat?.id || '-'}
        </Typography>
      </Breadcrumbs>
      <Typography variant="h5" mb="2rem">
        Preheat
      </Typography>
      <Box width="100%">
        <Card className={styles.container}>
          <Box className={styles.informationContainer}>
            <Box className={styles.informationTitle}>
              <Box component="img" className={styles.informationTitleIcon} src="/icons/job/preheat/id.svg" />
              <Typography
                variant="body1"
                fontFamily="mabry-bold"
                component="div"
                className={styles.informationTitleText}
              >
                ID
              </Typography>
            </Box>
            <Typography id="id" variant="body1" className={styles.informationContent}>
              {isLoading ? <Skeleton data-testid="preheat-isloading" sx={{ width: '2rem' }} /> : preheat?.id || 0}
            </Typography>
          </Box>
          <Box className={styles.informationContainer}>
            <Box className={styles.informationTitle}>
              <Box component="img" className={styles.informationTitleIcon} src="/icons/job/preheat/description.svg" />
              <Typography
                variant="body1"
                fontFamily="mabry-bold"
                component="div"
                className={styles.informationTitleText}
              >
                Description
              </Typography>
            </Box>
            <Typography id="description" variant="body1" className={styles.informationContent}>
              {isLoading ? <Skeleton data-testid="preheat-isloading" sx={{ width: '2rem' }} /> : preheat?.bio || '-'}
            </Typography>
          </Box>
          <Box className={styles.informationContainer}>
            <Box className={styles.informationTitle}>
              <Box component="img" className={styles.informationTitleIcon} src="/icons/job/preheat/status.svg" />
              <Typography
                variant="body1"
                fontFamily="mabry-bold"
                component="div"
                className={styles.informationTitleText}
              >
                Status
              </Typography>
            </Box>
            <Box className={styles.statusContent}>
              {isLoading ? (
                <Skeleton data-testid="preheat-isloading" sx={{ width: '4rem' }} />
              ) : preheat?.result?.state ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      height: '2rem',
                      borderRadius: '0.3rem',
                      p: '0.4rem 0.6rem',
                      pr: preheat.result.state === 'FAILURE' ? '0' : '',
                      backgroundColor:
                        preheat.result.state === 'SUCCESS'
                          ? '#228B22'
                          : preheat.result.state === 'FAILURE'
                          ? '#D42536'
                          : '#DBAB0A',
                    }}
                    id="status"
                  >
                    {preheat.result.state === 'SUCCESS' ? (
                      <></>
                    ) : preheat.result.state === 'FAILURE' ? (
                      <></>
                    ) : (
                      <Box
                        component="img"
                        id="pending-icon"
                        className={styles.statusIcon}
                        src="/icons/job/preheat/status-pending.svg"
                      />
                    )}
                    <Typography
                      variant="body2"
                      fontFamily="mabry-bold"
                      sx={{
                        color: '#FFF',
                      }}
                    >
                      {preheat.result.state || ''}
                    </Typography>
                    {preheat?.result.state === 'FAILURE' ? (
                      <>
                        <Box
                          sx={{ ml: '0.4rem', mr: '0.2rem', backgroundColor: '#fff', height: '1rem', width: '0.08rem' }}
                        />
                        <Tooltip title="View error log." placement="top">
                          <IconButton
                            sx={{
                              '&.MuiIconButton-root': {
                                borderRadius: '0.3rem',
                                backgroundColor: '#D42536',
                                borderColor: '#D42536',
                                height: '2rem',
                              },
                            }}
                            onClick={() => {
                              setErrorLog(true);
                            }}
                          >
                            <Box
                              id="error-log-icon"
                              component="img"
                              sx={{ width: '1.2rem', height: '1.2rem' }}
                              src="/icons/job/preheat/error-log.svg"
                            />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <></>
                    )}
                  </Box>
                </Box>
              ) : (
                '-'
              )}
            </Box>
          </Box>
          <Box className={styles.informationContainer}>
            <Box className={styles.informationTitle}>
              <Box component="img" className={styles.informationTitleIcon} src="/icons/job/preheat/url.svg" />
              <Typography
                variant="body1"
                fontFamily="mabry-bold"
                component="div"
                className={styles.informationTitleText}
              >
                URL
              </Typography>
            </Box>
            <CustomWidthTooltip title={preheat?.args?.url || '-'} placement="bottom">
              <Typography
                id="url"
                variant="body1"
                fontFamily="mabry-bold"
                component="div"
                className={styles.urlContent}
              >
                {preheat?.args?.url || '-'}
              </Typography>
            </CustomWidthTooltip>
          </Box>
          <Box className={styles.informationContainer}>
            <Box className={styles.informationTitle}>
              <Box component="img" className={styles.informationTitleIcon} src="/icons/job/preheat/scope.svg" />
              <Typography
                variant="body1"
                fontFamily="mabry-bold"
                component="div"
                className={styles.informationTitleText}
              >
                Scope
              </Typography>
            </Box>
            <Typography id="scope" variant="body1" className={styles.informationContent}>
              {isLoading ? (
                <Skeleton data-testid="preheat-isloading" sx={{ width: '2rem' }} />
              ) : scope ? (
                scope.label
              ) : (
                ''
              )}
            </Typography>
          </Box>
          <Box className={styles.informationContainer}>
            <Box className={styles.informationTitle}>
              <Box component="img" className={styles.informationTitleIcon} src="/icons/job/preheat/tag.svg" />
              <Typography
                variant="body1"
                fontFamily="mabry-bold"
                component="div"
                className={styles.informationTitleText}
              >
                Tag
              </Typography>
            </Box>
            <Box id="tag" className={styles.informationContent}>
              {isLoading ? (
                <Skeleton data-testid="preheat-isloading" sx={{ width: '4rem' }} />
              ) : preheat?.args?.tag ? (
                <Chip
                  label={preheat.args.tag}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderRadius: '0.3rem',
                    background: 'var(--description-color)',
                    color: '#FFFFFF',
                    mr: '0.4rem',
                    borderColor: 'var(--description-color)',
                    fontWeight: 'bold',
                  }}
                />
              ) : (
                <Typography variant="body1" className={styles.informationContent}>
                  -
                </Typography>
              )}
            </Box>
          </Box>
          <Box className={styles.informationContainer}>
            <Box className={styles.informationTitle}>
              <Box component="img" className={styles.informationTitleIcon} src="/icons/job/preheat/headers.svg" />
              <Typography
                variant="body1"
                fontFamily="mabry-bold"
                component="div"
                className={styles.informationTitleText}
              >
                Headers
              </Typography>
            </Box>
            {isLoading ? (
              <Skeleton data-testid="preheat-isloading" sx={{ width: '4rem' }} />
            ) : preheat?.args?.headers && preheat?.args?.headers !== null ? (
              Object.keys(preheat?.args?.headers).length > 0 ? (
                <Card id="headers" className={styles.headersContent}>
                  {Object.entries(preheat?.args.headers).map(([key, value], index) => (
                    <Box key={index} className={styles.headersText}>
                      <Box id={`header-key${index}`} fontFamily="mabry-bold" width="35%" mr="1rem">
                        {key}
                      </Box>
                      <Box width="65%" className={styles.headerValue} id={`header-value${index}`}>
                        <CustomWidthTooltip title={value || '-'} placement="bottom">
                          <Typography id="url" variant="body1" component="div">
                            {value}
                          </Typography>
                        </CustomWidthTooltip>
                      </Box>
                    </Box>
                  ))}
                </Card>
              ) : (
                <Typography id="headers" variant="body1" className={styles.informationContent}>
                  -
                </Typography>
              )
            ) : (
              <Typography id="headers" variant="body1" className={styles.informationContent}>
                -
              </Typography>
            )}
          </Box>
          <Box className={styles.informationContainer}>
            <Box className={styles.informationTitle}>
              <Box component="img" className={styles.informationTitleIcon} src="/icons/job/preheat/id.svg" />
              <Typography
                variant="body1"
                fontFamily="mabry-bold"
                component="div"
                className={styles.informationTitleText}
              >
                Scheduler Clusters ID
              </Typography>
            </Box>
            <Box id="scheduler-lusters-id" className={styles.schedulerClustersID}>
              {preheat?.scheduler_clusters?.map((item, index) => {
                return (
                  <Box className={styles.schedulerClustersIDContent}>
                    <Typography key={index} variant="body2" component="div" fontFamily="mabry-bold">
                      {isLoading ? <Skeleton data-testid="preheat-isloading" sx={{ width: '4rem' }} /> : item.id || '-'}
                    </Typography>
                  </Box>
                );
              }) || '-'}
            </Box>
          </Box>
          <Box className={styles.informationContainer}>
            <Box className={styles.informationTitle}>
              <Box component="img" className={styles.informationTitleIcon} src="/icons/job/preheat/created-at.svg" />
              <Typography
                variant="body1"
                fontFamily="mabry-bold"
                component="div"
                className={styles.informationTitleText}
              >
                Created At
              </Typography>
            </Box>
            {isLoading ? (
              <Skeleton data-testid="preheat-isloading" sx={{ width: '4rem' }} />
            ) : preheat?.created_at ? (
              <Chip
                id="created-at"
                avatar={<MoreTimeIcon />}
                label={getBJTDatetime(preheat.created_at)}
                variant="outlined"
                size="small"
              />
            ) : (
              <Typography id="created-at" variant="body1" className={styles.informationContent}>
                -
              </Typography>
            )}
          </Box>
        </Card>
        <Drawer anchor="right" open={errorLog} onClose={handleClose}>
          <Box role="presentation" sx={{ width: '28rem' }}>
            <Box sx={{ height: '100vh', backgroundColor: '#24292f' }}>
              <Typography variant="h6" fontFamily="mabry-bold" sx={{ p: '1rem', color: '#fff' }}>
                Error log
              </Typography>
              <Divider sx={{ backgroundColor: '#6c6e6f' }} />
              <Box sx={{ p: '1rem' }}>
                <Accordion
                  disableGutters
                  elevation={0}
                  square
                  sx={{
                    '&:not(:last-child)': {
                      borderBottom: 0,
                    },
                    '&:before': {
                      display: 'none',
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem', color: '#d0d7de' }} />}
                    sx={{
                      backgroundColor: '#32383f',
                      flexDirection: 'row-reverse',
                      '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                        transform: 'rotate(90deg)',
                      },
                      '& .MuiAccordionSummary-content': {
                        marginLeft: '1rem',
                      },
                      height: '2rem',
                    }}
                    aria-controls="panel1d-content"
                    id="panel1d-header"
                  >
                    <Box display="flex">
                      <Box
                        component="img"
                        sx={{ width: '1.4rem', height: '1.4rem', mr: '0.6rem' }}
                        src="/icons/job/preheat/failure.svg"
                      />
                      <Typography variant="body2" fontFamily="mabry-bold" sx={{ color: '#d0d7de' }}>
                        Preheat
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails
                    sx={{
                      padding: '1rem',
                      backgroundColor: '#24292f',
                    }}
                  >
                    {preheat?.result?.job_states.map((item) =>
                      item.state === 'FAILURE' && item.error !== '' ? (
                        <Typography sx={{ color: '#d0d7de' }}>{item.error}</Typography>
                      ) : (
                        ''
                      ),
                    )}
                  </AccordionDetails>
                </Accordion>
              </Box>
            </Box>
          </Box>
        </Drawer>
      </Box>
    </ThemeProvider>
  );
}
