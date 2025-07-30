import {
  Box,
  Table,
  TableHead,
  Typography,
  TableRow,
  TableCell,
  TableBody,
  Skeleton,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import styles from './index.module.css';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../lib/constants';
import { auditLogsResponse, getAuditLogs, getUsers, getUsersResponse } from '../../lib/api';
import Card from '../card';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDatetime, useQuery } from '../../lib/utils';
import { debounce } from 'lodash';
import SearchCircularProgress from '../circular-progress';
import ErrorHandler from '../error-handler';

export default function AuditLogs() {
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<auditLogsResponse[]>([]);
  const [totalPage, setTotalPage] = useState(1);
  const [openStatusSelect, setOpenStatusSelect] = useState(false);
  const [openoperationSelect, setOpenOperationSelect] = useState(false);
  const [openActorTypeSelect, setOpenActorTypeSelect] = useState(false);
  const [users, setUsers] = useState<getUsersResponse[]>([]);
  const [search, setSearch] = useState('');
  const [searchPath, setSearchPath] = useState('');
  const [actorType, setActorType] = useState('ALL');
  const [user, setUser] = useState('');
  const [operation, setOperation] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [searchLodaing, setSearchLodaing] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const query = useQuery();
  const page = query.get('page') ? parseInt(query.get('page') as string, 10) || 1 : 1;

  useEffect(() => {
    (async function () {
      try {
        setIsLoading(true);

        const user = await getUsers({ page: 1, per_page: MAX_PAGE_SIZE });

        setUsers(user);
        setIsLoading(false);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
          setIsLoading(false);
        }
      }
    })();
  }, []);

  useEffect(() => {
    (async function () {
      try {
        setIsLoading(true);

        const audit = await getAuditLogs({
          page: page,
          per_page: DEFAULT_PAGE_SIZE,
          state: status === 'ALL' ? undefined : status,
          operation: operation === 'ALL' ? undefined : operation,
          actor_name: user === '' ? undefined : user,
          path: search === '' ? undefined : search,
          actor_type: actorType === 'ALL' ? undefined : actorType,
        });

        setLogs(audit?.data);
        setTotalPage(audit?.total_page || 1);

        setIsLoading(false);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
          setIsLoading(false);
        }
      }
    })();
  }, [operation, user, status, page, search, actorType]);

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorMessage(false);
  };

  const statusList = [
    { lable: 'All', name: 'ALL' },
    { lable: 'Success', name: 'SUCCESS' },
    { lable: 'Failure', name: 'FAILURE' },
  ];

  const operationList = [
    { lable: 'All', name: 'ALL' },
    { lable: 'Get', name: 'GET' },
    { lable: 'Post', name: 'POST' },
    { lable: 'Patch', name: 'PATCH' },
    { lable: 'Delete', name: 'DELETE' },
    { lable: 'Put', name: 'PUT' },
  ];

  const actorTypeList = [
    { lable: 'All', name: 'ALL' },
    { lable: 'User', name: 'USER' },
    { lable: 'PAT', name: 'PAT' },
    { lable: 'Unknown', name: 'UNKNOWN' },
  ];

  const handleSearchByStatus = (event: { target: { value: SetStateAction<string> } }) => {
    if (event.target.value) {
      setStatus(event.target.value);
      navigate(`/audit`);
    }
  };

  const handleSearchByActorType = (event: { target: { value: SetStateAction<string> } }) => {
    if (event.target.value) {
      setActorType(event.target.value);
      navigate(`/audit`);
    }
  };

  const handleSearchByOperation = (event: { target: { value: SetStateAction<string> } }) => {
    if (event.target.value) {
      setOperation(event.target.value);
      navigate(`/audit`);
    }
  };

  const handleSearchByUser = useMemo(
    () =>
      debounce((value: string) => {
        setUser(value);
        navigate(`/audit`);
      }, 300),
    [navigate],
  );

  const debounced = useMemo(
    () =>
      debounce(async (currentSearch) => {
        setSearch(currentSearch);
        setSearchLodaing(false);
        navigate(`/audit`);
      }, 500),
    [navigate],
  );

  const handleSearchByPath = useCallback(
    (newSearch: any) => {
      debounced(newSearch);
      setSearchLodaing(true);
    },
    [debounced],
  );

  return (
    <Box>
      <ErrorHandler errorMessage={errorMessage} errorMessageText={errorMessageText} onClose={handleClose} />
      <Typography variant="h5" mb="1.5rem">
        Audit Logs
      </Typography>
      <FormControl className={styles.search} size="small">
        <TextField
          sx={{
            '& .MuiInputBase-input': {
              padding: '0.7rem 0.6rem',
            },
          }}
          value={searchPath}
          label="Search"
          id="search"
          name="search"
          placeholder="Search by path"
          onChange={(e) => {
            const value = e.target.value;
            setSearchPath(value);
            handleSearchByPath(value);
          }}
          InputProps={{
            startAdornment: searchLodaing ? (
              <Box className={styles.searchIconContainer}>
                <SearchCircularProgress />
              </Box>
            ) : (
              <Box className={styles.searchIconContainer}>
                <SearchIcon sx={{ color: '#919EAB' }} />
              </Box>
            ),
          }}
        />
      </FormControl>
      <Card className={styles.card}>
        <Box className={styles.filterWrapper}>
          <FormControl size="small" className={styles.userFilter}>
            <Autocomplete
              color="secondary"
              id="actor-name"
              sx={{ '& .MuiOutlinedInput-root.MuiInputBase-sizeSmall': { p: '0.5rem' } }}
              value={user}
              onInputChange={(_event, newInputValue) => {
                handleSearchByUser(newInputValue);
              }}
              options={(Array.isArray(users) && users.map((option) => option?.name)) || ['']}
              renderInput={(params) => (
                <TextField {...params} label="User" size="small" placeholder="Select user name" />
              )}
            />
          </FormControl>
          <Box className={styles.statusFilterWrapper}>
            <FormControl size="small" className={styles.statusFilter}>
              <InputLabel id="operation">Operation</InputLabel>
              <Select
                id="operation-select"
                value={operation}
                label="Operation"
                open={openoperationSelect}
                onClose={() => {
                  setOpenOperationSelect(false);
                }}
                onOpen={() => {
                  setOpenOperationSelect(true);
                }}
                onChange={handleSearchByOperation}
              >
                {operationList.map((item) => (
                  <MenuItem
                    sx={{
                      m: '0.3rem',
                      borderRadius: '4px',
                    }}
                    key={item.name}
                    value={item.name}
                    id={item.name}
                  >
                    {item.lable}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" className={styles.statusFilter}>
              <InputLabel id="actor-type">Actor Type</InputLabel>
              <Select
                id="actor-type-select"
                value={actorType}
                label="Actor Type"
                open={openActorTypeSelect}
                onClose={() => {
                  setOpenActorTypeSelect(false);
                }}
                onOpen={() => {
                  setOpenActorTypeSelect(true);
                }}
                onChange={handleSearchByActorType}
              >
                {actorTypeList.map((item) => (
                  <MenuItem
                    sx={{
                      m: '0.3rem',
                      borderRadius: '4px',
                    }}
                    key={item.name}
                    value={item.name}
                    id={item.name}
                  >
                    {item.lable}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" className={styles.statusFilter}>
              <InputLabel id="states">Status</InputLabel>
              <Select
                id="states-select"
                value={status}
                label="States"
                open={openStatusSelect}
                onClose={() => {
                  setOpenStatusSelect(false);
                }}
                onOpen={() => {
                  setOpenStatusSelect(true);
                }}
                onChange={handleSearchByStatus}
              >
                {statusList.map((item) => (
                  <MenuItem
                    sx={{
                      m: '0.3rem',
                      borderRadius: '4px',
                    }}
                    key={item.name}
                    value={item.name}
                    id={item.name}
                  >
                    {item.lable}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
        <Table sx={{ minWidth: 650 }} aria-label="a dense table" id="audit-table">
          <TableHead sx={{ backgroundColor: 'var(--palette-table-title-color)' }}>
            <TableRow>
              <TableCell align="center" className={styles.tableHeader}>
                <Typography variant="body1" className={styles.tableHeaderText}>
                  User
                </Typography>
              </TableCell>
              <TableCell align="center" className={styles.tableHeader}>
                <Typography variant="body1" className={styles.tableHeaderText}>
                  Path
                </Typography>
              </TableCell>
              <TableCell align="center" className={styles.tableHeader}>
                <Typography variant="body1" className={styles.tableHeaderText}>
                  Operation
                </Typography>
              </TableCell>
              <TableCell align="center" className={styles.tableHeader}>
                <Typography variant="body1" className={styles.tableHeaderText}>
                  Actor Type
                </Typography>
              </TableCell>
              <TableCell align="center" className={styles.tableHeader}>
                <Typography variant="body1" className={styles.tableHeaderText}>
                  Status Code
                </Typography>
              </TableCell>
              <TableCell align="center" className={styles.tableHeader}>
                <Typography variant="body1" className={styles.tableHeaderText}>
                  Status
                </Typography>
              </TableCell>
              <TableCell align="center" className={styles.tableHeader}>
                <Typography variant="body1" className={styles.tableHeaderText}>
                  Operated At
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody id="audit-table-body" sx={{ border: 'none' }}>
            {isLoading ? (
              <TableRow
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                }}
              >
                <TableCell align="center">
                  <Skeleton data-testid="isloading" width="2rem" />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Skeleton data-testid="isloading" width="4rem" />
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Skeleton data-testid="isloading" width="4rem" height="2.6rem" />
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Skeleton data-testid="isloading" width="2rem" />
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Skeleton data-testid="isloading" width="3.5rem" height="2.6rem" />
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Skeleton data-testid="isloading" width="4rem" />
                  </Box>
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableCell id="no-audit-table" colSpan={9} align="center" sx={{ border: 0 }}>
                You don't have audit logs.
              </TableCell>
            ) : (
              Array.isArray(logs) &&
              logs.map((item: any) => {
                return (
                  <TableRow
                    key={item?.id}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      ':hover': { backgroundColor: 'var(--palette-action-hover)' },
                    }}
                    className={styles.tableRow}
                  >
                    <TableCell align="center" id={`user-${item?.id}`}>
                      <Typography variant="body1" fontFamily="mabry-bold">
                        {item?.actor_name}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      id={`path-${item?.id}`}
                      sx={{
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                      }}
                    >
                      <Box
                        sx={{
                          backgroundColor: 'var(--palette-background-inactive)',
                          p: '0.2rem 0.4rem',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          color: 'var(--palette-table-title-text-color)',
                        }}
                      >
                        {item?.path}
                      </Box>
                    </TableCell>
                    <TableCell align="center" id={`operation-${item?.id}`}>
                      {item?.operation === 'GET' ? (
                        <Box
                          sx={{
                            backgroundColor: 'var(--palette-grey-background-color)',
                            color: 'var(--palette-color-get)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            borderRadius: '1rem',
                            p: '0.2rem 0.5rem',
                          }}
                        >
                          <Box
                            sx={{
                              backgroundColor: 'var(--palette-color-get)',
                              borderRadius: '50%',
                              width: '0.4rem',
                              height: '0.4rem',
                              mr: '0.4rem',
                            }}
                          />
                          GET
                        </Box>
                      ) : item?.operation === 'POST' ? (
                        <Box
                          sx={{
                            backgroundColor: 'var(--palette-background-color-post)',
                            color: 'var(--palette-color-post)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            borderRadius: '1rem',
                            p: '0.2rem 0.5rem',
                          }}
                        >
                          <Box
                            sx={{
                              backgroundColor: 'var(--palette-color-post)',
                              borderRadius: '50%',
                              width: '0.4rem',
                              height: '0.4rem',
                              mr: '0.4rem',
                            }}
                          />
                          POST
                        </Box>
                      ) : item?.operation === 'PUT' ? (
                        <Box
                          sx={{
                            backgroundColor: 'var(--palette-background-color-put)',
                            color: 'var(--palette-color-put)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            borderRadius: '1rem',
                            p: '0.2rem 0.5rem',
                          }}
                        >
                          <Box
                            sx={{
                              backgroundColor: 'var(--palette-color-put)',
                              borderRadius: '50%',
                              width: '0.4rem',
                              height: '0.4rem',
                              mr: '0.4rem',
                            }}
                          />
                          PUT
                        </Box>
                      ) : item?.operation === 'PATCH' ? (
                        <Box
                          sx={{
                            backgroundColor: 'var(--palette-background-color-patch)',
                            color: 'var(--palette-color-patch)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            borderRadius: '1rem',
                            p: '0.2rem 0.5rem',
                          }}
                        >
                          <Box
                            sx={{
                              backgroundColor: 'var(--palette-color-patch)',
                              borderRadius: '50%',
                              width: '0.4rem',
                              height: '0.4rem',
                              mr: '0.4rem',
                            }}
                          />
                          PATCH
                        </Box>
                      ) : item?.operation === 'DELETE' ? (
                        <Box
                          sx={{
                            backgroundColor: 'var(--palette-background-color-deltet)',
                            color: 'var(--palette-color-deltet)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            borderRadius: '1rem',
                            p: '0.2rem 0.5rem',
                          }}
                        >
                          <Box
                            sx={{
                              backgroundColor: 'var(--palette-color-deltet)',
                              borderRadius: '50%',
                              width: '0.4rem',
                              height: '0.4rem',
                              mr: '0.4rem',
                            }}
                          />
                          DELETE
                        </Box>
                      ) : (
                        <></>
                      )}
                    </TableCell>
                    <TableCell align="center" id={`actor-type-${item?.id}`}>
                      {item?.actor_type}
                    </TableCell>
                    <TableCell align="center" id={`status-code-${item?.id}`}>
                      {item?.status_code}
                    </TableCell>
                    <TableCell align="center" id={`status-${item?.id}`}>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          borderRadius: '0.3rem',
                          p: '0.2rem 0.5rem',
                          backgroundColor:
                            item?.state === 'SUCCESS' ? '#228B22' : item?.state === 'FAILURE' ? '#D42536' : '#DBAB0A',
                          color: '#FFF',
                          fontFamily: 'mabry-bold',
                        }}
                        id="status"
                      >
                        {item?.state}
                      </Box>
                    </TableCell>
                    <TableCell align="center" id={`operated-at-${item?.id}`}>
                      {getDatetime(item?.operated_at)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
      {totalPage > 1 && (
        <Box id="pagination" display="flex" justifyContent="flex-end" sx={{ marginTop: '2rem' }}>
          <Pagination
            count={totalPage}
            page={page}
            onChange={(_event: any, newPage: number) => {
              const queryParts = [];

              if (newPage > 1) {
                queryParts.push(`page=${newPage}`);
              }

              const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
              navigate(`${location.pathname}${queryString}`);
            }}
            color="primary"
            size="small"
            id="audit-pagination"
          />
        </Box>
      )}
    </Box>
  );
}
