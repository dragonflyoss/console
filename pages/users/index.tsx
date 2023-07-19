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
import { useEffect, useState } from 'react';
import React from 'react';
import { DeleteGuest, DeleteRoot, GetuserRoles, Getusers, GetusersInfo, PutGuest, PutRoot } from 'lib/api';
import { makeStyles } from '@mui/styles';
import { dateTimeFormat } from 'components/dataTime';
import { LoadingButton } from '@mui/lab';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import styles from './users.module.scss';

const useStyles = makeStyles((theme: any) => ({
  tableRow: {
    '&$selected': {
      backgroundColor: '#1C293A',
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
    color: '#1C293A!important',
    backgroundColor: '#fff!important',
  },
  selectedButton: {
    color: '#1C293A!important',
    backgroundColor: '#fff!important',
  },
}));

const User: NextPageWithLayout = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [DetailLoading, setDetailLoading] = useState(true);
  const [detailopen, setDetailOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [loadingButton, setLoadingButton] = useState(false);
  const [usersList, setUsersList] = useState([{ avatar: '', id: '', email: '', name: '', state: '', location: '' }]);
  const [userList, setUserList] = useState({
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

    Getusers().then(async (response) => {
      if (response.status === 200) {
        setUsersList(await response.json());
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

    await GetusersInfo(row.id).then(async (response) => {
      if (response.status === 200) {
        setUserList(await response.json());
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
    setSelected(row.id);

    await GetuserRoles(row.id).then(async (response) => {
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
      const deleteGuest = DeleteGuest(selected);
      const putRoot = PutRoot(selected);

      Promise.all([deleteGuest, putRoot]).then((res) => {
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
      const deleteRoot = await DeleteRoot(selected);
      const putGuest = await PutGuest(selected);

      Promise.all([deleteRoot, putGuest]).then((res) => {
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
        <Typography variant="h5" color="text.primary" fontFamily="MabryPro-Bold">
          User
        </Typography>
      </Breadcrumbs>
      <Paper variant="outlined">
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="center"></TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="MabryPro-Bold">
                  Name
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="MabryPro-Bold">
                  Email
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="MabryPro-Bold">
                  Location
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="MabryPro-Bold">
                  State
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="MabryPro-Bold">
                  Operation
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(usersList) &&
              usersList.map((item) => (
                <TableRow
                  sx={{ '&.MuiTableRow-root': { ':hover': { background: selectedRow === item ? '#1C293A' : '' } } }}
                  key={item?.name}
                  selected={selectedRow === item}
                  className={`${classes.tableRow} ${selected === item ? classes.selected : ''}`}
                  classes={{ selected: classes.selected }}
                >
                  <TableCell align="center">
                    {isLoading ? (
                      <Skeleton />
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Avatar
                          alt="Remy Sharp"
                          sx={{ '&.MuiAvatar-root': { background: '#1C293A', color: '#fff' } }}
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
                          backgroundColor: item?.state === 'enable' ? '#2E8F79' : '#1C293A',
                          color: item?.state === 'enable' ? '#FFFFFF' : '#FFFFFF',
                          borderColor: item?.state === 'enable' ? '#2E8F79' : '#1C293A',
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
                            backgroundColor: '#1C293A',
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
                              backgroundColor: '#1C293A',
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
                            '&.MuiButton-root': { backgroundColor: '#1C293A', borderRadius: 0, color: '#fff' },
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
            <Box component="img" className={styles.roleIcon} src="/favicon/userIcon/role.svg" />
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
                          color: '#1C293A',
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
                          color: '#1C293A',
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
            endIcon={<CancelIcon sx={{ color: '#1C293A' }} />}
            size="small"
            variant="outlined"
            loadingPosition="end"
            sx={{
              '&.MuiLoadingButton-root': {
                color: '#000000',
                borderRadius: 0,
                borderColor: '#979797',
              },
              ':hover': { backgroundColor: '#F4F3F6', borderColor: '#F4F3F6' },
              '&.MuiLoadingButton-loading': {
                backgroundColor: '#DEDEDE',
                color: '#000000',
                borderColor: '#DEDEDE',
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
                backgroundColor: '#1C293A',
                borderRadius: 0,
                color: '#FFFFFF',
                borderColor: '#1C293A',
              },
              ':hover': { backgroundColor: '#555555', borderColor: '#555555' },
              '&.MuiLoadingButton-loading': {
                backgroundColor: '#DEDEDE',
                color: '#000000',
                borderColor: '#DEDEDE',
              },
              width: '8rem',
            }}
            onClick={handleSubmit}
          >
            Save
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <Drawer anchor="right" open={detailopen} onClose={closure} className={styles.detailContainer}>
        <Box role="presentation" sx={{ width: 350 }}>
          <List>
            <ListSubheader component="div" color="inherit" className={styles.detailTitle}>
              <Typography variant="h6" fontFamily="MabryPro-Bold">
                User Detail
              </Typography>
              <IconButton onClick={closureDeatail}>
                <ClearOutlinedIcon sx={{ color: '#1C293A' }} />
              </IconButton>
            </ListSubheader>
            <Divider />
            <ListItem className={styles.detailContentWrap}>
              <ListItemAvatar className={styles.detailContentLabelContainer}>
                <Box component="img" className={styles.detailIcon} src="/favicon/userIcon/ID.svg" />
                <Typography variant="body2" ml="0.8rem" fontFamily="MabryPro-Bold">
                  ID
                </Typography>
              </ListItemAvatar>
              <Typography variant="body2">
                {DetailLoading ? <Skeleton sx={{ width: '8rem' }} /> : userList?.id}
              </Typography>
            </ListItem>
            <Divider />
            <ListItem className={styles.detailContentWrap}>
              <ListItemAvatar className={styles.detailContentLabelContainer}>
                <Box component="img" className={styles.detailIcon} src="/favicon/userIcon/name.svg" />
                <Typography variant="body2" ml="0.8rem" fontFamily="MabryPro-Bold">
                  Name
                </Typography>
              </ListItemAvatar>
              <Typography variant="body2">
                {DetailLoading ? <Skeleton sx={{ width: '8rem' }} /> : userList?.name}
              </Typography>
            </ListItem>
            <Divider />
            <ListItem className={styles.detailContentWrap}>
              <ListItemAvatar className={styles.detailContentLabelContainer}>
                <Box component="img" className={styles.detailIcon} src="/favicon/userIcon/email.svg" />
                <Typography variant="body2" ml="0.8rem" fontFamily="MabryPro-Bold">
                  Email
                </Typography>
              </ListItemAvatar>
              <Tooltip title={userList?.email || '-'} placement="top">
                <Typography variant="body2" className={styles.EmailContent}>
                  {DetailLoading ? <Skeleton sx={{ width: '8rem' }} /> : userList?.email || '-'}
                </Typography>
              </Tooltip>
            </ListItem>
            <Divider />
            <ListItem className={styles.detailContentWrap}>
              <ListItemAvatar className={styles.detailContentLabelContainer}>
                <Box component="img" className={styles.detailIcon} src="/favicon/userIcon/phone.svg" />
                <Typography variant="body2" ml="0.8rem" fontFamily="MabryPro-Bold">
                  Phone
                </Typography>
              </ListItemAvatar>
              <Typography variant="body2">
                {DetailLoading ? <Skeleton sx={{ width: '8rem' }} /> : userList.phone || '-'}
              </Typography>
            </ListItem>
            <Divider />
            <ListItem className={styles.detailContentWrap}>
              <ListItemAvatar className={styles.detailContentLabelContainer}>
                <Box component="img" className={styles.detailIcon} src="/favicon/userIcon/location.svg" />
                <Typography variant="body2" ml="0.8rem" fontFamily="MabryPro-Bold">
                  Location
                </Typography>
              </ListItemAvatar>
              <Tooltip title={userList.location || '-'} placement="top">
                <Box className={styles.LocationTextContainer}>
                  <Typography variant="body2">
                    {DetailLoading ? <Skeleton sx={{ width: '8rem' }} /> : userList.location || '-'}
                  </Typography>
                </Box>
              </Tooltip>
            </ListItem>
            <Divider />
            <ListItem className={styles.detailContentWrap}>
              <ListItemAvatar className={styles.detailContentLabelContainer}>
                <Box component="img" className={styles.detailIcon} src="/favicon/userIcon/created_at.svg" />
                <Typography variant="body2" ml="0.8rem" fontFamily="MabryPro-Bold">
                  Created At
                </Typography>
              </ListItemAvatar>
              {DetailLoading ? (
                <Skeleton sx={{ width: '8rem' }} />
              ) : (
                <Chip
                  avatar={<Box component="img" src="/favicon/userIcon/created_at.svg" />}
                  label={dateTimeFormat(userList.created_at || '-')}
                  variant="outlined"
                  size="small"
                />
              )}
            </ListItem>
            <Divider />
            <ListItem className={styles.detailContentWrap}>
              <ListItemAvatar className={styles.detailContentLabelContainer}>
                <Box component="img" className={styles.detailIcon} src="/favicon/userIcon/updated_at.svg" />
                <Typography variant="body2" ml="0.8rem" fontFamily="MabryPro-Bold">
                  Updated At
                </Typography>
              </ListItemAvatar>
              {DetailLoading ? (
                <Skeleton sx={{ width: '8rem' }} />
              ) : (
                <Chip
                  avatar={<Box component="img" src="/favicon/userIcon/updated_at.svg" />}
                  label={dateTimeFormat(userList.updated_at || '-')}
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
User.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};
