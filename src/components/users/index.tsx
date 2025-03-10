import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import Divider from '@mui/material/Divider';
import {
  Box,
  Alert,
  Avatar,
  Chip,
  Dialog,
  DialogContent,
  Drawer,
  FormControl,
  FormLabel,
  IconButton,
  ListItemAvatar,
  Radio,
  Skeleton,
  Snackbar,
  Tooltip,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  ListItem,
  List,
  Pagination,
  MenuItem,
  Menu,
  ListItemIcon,
  Button,
  Stack,
  Autocomplete,
  TextField,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { getUserRoles, getUsers, getUser, deleteUserRole, putUserRole, getUsersResponse } from '../../lib/api';
import { fuzzySearch, getDatetime, getPaginatedList, useQuery } from '../../lib/utils';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import styles from './index.module.css';
import _, { debounce } from 'lodash';
import { ROLE_ROOT, ROLE_GUEST, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../lib/constants';
import { useLocation, useNavigate } from 'react-router-dom';
import { CancelLoadingButton, SavelLoadingButton } from '../loading-button';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import PersonIcon from '@mui/icons-material/Person';
import Card from '../card';
import { ReactComponent as Role } from '../../assets/images/user/role.svg';
import { ReactComponent as UserID } from '../../assets/images/user/id.svg';
import { ReactComponent as Name } from '../../assets/images/user/name.svg';
import { ReactComponent as DetailRole } from '../../assets/images/user/detail-role.svg';
import { ReactComponent as Email } from '../../assets/images/user/email.svg';
import { ReactComponent as Phone } from '../../assets/images/user/phone.svg';
import { ReactComponent as Location } from '../../assets/images/user/location.svg';
import { ReactComponent as CreatedAt } from '../../assets/images/user/created-at.svg';
import { ReactComponent as UpdatedAt } from '../../assets/images/user/updated-at.svg';
import { ReactComponent as Root } from '../../assets/images/user/root.svg';
import { ReactComponent as Guest } from '../../assets/images/user/guest.svg';
import SearchCircularProgress from '../circular-progress';

export default function Users() {
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [detailIsLoading, setDetailIsLoading] = useState(true);
  const [userDetail, setUserDetail] = useState(false);
  const [switchUser, setSwitchUser] = useState(false);
  const [userID, setUserID] = useState('');
  const [selectedRow, setSelectedRow] = useState<getUsersResponse | null>(null);
  const [loadingButton, setLoadingButton] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState<number>(1);
  const [users, setUsers] = useState<getUsersResponse[]>([]);
  const [allUsers, setAllUsers] = useState<getUsersResponse[]>([]);
  const [userCount, setUserCount] = useState<getUsersResponse[]>([]);
  const [user, setUser] = useState({
    id: 0,
    email: '',
    name: '',
    phone: '',
    created_at: '',
    location: '',
    updated_at: '',
  });
  const [role, setRole] = useState(['']);
  const [detailRole, setDetailRole] = useState('');
  const [updateRole, setUpdatelRole] = useState('');
  const [anchorElement, setAnchorElement] = useState(null);
  const [searchUser, setSearchUser] = useState('');
  const [searchIconISLodaing, setSearchIconISLodaing] = useState(false);

  const navigate = useNavigate();
  const query = useQuery();
  const page = query.get('page') ? parseInt(query.get('page') as string, 10) || 1 : 1;
  const search = query.get('search') ? (query.get('search') as string) : '';
  const location = useLocation();

  useEffect(() => {
    (async function () {
      try {
        setUserPage(page);
        setIsLoading(true);

        const user = await getUsers({ page: 1, per_page: MAX_PAGE_SIZE });

        setUsers(user);
        setUserCount(user);
        setIsLoading(false);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
          setIsLoading(false);
        }
      }
    })();
  }, [userPage, page]);

  useEffect(() => {
    if (Array.isArray(users) && users.length > 0) {
      const totalPage = Math.ceil(users.length / DEFAULT_PAGE_SIZE);
      const currentPageData = getPaginatedList(users, userPage, DEFAULT_PAGE_SIZE);

      setUserTotalPages(totalPage || 1);
      setAllUsers(currentPageData);
    } else if (users === null || users) {
      setUserTotalPages(1);
      setAllUsers([]);
    }
  }, [users, userPage]);

  const handleChange = async (row: any) => {
    try {
      setUserDetail(true);
      setDetailIsLoading(true);

      const user = await getUser(row.id);
      const role = await getUserRoles(row.id);

      setDetailRole(role[0] || '');
      setUser(user);
      setDetailIsLoading(false);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(true);
        setErrorMessageText(error.message);
        setUserDetail(true);
        setDetailIsLoading(false);
      }
    }
  };

  const openSwitchUser = async (row: any) => {
    try {
      setUserID(row.id);

      const role = await getUserRoles(row.id);

      setRole(role);
      setUpdatelRole(role.includes(ROLE_ROOT) ? ROLE_ROOT : ROLE_GUEST);
      setSwitchUser(true);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(true);
        setErrorMessageText(error.message);
        setSwitchUser(true);
      }
    }
  };

  const closeAllPopups = () => {
    setAnchorElement(null);
    setUserDetail(false);
    setSwitchUser(false);
    setSelectedRow(null);
  };

  const handleSubmit = async () => {
    if (updateRole === ROLE_ROOT && !role.includes(ROLE_ROOT)) {
      setLoadingButton(true);

      try {
        await putUserRole(userID, ROLE_ROOT);
        await deleteUserRole(userID, ROLE_GUEST);

        setSuccessMessage(true);
        setLoadingButton(false);
        setSwitchUser(false);
        setSelectedRow(null);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);

          setLoadingButton(false);
        }
      }
    }

    if (updateRole === ROLE_GUEST && !role.includes(ROLE_GUEST)) {
      setLoadingButton(true);

      try {
        await putUserRole(userID, ROLE_GUEST);
        await deleteUserRole(userID, ROLE_ROOT);

        setSuccessMessage(true);
        setLoadingButton(false);
        setSwitchUser(false);
        setSelectedRow(null);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
          setLoadingButton(false);
        }
      }
    }
  };

  const handleClose = (_: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setSuccessMessage(false);
    setErrorMessage(false);
  };

  const debounced = useMemo(
    () =>
      debounce(async (currentSearch) => {
        if (currentSearch && userCount.length > 0) {
          const user = fuzzySearch(currentSearch, userCount);

          setUsers(user);
          setSearchIconISLodaing(false);
        } else if (currentSearch === '' && userCount.length > 0) {
          setUsers(userCount);
          setSearchIconISLodaing(false);
        }
      }, 500),
    [userCount],
  );

  const handleInputChange = useCallback(
    (newSearch: any) => {
      setSearchUser(newSearch);
      setSearchIconISLodaing(true);
      debounced(newSearch);

      const queryString = newSearch ? `?search=${newSearch}` : '';
      navigate(`${location.pathname}${queryString}`);
    },
    [debounced, location.pathname, navigate],
  );

  useEffect(() => {
    if (search) {
      setSearchUser(search);
      debounced(search);
    }
  }, [search, debounced]);

  return (
    <Box>
      <Snackbar
        open={successMessage}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          Submission successful!
        </Alert>
      </Snackbar>
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '2rem' }}>
        <Typography variant="h5" fontFamily="mabry-bold">
          User
        </Typography>
        <Button
          id="create-user"
          size="small"
          sx={{
            background: 'var(--palette--button-color)',
            color: 'var(--palette--button-text-color)',
            ':hover': { backgroundColor: 'var(--palette--hover-button-text-color)' },
          }}
          variant="contained"
          onClick={() => {
            navigate(`/users/new`);
          }}
        >
          <AddIcon fontSize="small" sx={{ mr: '0.4rem' }} />
          Add User
        </Button>
      </Box>
      <Box className={styles.searchWrapper}>
        <Stack spacing={2} sx={{ width: '20rem' }}>
          <Autocomplete
            color="secondary"
            id="free-solo-demo"
            size="small"
            freeSolo
            inputValue={searchUser}
            onInputChange={(_event, newInputValue) => {
              handleInputChange(newInputValue);
            }}
            options={(Array.isArray(allUsers) && allUsers.map((option) => option?.name)) || ['']}
            renderInput={(params) => (
              <TextField
                {...params}
                sx={{ padding: 0 }}
                label="Search"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: searchIconISLodaing ? (
                    <Box
                      sx={{
                        width: '2.2rem',
                        height: '2.2rem',
                        pl: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <SearchCircularProgress />
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        width: '2.2rem',
                        height: '2.2rem',
                        pl: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <SearchIcon sx={{ color: '#919EAB' }} />
                    </Box>
                  ),
                }}
              />
            )}
          />
        </Stack>
      </Box>
      <Card>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead sx={{ backgroundColor: 'var(--palette--table-title-color)' }}>
            <TableRow>
              <TableCell className={styles.tableHeaderText} align="center"></TableCell>
              <TableCell align="center" className={styles.tableHeaderText}>
                <Typography variant="subtitle1" className={styles.tableHeader}>
                  Name
                </Typography>
              </TableCell>
              <TableCell align="center" className={styles.tableHeaderText}>
                <Typography variant="subtitle1" className={styles.tableHeader}>
                  Email
                </Typography>
              </TableCell>
              <TableCell align="center" className={styles.tableHeaderText}>
                <Typography variant="subtitle1" className={styles.tableHeader}>
                  Location
                </Typography>
              </TableCell>
              <TableCell align="center" className={styles.tableHeaderText}>
                <Typography variant="subtitle1" className={styles.tableHeader}>
                  State
                </Typography>
              </TableCell>
              <TableCell align="center" className={styles.tableHeaderText}>
                <Typography variant="subtitle1" className={styles.tableHeader}>
                  Operation
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody id="user-table-body">
            {isLoading ? (
              <TableRow id="user-table-row">
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Skeleton data-testid="isloading" variant="circular" component="div" width={40} height={40} />
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Skeleton data-testid="isloading" width="2rem" />
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Skeleton data-testid="isloading" width="4rem" />
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Skeleton data-testid="isloading" width="2rem" />
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Skeleton data-testid="isloading" width="3.8rem" height="2.8rem" />
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Skeleton data-testid="isloading" variant="circular" component="div" width={40} height={40} />
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              Array.isArray(allUsers) &&
              allUsers.map((item) => (
                <TableRow
                  id="user-table-row"
                  key={item?.name}
                  selected={selectedRow === item}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    ':hover': { backgroundColor: 'var(--palette-action-hover)' },
                  }}
                  className={styles.tableRow}
                >
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Avatar
                        alt="Remy Sharp"
                        sx={{
                          '&.MuiAvatar-root': {
                            background: 'var(--palette--button-color)',
                            color: '#fff',
                          },
                        }}
                        src={item?.avatar}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body1" fontFamily="mabry-bold">
                      {item?.name || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{item?.email || '-'}</TableCell>
                  <TableCell align="center">{item?.location || '-'}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={_.upperFirst(item?.state) || ''}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderRadius: '0.2rem',
                        backgroundColor:
                          item?.state === 'enable'
                            ? 'var( --palette--description-color)'
                            : 'var(--palette-dark-300Channel)',
                        color: item?.state === 'enable' ? '#FFFFFF' : '#FFFFFF',
                        borderColor:
                          item?.state === 'enable'
                            ? 'var( --palette--description-color)'
                            : 'var(--palette-dark-300Channel)',
                        fontWeight: 'bold',
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={(event: any) => {
                        setAnchorElement(event.currentTarget);
                        setSelectedRow(item);
                      }}
                      id={`action-${item?.name}`}
                      aria-haspopup="true"
                      sx={{ position: 'relative' }}
                    >
                      <MoreVertIcon sx={{ color: 'var(--palette-color)' }} />
                    </IconButton>
                    <Menu
                      anchorEl={anchorElement}
                      id="account-menu"
                      open={Boolean(anchorElement)}
                      onClose={closeAllPopups}
                      sx={{
                        position: 'absolute',
                        left: '-6.5rem',
                        '& .MuiMenu-paper': {
                          boxShadow: 'var(--palette-menu-shadow);',
                          borderRadius: 'var(--menu-border-radius);',
                        },
                        '& .MuiMenu-list': {
                          p: 0,
                        },
                      }}
                    >
                      <Box className={styles.menu}>
                        <MenuItem
                          id={`detail-${selectedRow?.name}`}
                          onClick={() => {
                            handleChange(selectedRow);
                            setAnchorElement(null);
                          }}
                        >
                          <ListItemIcon>
                            <PersonIcon className={styles.menuItemIcon} />
                          </ListItemIcon>
                          <Typography variant="body2" className={styles.menuText}>
                            Detail
                          </Typography>
                        </MenuItem>
                        {selectedRow?.name === 'root' ? (
                          <></>
                        ) : (
                          <MenuItem
                            id={`edit-${selectedRow?.name}`}
                            onClick={() => {
                              openSwitchUser(selectedRow);
                              setAnchorElement(null);
                            }}
                          >
                            <ListItemIcon>
                              <ModeEditIcon className={styles.menuItemIcon} />
                            </ListItemIcon>
                            <Typography variant="body2" className={styles.menuText}>
                              Edit Role
                            </Typography>
                          </MenuItem>
                        )}
                      </Box>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
      {userTotalPages > 1 ? (
        <Box display="flex" justifyContent="flex-end" sx={{ marginTop: '1rem' }}>
          <Pagination
            id="user-pagination"
            count={userTotalPages}
            page={userPage}
            onChange={(_event: any, newPage: number) => {
              setUserPage(newPage);
              navigate(`/users${newPage > 1 ? `?page=${newPage}` : ''}`);
            }}
            color="primary"
            size="small"
          />
        </Box>
      ) : (
        <></>
      )}
      <Dialog
        open={switchUser}
        onClose={closeAllPopups}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          '& .MuiDialog-paper': {
            minWidth: '37rem',
          },
        }}
      >
        <Box className={styles.editRoleHeader}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Role className={styles.editRoleHeaderIcon} />
            <Typography variant="h6" fontFamily="mabry-bold" pl="0.7rem">
              Role
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            id="close-delete-icon"
            onClick={closeAllPopups}
            sx={{
              color: (theme) => theme.palette.grey[500],
              p: '0.2rem',
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <DialogContent>
          <Box className={styles.changeRoleContainer}>
            <FormControl>
              <Box
                sx={{
                  borderColor:
                    updateRole === 'root' ? 'var(--palette--description-color)' : 'var(--palette-background-paper)',
                }}
                className={styles.roleEdit}
              >
                <Box className={styles.roleContainer}>
                  <Root className={styles.roleIcon} />
                  <Box pl="0.7rem">
                    <Typography variant="body2" fontFamily="mabry-bold">
                      Root
                    </Typography>
                    <Tooltip
                      title="The root user is the super user of the system and has the highest authority."
                      placement="top"
                    >
                      <Typography component="div" className={styles.roleText} variant="caption">
                        The root user is the super user of the system and has the highest authority.
                      </Typography>
                    </Tooltip>
                  </Box>
                </Box>
                <Radio
                  size="small"
                  value="root"
                  id="role-root"
                  name="radio-buttons"
                  checked={updateRole === 'root'}
                  sx={{
                    '&.Mui-checked': {
                      color: 'var(--palette--description-color)',
                    },
                  }}
                  onChange={(e: any) => {
                    setUpdatelRole(e.target.value);
                  }}
                />
              </Box>
              <Box
                sx={{
                  borderColor:
                    updateRole === 'guest' ? 'var(--palette--description-color)' : 'var(--palette-background-paper)',
                }}
                className={styles.roleEdit}
              >
                <Box className={styles.roleContainer}>
                  <Guest className={styles.roleIcon} />
                  <Box pl="0.7rem">
                    <Typography variant="body2" fontFamily="mabry-bold">
                      Guest
                    </Typography>
                    <Tooltip
                      title="The guest user has limited permissions and is intended for general user access."
                      placement="top"
                    >
                      <Typography component="div" className={styles.roleText} variant="caption">
                        The guest user has limited permissions and is intended for general user access.
                      </Typography>
                    </Tooltip>
                  </Box>
                </Box>
                <Radio
                  size="small"
                  value="guest"
                  id="role-guest"
                  name="radio-buttons"
                  checked={updateRole === 'guest'}
                  sx={{
                    '&.Mui-checked': {
                      color: 'var(--palette--description-color)',
                    },
                  }}
                  onChange={(e: any) => {
                    setUpdatelRole(e.target.value);
                  }}
                />
              </Box>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: '1.2rem' }}>
            <CancelLoadingButton id="cancel" loading={loadingButton} onClick={closeAllPopups} />
            <SavelLoadingButton
              loading={loadingButton}
              endIcon={<CheckCircleIcon />}
              id="save"
              text="Save"
              onClick={handleSubmit}
            />
          </Box>
        </DialogContent>
      </Dialog>
      <Drawer anchor="right" open={userDetail} onClose={closeAllPopups}>
        <Box role="presentation" sx={{ width: 350 }}>
          <List>
            <Box className={styles.detailWrapper}>
              <Typography variant="h6" fontFamily="mabry-bold">
                User Detail
              </Typography>
              <IconButton
                id="closure-user-detail"
                onClick={() => {
                  setUserDetail(false);
                  setSwitchUser(false);
                  setSelectedRow(null);
                  setDetailIsLoading(true);
                }}
              >
                <ClearOutlinedIcon sx={{ color: 'var(--palette-secondary-dark)' }} />
              </IconButton>
            </Box>
            <Divider
              sx={{
                borderStyle: 'dashed',
                borderColor: 'var(--palette--palette-divider)',
                borderWidth: '0px 0px thin',
              }}
            />
            <ListItem className={styles.detailContentWrap}>
              <ListItemAvatar className={styles.detailContentLabelContainer}>
                <UserID className={styles.detailIcon} />
                <Typography variant="body2" className={styles.detailTitle}>
                  ID
                </Typography>
              </ListItemAvatar>
              <Typography id="id" variant="body2" className={styles.detailContent}>
                {detailIsLoading ? <Skeleton data-testid="detail-isloading" sx={{ width: '8rem' }} /> : user?.id || 0}
              </Typography>
            </ListItem>
            <Divider
              sx={{
                borderStyle: 'dashed',
                borderColor: 'var(--palette--palette-divider)',
                borderWidth: '0px 0px thin',
              }}
            />
            <ListItem className={styles.detailContentWrap}>
              <ListItemAvatar className={styles.detailContentLabelContainer}>
                <Name className={styles.detailIcon} />
                <Typography variant="body2" className={styles.detailTitle}>
                  Name
                </Typography>
              </ListItemAvatar>
              <Typography id="name" variant="body2" className={styles.detailContent}>
                {detailIsLoading ? (
                  <Skeleton data-testid="detail-isloading" sx={{ width: '8rem' }} />
                ) : (
                  user?.name || '-'
                )}
              </Typography>
            </ListItem>
            <Divider
              sx={{
                borderStyle: 'dashed',
                borderColor: 'var(--palette--palette-divider)',
                borderWidth: '0px 0px thin',
              }}
            />
            <ListItem className={styles.detailContentWrap}>
              <ListItemAvatar className={styles.detailContentLabelContainer}>
                <DetailRole className={styles.detailIcon} />
                <Typography variant="body2" className={styles.detailTitle}>
                  Role
                </Typography>
              </ListItemAvatar>
              <Typography id="role" variant="body2" component="div">
                {detailIsLoading ? (
                  <Skeleton data-testid="detail-isloading" sx={{ width: '8rem' }} />
                ) : detailRole ? (
                  <Chip
                    label={detailRole}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderRadius: '0.2rem',
                      background: 'var(--palette--button-color)',
                      color: '#FFFFFF',
                      mr: '0.4rem',
                      borderColor: 'var(--palette--button-color)',
                      fontWeight: 'bold',
                    }}
                  />
                ) : (
                  <Typography id="role" variant="body2" component="div">
                    -
                  </Typography>
                )}
              </Typography>
            </ListItem>
            <Divider
              sx={{
                borderStyle: 'dashed',
                borderColor: 'var(--palette--palette-divider)',
                borderWidth: '0px 0px thin',
              }}
            />
            <ListItem className={styles.detailContentWrap}>
              <ListItemAvatar className={styles.detailContentLabelContainer}>
                <Email className={styles.detailIcon} />
                <Typography variant="body2" className={styles.detailTitle}>
                  Email
                </Typography>
              </ListItemAvatar>
              <Tooltip title={user?.email || '-'} placement="top">
                <Typography id="email" variant="body2" className={styles.emailContent}>
                  {detailIsLoading ? (
                    <Skeleton data-testid="detail-isloading" sx={{ width: '8rem' }} />
                  ) : (
                    user?.email || '-'
                  )}
                </Typography>
              </Tooltip>
            </ListItem>
            <Divider
              sx={{
                borderStyle: 'dashed',
                borderColor: 'var(--palette--palette-divider)',
                borderWidth: '0px 0px thin',
              }}
            />
            <ListItem className={styles.detailContentWrap}>
              <ListItemAvatar className={styles.detailContentLabelContainer}>
                <Phone className={styles.detailIcon} />
                <Typography variant="body2" className={styles.detailTitle}>
                  Phone
                </Typography>
              </ListItemAvatar>
              <Typography id="phone" variant="body2" className={styles.detailContent}>
                {detailIsLoading ? (
                  <Skeleton data-testid="detail-isloading" sx={{ width: '8rem' }} />
                ) : (
                  user.phone || '-'
                )}
              </Typography>
            </ListItem>
            <Divider
              sx={{
                borderStyle: 'dashed',
                borderColor: 'var(--palette--palette-divider)',
                borderWidth: '0px 0px thin',
              }}
            />
            <ListItem className={styles.detailContentWrap}>
              <ListItemAvatar className={styles.detailContentLabelContainer}>
                <Location className={styles.detailIcon} />
                <Typography variant="body2" className={styles.detailTitle}>
                  Location
                </Typography>
              </ListItemAvatar>
              <Tooltip title={user.location || '-'} placement="top">
                <Box className={styles.emailContent}>
                  <Typography id="location" variant="body2">
                    {detailIsLoading ? (
                      <Skeleton data-testid="detail-isloading" sx={{ width: '8rem' }} />
                    ) : (
                      user.location || '-'
                    )}
                  </Typography>
                </Box>
              </Tooltip>
            </ListItem>
            <Divider
              sx={{
                borderStyle: 'dashed',
                borderColor: 'var(--palette--palette-divider)',
                borderWidth: '0px 0px thin',
              }}
            />
            <ListItem className={styles.detailContentWrap}>
              <ListItemAvatar className={styles.detailContentLabelContainer}>
                <CreatedAt className={styles.detailIcon} />
                <Typography variant="body2" className={styles.detailTitle}>
                  Created At
                </Typography>
              </ListItemAvatar>
              {detailIsLoading ? (
                <Skeleton data-testid="detail-isloading" sx={{ width: '8rem' }} />
              ) : user.created_at ? (
                <Typography id="created-at" variant="body2" className={styles.detailContent}>
                  {detailIsLoading ? (
                    <Skeleton data-testid="detail-isloading" sx={{ width: '8rem' }} />
                  ) : (
                    getDatetime(user.created_at || '-')
                  )}
                </Typography>
              ) : (
                <Typography id="created-at" variant="body2" className={styles.detailContent}>
                  -
                </Typography>
              )}
            </ListItem>
            <Divider
              sx={{
                borderStyle: 'dashed',
                borderColor: 'var(--palette--palette-divider)',
                borderWidth: '0px 0px thin',
              }}
            />
            <ListItem className={styles.detailContentWrap}>
              <ListItemAvatar className={styles.detailContentLabelContainer}>
                <UpdatedAt className={styles.detailIcon} />
                <Typography variant="body2" className={styles.detailTitle}>
                  Updated At
                </Typography>
              </ListItemAvatar>
              {detailIsLoading ? (
                <Skeleton data-testid="detail-isloading" sx={{ width: '8rem' }} />
              ) : user.updated_at ? (
                <Typography id="updated-at" variant="body2" className={styles.detailContent}>
                  {detailIsLoading ? (
                    <Skeleton data-testid="detail-isloading" sx={{ width: '8rem' }} />
                  ) : (
                    getDatetime(user.updated_at || '-')
                  )}
                </Typography>
              ) : (
                <Typography id="updated-at" variant="body2" className={styles.detailContent}>
                  -
                </Typography>
              )}
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
}
