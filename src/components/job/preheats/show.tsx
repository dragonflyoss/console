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
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: '1rem' }}>
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
        <Paper variant="outlined" sx={{ p: '1rem 2rem' }}>
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
                <Paper id="headers" variant="outlined" className={styles.headersContent}>
                  {Object.entries(preheat?.args.headers).map(([key, value], index) => (
                    <Box key={index} className={styles.headersText}>
                      <Box fontFamily="mabry-bold" width="35%" mr="1rem">
                        {key}
                      </Box>
                      <Box width="65%">{value}</Box>
                    </Box>
                  ))}
                </Paper>
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
                      {isLoading ? (
                        <Skeleton data-testid="execution-isloading" sx={{ width: '4rem' }} />
                      ) : (
                        item.id || '-'
                      )}
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
        </Paper>
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

// curl --location --request POST 'http://localhost:8080/oapi/v1/jobs' \
// --header 'Content-Type: application/json' \
// --header 'Authorization: Bearer ZjhlOGI3YmUtNWZmZi00MWEwLWIyYTUtZDEzODE3ZDJiZGIx' \
// --data-raw '{
//     "type": "preheat",
//     "args": {
//         "type": "image",
//         "url": "https://dockerpull.org/v2/library/alpine/manifests/3.19",
//         "username": "zhaoxinxin1",
//         "password": "zhaoxin666..",
//         "scope": "single_seed_peer",
//         "scheduler_cluster_ids":[1]
//     }
// }'

// curl --request GET 'http://localhost:8080/oapi/v1/jobs/3' \
// --header 'Content-Type: application/json' \
// --header 'Authorization: Bearer ZjhlOGI3YmUtNWZmZi00MWEwLWIyYTUtZDEzODE3ZDJiZGIx'

// curl --location --request POST 'http://localhost:8080/oapi/v1/jobs' \
// --header 'Content-Type: application/json' \
// --header 'Authorization: Bearer ZjhlOGI3YmUtNWZmZi00MWEwLWIyYTUtZDEzODE3ZDJiZGIx' \
// --data-raw '{
//     "type": "preheat",
//     "args": {
//         "type": "file",
//         "url": "https://image.baidu.com/front/aigc?atn=aigc&fr=home&imgcontent=%7B%22aigcQuery%22%3A%22%22%2C%22imageAigcId%22%3A%224199096378%22%7D&isImmersive=1&pd=image_content&quality=1&ratio=9%3A16&sa=searchpromo_shijian_photohp_inspire&tn=aigc&top=%7B%22sfhs%22%3A1%7D&word=%E5%86%AC%E6%97%A5%E7%9A%84%E5%B0%8F%E4%BC%81%E9%B9%85%EF%BC%8C%E5%9C%A8%E5%86%B0%E9%9B%AA%E8%A6%86%E7%9B%96%E7%9A%84%E5%8D%97%E6%9E%81%EF%BC%8C%E4%B8%80%E5%8F%AA%E5%B0%8F%E4%BC%81%E9%B9%85%E8%B9%92%E8%B7%9A%E5%9C%B0%E5%AD%A6%E7%9D%80%E8%B5%B0%E8%B7%AF%EF%BC%8C%E5%AE%83%E7%9A%84%E9%BB%91%E7%99%BD%E7%9B%B8%E9%97%B4%E7%9A%84%E7%BE%BD%E6%AF%9B%E5%9C%A8%E9%9B%AA%E5%9C%B0%E4%B8%AD%E6%98%BE%E5%BE%97%E6%A0%BC%E5%A4%96%E9%86%92%E7%9B%AE%EF%BC%8C%E5%BC%95%E6%9D%A5%E4%BA%86%E5%90%8C%E4%BC%B4%E4%BB%AC%E5%A5%BD%E5%A5%87%E7%9A%84%E7%9B%AE%E5%85%89%E3%80%82",
//         "scope": "all_seed_peers",
//         "scheduler_cluster_ids":[1]
//     }
// }'
