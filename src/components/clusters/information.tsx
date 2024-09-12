import Divider from '@mui/material/Divider';
import {
  Box,
  Grid,
  Tooltip,
  Typography,
  Paper,
  DialogTitle,
  DialogContent,
  IconButton,
  Skeleton,
  Chip,
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import styles from './information.module.css';
import HelpIcon from '@mui/icons-material/Help';
import { useState } from 'react';
import { useCopyToClipboard } from 'react-use';
import { getClusterResponse } from '../../lib/api';

export default function Information(props: { cluster: getClusterResponse; isLoading: boolean }) {
  const { cluster, isLoading } = props;
  const [openCIDRs, setOpenCIDRs] = useState(false);
  const [openIDC, setOpenIDC] = useState(false);
  const [openHostnames, setOpenHostnames] = useState(false);
  const [showSchedulerClusterIDCopyIcon, setShowSchedulerClusterIDCopyIcon] = useState(false);
  const [showSeedPeerClusterIDCopyIcon, setShowSeedPeerClusterIDCopyIcon] = useState(false);
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

  return (
    <Box sx={{ mb: '2rem' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: '1rem', mt: '0.8rem' }}>
        <Typography variant="subtitle1" fontFamily="mabry-bold" sx={{ mr: '0.2rem' }}>
          Information
        </Typography>
        <Tooltip title="The information of cluster." placement="top">
          <HelpIcon color="disabled" className={styles.descriptionIcon} />
        </Tooltip>
      </Box>
      <Grid>
        <Paper variant="outlined" className={styles.clusterContainer}>
          <Box className={styles.clusterWrap}>
            <Box className={styles.clusterTitle}>
              <Typography variant="body2" component="div" color="#80828B" mr="0.2rem">
                Name
              </Typography>
              <Tooltip title="Cluster name." placement="top">
                <HelpIcon color="disabled" className={styles.descriptionIcon} />
              </Tooltip>
            </Box>
            <Typography variant="subtitle1" component="div" fontFamily="mabry-bold">
              {isLoading ? <Skeleton sx={{ width: '8rem' }} /> : cluster.name || '-'}
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box className={styles.clusterWrap}>
            <Box className={styles.clusterTitle}>
              <Typography variant="body2" component="div" color="#80828B" mr="0.2rem">
                Description
              </Typography>
              <Tooltip title="Cluster description." placement="top">
                <HelpIcon color="disabled" className={styles.descriptionIcon} />
              </Tooltip>
            </Box>
            <Tooltip title={cluster?.bio || '-'} placement="bottom">
              <Typography
                variant="subtitle1"
                component="div"
                fontFamily="mabry-bold"
                sx={{
                  width: '80%',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  textAlign: 'center',
                }}
              >
                {isLoading ? <Skeleton data-testid="cluster-loading" sx={{ width: '8rem' }} /> : cluster?.bio || '-'}
              </Typography>
            </Tooltip>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box className={styles.clusterWrap}>
            <Box className={styles.clusterTitle}>
              <Typography variant="body2" component="div" color="#80828B" mr="0.2rem">
                Set as default cluster
              </Typography>
              <Tooltip
                title="When peer does not find a matching cluster based on scopes, the default cluster will be used."
                placement="top"
              >
                <HelpIcon color="disabled" className={styles.descriptionIcon} />
              </Tooltip>
            </Box>
            <Typography variant="subtitle1" component="div" fontFamily="mabry-bold">
              {isLoading ? (
                <Skeleton data-testid="cluster-loading" sx={{ width: '8rem' }} />
              ) : cluster.is_default ? (
                'Yes'
              ) : (
                'No'
              )}
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box className={styles.clusterWrap}>
            <Box className={styles.clusterTitle}>
              <Typography variant="body2" component="div" color="#80828B" mr="0.2rem">
                Scheduler cluster ID
              </Typography>
              <Tooltip
                title="When the scheduler is deployed, the schedulerClusterID must be filled with this scheduler cluster ID in scheduler configuration. In this way, the scheduler will become the scheduling service of this cluster."
                placement="top"
              >
                <HelpIcon color="disabled" className={styles.descriptionIcon} />
              </Tooltip>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="subtitle1" component="div" fontFamily="mabry-bold" mr="0.4rem">
                {isLoading ? (
                  <Skeleton data-testid="cluster-loading" sx={{ width: '8rem' }} />
                ) : (
                  cluster?.scheduler_cluster_id || 0
                )}
              </Typography>
              {isLoading ? (
                <></>
              ) : (
                <IconButton
                  aria-label="copy"
                  sx={{
                    width: '1.2rem',
                    height: '1.2rem',
                  }}
                  onClick={() => {
                    copyClusterID('schedulerClusterID', cluster?.scheduler_cluster_id || 0);
                  }}
                >
                  {showSchedulerClusterIDCopyIcon ? (
                    <Tooltip
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
                      <Box
                        component="img"
                        id="schedulerClusterIDCopyIcon"
                        sx={{ width: '1rem', height: '1rem' }}
                        src="/icons/tokens/done.svg"
                      />
                    </Tooltip>
                  ) : (
                    <Box component="img" sx={{ width: '1rem', height: '1rem' }} src="/icons/tokens/copy.svg" />
                  )}
                </IconButton>
              )}
            </Box>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box className={styles.clusterWrap}>
            <Box className={styles.clusterTitle}>
              <Typography variant="body2" component="div" color="#80828B" mr="0.2rem">
                Seed peer cluster ID
              </Typography>
              <Tooltip
                title="When the seed peer is deployed, the clusterID must be filled with this seed peer cluster ID in scheduler configuration. In this way, the seed peer will become the seed peer service of this cluster."
                placement="top"
              >
                <HelpIcon color="disabled" className={styles.descriptionIcon} />
              </Tooltip>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="subtitle1" component="div" fontFamily="mabry-bold" mr="0.4rem">
                {isLoading ? (
                  <Skeleton data-testid="cluster-loading" sx={{ width: '8rem' }} />
                ) : (
                  cluster?.seed_peer_cluster_id || 0
                )}
              </Typography>
              {isLoading ? (
                <></>
              ) : (
                <IconButton
                  aria-label="copy"
                  sx={{
                    width: '1.2rem',
                    height: '1.2rem',
                  }}
                  onClick={() => {
                    copyClusterID('seedPeerClusterID', cluster?.seed_peer_cluster_id || 0);
                  }}
                >
                  {showSeedPeerClusterIDCopyIcon ? (
                    <Tooltip
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
                      <Box
                        component="img"
                        id="seedPeerClusterIDCopyIcon"
                        sx={{ width: '1rem', height: '1rem' }}
                        src="/icons/tokens/done.svg"
                      />
                    </Tooltip>
                  ) : (
                    <Box component="img" sx={{ width: '1rem', height: '1rem' }} src="/icons/tokens/copy.svg" />
                  )}
                </IconButton>
              )}
            </Box>
          </Box>
        </Paper>
        <Box className={styles.container}>
          <Box className={styles.scopesContainer}>
            <Grid sx={{ mb: '1rem', display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" color="text.primary" fontFamily="mabry-bold" sx={{ mr: '0.4rem' }}>
                  Scopes
                </Typography>
                <Tooltip
                  title="The cluster needs to serve the scope. It wil provide scheduler services and seed peer services to
                  peers in the scope."
                  placement="top"
                >
                  <HelpIcon color="disabled" className={styles.descriptionIcon} />
                </Tooltip>
              </Box>
            </Grid>
            <Paper elevation={0} className={styles.scopesContentContainer}>
              <Box className={styles.scopesCard}>
                <Paper variant="outlined" className={styles.cidrsContainer}>
                  <Box display="flex" justifyContent="space-between">
                    <Box className={styles.locationTitle}>
                      <Typography variant="body1" component="div" color="#80828B" sx={{ mr: '0.2rem' }}>
                        Location
                      </Typography>
                      <Tooltip
                        title={`The cluster needs to serve all peers in the location. When the location in the peer configuration matches the location in the cluster, the peer will preferentially use the scheduler and the seed peer of the cluster. It separated by "|", for example "area|country|province|city".`}
                        placement="top"
                      >
                        <HelpIcon color="disabled" className={styles.descriptionIcon} />
                      </Tooltip>
                    </Box>
                    <Box className={styles.scopesIconContainer}>
                      <Box component="img" className={styles.scopesIcon} src="/icons/cluster/location.svg" />
                    </Box>
                  </Box>
                  <Box className={styles.locationTextContainer}>
                    <Tooltip title={cluster?.scopes?.location || '-'} placement="top">
                      <Typography variant="subtitle1" component="div" className={styles.locationContent}>
                        {isLoading ? (
                          <Skeleton data-testid="cluster-loading" sx={{ width: '8rem' }} />
                        ) : (
                          cluster?.scopes?.location || '-'
                        )}
                      </Typography>
                    </Tooltip>
                  </Box>
                </Paper>
              </Box>
              <Box className={styles.scopesCard}>
                <Paper variant="outlined" className={styles.cidrsContainer}>
                  <Box display="flex" justifyContent="space-between">
                    <Box className={styles.cidrsTitle}>
                      <Typography variant="subtitle1" component="div" color="#80828B" sx={{ mr: '0.2rem' }}>
                        IDC
                      </Typography>
                      <Tooltip
                        title={`The cluster needs to serve all peers in the IDC. When the IDC in the peer configuration matches the IDC in the cluster, the peer will preferentially use the scheduler and the seed peer of the cluster. IDC has higher priority than location in the scopes.`}
                        placement="top"
                      >
                        <HelpIcon color="disabled" className={styles.descriptionIcon} />
                      </Tooltip>
                    </Box>
                    <Chip
                      size="small"
                      icon={<Box component="img" className={styles.scopesIcon} src="/icons/cluster/idc.svg" />}
                      label={`Total: ${cluster?.scopes?.idc !== '' ? cluster?.scopes?.idc.split('|').length : 0}`}
                    />
                  </Box>
                  <Box className={styles.cidrsTags}>
                    {cluster?.scopes?.idc ? (
                      <>
                        <Box className={styles.cidrWrapper}>
                          <Paper variant="outlined" className={styles.cidrsContent}>
                            <Tooltip title={cluster?.scopes?.idc.split('|')[0] || '-'} placement="top">
                              <Typography variant="body2" component="div" className={styles.cidrsText}>
                                {isLoading ? (
                                  <Skeleton data-testid="cluster-loading" sx={{ width: '8rem' }} />
                                ) : (
                                  cluster?.scopes?.idc.split('|')[0] || '-'
                                )}
                              </Typography>
                            </Tooltip>
                          </Paper>
                          {cluster?.scopes?.idc.split('|').length > 1 ? (
                            <Paper variant="outlined" className={styles.cidrsContent}>
                              <Tooltip title={cluster?.scopes?.idc.split('|')[1] || ''} placement="top">
                                <Typography variant="body2" component="div" className={styles.cidrsText}>
                                  {isLoading ? (
                                    <Skeleton data-testid="cluster-loading" sx={{ width: '8rem' }} />
                                  ) : (
                                    cluster?.scopes?.idc.split('|')[1] || ''
                                  )}
                                </Typography>
                              </Tooltip>
                            </Paper>
                          ) : (
                            <></>
                          )}
                          {cluster?.scopes?.idc.split('|').length > 2 ? (
                            <Paper variant="outlined" className={styles.cidrsContent}>
                              <Tooltip title={cluster?.scopes?.idc.split('|')[2] || ''} placement="top">
                                <Typography variant="body2" component="div" className={styles.cidrsText}>
                                  {isLoading ? (
                                    <Skeleton data-testid="cluster-loading" sx={{ width: '8rem' }} />
                                  ) : (
                                    cluster?.scopes?.idc.split('|')[2] || ''
                                  )}
                                </Typography>
                              </Tooltip>
                            </Paper>
                          ) : (
                            <></>
                          )}
                          {cluster?.scopes?.idc.split('|').length > 3 ? (
                            <Paper variant="outlined" className={styles.cidrsContent}>
                              <Tooltip title={cluster?.scopes?.idc.split('|')[3] || ''} placement="top">
                                <Typography variant="body2" component="div" className={styles.cidrsText}>
                                  {isLoading ? (
                                    <Skeleton data-testid="cluster-loading" sx={{ width: '8rem' }} />
                                  ) : (
                                    cluster?.scopes?.idc.split('|')[3] || ''
                                  )}
                                </Typography>
                              </Tooltip>
                            </Paper>
                          ) : (
                            <></>
                          )}
                        </Box>
                        {cluster?.scopes?.idc.split('|').length > 2 ? (
                          <IconButton
                            size="small"
                            id="idc"
                            onClick={() => {
                              setOpenIDC(true);
                            }}
                          >
                            <MoreVertIcon sx={{ color: 'var(--button-color)' }} />
                          </IconButton>
                        ) : (
                          <></>
                        )}
                      </>
                    ) : (
                      <Typography variant="subtitle1" component="div">
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
                    <DialogTitle fontFamily="mabry-bold">IDC</DialogTitle>
                    <DialogContent dividers className={styles.idcDialogContainer}>
                      {cluster?.scopes?.idc.split('|').map((item: any, id: any) => (
                        <Paper key={id} elevation={0} className={styles.idcDialogContent}>
                          <Box component="img" className={styles.cidrsIcon} src="/icons/cluster/idc.svg" />
                          <Tooltip title={item} placement="top">
                            <Typography variant="body2" component="div" className={styles.cidrsText} alignSelf="center">
                              {item}
                            </Typography>
                          </Tooltip>
                        </Paper>
                      ))}
                    </DialogContent>
                  </Dialog>
                </Paper>
              </Box>
              <Box className={styles.scopesCard}>
                <Paper variant="outlined" className={styles.cidrsContainer}>
                  <Box display="flex" justifyContent="space-between">
                    <Box className={styles.cidrsTitle}>
                      <Typography variant="subtitle1" component="div" color="#80828B" sx={{ mr: '0.2rem' }}>
                        CIDRs
                      </Typography>
                      <Tooltip
                        title={`The cluster needs to serve all peers in the CIDRs. The advertise IP will be reported in the peer configuration when the peer is started, and if the advertise IP is empty in the peer configuration, peer will automatically get expose IP as advertise IP. When advertise IP of the peer matches the CIDRs in cluster, the peer will preferentially use the scheduler and the seed peer of the cluster. CIDRs has higher priority than IDC in the scopes. CIDRs has higher priority than IDC in the scopes. CIDRs has priority equal to hostname in the scopes.`}
                        placement="top"
                      >
                        <HelpIcon color="disabled" className={styles.descriptionIcon} />
                      </Tooltip>
                    </Box>
                    <Chip
                      size="small"
                      icon={<Box component="img" className={styles.scopesIcon} src="/icons/cluster/cidrs.svg" />}
                      label={`Total: ${cluster?.scopes?.cidrs?.length ? cluster?.scopes?.cidrs?.length : 0}`}
                    />
                  </Box>
                  {isLoading ? (
                    <Skeleton data-testid="cluster-loading" sx={{ width: '10rem' }} />
                  ) : (
                    <Box className={styles.cidrsTags}>
                      {cluster?.scopes?.cidrs?.length > 0 ? (
                        <>
                          <Box className={styles.cidrWrapper}>
                            <Paper variant="outlined" className={styles.cidrsContent}>
                              <Tooltip title={cluster?.scopes?.cidrs[0] || '-'} placement="top">
                                <Typography variant="body2" className={styles.cidrsText}>
                                  {cluster?.scopes?.cidrs[0] || ''}
                                </Typography>
                              </Tooltip>
                            </Paper>
                            {cluster?.scopes?.cidrs?.length > 1 ? (
                              <Paper variant="outlined" className={styles.cidrsContent}>
                                <Tooltip title={cluster?.scopes?.cidrs[1] || ''} placement="top">
                                  <Typography variant="body2" className={styles.cidrsText}>
                                    {cluster?.scopes?.cidrs[1] || ''}
                                  </Typography>
                                </Tooltip>
                              </Paper>
                            ) : (
                              <></>
                            )}
                            {cluster?.scopes?.cidrs?.length > 2 ? (
                              <Paper variant="outlined" className={styles.cidrsContent}>
                                <Tooltip title={cluster?.scopes?.cidrs[2] || ''} placement="top">
                                  <Typography variant="body2" className={styles.cidrsText}>
                                    {cluster?.scopes?.cidrs[2] || ''}
                                  </Typography>
                                </Tooltip>
                              </Paper>
                            ) : (
                              <></>
                            )}
                            {cluster?.scopes?.cidrs?.length > 3 ? (
                              <Paper variant="outlined" className={styles.cidrsContent}>
                                <Tooltip title={cluster?.scopes?.cidrs[3] || ''} placement="top">
                                  <Typography variant="body2" className={styles.cidrsText}>
                                    {cluster?.scopes?.cidrs[3] || ''}
                                  </Typography>
                                </Tooltip>
                              </Paper>
                            ) : (
                              <></>
                            )}
                          </Box>
                          {cluster?.scopes?.cidrs?.length > 2 ? (
                            <IconButton
                              size="small"
                              id="cidrs"
                              onClick={() => {
                                setOpenCIDRs(true);
                              }}
                            >
                              <MoreVertIcon sx={{ color: 'var(--button-color)' }} />
                            </IconButton>
                          ) : (
                            <></>
                          )}
                        </>
                      ) : (
                        <Typography variant="subtitle1" component="div">
                          -
                        </Typography>
                      )}
                    </Box>
                  )}
                </Paper>
                <Dialog
                  maxWidth="sm"
                  fullWidth
                  open={openCIDRs}
                  onClose={() => {
                    setOpenCIDRs(false);
                  }}
                >
                  <DialogTitle fontFamily="mabry-bold">CIDRs</DialogTitle>
                  <DialogContent dividers className={styles.cidrsDialogContainer}>
                    {cluster?.scopes?.cidrs?.map((item: any, id: any) => (
                      <Paper key={id} elevation={0} className={styles.cidrsDialogContent}>
                        <Box component="img" className={styles.cidrsIcon} src="/icons/cluster/cidrs.svg" />
                        <Tooltip title={item} placement="top">
                          <Typography variant="body2" component="div" className={styles.cidrsText} alignSelf="center">
                            {item}
                          </Typography>
                        </Tooltip>
                      </Paper>
                    ))}
                  </DialogContent>
                </Dialog>
              </Box>
              <Box className={styles.scopesCard}>
                <Paper variant="outlined" className={styles.cidrsContainer}>
                  <Box display="flex" justifyContent="space-between">
                    <Box className={styles.cidrsTitle}>
                      <Typography variant="subtitle1" component="div" color="#80828B" sx={{ mr: '0.2rem' }}>
                        Hostnames
                      </Typography>
                      <Tooltip
                        title={
                          'The cluster needs to serve all peers in hostname. The input parameter is the multiple hostname regexes. The hostname will be reported in the peer configuration when the peer is started. When the hostname matches the multiple hostname regexes in the cluster, the peer will preferentially use the scheduler and the seed peer of the cluster. Hostname has higher priority than IDC in the scopes. Hostname has priority equal to CIDRs in the scopes.'
                        }
                        placement="top"
                      >
                        <HelpIcon color="disabled" className={styles.descriptionIcon} />
                      </Tooltip>
                    </Box>
                    <Chip
                      size="small"
                      icon={<Box component="img" className={styles.scopesIcon} src="/icons/cluster/hostnames.svg" />}
                      label={`Total: ${cluster?.scopes?.hostnames?.length ? cluster?.scopes?.hostnames?.length : 0}`}
                    />
                  </Box>
                  {isLoading ? (
                    <Skeleton data-testid="cluster-loading" sx={{ width: '10rem' }} />
                  ) : (
                    <Box className={styles.cidrsTags}>
                      {cluster?.scopes?.hostnames?.length > 0 ? (
                        <>
                          <Box className={styles.cidrWrapper}>
                            <Paper variant="outlined" className={styles.cidrsContent}>
                              <Tooltip title={cluster?.scopes?.hostnames[0] || '-'} placement="top">
                                <Typography variant="body2" className={styles.cidrsText}>
                                  {cluster?.scopes?.hostnames[0] || '-'}
                                </Typography>
                              </Tooltip>
                            </Paper>
                            {cluster?.scopes?.hostnames?.length > 1 ? (
                              <Paper variant="outlined" className={styles.cidrsContent}>
                                <Tooltip title={cluster?.scopes?.hostnames[1] || ''} placement="top">
                                  <Typography variant="body2" className={styles.cidrsText}>
                                    {cluster?.scopes?.hostnames[1] || ''}
                                  </Typography>
                                </Tooltip>
                              </Paper>
                            ) : (
                              <></>
                            )}
                            {cluster?.scopes?.hostnames?.length > 2 ? (
                              <Paper variant="outlined" className={styles.cidrsContent}>
                                <Tooltip title={cluster?.scopes?.hostnames[2] || ''} placement="top">
                                  <Typography variant="body2" className={styles.cidrsText}>
                                    {cluster?.scopes?.hostnames[2] || ''}
                                  </Typography>
                                </Tooltip>
                              </Paper>
                            ) : (
                              <></>
                            )}
                            {cluster?.scopes?.hostnames?.length > 3 ? (
                              <Paper variant="outlined" className={styles.cidrsContent}>
                                <Tooltip title={cluster?.scopes?.hostnames[3] || ''} placement="top">
                                  <Typography variant="body2" className={styles.cidrsText}>
                                    {cluster?.scopes?.hostnames[3] || ''}
                                  </Typography>
                                </Tooltip>
                              </Paper>
                            ) : (
                              <></>
                            )}
                          </Box>
                          {cluster?.scopes?.hostnames?.length > 2 ? (
                            <IconButton
                              size="small"
                              id="hostnames"
                              onClick={() => {
                                setOpenHostnames(true);
                              }}
                            >
                              <MoreVertIcon sx={{ color: 'var(--button-color)' }} />
                            </IconButton>
                          ) : (
                            <></>
                          )}
                        </>
                      ) : (
                        <Typography variant="subtitle1" component="div">
                          -
                        </Typography>
                      )}
                    </Box>
                  )}
                </Paper>
                <Dialog
                  maxWidth="sm"
                  fullWidth
                  open={openHostnames}
                  onClose={() => {
                    setOpenHostnames(false);
                  }}
                >
                  <DialogTitle fontFamily="mabry-bold">Hostnames</DialogTitle>
                  <DialogContent dividers className={styles.cidrsDialogContainer}>
                    {cluster?.scopes?.hostnames?.map((item: any, id: any) => (
                      <Paper key={id} elevation={0} className={styles.cidrsDialogContent}>
                        <Box component="img" className={styles.cidrsIcon} src="/icons/cluster/hostnames.svg" />
                        <Tooltip title={item} placement="top">
                          <Typography variant="body2" component="div" className={styles.cidrsText} alignSelf="center">
                            {item}
                          </Typography>
                        </Tooltip>
                      </Paper>
                    ))}
                  </DialogContent>
                </Dialog>
              </Box>
            </Paper>
          </Box>
          <Box className={styles.configRightContainer}>
            <Grid className={styles.configContainer}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" color="text.primary" fontFamily="mabry-bold" sx={{ mr: '0.4rem' }}>
                  Config
                </Typography>
                <Tooltip title="The configuration for P2P downloads." placement="top">
                  <HelpIcon color="disabled" className={styles.descriptionIcon} />
                </Tooltip>
              </Box>
            </Grid>
            <Paper variant="outlined" className={styles.configListContainer}>
              <Box className={styles.configContent}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" component="div" color="#80828B" sx={{ mr: '0.2rem' }}>
                    Seed peer load limit
                  </Typography>
                  <Tooltip
                    title="If other peers download from the seed peer, the load of the seed peer will increase. When the load limit of the seed peer is reached, the scheduler will no longer schedule other peers to download from the seed peer until the it has the free load.	seed_peer_cluster_config.load_limit"
                    placement="top"
                  >
                    <HelpIcon color="disabled" className={styles.descriptionIcon} />
                  </Tooltip>
                </Box>
                {isLoading ? (
                  <Box sx={{ width: '20%' }}>
                    <Skeleton data-testid="cluster-loading" />
                  </Box>
                ) : (
                  <Typography component="div">{cluster?.seed_peer_cluster_config?.load_limit || 0}</Typography>
                )}
              </Box>
              <Divider />
              <Box className={styles.configContent}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" component="div" color="#80828B" sx={{ mr: '0.2rem' }}>
                    Peer load limit
                  </Typography>
                  <Tooltip
                    title={`If other peers download from the peer, the load of the peer will increase. When the load limit of the peer is reached, the scheduler will no longer schedule other peers to download from the peer until the it has the free load.`}
                    placement="top"
                  >
                    <HelpIcon color="disabled" className={styles.descriptionIcon} />
                  </Tooltip>
                </Box>
                {isLoading ? (
                  <Box sx={{ width: '20%' }}>
                    <Skeleton data-testid="cluster-loading" />
                  </Box>
                ) : (
                  <Typography component="div">{cluster?.peer_cluster_config?.load_limit || 0}</Typography>
                )}
              </Box>
              <Divider />
              <Box className={styles.configContent}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" component="div" color="#80828B" sx={{ mr: '0.2rem' }}>
                    Candidate parent limit
                  </Typography>
                  <Tooltip
                    title="The maximum number of parents that the scheduler can schedule for download peer."
                    placement="top"
                  >
                    <HelpIcon color="disabled" className={styles.descriptionIcon} />
                  </Tooltip>
                </Box>
                {isLoading ? (
                  <Box sx={{ width: '20%' }}>
                    <Skeleton data-testid="cluster-loading" />
                  </Box>
                ) : (
                  <Typography component="div">
                    {cluster?.scheduler_cluster_config?.candidate_parent_limit || 0}
                  </Typography>
                )}
              </Box>
              <Divider />
              <Box className={styles.configContent}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" component="div" color="#80828B" sx={{ mr: '0.2rem' }}>
                    Filter parent limit
                  </Typography>
                  <Tooltip
                    title="The scheduler will randomly select the  number of parents from all the parents according to the filter parent limit and evaluate the optimal parents in selecting parents for the peer to download task. The number of optimal parent is the scheduling parent limit."
                    placement="top"
                  >
                    <HelpIcon color="disabled" className={styles.descriptionIcon} />
                  </Tooltip>
                </Box>
                {isLoading ? (
                  <Box sx={{ width: '20%' }}>
                    <Skeleton data-testid="cluster-loading" />
                  </Box>
                ) : (
                  <Typography component="div">{cluster?.scheduler_cluster_config?.filter_parent_limit || 0}</Typography>
                )}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Grid>
    </Box>
  );
}
