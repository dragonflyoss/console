import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import Divider from '@mui/material/Divider';
import {
  Box,
  Alert,
  Avatar,
  Breadcrumbs,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Drawer,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  ListItemAvatar,
  ListSubheader,
  Radio,
  RadioGroup,
  Skeleton,
  Snackbar,
  Tooltip,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  ListItem,
  List,
  Pagination,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { getUserRoles, getUsers, getUser, deleteUserRole, putUserRole } from '../../lib/api';
import { makeStyles } from '@mui/styles';
import { getDatetime, getPaginatedList } from '../../lib/utils';
import { LoadingButton } from '@mui/lab';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import styles from './index.module.css';
import _ from 'lodash';
import { ROLE_ROOT, ROLE_GUEST, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../lib/constants';

const useStyles = makeStyles((theme: any) => ({
  tableRow: {
    '&$selected': {
      backgroundColor: 'var(--button-color)',
    },
  },
  hover: {
    backgroundColor: theme.palette.action.hover,
  },
  selected: {},
  tableCell: {
    color: theme.palette.text.primary,
  },

  selectedTableCell: {
    color: '#fff',
  },
  selectedTableAvatar: {
    color: 'var(--button-color)!important',
    backgroundColor: '#fff!important',
  },
  selectedButton: {
    color: 'var(--button-color)!important',
    backgroundColor: '#fff!important',
  },
}));

export default function Users() {
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [detailIsLoading, setDetailIsLoading] = useState(true);
  const [userDetail, setUserDetail] = useState(false);
  const [switchUser, setSwitchUser] = useState(false);
  const [userID, setUserID] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);
  const [loadingButton, setLoadingButton] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState<number>(1);
  const [users, setUsers] = useState([{ avatar: '', id: 0, email: '', name: '', state: '', location: '' }]);
  const [allUsers, setAllUsers] = useState([{ avatar: '', id: 0, email: '', name: '', state: '', location: '' }]);
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

  const classes = useStyles();

  const theme = createTheme({
    palette: {
      primary: {
        main: '#1C293A',
      },
    },
  });

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
  }, [userPage]);

  useMemo(() => {
    const totalPage = Math.ceil(users.length / DEFAULT_PAGE_SIZE);
    const currentPageData = getPaginatedList(users, userPage, DEFAULT_PAGE_SIZE);

    setUserTotalPages(totalPage || 1);
    setAllUsers(currentPageData);
  }, [users, userPage]);

  const handleChange = async (row: any) => {
    try {
      setUserDetail(true);
      setDetailIsLoading(true);
      setSelectedRow(row);

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
      setSelectedRow(row);
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

  return (
    <ThemeProvider theme={theme}>
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
      <Breadcrumbs sx={{ mb: '2rem' }}>
        <Typography variant="h5" color="text.primary">
          User
        </Typography>
      </Breadcrumbs>
      <Paper variant="outlined">
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead sx={{ backgroundColor: 'var(--table-title-color)' }}>
            <TableRow>
              <TableCell align="center"></TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1">Name</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1">Email</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1">Location</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1">State</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1">Operation</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(allUsers) &&
              allUsers.map((item) => (
                <TableRow
                  sx={{
                    '&.MuiTableRow-root': {
                      ':hover': {
                        background: selectedRow === item ? 'var(--button-color)' : '',
                      },
                    },
                  }}
                  key={item?.name}
                  selected={selectedRow === item}
                  className={`${classes.tableRow} ${selectedRow === item ? classes.selected : ''}`}
                  classes={{ selected: classes.selected }}
                >
                  <TableCell align="center">
                    {isLoading ? (
                      <Skeleton />
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Avatar
                          alt="Remy Sharp"
                          sx={{
                            '&.MuiAvatar-root': {
                              background: 'var(--button-color)',
                              color: '#fff',
                            },
                          }}
                          className={`${classes.tableCell} ${selectedRow === item ? classes.selectedTableAvatar : ''}`}
                          src={item?.avatar}
                        />
                      </Box>
                    )}
                  </TableCell>
                  <TableCell
                    align="center"
                    className={`${classes.tableCell} ${selectedRow === item ? classes.selectedTableCell : ''}`}
                  >
                    {isLoading ? <Skeleton /> : item?.name || '-'}
                  </TableCell>
                  <TableCell
                    align="center"
                    className={`${classes.tableCell} ${selectedRow === item ? classes.selectedTableCell : ''}`}
                  >
                    {isLoading ? <Skeleton /> : item?.email || '-'}
                  </TableCell>
                  <TableCell
                    align="center"
                    className={`${classes.tableCell} ${selectedRow === item ? classes.selectedTableCell : ''}`}
                  >
                    {isLoading ? <Skeleton /> : item?.location || '-'}
                  </TableCell>
                  <TableCell
                    align="center"
                    className={`${classes.tableCell} ${selectedRow === item ? classes.selectedTableCell : ''}`}
                  >
                    {isLoading ? (
                      <Skeleton />
                    ) : (
                      <Chip
                        label={_.upperFirst(item?.state) || ''}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderRadius: '0%',
                          backgroundColor:
                            item?.state === 'enable' ? 'var( --description-color)' : 'var(--button-color)',
                          color: item?.state === 'enable' ? '#FFFFFF' : '#FFFFFF',
                          borderColor: item?.state === 'enable' ? 'var( --description-color)' : 'var(--button-color)',
                          fontWeight: 'bold',
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {item?.name === 'root' ? (
                      <IconButton
                        className={`${classes.tableCell} ${selectedRow === item ? classes.selectedButton : ''}`}
                        sx={{
                          '&.MuiButton-root': {
                            backgroundColor: 'var(--button-color)',
                            borderRadius: 0,
                            color: '#fff',
                          },
                        }}
                        onClick={() => {
                          handleChange(item);
                        }}
                      >
                        <Box component="img" sx={{ width: '2rem', height: '2rem' }} src="/icons/user/detail.svg" />
                      </IconButton>
                    ) : (
                      <>
                        <IconButton
                          className={`${classes.tableCell} ${selectedRow === item ? classes.selectedButton : ''}`}
                          sx={{
                            '&.MuiButton-root': {
                              backgroundColor: 'var(--button-color)',
                              borderRadius: 0,
                              color: '#fff',
                            },
                          }}
                          onClick={() => {
                            openSwitchUser(item);
                          }}
                        >
                          <Box component="img" sx={{ width: '2rem', height: '2rem' }} src="/icons/user/user-edit.svg" />
                        </IconButton>
                        <IconButton
                          className={`${classes.tableCell} ${selectedRow === item ? classes.selectedButton : ''}`}
                          sx={{
                            '&.MuiButton-root': {
                              backgroundColor: 'var(--button-color)',
                              borderRadius: 0,
                              color: '#fff',
                            },
                          }}
                          onClick={() => {
                            handleChange(item);
                          }}
                        >
                          <Box component="img" sx={{ width: '2rem', height: '2rem' }} src="/icons/user/detail.svg" />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Paper>
      {userTotalPages > 1 ? (
        <Box display="flex" justifyContent="flex-end" sx={{ marginTop: theme.spacing(2) }}>
          <Pagination
            count={userTotalPages}
            page={userPage}
            onChange={(_event: any, newPage: number) => {
              setUserPage(newPage);
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
        maxWidth="xs"
        fullWidth
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <Box className={styles.changeRoleContainer}>
            <Box component="img" className={styles.roleIcon} src="/icons/user/role.svg" />
            <FormControl>
              <FormLabel color="success" id="demo-controlled-radio-buttons-group"></FormLabel>
              <RadioGroup
                row
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="controlled-radio-buttons-group"
                value={updateRole}
                onChange={(e: any) => {
                  setUpdatelRole(e.target.value);
                }}
              >
                <FormControlLabel
                  value="root"
                  control={
                    <Radio
                      sx={{
                        '&.MuiRadio-root': {
                          color: 'var(--button-color)',
                        },
                      }}
                    />
                  }
                  label="root"
                />
                <FormControlLabel
                  value="guest"
                  control={
                    <Radio
                      sx={{
                        '&.MuiRadio-root': {
                          color: 'var(--button-color)',
                        },
                      }}
                    />
                  }
                  label="guest"
                />
              </RadioGroup>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions className={styles.roleButtonContainer}>
          <LoadingButton
            loading={loadingButton}
            endIcon={<CancelIcon sx={{ color: 'var(--button-color)' }} />}
            size="small"
            variant="outlined"
            loadingPosition="end"
            sx={{
              '&.MuiLoadingButton-root': {
                color: 'var(--calcel-size-color)',
                borderRadius: 0,
                borderColor: 'var(--calcel-color)',
              },
              ':hover': {
                backgroundColor: 'var( --calcel-hover-corlor)',
                borderColor: 'var( --calcel-hover-corlor)',
              },
              '&.MuiLoadingButton-loading': {
                backgroundColor: 'var(--button-loading-color)',
                color: 'var(--button-loading-size-color)',
                borderColor: 'var(--button-loading-color)',
              },
              mr: '1rem',
              width: '8rem',
            }}
            onClick={closeAllPopups}
          >
            Cancel
          </LoadingButton>
          <LoadingButton
            loading={loadingButton}
            endIcon={<CheckCircleIcon />}
            size="small"
            variant="outlined"
            type="submit"
            loadingPosition="end"
            sx={{
              '&.MuiLoadingButton-root': {
                backgroundColor: 'var(--save-color)',
                borderRadius: 0,
                color: 'var(--save-size-color)',
                borderColor: 'var(--save-color)',
              },
              ':hover': {
                backgroundColor: 'var(--save-hover-corlor)',
                borderColor: 'var(--save-hover-corlor)',
              },
              '&.MuiLoadingButton-loading': {
                backgroundColor: 'var(--button-loading-color)',
                color: 'var(--button-loading-size-color)',
                borderColor: 'var(--button-loading-color)',
              },
              width: '8rem',
            }}
            onClick={handleSubmit}
          >
            Save
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <Drawer anchor="right" open={userDetail} onClose={closeAllPopups}>
        <Box role="presentation" sx={{ width: 350 }}>
          <List>
            <ListSubheader component="div" color="inherit" className={styles.detailTitle}>
              <Typography variant="h6" fontFamily="mabry-bold">
                User Detail
              </Typography>
              <IconButton
                onClick={() => {
                  setUserDetail(false);
                  setSwitchUser(false);
                  setSelectedRow(null);
                  setDetailIsLoading(true);
                }}
              >
                <ClearOutlinedIcon sx={{ color: 'var(--button-color)' }} />
              </IconButton>
            </ListSubheader>
            <Divider />
            <ListItem className={styles.detailContentWrap}>
              <ListItemAvatar className={styles.detailContentLabelContainer}>
                <Box component="img" className={styles.detailIcon} src="/icons/user/id.svg" />
                <Typography variant="body2" ml="0.8rem" fontFamily="mabry-bold">
                  ID
                </Typography>
              </ListItemAvatar>
              <Typography variant="body2">
                {detailIsLoading ? <Skeleton sx={{ width: '8rem' }} /> : user?.id}
              </Typography>
            </ListItem>
            <Divider />
            <ListItem className={styles.detailContentWrap}>
              <ListItemAvatar className={styles.detailContentLabelContainer}>
                <Box component="img" className={styles.detailIcon} src="/icons/user/name.svg" />
                <Typography variant="body2" ml="0.8rem" fontFamily="mabry-bold">
                  Name
                </Typography>
              </ListItemAvatar>
              <Typography variant="body2">
                {detailIsLoading ? <Skeleton sx={{ width: '8rem' }} /> : user?.name}
              </Typography>
            </ListItem>
            <Divider />
            <ListItem className={styles.detailContentWrap}>
              <ListItemAvatar className={styles.detailContentLabelContainer}>
                <Box component="img" className={styles.detailIcon} src="/icons/user/detail-role.svg" />
                <Typography variant="body2" ml="0.8rem" fontFamily="mabry-bold">
                  Role
                </Typography>
              </ListItemAvatar>
              <Typography variant="body2" component="div">
                {detailIsLoading ? (
                  <Skeleton sx={{ width: '8rem' }} />
                ) : (
                  <Chip
                    label={detailRole}
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
                )}
              </Typography>
            </ListItem>
            <Divider />
            <ListItem className={styles.detailContentWrap}>
              <ListItemAvatar className={styles.detailContentLabelContainer}>
                <Box component="img" className={styles.detailIcon} src="/icons/user/email.svg" />
                <Typography variant="body2" ml="0.8rem" fontFamily="mabry-bold">
                  Email
                </Typography>
              </ListItemAvatar>
              <Tooltip title={user?.email || '-'} placement="top">
                <Typography variant="body2" className={styles.emailContent}>
                  {detailIsLoading ? <Skeleton sx={{ width: '8rem' }} /> : user?.email || '-'}
                </Typography>
              </Tooltip>
            </ListItem>
            <Divider />
            <ListItem className={styles.detailContentWrap}>
              <ListItemAvatar className={styles.detailContentLabelContainer}>
                <Box component="img" className={styles.detailIcon} src="/icons/user/phone.svg" />
                <Typography variant="body2" ml="0.8rem" fontFamily="mabry-bold">
                  Phone
                </Typography>
              </ListItemAvatar>
              <Typography variant="body2">
                {detailIsLoading ? <Skeleton sx={{ width: '8rem' }} /> : user.phone || '-'}
              </Typography>
            </ListItem>
            <Divider />
            <ListItem className={styles.detailContentWrap}>
              <ListItemAvatar className={styles.detailContentLabelContainer}>
                <Box component="img" className={styles.detailIcon} src="/icons/user/location.svg" />
                <Typography variant="body2" ml="0.8rem" fontFamily="mabry-bold">
                  Location
                </Typography>
              </ListItemAvatar>
              <Tooltip title={user.location || '-'} placement="top">
                <Box className={styles.emailContent}>
                  <Typography variant="body2">
                    {detailIsLoading ? <Skeleton sx={{ width: '8rem' }} /> : user.location || '-'}
                  </Typography>
                </Box>
              </Tooltip>
            </ListItem>
            <Divider />
            <ListItem className={styles.detailContentWrap}>
              <ListItemAvatar className={styles.detailContentLabelContainer}>
                <Box component="img" className={styles.detailIcon} src="/icons/user/created-at.svg" />
                <Typography variant="body2" ml="0.8rem" fontFamily="mabry-bold">
                  Created At
                </Typography>
              </ListItemAvatar>
              {detailIsLoading ? (
                <Skeleton sx={{ width: '8rem' }} />
              ) : (
                <Chip
                  avatar={<Box component="img" src="/icons/user/created-at.svg" />}
                  label={getDatetime(user.created_at || '-')}
                  variant="outlined"
                  size="small"
                />
              )}
            </ListItem>
            <Divider />
            <ListItem className={styles.detailContentWrap}>
              <ListItemAvatar className={styles.detailContentLabelContainer}>
                <Box component="img" className={styles.detailIcon} src="/icons/user/updated-at.svg" />
                <Typography variant="body2" ml="0.8rem" fontFamily="mabry-bold">
                  Updated At
                </Typography>
              </ListItemAvatar>
              {detailIsLoading ? (
                <Skeleton sx={{ width: '8rem' }} />
              ) : (
                <Chip
                  avatar={<Box component="img" src="/icons/user/updated-at.svg" />}
                  label={getDatetime(user.updated_at || '-')}
                  variant="outlined"
                  size="small"
                />
              )}
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </ThemeProvider>
  );
}
