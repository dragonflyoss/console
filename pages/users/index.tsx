import Layout from 'components/layout';
import { NextPageWithLayout } from '../_app';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import {
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
} from '@mui/material';
import { ReactElement, useEffect, useState } from 'react';
import { deleteGuest, deleteRoot, getuserRoles, listUsers, getUser, putGuest, putRoot } from 'lib/api';
import { makeStyles } from '@mui/styles';
import { datetime } from 'lib/utils';
import { LoadingButton } from '@mui/lab';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import styles from './users.module.css';

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

const User: NextPageWithLayout = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [DetailLoading, setDetailLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [userID, setUserID] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);
  const [loadingButton, setLoadingButton] = useState(false);
  const [userList, setUserList] = useState([{ avatar: '', id: '', email: '', name: '', state: '', location: '' }]);
  const [userObject, setUserObject] = useState({
    id: '',
    email: '',
    name: '',
    phone: '',
    created_at: '',
    location: '',
    updated_at: '',
  });
  const [role, setRole] = useState('');
  const classes = useStyles();

  useEffect(() => {
    setIsLoading(true);

    listUsers().then(async (response) => {
      if (response.status === 200) {
        setUserList(await response.json());
      } else {
        setErrorMessage(true);
        setErrorMessageText(response.statusText);
      }
    });

    setIsLoading(false);
  }, []);

  const handleChange = async (row: any) => {
    setDetailLoading(true);
    setSelectedRow(row);

    await getUser(row.id).then(async (response) => {
      if (response.status === 200) {
        setUserObject(await response.json());
      } else {
        setErrorMessage(true);
        setErrorMessageText(response.statusText);
      }
    });

    setDetailOpen(true);
    setDetailLoading(false);
  };

  const closureDeatail = () => {
    setDetailOpen(false);
    setUserOpen(false);
    setSelectedRow(null);
    setDetailLoading(true);
  };

  const openSwitchUser = async (row: any) => {
    setSelectedRow(row);
    setUserID(row.id);

    await getuserRoles(row.id).then(async (response) => {
      if (response.status === 200) {
        setRole(await response.json());
      } else {
        setErrorMessage(true);
        setErrorMessageText(response.statusText);
      }
    });

    setUserOpen(true);
  };

  const closure = () => {
    setDetailOpen(false);
    setUserOpen(false);
    setSelectedRow(null);
  };

  const handleSubmit = async () => {
    setLoadingButton(true);

    if (role == 'root') {
      const deleteGuestMethod = deleteGuest(userID);
      const putRootMethod = putRoot(userID);

      Promise.all([deleteGuestMethod, putRootMethod]).then((res) => {
        const response = res.filter((item) => {
          return item.status == 200;
        });

        if (response.length == 2) {
          setSuccessMessage(true);
          setLoadingButton(false);
          setUserOpen(false);
          setSelectedRow(null);
        } else {
          setErrorMessage(true);
          setLoadingButton(false);
          setErrorMessageText(response[0].statusText || 'Submission Failed!');
        }
      });
    } else if (role == 'guest') {
      const deleteRootMethod = await deleteRoot(userID);
      const putGuestMethod = await putGuest(userID);

      Promise.all([deleteRootMethod, putGuestMethod]).then((res) => {
        const response = res.filter((item) => {
          return item.status == 200;
        });

        if (response.length == 2) {
          setSuccessMessage(true);
          setLoadingButton(false);
          setUserOpen(false);
          setSelectedRow(null);
        } else {
          setErrorMessage(true);
          setLoadingButton(false);
          setErrorMessageText(response[0].statusText || 'Submission Failed!');
        }
      });
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
      <Breadcrumbs sx={{ mb: '2rem' }}>
        <Typography variant="h5" color="text.primary" fontFamily="mabry-bold">
          User
        </Typography>
      </Breadcrumbs>
      <Paper variant="outlined">
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="center"></TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="mabry-bold">
                  Name
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="mabry-bold">
                  Email
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="mabry-bold">
                  Location
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="mabry-bold">
                  State
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="mabry-bold">
                  Operation
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(userList) &&
              userList.map((item) => (
                <TableRow
                  sx={{
                    '&.MuiTableRow-root': {
                      ':hover': { background: selectedRow === item ? 'var(--button-color)' : '' },
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
                          sx={{ '&.MuiAvatar-root': { background: 'var(--button-color)', color: '#fff' } }}
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
                        label={`${item?.state?.charAt(0).toUpperCase()}${item?.state?.slice(1)}`}
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
                    {item?.name == 'root' ? (
                      <Button
                        onClick={() => {
                          handleChange(item);
                        }}
                        size="small"
                        variant="contained"
                        className={`${classes.tableCell} ${selectedRow === item ? classes.selectedButton : ''}`}
                        sx={{
                          '&.MuiButton-root': {
                            backgroundColor: 'var(--button-color)',
                            borderRadius: 0,
                            color: '#fff',
                          },
                          mr: '0.6rem',
                        }}
                      >
                        Detail
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={() => {
                            handleChange(item);
                          }}
                          size="small"
                          variant="contained"
                          className={`${classes.tableCell} ${selectedRow === item ? classes.selectedButton : ''}`}
                          sx={{
                            '&.MuiButton-root': {
                              backgroundColor: 'var(--button-color)',
                              borderRadius: 0,
                              color: '#fff',
                            },
                            mr: '0.6rem',
                          }}
                        >
                          Detail
                        </Button>
                        <Button
                          onClick={() => {
                            openSwitchUser(item);
                          }}
                          size="small"
                          variant="contained"
                          className={`${classes.tableCell} ${selectedRow === item ? classes.selectedButton : ''}`}
                          sx={{
                            '&.MuiButton-root': {
                              backgroundColor: 'var(--button-color)',
                              borderRadius: 0,
                              color: '#fff',
                            },
                          }}
                        >
                          Update
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Paper>
      <Dialog
        open={userOpen}
        onClose={closure}
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
                value={role}
                onChange={(e: any) => {
                  setRole(e.target.value);
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
            onClick={closure}
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
              ':hover': { backgroundColor: 'var(--save-hover-corlor)', borderColor: 'var(--save-hover-corlor)' },
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
      <Drawer anchor="right" open={detailOpen} onClose={closure}>
        <Box role="presentation" sx={{ width: 350 }}>
          <List>
            <ListSubheader component="div" color="inherit" className={styles.detailTitle}>
              <Typography variant="h6" fontFamily="mabry-bold">
                User Detail
              </Typography>
              <IconButton onClick={closureDeatail}>
                <ClearOutlinedIcon sx={{ color: 'var(--button-color)' }} />
              </IconButton>
            </ListSubheader>
            <Divider />
            <ListItem className={styles.detailContentWrap}>
              <ListItemAvatar className={styles.detailContentLabelContainer}>
                <Box component="img" className={styles.detailIcon} src="/icons/user/ID.svg" />
                <Typography variant="body2" ml="0.8rem" fontFamily="mabry-bold">
                  ID
                </Typography>
              </ListItemAvatar>
              <Typography variant="body2">
                {DetailLoading ? <Skeleton sx={{ width: '8rem' }} /> : userObject?.id}
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
                {DetailLoading ? <Skeleton sx={{ width: '8rem' }} /> : userObject?.name}
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
              <Tooltip title={userObject?.email || '-'} placement="top">
                <Typography variant="body2" className={styles.emailContent}>
                  {DetailLoading ? <Skeleton sx={{ width: '8rem' }} /> : userObject?.email || '-'}
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
                {DetailLoading ? <Skeleton sx={{ width: '8rem' }} /> : userObject.phone || '-'}
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
              <Tooltip title={userObject.location || '-'} placement="top">
                <Box className={styles.emailContent}>
                  <Typography variant="body2">
                    {DetailLoading ? <Skeleton sx={{ width: '8rem' }} /> : userObject.location || '-'}
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
              {DetailLoading ? (
                <Skeleton sx={{ width: '8rem' }} />
              ) : (
                <Chip
                  avatar={<Box component="img" src="/icons/user/created-at.svg" />}
                  label={datetime(userObject.created_at || '-')}
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
              {DetailLoading ? (
                <Skeleton sx={{ width: '8rem' }} />
              ) : (
                <Chip
                  avatar={<Box component="img" src="/icons/user/updated-at.svg" />}
                  label={datetime(userObject.updated_at || '-')}
                  variant="outlined"
                  size="small"
                />
              )}
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default User;

User.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
