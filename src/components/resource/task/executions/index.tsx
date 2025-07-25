import Box from '@mui/material/Box';
import styles from './index.module.css';
import { getDeleteTaskJob, getTaskJobResponse } from '../../../../lib/api';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getDatetime, useQuery } from '../../../../lib/utils';
import { DEFAULT_PAGE_SIZE } from '../../../../lib/constants';
import {
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Link as RouterLink,
  Chip,
  Pagination,
  Skeleton,
} from '@mui/material';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import Card from '../../../card';
import { ReactComponent as IcContent } from '../../../../assets/images/cluster/scheduler/ic-content.svg';
import { ReactComponent as Success } from '../../../../assets/images/job/preheat/success.svg';
import { ReactComponent as Failure } from '../../../../assets/images/job/preheat/failure.svg';
import { ReactComponent as Pending } from '../../../../assets/images/job/preheat/pending.svg';
import { ReactComponent as Detail } from '../../../../assets/images/job/preheat/detail.svg';
import ErrorHandler from '../../../error-handler';

export default function Executions() {
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [executionsPage, setExecutionsPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>('ALL');
  const [shouldPoll, setShouldPoll] = useState(false);
  const [openStatusSelect, setOpenStatusSelect] = useState(false);
  const [executions, setExecutions] = useState<getTaskJobResponse[]>([]);

  const navigate = useNavigate();
  const query = useQuery();
  const page = query.get('page') ? parseInt(query.get('page') as string, 10) || 1 : 1;

  useEffect(() => {
    (async function () {
      try {
        setIsLoading(true);
        setExecutionsPage(page);

        const jobs = await getDeleteTaskJob({
          page: page,
          per_page: DEFAULT_PAGE_SIZE,
          state: status === 'ALL' ? undefined : status,
        });

        setExecutions(jobs.data);
        setTotalPages(jobs.total_page || 1);

        const states = jobs.data.filter(
          (obj) => obj.result.state !== 'SUCCESS' && obj.result.state !== 'FAILURE',
        ).length;

        states === 0 ? setShouldPoll(false) : setShouldPoll(true);

        setIsLoading(false);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
          setIsLoading(false);
        }
      }
    })();
  }, [status, executionsPage, page]);

  useEffect(() => {
    if (shouldPoll) {
      const pollingInterval = setInterval(() => {
        const pollExecutions = async () => {
          try {
            const jobs = await getDeleteTaskJob({
              page: executionsPage,
              per_page: DEFAULT_PAGE_SIZE,
              state: status === 'ALL' ? undefined : status,
            });

            setExecutions(jobs.data);
            setTotalPages(jobs.total_page || 1);

            const states = jobs.data.filter(
              (obj) => obj.result.state !== 'SUCCESS' && obj.result.state !== 'FAILURE',
            ).length;

            states === 0 ? setShouldPoll(false) : setShouldPoll(true);
          } catch (error) {
            if (error instanceof Error) {
              setErrorMessage(true);
              setErrorMessageText(error.message);
              setShouldPoll(false);
            }
          }
        };

        pollExecutions();
      }, 60000);

      return () => {
        clearInterval(pollingInterval);
      };
    }
  }, [status, shouldPoll, executionsPage]);

  const statusList = [
    { lable: 'Pending', name: 'PENDING' },
    { lable: 'All', name: 'ALL' },
    { lable: 'Success', name: 'SUCCESS' },
    { lable: 'Failure', name: 'FAILURE' },
  ];

  const changeStatus = (event: any) => {
    setStatus(event.target.value);
  };

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorMessage(false);
  };

  return (
    <Box>
      <ErrorHandler errorMessage={errorMessage} errorMessageText={errorMessageText} onClose={handleClose} />
      <Card>
        <Box className={styles.titleContainer}>
          <Typography variant="body1" fontFamily="mabry-bold">
            Workflow runs
          </Typography>
          <FormControl sx={{ width: '10rem' }} size="small">
            <InputLabel id="states-select">Status</InputLabel>
            <Select
              id="states-select"
              value={status}
              label="changeStatus"
              open={openStatusSelect}
              onClose={() => {
                setOpenStatusSelect(false);
              }}
              onOpen={() => {
                setOpenStatusSelect(true);
              }}
              onChange={changeStatus}
            >
              <Typography variant="body1" fontFamily="mabry-bold" sx={{ ml: '1rem', mt: '0.4rem', mb: '0.4rem' }}>
                Filter by status
              </Typography>
              <Divider />
              {statusList.map((item) => (
                <MenuItem key={item.name} value={item.name}>
                  {item.lable}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Divider />
        {isLoading ? (
          <Box>
            <Box className={styles.isLoadingWrapper}>
              <Box className={styles.statusContainer}>
                <Skeleton data-testid="isloading" variant="circular" width="1.4rem" height="1.4rem" />
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} ml="0.6rem">
                  <Skeleton data-testid="isloading" width="3rem" />
                  <Skeleton data-testid="isloading" width="6rem" />
                </Box>
              </Box>
              <Box className={styles.timeContainer}>
                <Skeleton data-testid="isloading" width="40%" />
              </Box>
              <Box className={styles.iconButton}>
                <Skeleton data-testid="isloading" variant="circular" width="2em" height="2em" />
              </Box>
            </Box>
          </Box>
        ) : executions && executions.length === 0 ? (
          <Box id="no-executions" className={styles.noData}>
            <IcContent className={styles.nodataIcon} />
            <Typography variant="h6" className={styles.nodataText}>
              You don't have any executions.
            </Typography>
          </Box>
        ) : (
          <Box id="executions-list">
            {executions &&
              executions.map((item, index) => {
                return (
                  <Box key={item.id} id={`list-${item.id}`}>
                    <Box sx={{ display: 'flex', p: '0.8rem', alignItems: 'center' }}>
                      <Box id={`execution-${item.id}`} className={styles.statusContainer}>
                        {item.result.state === 'SUCCESS' ? (
                          <Success id={`SUCCESS-${item.id}`} className={styles.stateIcon} />
                        ) : item.result.state === 'FAILURE' ? (
                          <Failure id={`FAILURE-${item.id}`} className={styles.stateIcon} />
                        ) : (
                          <Pending id={`PENDING-${item.id}`} className={styles.pendingIcon} />
                        )}
                        <Box
                          sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                          ml="0.6rem"
                        >
                          <Typography id={`id-${item?.id}`} variant="body1" fontFamily="mabry-bold">
                            {item?.id || '-'}
                          </Typography>
                          <Typography id={`task-id-${item?.id}`} variant="body2">
                            {item?.args?.task_id || '-'}
                          </Typography>
                        </Box>
                      </Box>
                      <Box className={styles.timeContainer}>
                        <Chip
                          avatar={<MoreTimeIcon />}
                          label={getDatetime(item.created_at) || '-'}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                      <Box className={styles.iconButton}>
                        <RouterLink
                          component={Link}
                          id={`detail-${item?.id}`}
                          to={`/resource/task/executions/${item?.id}`}
                          underline="hover"
                          sx={{ color: 'var(--palette-description-color)' }}
                        >
                          <Detail className={styles.detailIcon} />
                        </RouterLink>
                      </Box>
                    </Box>
                    {index !== executions.length - 1 && (
                      <Divider
                        sx={{
                          borderStyle: 'dashed',
                          borderColor: 'var(--palette-palette-divider)',
                          borderWidth: '0px 0px thin',
                        }}
                      />
                    )}
                  </Box>
                );
              })}
          </Box>
        )}
      </Card>
      {totalPages > 1 && (
        <Box display="flex" justifyContent="flex-end" sx={{ marginTop: '2rem' }}>
          <Pagination
            count={totalPages}
            page={executionsPage}
            onChange={(_event: any, newPage: number) => {
              setExecutionsPage(newPage);
              navigate(`/resource/task/executions${newPage > 1 ? `?page=${newPage}` : ''}`);
            }}
            boundaryCount={1}
            color="primary"
            size="small"
            id="executions-pagination"
          />
        </Box>
      )}
    </Box>
  );
}
