import type { NextPageWithLayout } from '../../_app';
import Layout from 'components/layout';
import * as React from 'react';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useRouter } from 'next/router';
import Information from 'components/clusterInformation';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Grid,
  Link as RouterLink,
  Skeleton,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  DeleteCluster,
  DeleteSeedPeerID,
  GetSchedulerID,
  DeleteSchedulerID,
  GetSeedPeerID,
  getInformation,
} from 'lib/api';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import { LoadingButton } from '@mui/lab';
import styles from './index.module.scss';

const Cluster: NextPageWithLayout = () => {
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [openDelet, setOpenDelet] = useState(false);
  const [openDeletScheduler, setOpenDeletScheduler] = useState(false);
  const [openDeletSeedPeers, setOpenDeletSeedPeers] = useState(false);
  const [InformationList, setInformationList] = useState({ Name: '' });
  const [deleteLoadingButton, setDeleteLoadingButton] = useState(false);
  const [schedulerSelectedRow, setSchedulerSelectedRow] = useState(null);
  const [schedulerSelectedID, setSchedulerSelectedID] = useState('');
  const [seedPeersSelectedRow, setSeedPeersSelectedRow] = useState(null);
  const [seedPeersSelectedID, setSeedPeersSelectedID] = useState(null);
  const [schedulerList, setSchedlerList] = useState([
    {
      id: '',
      host_name: '',
      idc: '',
      location: '',
      ip: '',
      port: '',
      state: '',
      features: [''],
    },
  ]);
  const [seedPeerList, setSeedPeerList] = useState([
    {
      id: '',
      host_name: '',
      download_port: '',
      object_storage_port: '',
      ip: '',
      port: '',
      state: '',
      type: '',
    },
  ]);
  const router = useRouter();
  const { pathname, asPath, query } = router;
  const routerName = pathname.split('/')[1];

  const theme = createTheme({
    palette: {
      secondary: {
        contrastText: '#fff',
        main: '#239b56',
      },
    },
  });

  const getClustersList = (id: any) => {
    GetSchedulerID(id).then(async (response) => {
      if (response.status == 200) {
        setSchedlerList(await response.json());
      } else {
        setErrorMessage(true);
        setErrorMessageText(response.statusText);
      }
    });
  };

  const GetSeedPeerList = (id: any) => {
    GetSeedPeerID(id).then(async (response) => {
      if (response.status == 200) {
        setSeedPeerList(await response.json());
      } else {
        setErrorMessage(true);
        setErrorMessageText(response.statusText);
      }
    });
  };
  useEffect(() => {
    setIsLoading(true);

    if (query.postid) {
      getInformation(query.postid).then(async (response) => {
        if (response.status == 200) {
          setInformationList(await response.json());
        } else {
          setErrorMessage(true);
          setErrorMessageText(response.statusText);
        }
      });

      getClustersList(query.postid);
      GetSeedPeerList(query.postid);
    }

    setIsLoading(false);
  }, [query.postid]);

  const handleClose = (_event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorMessage(false);
    setSuccessMessage(false);
  };

  const handleDelete = () => {
    setOpenDelet(false);
    setOpenDeletScheduler(false);
    setSchedulerSelectedRow(null);

    setOpenDeletSeedPeers(false);
    setSeedPeersSelectedRow(null);
  };

  const handledelete = () => {
    setDeleteLoadingButton(true);

    DeleteCluster(query.postid).then((response) => {
      if (response.status === 200) {
        setDeleteLoadingButton(false);
        setSuccessMessage(true);
        setOpenDelet(false);
        router.push('/clusters');
      } else {
        setDeleteLoadingButton(false);
        setErrorMessage(true);
      }
    });
  };

  const openHandleScheduler = async (row: any) => {
    setSchedulerSelectedRow(row);
    setSchedulerSelectedID(row.id);
    setOpenDeletScheduler(true);
  };

  const handledeleteScheduler = async () => {
    setDeleteLoadingButton(true);

    await DeleteSchedulerID(schedulerSelectedID).then((response) => {
      if (response.status === 200) {
        setSuccessMessage(true);
        setOpenDeletScheduler(false);
        setDeleteLoadingButton(false);
        if (query.postid) {
          getClustersList(query.postid);
        }
      } else {
        setErrorMessage(true);
        setErrorMessageText(response.statusText);
        setDeleteLoadingButton(false);
      }
    });
  };

  const openHandleSeedPeers = async (row: any) => {
    setSeedPeersSelectedRow(row);
    setSeedPeersSelectedID(row.id);
    setOpenDeletSeedPeers(true);
  };

  const handledeleteSeedPeers = async () => {
    setDeleteLoadingButton(true);

    await DeleteSeedPeerID(seedPeersSelectedID).then((response) => {
      if (response.status === 200) {
        setSuccessMessage(true);
        setOpenDeletSeedPeers(false);
        setDeleteLoadingButton(false);
        if (query.postid) {
          GetSeedPeerList(query.postid);
        }
      } else {
        setErrorMessage(true);
        setErrorMessageText(response.statusText);
        setDeleteLoadingButton(false);
      }
    });
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
      <Breadcrumbs aria-label="breadcrumb">
        <RouterLink underline="hover" component={Link} color="inherit" href={`/${routerName}`}>
          {routerName}
        </RouterLink>
        <Typography color="text.primary" fontFamily="MabryPro-Bold">
          {InformationList?.Name}
        </Typography>
      </Breadcrumbs>
      <Box sx={{ mb: '1rem', mt: '1rem', display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h5" fontFamily="MabryPro-Bold">
          Cluster
        </Typography>
        <ThemeProvider theme={theme}>
          <Box>
            <Button
              onClick={() => {
                router.push(`/clusters/${query.postid}/edit`);
              }}
              size="small"
              variant="contained"
              sx={{ mr: '2rem', '&.MuiButton-root': { backgroundColor: '#1C293A', borderRadius: 0 } }}
            >
              <Box component="img" className={styles.updateClusterIcon} src="/favicon/userIcon/Edit.svg" />
              Update Cluster
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                setOpenDelet(true);
              }}
              sx={{ '&.MuiButton-root': { backgroundColor: '#1C293A', borderRadius: 0 } }}
            >
              <DeleteIcon fontSize="small" sx={{ mr: '0.4rem' }} />
              Delete Cluster
            </Button>
          </Box>
        </ThemeProvider>
        <Dialog
          open={openDelet}
          onClose={handleDelete}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box component="img" className={styles.deleteClusterIcon} src="/favicon/clusterIcon/clusterDelete.svg" />
              <Typography fontFamily="MabryPro-Bold" pt="1rem">
                Are you sure you want to delet this Cluster?
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ display: 'flex', justifyContent: 'space-evenly', pb: '1.2rem' }}>
            <LoadingButton
              loading={deleteLoadingButton}
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
              onClick={handleDelete}
            >
              Cancel
            </LoadingButton>
            <LoadingButton
              loading={deleteLoadingButton}
              endIcon={<DeleteIcon />}
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
              onClick={handledelete}
            >
              Delete
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Box>
      <Information InformationList={InformationList} isLoading={isLoading} />
      <Typography variant="subtitle1" gutterBottom fontFamily="MabryPro-Bold" mt="2rem" mb="1rem">
        Scheduler Cluster
      </Typography>
      <Paper variant="outlined">
        <Table sx={{ minWidth: 650 }} aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="MabryPro-Bold">
                  ID
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="MabryPro-Bold">
                  Hostname
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="MabryPro-Bold">
                  IP
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="MabryPro-Bold">
                  Port
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="MabryPro-Bold">
                  IDC
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
                  Features
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
            {schedulerList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  -
                </TableCell>
              </TableRow>
            ) : (
              <>
                {Array.isArray(schedulerList) &&
                  schedulerList.map((item: any) => {
                    return (
                      <TableRow
                        key={item?.id}
                        selected={schedulerSelectedRow === item}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell align="center">{isLoading ? <Skeleton /> : item?.id}</TableCell>
                        <TableCell align="center">
                          {isLoading ? (
                            <Skeleton />
                          ) : (
                            <RouterLink
                              component={Link}
                              href={`${asPath}/schedulers/${item?.id}`}
                              underline="hover"
                              sx={{ color: '#2E8F79' }}
                            >
                              {item?.host_name}
                            </RouterLink>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {isLoading ? (
                            <Skeleton />
                          ) : (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
                              <Box
                                component="img"
                                className={styles.clusterIPIcon}
                                src="/favicon/clusterIcon/clusterIP.svg"
                              />
                              {item?.ip}
                            </Box>
                          )}
                        </TableCell>
                        <TableCell align="center">{isLoading ? <Skeleton /> : item?.port}</TableCell>
                        <TableCell align="center">{isLoading ? <Skeleton /> : item?.idc || '-'}</TableCell>
                        <TableCell align="center">{isLoading ? <Skeleton /> : item?.location || '-'}</TableCell>
                        <TableCell align="center">
                          {isLoading ? (
                            <Skeleton />
                          ) : (
                            <Chip
                              label={`${item?.state.charAt(0).toUpperCase()}${item?.state.slice(1)}`}
                              size="small"
                              variant="outlined"
                              sx={{
                                borderRadius: '0%',
                                backgroundColor: item?.state === 'active' ? '#2E8F79' : '#1C293A',
                                color: item?.state === 'active' ? '#FFFFFF' : '#FFFFFF',
                                borderColor: item?.state === 'active' ? '#2E8F79' : '#1C293A',
                                fontWeight: 'bold',
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {isLoading ? (
                            <Skeleton />
                          ) : (
                            <>
                              {Array.isArray(item.features) &&
                                item.features.map((item: string, id: any) => (
                                  <Chip
                                    key={id}
                                    label={`${item.charAt(0).toUpperCase()}${item.slice(1)}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                      borderRadius: '0%',
                                      background: '#1C293A',
                                      color: '#FFFFFF',
                                      mr: '0.4rem',
                                      borderColor: '#1C293A',
                                      fontWeight: 'bold',
                                    }}
                                  />
                                ))}
                            </>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            onClick={() => {
                              openHandleScheduler(item);
                            }}
                            size="small"
                            variant="contained"
                            sx={{
                              '&.MuiButton-root': { backgroundColor: '#1C293A', borderRadius: 0, color: '#fff' },
                            }}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </>
            )}
          </TableBody>
        </Table>
        <Dialog
          open={openDeletScheduler}
          onClose={handleDelete}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box component="img" className={styles.deleteClusterIcon} src="/favicon/clusterIcon/clusterDelete.svg" />
              <Typography fontFamily="MabryPro-Bold" pt="1rem">
                Are you sure you want to delet this Scheduler Cluster?
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ display: 'flex', justifyContent: 'space-evenly', pb: '1.2rem' }}>
            <LoadingButton
              loading={deleteLoadingButton}
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
              onClick={() => {
                setOpenDeletScheduler(false);
                setSchedulerSelectedRow(null);
              }}
            >
              Cancel
            </LoadingButton>
            <LoadingButton
              loading={deleteLoadingButton}
              endIcon={<DeleteIcon />}
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
              onClick={handledeleteScheduler}
            >
              Delete
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Paper>
      <Typography variant="subtitle1" gutterBottom fontFamily="MabryPro-Bold" mt="2rem" mb="1rem">
        Seed Peer Cluster
      </Typography>
      <Paper variant="outlined">
        <Table sx={{ minWidth: 650 }} aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="MabryPro-Bold">
                  ID
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="MabryPro-Bold">
                  Hostname
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="MabryPro-Bold">
                  IP
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="MabryPro-Bold">
                  Port
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="MabryPro-Bold">
                  Download Port
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="MabryPro-Bold">
                  Object Storage Port
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle1" fontFamily="MabryPro-Bold">
                  Type
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
            {seedPeerList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  -
                </TableCell>
              </TableRow>
            ) : (
              <>
                {Array.isArray(seedPeerList) &&
                  seedPeerList.map((item: any) => (
                    <TableRow
                      key={item?.id}
                      selected={seedPeersSelectedRow === item}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell align="center">{isLoading ? <Skeleton /> : item?.id}</TableCell>
                      <TableCell align="center">
                        {isLoading ? (
                          <Skeleton />
                        ) : (
                          <RouterLink
                            component={Link}
                            href={`${asPath}/seed-peers/${item?.id}`}
                            underline="hover"
                            sx={{ color: '#2E8F79' }}
                          >
                            {item?.host_name}
                          </RouterLink>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {isLoading ? (
                          <Skeleton />
                        ) : (
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
                            <Box
                              component="img"
                              className={styles.clusterIPIcon}
                              src="/favicon/clusterIcon/clusterIP.svg"
                            />
                            {item?.ip}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell align="center">{isLoading ? <Skeleton /> : item?.port}</TableCell>
                      <TableCell align="center">{isLoading ? <Skeleton /> : item?.download_port}</TableCell>
                      <TableCell align="center">
                        {isLoading ? <Skeleton /> : item?.object_storage_port === 0 ? '-' : item?.object_storage_port}
                      </TableCell>
                      <TableCell align="center">
                        {isLoading ? <Skeleton /> : `${item?.type?.charAt(0).toUpperCase()}${item?.type?.slice(1)}`}
                      </TableCell>
                      <TableCell align="center">
                        {isLoading ? (
                          <Skeleton />
                        ) : (
                          <Chip
                            label={`${item?.state.charAt(0).toUpperCase()}${item?.state.slice(1)}`}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderRadius: '0%',
                              backgroundColor: item?.state === 'active' ? '#2E8F79' : '#1C293A',
                              color: item?.state === 'active' ? '#FFFFFF' : '#FFFFFF',
                              borderColor: item?.state === 'active' ? '#2E8F79' : '#1C293A',
                              fontWeight: 'bold',
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          onClick={() => {
                            openHandleSeedPeers(item);
                          }}
                          size="small"
                          variant="contained"
                          sx={{
                            '&.MuiButton-root': { backgroundColor: '#1C293A', borderRadius: 0, color: '#fff' },
                          }}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </>
            )}
          </TableBody>
        </Table>
        <Dialog
          open={openDeletSeedPeers}
          onClose={handleDelete}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box component="img" className={styles.deleteClusterIcon} src="/favicon/clusterIcon/clusterDelete.svg" />
              <Typography fontFamily="MabryPro-Bold" pt="1rem">
                Are you sure you want to delet this Seed Peer Cluster?
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ display: 'flex', justifyContent: 'space-evenly', pb: '1.2rem' }}>
            <LoadingButton
              loading={deleteLoadingButton}
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
              onClick={() => {
                setOpenDeletSeedPeers(false);
                setSeedPeersSelectedRow(null);
              }}
            >
              Cancel
            </LoadingButton>
            <LoadingButton
              loading={deleteLoadingButton}
              endIcon={<DeleteIcon />}
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
              onClick={handledeleteSeedPeers}
            >
              Delete
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Paper>
      <Grid sx={{ height: 2 }}> </Grid>
    </Box>
  );
};

export default Cluster;
Cluster.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};
