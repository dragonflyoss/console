import {
  Box,
  Chip,
  Divider,
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
  styled,
  tooltipClasses,
  TooltipProps,
  Paper,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { getJob, JobsResponse } from '../../../lib/api';
import { useParams, Link } from 'react-router-dom';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import { getDatetime } from '../../../lib/utils';
import styles from './show.module.css';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import Card from '../../card';
import { ReactComponent as PreheatID } from '../../../assets/images/job/preheat/id.svg';
import { ReactComponent as Description } from '../../../assets/images/job/preheat/description.svg';
import { ReactComponent as Status } from '../../../assets/images/job/preheat/status.svg';
import { ReactComponent as URL } from '../../../assets/images/job/preheat/url.svg';
import { ReactComponent as Scope } from '../../../assets/images/job/preheat/scope.svg';
import { ReactComponent as Tag } from '../../../assets/images/job/preheat/tag.svg';
import { ReactComponent as Headers } from '../../../assets/images/job/preheat/headers.svg';
import { ReactComponent as SchedulerClustersID } from '../../../assets/images/job/preheat/id.svg';
import { ReactComponent as CreatedAt } from '../../../assets/images/job/preheat/created-at.svg';
import { ReactComponent as Failure } from '../../../assets/images/job/preheat/failure.svg';
import { ReactComponent as Pending } from '../../../assets/images/job/preheat/pending.svg';
import { ReactComponent as ErrorLog } from '../../../assets/images/job/preheat/error-log.svg';
import { ReactComponent as Application } from '../../../assets/images/resource/task/type.svg';
import { ReactComponent as PieceLength } from '../../../assets/images/job/preheat/piece-length.svg';
import { ReactComponent as Percentage } from '../../../assets/images/job/preheat/percentage.svg';
import { ReactComponent as Count } from '../../../assets/images/job/preheat/count.svg';

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
  const [preheat, setPreheat] = useState<JobsResponse>();

  const params = useParams();

  useEffect(() => {
    setIsLoading(true);
    (async function () {
      try {
        if (typeof params.id === 'string') {
          const job = await getJob(params.id);

          setPreheat(job);
          setIsLoading(false);
          if (job?.result?.state !== 'SUCCESS' && job?.result?.state !== 'FAILURE') {
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
      <Typography variant="h5" id="preheat-title">
        Preheat
      </Typography>
      <Breadcrumbs
        separator={
          <Box
            sx={{ width: '0.3rem', height: '0.3rem', backgroundColor: '#919EAB', borderRadius: '50%', m: '0 0.4rem' }}
          />
        }
        aria-label="breadcrumb"
        sx={{ mb: '1.5rem', mt: '1rem' }}
      >
        <Typography color="text.primary">Job</Typography>
        <RouterLink component={Link} underline="hover" color="text.primary" to={`/jobs/preheats`}>
          Preheat
        </RouterLink>
        <Typography>{preheat?.id || '-'}</Typography>
      </Breadcrumbs>
      <Box width="100%">
        <Card className={styles.container}>
          <Box className={styles.informationContainer}>
            <Box className={styles.informationTitle}>
              <PreheatID className={styles.informationTitleIcon} />
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
              <Description className={styles.informationTitleIcon} />
              <Typography
                variant="body1"
                fontFamily="mabry-bold"
                component="div"
                className={styles.informationTitleText}
              >
                Description
              </Typography>
            </Box>
            <Typography id="description" variant="body1" className={styles.descriptionContent}>
              {isLoading ? <Skeleton data-testid="preheat-isloading" sx={{ width: '2rem' }} /> : preheat?.bio || '-'}
            </Typography>
          </Box>
          <Box className={styles.informationContainer}>
            <Box className={styles.informationTitle}>
              <Status className={styles.informationTitleIcon} />
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
                      pr: preheat?.result?.state === 'FAILURE' ? '0' : '',
                      backgroundColor:
                        preheat?.result?.state === 'SUCCESS'
                          ? '#228B22'
                          : preheat?.result?.state === 'FAILURE'
                          ? '#D42536'
                          : '#DBAB0A',
                    }}
                    id="status"
                  >
                    {preheat?.result?.state === 'SUCCESS' ? (
                      <></>
                    ) : preheat?.result?.state === 'FAILURE' ? (
                      <></>
                    ) : (
                      <Pending id="pending-icon" className={styles.pendingIcon} />
                    )}
                    <Typography
                      variant="body2"
                      fontFamily="mabry-bold"
                      sx={{
                        color: '#FFF',
                      }}
                    >
                      {preheat?.result?.state || ''}
                    </Typography>
                    {preheat?.result?.state === 'FAILURE' ? (
                      <>
                        <Box
                          sx={{ ml: '0.4rem', mr: '0.2rem', backgroundColor: '#fff', height: '1rem', width: '0.08rem' }}
                        />
                        <Tooltip title="View error log." placement="top">
                          <IconButton
                            id="view-error-log"
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
                            <ErrorLog id="error-log-icon" className={styles.errorIcon} />
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
              <URL className={styles.informationTitleIcon} />
              <Typography
                variant="body1"
                fontFamily="mabry-bold"
                component="div"
                className={styles.informationTitleText}
              >
                URL
              </Typography>
            </Box>
            {(Array.isArray(preheat?.args?.urls) && preheat?.args?.urls?.length > 0) || preheat?.args?.url ? (
              <Box className={styles.urlsWrapper}>
                {preheat?.args?.url && (
                  <CustomWidthTooltip title={preheat?.args?.url || '-'} placement="bottom">
                    <Typography
                      id="url"
                      variant="body1"
                      fontFamily="mabry-bold"
                      component="div"
                      className={styles.urls}
                    >
                      {preheat?.args?.url || '-'}
                    </Typography>
                  </CustomWidthTooltip>
                )}
                {preheat?.args?.urls !== null &&
                  Array.isArray(preheat?.args?.urls) &&
                  preheat?.args?.urls?.length > 0 &&
                  preheat?.args?.urls?.map((item, index) => (
                    <CustomWidthTooltip key={index} title={item || '-'} placement="bottom">
                      <Typography
                        id={`url-${index}`}
                        variant="body1"
                        fontFamily="mabry-bold"
                        className={styles.urls}
                        component="div"
                      >
                        {item || '-'}
                      </Typography>
                    </CustomWidthTooltip>
                  ))}
              </Box>
            ) : (
              <Typography id="url" variant="body1" className={styles.informationContent}>
                -
              </Typography>
            )}
          </Box>
          <Box className={styles.informationContainer}>
            <Box className={styles.informationTitle}>
              <PieceLength className={styles.informationTitleIcon} />
              <Typography
                variant="body1"
                fontFamily="mabry-bold"
                component="div"
                className={styles.informationTitleText}
              >
                Piece Length
              </Typography>
            </Box>
            <Typography id="piece-length" variant="body1" className={styles.informationContent}>
              {isLoading ? (
                <Skeleton sx={{ width: '4rem' }} />
              ) : preheat?.args?.piece_length ? (
                `${Number(preheat?.args?.piece_length) / 1024 / 1024} MiB`
              ) : (
                '-'
              )}
            </Typography>
          </Box>
          <Box className={styles.informationContainer}>
            <Box className={styles.informationTitle}>
              <Scope className={styles.informationTitleIcon} />
              <Typography
                variant="body1"
                fontFamily="mabry-bold"
                component="div"
                className={styles.informationTitleText}
              >
                Scope
              </Typography>
            </Box>
            <Box id="scope" className={styles.informationContent}>
              {isLoading ? (
                <Skeleton data-testid="preheat-isloading" sx={{ width: '2rem' }} />
              ) : scope ? (
                <Box className={styles.scopeContent}>
                  <Typography variant="body2" component="div" fontFamily="mabry-bold">
                    {scope?.label || '-'}
                  </Typography>
                </Box>
              ) : (
                '-'
              )}
            </Box>
          </Box>
          {preheat?.args?.percentage && (
            <Box className={styles.informationContainer}>
              <Box className={styles.informationTitle}>
                <Percentage className={styles.informationTitleIcon} />
                <Typography
                  variant="body1"
                  fontFamily="mabry-bold"
                  component="div"
                  className={styles.informationTitleText}
                >
                  Percentage
                </Typography>
              </Box>
              <Box id="percentage" className={styles.informationContent}>
                <Typography variant="body2" component="div" fontFamily="mabry-bold">
                  {preheat?.args?.percentage}%
                </Typography>
              </Box>
            </Box>
          )}
          {preheat?.args?.count && (
            <Box className={styles.informationContainer}>
              <Box className={styles.informationTitle}>
                <Count className={styles.informationTitleIcon} />
                <Typography
                  variant="body1"
                  fontFamily="mabry-bold"
                  component="div"
                  className={styles.informationTitleText}
                >
                  Count
                </Typography>
              </Box>
              <Box id="count" className={styles.informationContent}>
                <Typography variant="body2" component="div" fontFamily="mabry-bold">
                  {preheat?.args?.count}
                </Typography>
              </Box>
            </Box>
          )}
          <Box className={styles.informationContainer}>
            <Box className={styles.informationTitle}>
              <Tag className={styles.informationTitleIcon} />
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
                <Box className={styles.tagContent}>
                  <Typography variant="body2" component="div" fontFamily="mabry-bold">
                    {preheat.args.tag || '-'}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body1" className={styles.informationContent}>
                  -
                </Typography>
              )}
            </Box>
          </Box>
          <Box className={styles.informationContainer}>
            <Box className={styles.informationTitle}>
              <Application className={styles.informationTitleIcon} />
              <Typography
                variant="body1"
                fontFamily="mabry-bold"
                component="div"
                className={styles.informationTitleText}
              >
                Application
              </Typography>
            </Box>
            <Typography id="application" variant="body1" className={styles.informationContent}>
              {isLoading ? (
                <Skeleton sx={{ width: '4rem' }} />
              ) : preheat?.args?.application ? (
                preheat?.args?.application
              ) : (
                '-'
              )}
            </Typography>
          </Box>
          <Box className={styles.informationContainer}>
            <Box className={styles.informationTitle}>
              <Headers className={styles.informationTitleIcon} />
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
                <Paper variant="outlined" id="headers" className={styles.headersContent}>
                  <Box className={styles.tableHeader}>
                    <Box className={styles.tableHeaderKey}>
                      <Typography variant="body2" className={styles.tableHeaderText}>
                        Key
                      </Typography>
                    </Box>
                    <Box className={styles.tableHeaderValue}>
                      <Typography variant="body2" className={styles.tableHeaderText}>
                        Value
                      </Typography>
                    </Box>
                  </Box>
                  <Divider className={styles.divider} />
                  {Object.entries(preheat?.args.headers).map(([key, value], index) => (
                    <Box key={index}>
                      <Box className={styles.headersText}>
                        <Typography
                          variant="body2"
                          component="div"
                          fontFamily="mabry-bold"
                          id={`header-key-${index}`}
                          width="35%"
                          mr="1rem"
                        >
                          {key}
                        </Typography>
                        <CustomWidthTooltip title={value || '-'} placement="bottom">
                          <Typography
                            variant="body2"
                            component="div"
                            width="65%"
                            id={`header-value-${index}`}
                            className={styles.headerValue}
                          >
                            {value}
                          </Typography>
                        </CustomWidthTooltip>
                      </Box>
                      {index !==
                        (preheat?.args?.headers &&
                          preheat?.args?.headers !== null &&
                          Object.entries(preheat?.args?.headers).length - 1) && (
                        <Divider
                          sx={{
                            borderStyle: 'dashed',
                            borderColor: 'var(--palette-palette-divider)',
                            borderWidth: '0px 0px thin',
                          }}
                        />
                      )}
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
              <SchedulerClustersID className={styles.informationTitleIcon} />
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
                  <Typography key={index} variant="body1" component="div" fontFamily="mabry-bold" mr="0.7rem">
                    {isLoading ? <Skeleton data-testid="preheat-isloading" sx={{ width: '4rem' }} /> : item.id || '-'}
                  </Typography>
                );
              }) || '-'}
            </Box>
          </Box>
          <Box className={styles.informationContainer}>
            <Box className={styles.informationTitle}>
              <CreatedAt className={styles.informationTitleIcon} />
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
                label={getDatetime(preheat.created_at)}
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
          <Box role="presentation" sx={{ width: '25rem' }}>
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
                    <Box display="flex" alignItems="center">
                      <Failure className={styles.statusIcon} />
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
                    {preheat?.result?.job_states !== null &&
                      Array.isArray(preheat?.result?.job_states) &&
                      preheat?.result?.job_states?.map((item) =>
                        item.state === 'FAILURE' && item.error !== '' ? (
                          <Typography
                            variant="body2"
                            component="div"
                            fontFamily="mabry-bold"
                            color="#d0d7de"
                            mb="1rem"
                            className={styles.errorLog}
                          >
                            {item.error}
                          </Typography>
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
    </Box>
  );
}
