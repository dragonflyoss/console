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
} from '@mui/material';
import { useEffect, useState } from 'react';
import { getJob } from '../../../lib/api';
import { useParams, Link } from 'react-router-dom';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import { getDatetime } from '../../../lib/utils';
import styles from './show.module.css';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';

export default function ShowPreheat() {
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shouldPoll, setShouldPoll] = useState(false);
  const [errorLog, setErrorLog] = useState(false);
  const [preheat, setPreheat] = useState({
    id: 0,
    created_at: '',
    updated_at: '',
    is_del: 0,
    task_id: '',
    bio: '',
    type: '',
    state: '',
    args: {
      filter: '',
      headers: '',
      tag: '',
      type: '',
      url: '',
    },
    result: {
      CreatedAt: '',
      GroupUUID: '',
      JobStates: [
        {
          CreatedAt: '',
          Error: '',
          Results: [''],
          State: '',
          TTL: 0,
          TaskName: '',
          TaskUUID: '',
        },
      ],
      State: '',
    },
    scheduler_clusters: [{ id: 0 }],
  });

  const params = useParams();

  useEffect(() => {
    setIsLoading(true);
    (async function () {
      try {
        if (typeof params.id === 'string') {
          const job = await getJob(params.id);
          setPreheat(job);
          setIsLoading(false);

          if (job.result.State !== 'SUCCESS' && job.result.State !== 'FAILURE') {
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

              if (job.result.State && job.result.State === 'SUCCESS') {
                setShouldPoll(false);
              }

              if (job.result.State && job.result.State === 'FAILURE') {
                setShouldPoll(false);
              }
            }
          } catch (error) {
            if (error instanceof Error) {
              setErrorMessage(true);
              setErrorMessageText(error.message);
              setIsLoading(false);
            }
          }
        };

        pollPreheat();
      }, 3000);

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

  return (
    <Box>
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
          {preheat.id}
        </Typography>
      </Breadcrumbs>
      <Typography variant="h5" mb="1rem">
        Preheat
      </Typography>
      <Box width="100%">
        <Paper variant="outlined" sx={{ p: '1rem 2rem', mt: '1rem' }}>
          <Box className={styles.informationContainer}>
            <Box className={styles.informationTitle}>
              <Box component="img" className={styles.informationTitleIcon} src="/icons/preheat/id.svg" />
              <Typography
                variant="body1"
                fontFamily="mabry-bold"
                component="div"
                className={styles.informationTitleText}
              >
                ID
              </Typography>
            </Box>
            <Typography variant="body1" className={styles.informationContent}>
              {isLoading ? <Skeleton sx={{ width: '2rem' }} /> : preheat.id || ''}
            </Typography>
          </Box>
          <Box className={styles.informationContainer}>
            <Box className={styles.informationTitle}>
              <Box component="img" className={styles.informationTitleIcon} src="/icons/preheat/description.svg" />
              <Typography
                variant="body1"
                fontFamily="mabry-bold"
                component="div"
                className={styles.informationTitleText}
              >
                Description
              </Typography>
            </Box>
            <Typography variant="body1" className={styles.informationContent}>
              {isLoading ? <Skeleton sx={{ width: '2rem' }} /> : preheat.bio || '-'}
            </Typography>
          </Box>
          <Box className={styles.informationContainer}>
            <Box className={styles.informationTitle}>
              <Box component="img" className={styles.informationTitleIcon} src="/icons/preheat/status.svg" />
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
                <Skeleton sx={{ width: '4rem' }} />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      height: '2rem',
                      borderRadius: '0.3rem',
                      p: '0.4rem 0.6rem',
                      pr: preheat.result.State === 'FAILURE' ? '0' : '',
                      backgroundColor:
                        preheat.result.State === 'SUCCESS'
                          ? '#228B22'
                          : preheat.result.State === 'FAILURE'
                          ? '#D42536'
                          : '#DBAB0A',
                    }}
                  >
                    {preheat.result.State === 'SUCCESS' ? (
                      <Box component="img" className={styles.statusIcon} src="/icons/preheat/status-success.svg" />
                    ) : preheat.result.State === 'FAILURE' ? (
                      <Box component="img" className={styles.statusIcon} src="/icons/preheat/status-failure.svg" />
                    ) : (
                      <Box component="img" className={styles.statusIcon} src="/icons/preheat/status-pending.svg" />
                    )}
                    <Typography
                      variant="body2"
                      fontFamily="mabry-bold"
                      sx={{
                        color: '#FFF',
                        ml: '0.4rem',
                      }}
                    >
                      {preheat.result.State || ''}
                    </Typography>
                    {preheat.result.State === 'FAILURE' ? (
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
                              component="img"
                              sx={{ width: '1.2rem', height: '1.2rem' }}
                              src="/icons/preheat/error-log.svg"
                            />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <></>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
          <Box className={styles.informationContainer}>
            <Box className={styles.informationTitle}>
              <Box component="img" className={styles.informationTitleIcon} src="/icons/preheat/url.svg" />
              <Typography
                variant="body1"
                fontFamily="mabry-bold"
                component="div"
                className={styles.informationTitleText}
              >
                URL
              </Typography>
            </Box>
            <Typography variant="body1" className={styles.informationContent}>
              {isLoading ? <Skeleton sx={{ width: '4rem' }} /> : preheat.args.url || '-'}
            </Typography>
          </Box>
          <Box className={styles.informationContainer}>
            <Box className={styles.informationTitle}>
              <Box component="img" className={styles.informationTitleIcon} src="/icons/preheat/filter.svg" />
              <Typography
                variant="body1"
                fontFamily="mabry-bold"
                component="div"
                className={styles.informationTitleText}
              >
                Filter
              </Typography>
            </Box>
            <Box className={styles.informationContent} sx={{ display: 'flex', flexWrap: 'wrap' }}>
              {isLoading ? (
                <Skeleton sx={{ width: '4rem' }} />
              ) : (
                preheat.args.filter.split('&').map((item) =>
                  item ? (
                    <Chip
                      key={item}
                      label={item}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderRadius: '0%',
                        background: 'var(--description-color)',
                        color: '#FFFFFF',
                        mr: '0.4rem',
                        mb: '0.4rem',
                        borderColor: 'var(--description-color)',
                        fontWeight: 'bold',
                      }}
                    />
                  ) : (
                    <Typography key={item} variant="body1" className={styles.informationContent}>
                      -
                    </Typography>
                  ),
                )
              )}
            </Box>
          </Box>
          <Box className={styles.informationContainer}>
            <Box className={styles.informationTitle}>
              <Box component="img" className={styles.informationTitleIcon} src="/icons/preheat/tag.svg" />
              <Typography
                variant="body1"
                fontFamily="mabry-bold"
                component="div"
                className={styles.informationTitleText}
              >
                Tag
              </Typography>
            </Box>
            <Box className={styles.informationContent}>
              {isLoading ? (
                <Skeleton sx={{ width: '4rem' }} />
              ) : preheat.args.tag ? (
                <Chip
                  label={preheat.args.tag}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderRadius: '0%',
                    background: 'var(--button-color)',
                    color: '#FFFFFF',
                    mr: '0.4rem',
                    borderColor: 'var(--button-color)',
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
              <Box component="img" className={styles.informationTitleIcon} src="/icons/preheat/headers.svg" />
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
              <Skeleton sx={{ width: '4rem' }} />
            ) : Object.keys(preheat.args.headers).length > 0 ? (
              <Paper variant="outlined" className={styles.headersContent}>
                {Object.entries(preheat.args.headers).map(([key, value], index) => (
                  <Box key={index} className={styles.headersText}>
                    <Box fontFamily="mabry-bold" width="40%">
                      {key}
                    </Box>
                    <Box width="60%">{value}</Box>
                  </Box>
                ))}
              </Paper>
            ) : (
              <Typography variant="body1" className={styles.informationContent}>
                -
              </Typography>
            )}
          </Box>
          <Box className={styles.informationContainer}>
            <Box className={styles.informationTitle}>
              <Box component="img" className={styles.informationTitleIcon} src="/icons/preheat/id.svg" />
              <Typography
                variant="body1"
                fontFamily="mabry-bold"
                component="div"
                className={styles.informationTitleText}
              >
                Scheduler clusters ID
              </Typography>
            </Box>
            <Typography variant="body1" className={styles.informationContent}>
              {isLoading ? <Skeleton sx={{ width: '4rem' }} /> : preheat.scheduler_clusters[0].id || '-'}
            </Typography>
          </Box>
          <Box className={styles.informationContainer}>
            <Box className={styles.informationTitle}>
              <Box component="img" className={styles.informationTitleIcon} src="/icons/preheat/created-at.svg" />
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
              <Skeleton sx={{ width: '4rem' }} />
            ) : (
              (
                <Chip
                  avatar={<MoreTimeIcon />}
                  label={getDatetime(preheat.created_at)}
                  variant="outlined"
                  size="small"
                />
              ) || '-'
            )}
          </Box>
        </Paper>
        <Drawer anchor="right" open={errorLog} onClose={handleClose}>
          <Box role="presentation" sx={{ width: '28rem' }}>
            {preheat.result.JobStates.map((item) => (
              <Box key={item.Error} sx={{ height: '100vh', backgroundColor: '#24292f' }}>
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
                          src="/icons/preheat/failure.svg"
                        />
                        <Typography variant="body2" fontFamily="mabry-bold" sx={{ color: '#d0d7de' }}>
                          Preheat
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails
                      sx={{
                        padding: '1rem',
                        borderTop: '1px solid rgba(0, 0, 0, .125)',
                        backgroundColor: '#24292f',
                      }}
                    >
                      <Typography sx={{ color: '#d0d7de' }}>{item.Error}</Typography>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              </Box>
            ))}
          </Box>
        </Drawer>
      </Box>
    </Box>
  );
}
