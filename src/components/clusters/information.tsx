import {
  Box,
  Tooltip as MuiTooltip,
  Typography,
  Paper,
  DialogTitle,
  DialogContent,
  IconButton,
  Skeleton,
  Snackbar,
  Button,
  Alert,
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Card from '../card';
import HelpIcon from '@mui/icons-material/Help';
import { useContext, useState } from 'react';
import { useCopyToClipboard } from 'react-use';
import { MyContext } from './show';
import { ReactComponent as InformationCluster } from '../../assets/images/cluster/information-cluster.svg';
import { ReactComponent as Done } from '../../assets/images/tokens/done.svg';
import { ReactComponent as Copy } from '../../assets/images/tokens/copy.svg';
import { ReactComponent as Edit } from '../../assets/images/user/edit.svg';
import { ReactComponent as Location } from '../../assets/images/cluster/location.svg';
import { ReactComponent as IDC } from '../../assets/images/cluster/idc.svg';
import { ReactComponent as Total } from '../../assets/images/cluster/total.svg';
import { ReactComponent as CIDRs } from '../../assets/images/cluster/cidrs.svg';
import { ReactComponent as Hostnames } from '../../assets/images/cluster/hostnames.svg';
import { ReactComponent as Delete } from '../../assets/images/cluster/delete.svg';
import { CancelLoadingButton, DeleteLoadingButton } from '../loading-button';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteCluster } from '../../lib/api';
import DeleteIcon from '@mui/icons-material/Delete';
import { getDatetime } from '../../lib/utils';
import styles from './information.module.css';
import ErrorHandler from '../error-handler';

export default function Information() {
  const [openCIDRs, setOpenCIDRs] = useState(false);
  const [openIDC, setOpenIDC] = useState(false);
  const [openHostnames, setOpenHostnames] = useState(false);
  const [showSchedulerClusterIDCopyIcon, setShowSchedulerClusterIDCopyIcon] = useState(false);
  const [showSeedPeerClusterIDCopyIcon, setShowSeedPeerClusterIDCopyIcon] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [deleteLoadingButton, setDeleteLoadingButton] = useState(false);
  const [openDeleteCluster, setOpenDeleteCluster] = useState(false);

  const params = useParams();
  const navigate = useNavigate();
  const [, setCopyToClipboard] = useCopyToClipboard();

  const copyClusterID = (title: string, clusterID: number) => {
    if (title === 'schedulerClusterID') {
      setCopyToClipboard(String(clusterID));
      setShowSchedulerClusterIDCopyIcon(true);

      setTimeout(() => {
        setShowSchedulerClusterIDCopyIcon(false);
      }, 1000);
    } else if (title === 'seedPeerClusterID') {
      setCopyToClipboard(String(clusterID));
      setShowSeedPeerClusterIDCopyIcon(true);

      setTimeout(() => {
        setShowSeedPeerClusterIDCopyIcon(false);
      }, 1000);
    }
  };

  const { cluster, isLoading } = useContext(MyContext);

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorMessage(false);
    setSuccessMessage(false);
  };

  const handleDeleteClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenDeleteCluster(false);
  };

  const handleDeleteCluster = async () => {
    setDeleteLoadingButton(true);

    try {
      if (typeof params.id === 'string') {
        await deleteCluster(params.id);
        setDeleteLoadingButton(false);
        setSuccessMessage(true);
        setOpenDeleteCluster(false);
        navigate('/clusters');
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(true);
        setErrorMessageText(error.message);
        setDeleteLoadingButton(false);
      }
    }
  };

  return (
    <Box>
      <Snackbar
        open={successMessage}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert id="successMessage" onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          Submission successful!
        </Alert>
      </Snackbar>
      <ErrorHandler errorMessage={errorMessage} errorMessageText={errorMessageText} onClose={handleClose} />
      <Dialog
        open={openDeleteCluster}
        onClose={handleDeleteClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Delete className={styles.deleteClusterIcon} />
            <Typography pt="1rem">Are you sure you want to delet this cluster?</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: '1.2rem' }}>
            <CancelLoadingButton id="cancelDeleteCluster" loading={deleteLoadingButton} onClick={handleDeleteClose} />
            <DeleteLoadingButton
              loading={deleteLoadingButton}
              endIcon={<DeleteIcon />}
              id="deleteCluster"
              onClick={handleDeleteCluster}
              text="Delete"
            />
          </Box>
        </DialogContent>
      </Dialog>
      <Box className={styles.container}>
        <Typography variant="h6" fontFamily="mabry-bold">
          Cluster
        </Typography>
        <Box>
          <Button
            id="update"
            onClick={() => {
              navigate(`/clusters/${params.id}/edit`);
            }}
            size="small"
            variant="contained"
            className={styles.button}
          >
            <Edit className={styles.updateClusterIcon} />
            Update
          </Button>
          <Button
            variant="contained"
            size="small"
            id="delete-cluster"
            onClick={() => {
              setOpenDeleteCluster(true);
            }}
            className={styles.button}
          >
            <DeleteIcon fontSize="small" sx={{ mr: '0.4rem' }} />
            Delete
          </Button>
        </Box>
      </Box>
      <Box>
        <Card className={styles.informationWrapper}>
          <Box className={styles.classNameWrapper}>
            <InformationCluster className={styles.clusterIcon} />
            <Box>
              <Typography id="name" variant="h6" component="div" className={styles.name}>
                {isLoading ? <Skeleton className={styles.loading} /> : cluster.name || '-'}
              </Typography>
              <Typography
                id="description"
                variant="caption"
                component="div"
                color="var(--palette-text-palette-text-secondary)"
              >
                {isLoading ? (
                  <Skeleton data-testid="cluster-loading" className={styles.loading} />
                ) : (
                  cluster?.bio || '-'
                )}
              </Typography>
            </Box>
          </Box>
          <Box className={styles.clusterContainer}>
            <Box className={styles.clusterWrap}>
              <Box className={styles.clusterTitle}>
                <Typography variant="body2" component="div" className={styles.configLable}>
                  Set as default cluster
                </Typography>
                <MuiTooltip
                  title="When peer does not find a matching cluster based on scopes, the default cluster will be used."
                  placement="top"
                >
                  <HelpIcon className={styles.descriptionIcon} />
                </MuiTooltip>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: '0.8rem',
                    height: '0.8rem',
                    backgroundColor: cluster.is_default
                      ? 'var(--palette-description-color)'
                      : 'var(--palette-dark-300Channel)',
                    borderRadius: '0.2rem',
                    mr: '0.5rem',
                  }}
                />
                <Typography id="default" variant="body2" component="div" className={styles.clusterContent}>
                  {isLoading ? (
                    <Skeleton data-testid="cluster-loading" className={styles.loading} />
                  ) : cluster.is_default ? (
                    'Yes'
                  ) : (
                    'No'
                  )}
                </Typography>
              </Box>
            </Box>
            <Box className={styles.clusterWrap}>
              <Box className={styles.clusterTitle}>
                <Typography variant="body2" component="div" className={styles.configLable}>
                  Scheduler cluster ID
                </Typography>
                <MuiTooltip
                  title="When the scheduler is deployed, the schedulerClusterID must be filled with this scheduler cluster ID in scheduler configuration. In this way, the scheduler will become the scheduling service of this cluster."
                  placement="top"
                >
                  <HelpIcon className={styles.descriptionIcon} />
                </MuiTooltip>
              </Box>
              <Box className={styles.schedulerClusterID}>
                <Typography
                  id="scheduler-cluster-id"
                  variant="body2"
                  component="div"
                  mr="0.5rem"
                  className={styles.clusterContent}
                >
                  {isLoading ? (
                    <Skeleton data-testid="cluster-loading" className={styles.loading} />
                  ) : (
                    cluster?.scheduler_cluster_id || 0
                  )}
                </Typography>
                {!isLoading && (
                  <IconButton
                    aria-label="copy"
                    sx={{
                      width: '1.2rem',
                      height: '1.2rem',
                      p: 0,
                    }}
                    onClick={() => {
                      copyClusterID('schedulerClusterID', cluster?.scheduler_cluster_id || 0);
                    }}
                    id="copy-scheduler-cluster-id"
                  >
                    {showSchedulerClusterIDCopyIcon ? (
                      <MuiTooltip
                        placement="top"
                        PopperProps={{
                          disablePortal: true,
                        }}
                        open={showSchedulerClusterIDCopyIcon}
                        disableFocusListener
                        disableHoverListener
                        disableTouchListener
                        title="copied!"
                        id="schedulerClusterIDTooltip"
                      >
                        <Done id="schedulerClusterDoneIcon" className={styles.copyIcon} />
                      </MuiTooltip>
                    ) : (
                      <Copy id="schedulerClusterIDCopyIcon" className={styles.copyIcon} />
                    )}
                  </IconButton>
                )}
              </Box>
            </Box>
            <Box className={styles.clusterWrap}>
              <Box className={styles.clusterTitle}>
                <Typography variant="body2" component="div" className={styles.configLable}>
                  Seed peer cluster ID
                </Typography>
                <MuiTooltip
                  title="When the seed peer is deployed, the clusterID must be filled with this seed peer cluster ID in scheduler configuration. In this way, the seed peer will become the seed peer service of this cluster."
                  placement="top"
                >
                  <HelpIcon className={styles.descriptionIcon} />
                </MuiTooltip>
              </Box>
              <Box className={styles.schedulerClusterID}>
                <Typography
                  id="seed-peer-cluster-id"
                  variant="body2"
                  component="div"
                  mr="0.5rem"
                  className={styles.clusterContent}
                >
                  {isLoading ? (
                    <Skeleton data-testid="cluster-loading" className={styles.loading} />
                  ) : (
                    cluster?.seed_peer_cluster_id || 0
                  )}
                </Typography>
                {!isLoading && (
                  <IconButton
                    aria-label="copy"
                    id="copy-seed-peer-cluster-id"
                    sx={{
                      width: '1.2rem',
                      height: '1.2rem',
                      p: 0,
                    }}
                    onClick={() => {
                      copyClusterID('seedPeerClusterID', cluster?.seed_peer_cluster_id || 0);
                    }}
                  >
                    {showSeedPeerClusterIDCopyIcon ? (
                      <MuiTooltip
                        placement="top"
                        PopperProps={{
                          disablePortal: true,
                        }}
                        open={showSeedPeerClusterIDCopyIcon}
                        disableFocusListener
                        disableHoverListener
                        disableTouchListener
                        title="copied!"
                        id="seedPeerClusterIDTooltip"
                      >
                        <Done id="seedPeerClusterDoneIcon" className={styles.copyIcon} />
                      </MuiTooltip>
                    ) : (
                      <Copy id="seedPeerClusterIDCopyIcon" className={styles.copyIcon} />
                    )}
                  </IconButton>
                )}
              </Box>
            </Box>
            <Box className={styles.clusterWrap}>
              <Box className={styles.clusterTitle}>
                <Typography variant="body2" component="div" className={styles.configLable}>
                  Create At
                </Typography>
                <MuiTooltip title="Cluster name." placement="top">
                  <HelpIcon className={styles.descriptionIcon} />
                </MuiTooltip>
              </Box>
              <Typography id="name" variant="body2" component="div" className={styles.clusterContent}>
                {isLoading ? <Skeleton className={styles.loading} /> : getDatetime(cluster.created_at)}
              </Typography>
            </Box>
          </Box>
        </Card>
        <Box className={styles.wrapper}>
          <Box className={styles.scopesWrapper}>
            <Typography variant="body1" className={styles.informationTitle}>
              Scopes
            </Typography>
            <MuiTooltip
              title="The cluster needs to serve the scope. It wil provide scheduler services and seed peer services to
                  peers in the scope."
              placement="top"
            >
              <HelpIcon className={styles.descriptionIcon} />
            </MuiTooltip>
          </Box>
          <Box className={styles.configTitle}>
            <Typography variant="body1" className={styles.informationTitle}>
              Config
            </Typography>
            <MuiTooltip title="The configuration for P2P downloads." placement="top">
              <HelpIcon className={styles.descriptionIcon} />
            </MuiTooltip>
          </Box>
        </Box>
        <Box className={styles.wrapper}>
          <Box className={styles.scopesContentContainer}>
            <Card className={styles.cidrsContainer}>
              <Box className={styles.scopesTitle}>
                <Box className={styles.locationTitle}>
                  <Location className={styles.scopesIcon} />
                  <Typography variant="body2" component="div" className={styles.scopesLable}>
                    Location
                  </Typography>
                  <MuiTooltip
                    title={`The cluster needs to serve all peers in the location. When the location in the peer configuration matches the location in the cluster, the peer will preferentially use the scheduler and the seed peer of the cluster. It separated by "|", for example "area|country|province|city".`}
                    placement="top"
                  >
                    <HelpIcon className={styles.descriptionIcon} />
                  </MuiTooltip>
                </Box>
              </Box>
              <Box className={styles.locationTextContainer}>
                {isLoading ? (
                  <Skeleton data-testid="cluster-loading" className={styles.loading} />
                ) : cluster.scopes?.location ? (
                  <Paper id="location" elevation={0} className={styles.cidrsContent}>
                    <MuiTooltip title={cluster?.scopes?.location || '-' || '-'} placement="top">
                      <Typography variant="body2" component="div" className={styles.cidrsText}>
                        {cluster?.scopes?.location || '-'}
                      </Typography>
                    </MuiTooltip>
                  </Paper>
                ) : (
                  <Typography id="no-location" variant="subtitle1" component="div">
                    -
                  </Typography>
                )}
              </Box>
            </Card>
            <Card className={styles.cidrsContainer}>
              <Box className={styles.scopesTitle}>
                <Box className={styles.cidrsTitle}>
                  <IDC className={styles.scopesIcon} />
                  <Typography variant="body2" component="p" className={styles.scopesLable}>
                    IDC
                  </Typography>
                  <MuiTooltip
                    title={`The cluster needs to serve all peers in the IDC. When the IDC in the peer configuration matches the IDC in the cluster, the peer will preferentially use the scheduler and the seed peer of the cluster. IDC has higher priority than location in the scopes.`}
                    placement="top"
                  >
                    <HelpIcon className={styles.descriptionIcon} />
                  </MuiTooltip>
                </Box>
                <Paper id="idc-total" elevation={0} className={styles.totalContainer}>
                  <Total className={styles.totalIcon} />
                  <Typography variant="body2" component="div" className={styles.totalText}>
                    {`Total: ${cluster?.scopes?.idc !== '' ? cluster?.scopes?.idc.split('|').length : 0}`}
                  </Typography>
                </Paper>
              </Box>
              <Box className={styles.cidrsTags}>
                {cluster?.scopes?.idc ? (
                  <>
                    <Box className={styles.cidrsWrapper}>
                      <Paper id="idc-1" elevation={0} className={styles.cidrsContent}>
                        <MuiTooltip title={cluster?.scopes?.idc.split('|')[0] || '-'} placement="top">
                          <Typography variant="body2" component="div" className={styles.cidrsText}>
                            {cluster?.scopes?.idc.split('|')[0] || '-'}
                          </Typography>
                        </MuiTooltip>
                      </Paper>
                      {cluster?.scopes?.idc.split('|').length > 1 && (
                        <Paper id="idc-2" elevation={0} className={styles.cidrsContent}>
                          <MuiTooltip title={cluster?.scopes?.idc.split('|')[1] || ''} placement="top">
                            <Typography variant="body2" component="div" className={styles.cidrsText}>
                              {cluster?.scopes?.idc.split('|')[1] || ''}
                            </Typography>
                          </MuiTooltip>
                        </Paper>
                      )}
                      {cluster?.scopes?.idc.split('|').length > 2 && (
                        <Paper id="idc-3" elevation={0} className={styles.cidrsContent}>
                          <MuiTooltip title={cluster?.scopes?.idc.split('|')[2] || ''} placement="top">
                            <Typography variant="body2" component="div" className={styles.cidrsText}>
                              {cluster?.scopes?.idc.split('|')[2] || ''}
                            </Typography>
                          </MuiTooltip>
                        </Paper>
                      )}
                      {cluster?.scopes?.idc.split('|').length > 3 && (
                        <Paper id="idc-4" elevation={0} className={styles.cidrsContent}>
                          <MuiTooltip title={cluster?.scopes?.idc.split('|')[3] || ''} placement="top">
                            <Typography variant="body2" component="div" className={styles.cidrsText}>
                              {cluster?.scopes?.idc.split('|')[3] || ''}
                            </Typography>
                          </MuiTooltip>
                        </Paper>
                      )}
                    </Box>
                    {cluster?.scopes?.idc.split('|').length > 2 && (
                      <IconButton
                        size="small"
                        id="idc"
                        onClick={() => {
                          setOpenIDC(true);
                        }}
                      >
                        <MoreVertIcon sx={{ color: 'var(--palette-color)' }} />
                      </IconButton>
                    )}
                  </>
                ) : (
                  <Typography id="no-idc" variant="subtitle1" component="div">
                    -
                  </Typography>
                )}
              </Box>
              <Dialog
                maxWidth="sm"
                fullWidth
                open={openIDC}
                onClose={() => {
                  setOpenIDC(false);
                }}
              >
                <DialogTitle>IDC</DialogTitle>
                <DialogContent dividers className={styles.idcDialogContainer}>
                  {cluster?.scopes?.idc.split('|').map((item: any, id: any) => (
                    <Paper key={id} elevation={0} className={styles.idcDialogContent}>
                      <IDC className={styles.cidrsIcon} />
                      <MuiTooltip title={item} placement="top">
                        <Typography variant="body2" component="div" className={styles.cidrsText} alignSelf="center">
                          {item}
                        </Typography>
                      </MuiTooltip>
                    </Paper>
                  ))}
                </DialogContent>
              </Dialog>
            </Card>
            <Card className={styles.cidrsContainer}>
              <Box className={styles.scopesTitle}>
                <Box className={styles.cidrsTitle}>
                  <CIDRs className={styles.scopesIcon} />
                  <Typography variant="body2" component="div" className={styles.scopesLable}>
                    CIDRs
                  </Typography>
                  <MuiTooltip
                    title={`The cluster needs to serve all peers in the CIDRs. The advertise IP will be reported in the peer configuration when the peer is started, and if the advertise IP is empty in the peer configuration, peer will automatically get expose IP as advertise IP. When advertise IP of the peer matches the CIDRs in cluster, the peer will preferentially use the scheduler and the seed peer of the cluster. CIDRs has higher priority than IDC in the scopes. CIDRs has higher priority than IDC in the scopes. CIDRs has priority equal to hostname in the scopes.`}
                    placement="top"
                  >
                    <HelpIcon className={styles.descriptionIcon} />
                  </MuiTooltip>
                </Box>
                <Paper id="cidrs-total" elevation={0} className={styles.totalContainer}>
                  <Total className={styles.totalIcon} />
                  <Typography variant="body2" component="div" className={styles.totalText}>
                    {`Total: ${cluster?.scopes?.cidrs?.length || 0}`}
                  </Typography>
                </Paper>
              </Box>
              {isLoading ? (
                <Skeleton data-testid="cluster-loading" sx={{ width: '10rem' }} />
              ) : (
                <Box className={styles.cidrsTags}>
                  {Array.isArray(cluster?.scopes?.cidrs) && cluster?.scopes?.cidrs?.length > 0 ? (
                    <>
                      <Box className={styles.cidrsWrapper}>
                        <Paper id="cidrs-1" elevation={0} className={styles.cidrsContent}>
                          <MuiTooltip title={cluster?.scopes?.cidrs[0] || '-'} placement="top">
                            <Typography variant="body2" className={styles.cidrsText}>
                              {cluster?.scopes?.cidrs[0] || ''}
                            </Typography>
                          </MuiTooltip>
                        </Paper>
                        {cluster?.scopes?.cidrs?.length > 1 && (
                          <Paper id="cidrs-2" elevation={0} className={styles.cidrsContent}>
                            <MuiTooltip title={cluster?.scopes?.cidrs[1] || ''} placement="top">
                              <Typography variant="body2" className={styles.cidrsText}>
                                {cluster?.scopes?.cidrs[1] || ''}
                              </Typography>
                            </MuiTooltip>
                          </Paper>
                        )}
                        {cluster?.scopes?.cidrs?.length > 2 && (
                          <Paper id="cidrs-3" elevation={0} className={styles.cidrsContent}>
                            <MuiTooltip title={cluster?.scopes?.cidrs[2] || ''} placement="top">
                              <Typography variant="body2" className={styles.cidrsText}>
                                {cluster?.scopes?.cidrs[2] || ''}
                              </Typography>
                            </MuiTooltip>
                          </Paper>
                        )}
                        {cluster?.scopes?.cidrs?.length > 3 && (
                          <Paper id="cidrs-4" elevation={0} className={styles.cidrsContent}>
                            <MuiTooltip title={cluster?.scopes?.cidrs[3] || ''} placement="top">
                              <Typography variant="body2" className={styles.cidrsText}>
                                {cluster?.scopes?.cidrs[3] || ''}
                              </Typography>
                            </MuiTooltip>
                          </Paper>
                        )}
                      </Box>
                      {cluster?.scopes?.cidrs?.length > 2 && (
                        <IconButton
                          size="small"
                          id="cidrs"
                          onClick={() => {
                            setOpenCIDRs(true);
                          }}
                        >
                          <MoreVertIcon sx={{ color: 'var(--palette-color)' }} />
                        </IconButton>
                      )}
                    </>
                  ) : (
                    <Typography id="no-cidrs" variant="subtitle1" component="div">
                      -
                    </Typography>
                  )}
                </Box>
              )}
            </Card>
            <Dialog
              maxWidth="sm"
              fullWidth
              open={openCIDRs}
              onClose={() => {
                setOpenCIDRs(false);
              }}
            >
              <DialogTitle>CIDRs</DialogTitle>
              <DialogContent dividers className={styles.cidrsDialogContainer}>
                {cluster?.scopes?.cidrs?.map((item: any, id: any) => (
                  <Paper key={id} elevation={0} className={styles.cidrsDialogContent}>
                    <CIDRs className={styles.cidrsIcon} />
                    <MuiTooltip title={item} placement="top">
                      <Typography variant="body2" component="div" className={styles.cidrsText} alignSelf="center">
                        {item}
                      </Typography>
                    </MuiTooltip>
                  </Paper>
                ))}
              </DialogContent>
            </Dialog>
            <Card className={styles.cidrsContainer}>
              <Box className={styles.scopesTitle}>
                <Box className={styles.cidrsTitle}>
                  <Hostnames className={styles.scopesIcon} />
                  <Typography variant="body2" component="div" className={styles.scopesLable}>
                    Hostnames
                  </Typography>
                  <MuiTooltip
                    title="The cluster needs to serve all peers in hostname. The input parameter is the multiple hostname regexes. The hostname will be reported in the peer configuration when the peer is started. When the hostname matches the multiple hostname regexes in the cluster, the peer will preferentially use the scheduler and the seed peer of the cluster. Hostname has higher priority than IDC in the scopes. Hostname has priority equal to CIDRs in the scopes."
                    placement="top"
                  >
                    <HelpIcon className={styles.descriptionIcon} />
                  </MuiTooltip>
                </Box>
                <Paper id="hostnames-total" elevation={0} className={styles.totalContainer}>
                  <Total className={styles.totalIcon} />
                  <Typography variant="body2" component="div" className={styles.totalText}>
                    {`Total: ${cluster?.scopes?.idc !== '' ? cluster?.scopes?.idc.split('|').length : 0}`}
                  </Typography>
                </Paper>
              </Box>
              {isLoading ? (
                <Skeleton data-testid="cluster-loading" sx={{ width: '10rem' }} />
              ) : (
                <Box className={styles.cidrsTags}>
                  {Array.isArray(cluster?.scopes?.hostnames) && cluster?.scopes?.hostnames?.length > 0 ? (
                    <>
                      <Box className={styles.cidrsWrapper}>
                        <Paper id="hostname-1" elevation={0} className={styles.cidrsContent}>
                          <MuiTooltip title={cluster?.scopes?.hostnames[0] || '-'} placement="top">
                            <Typography variant="body2" className={styles.cidrsText}>
                              {cluster?.scopes?.hostnames[0] || '-'}
                            </Typography>
                          </MuiTooltip>
                        </Paper>
                        {cluster?.scopes?.hostnames?.length > 1 && (
                          <Paper id="hostname-2" elevation={0} className={styles.cidrsContent}>
                            <MuiTooltip title={cluster?.scopes?.hostnames[1] || ''} placement="top">
                              <Typography variant="body2" className={styles.cidrsText}>
                                {cluster?.scopes?.hostnames[1] || ''}
                              </Typography>
                            </MuiTooltip>
                          </Paper>
                        )}
                        {cluster?.scopes?.hostnames?.length > 2 && (
                          <Paper id="hostname-3" elevation={0} className={styles.cidrsContent}>
                            <MuiTooltip title={cluster?.scopes?.hostnames[2] || ''} placement="top">
                              <Typography variant="body2" className={styles.cidrsText}>
                                {cluster?.scopes?.hostnames[2] || ''}
                              </Typography>
                            </MuiTooltip>
                          </Paper>
                        )}
                        {cluster?.scopes?.hostnames?.length > 3 && (
                          <Paper id="hostname-4" elevation={0} className={styles.cidrsContent}>
                            <MuiTooltip title={cluster?.scopes?.hostnames[3] || ''} placement="top">
                              <Typography variant="body2" className={styles.cidrsText}>
                                {cluster?.scopes?.hostnames[3] || ''}
                              </Typography>
                            </MuiTooltip>
                          </Paper>
                        )}
                      </Box>
                      {cluster?.scopes?.hostnames?.length > 2 && (
                        <IconButton
                          size="small"
                          id="hostnames"
                          onClick={() => {
                            setOpenHostnames(true);
                          }}
                        >
                          <MoreVertIcon sx={{ color: 'var(--palette-color)' }} />
                        </IconButton>
                      )}
                    </>
                  ) : (
                    <Typography id="no-hostnames" variant="subtitle1" component="div">
                      -
                    </Typography>
                  )}
                </Box>
              )}
            </Card>
            <Dialog
              maxWidth="sm"
              fullWidth
              open={openHostnames}
              onClose={() => {
                setOpenHostnames(false);
              }}
            >
              <DialogTitle>Hostnames</DialogTitle>
              <DialogContent dividers className={styles.cidrsDialogContainer}>
                {cluster?.scopes?.hostnames?.map((item: any, id: any) => (
                  <Paper key={id} elevation={0} className={styles.cidrsDialogContent}>
                    <Hostnames className={styles.cidrsIcon} />
                    <MuiTooltip title={item} placement="top">
                      <Typography variant="body2" component="div" className={styles.cidrsText} alignSelf="center">
                        {item}
                      </Typography>
                    </MuiTooltip>
                  </Paper>
                ))}
              </DialogContent>
            </Dialog>
          </Box>
          <Card className={styles.configListContainer}>
            <Box className={styles.configContent}>
              <Box className={styles.configContentTitle}>
                <Typography variant="body2" component="div" className={styles.configLable}>
                  Seed peer load limit
                </Typography>
                <MuiTooltip
                  title="If other peers download from the seed peer, the load of the seed peer will increase. When the load limit of the seed peer is reached, the scheduler will no longer schedule other peers to download from the seed peer until the it has the free load.	seed_peer_cluster_config.load_limit"
                  placement="top"
                >
                  <HelpIcon className={styles.descriptionIcon} />
                </MuiTooltip>
              </Box>
              {isLoading ? (
                <Box sx={{ width: '20%' }}>
                  <Skeleton data-testid="cluster-loading" />
                </Box>
              ) : (
                <Typography id="seed-peer-load-limit" className={styles.configText} variant="body2" component="div">
                  {cluster?.seed_peer_cluster_config?.load_limit || 0}
                </Typography>
              )}
            </Box>
            <Box className={styles.configContent}>
              <Box className={styles.configContentTitle}>
                <Typography variant="body2" component="div" className={styles.configLable}>
                  Peer load limit
                </Typography>
                <MuiTooltip
                  title={`If other peers download from the peer, the load of the peer will increase. When the load limit of the peer is reached, the scheduler will no longer schedule other peers to download from the peer until the it has the free load.`}
                  placement="top"
                >
                  <HelpIcon className={styles.descriptionIcon} />
                </MuiTooltip>
              </Box>
              {isLoading ? (
                <Box sx={{ width: '20%' }}>
                  <Skeleton data-testid="cluster-loading" />
                </Box>
              ) : (
                <Typography id="peer-load-limit" className={styles.configText} variant="body2" component="div">
                  {cluster?.peer_cluster_config?.load_limit || 0}
                </Typography>
              )}
            </Box>
            <Box className={styles.configContent}>
              <Box className={styles.configContentTitle}>
                <Typography variant="body2" component="div" className={styles.configLable}>
                  Candidate parent limit
                </Typography>
                <MuiTooltip
                  title="The maximum number of parents that the scheduler can schedule for download peer."
                  placement="top"
                >
                  <HelpIcon className={styles.descriptionIcon} />
                </MuiTooltip>
              </Box>
              {isLoading ? (
                <Box sx={{ width: '20%' }}>
                  <Skeleton data-testid="cluster-loading" />
                </Box>
              ) : (
                <Typography id="candidate-parent-limit" className={styles.configText} variant="body2" component="div">
                  {cluster?.scheduler_cluster_config?.candidate_parent_limit || 0}
                </Typography>
              )}
            </Box>
            <Box className={styles.configContent}>
              <Box className={styles.configContentTitle}>
                <Typography variant="body2" component="div" className={styles.configLable}>
                  Filter parent limit
                </Typography>
                <MuiTooltip
                  title="The scheduler will randomly select the  number of parents from all the parents according to the filter parent limit and evaluate the optimal parents in selecting parents for the peer to download task. The number of optimal parent is the scheduling parent limit."
                  placement="top"
                >
                  <HelpIcon className={styles.descriptionIcon} />
                </MuiTooltip>
              </Box>
              {isLoading ? (
                <Box sx={{ width: '20%' }}>
                  <Skeleton data-testid="cluster-loading" />
                </Box>
              ) : (
                <Typography id="filter-parent-limit" className={styles.configText} variant="body2" component="div">
                  {cluster?.scheduler_cluster_config?.filter_parent_limit || 0}
                </Typography>
              )}
            </Box>
            <Box className={styles.configContent}>
              <Box className={styles.configContentTitle}>
                <Typography variant="body2" component="div" className={styles.configLable}>
                  Job Rate Limit(requests per seconds)
                </Typography>
                <MuiTooltip
                  title="The rate limit(requests per second) for job Open API, default value is 10."
                  placement="top"
                >
                  <HelpIcon className={styles.descriptionIcon} />
                </MuiTooltip>
              </Box>
              {isLoading ? (
                <Box sx={{ width: '20%' }}>
                  <Skeleton data-testid="cluster-loading" />
                </Box>
              ) : (
                <Typography id="job-rate-limit" component="div" className={styles.configText} variant="body2">
                  {cluster?.scheduler_cluster_config?.job_rate_limit || 0}
                </Typography>
              )}
            </Box>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
