import * as React from 'react';
import Divider from '@mui/material/Divider';
import { Box, Grid, Tooltip, Typography, Paper, DialogTitle, DialogContent, IconButton, Skeleton } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import styles from './clusterInformation.module.css';
import HelpIcon from '@mui/icons-material/Help';
import { useState } from 'react';

interface clusterData {
  ID: number;
  Name: string;
  BIO: string;
  Scopes: {
    idc: string;
    location: string;
    cidrs: Array<string>;
  };
  SchedulerClusterID: number;
  SeedPeerClusterID: number;
  SchedulerClusterConfig: {
    candidate_parent_limit: number;
    filter_parent_limit: number;
  };
  SeedPeerClusterConfig: {
    load_limit: number;
  };
  PeerClusterConfig: {
    load_limit: number;
    concurrent_piece_count: number;
  };
  CreatedAt: string;
  UpdatedAt: string;
  IsDefault: boolean;
}

const Information = (props: { informationList: clusterData; isLoading: boolean }) => {
  const { informationList, isLoading } = props;
  const [openCIDRs, setOpenCIDRs] = useState(false);

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
        <Paper variant="outlined" className={styles.informationContainer}>
          <Box className={styles.informationWrap}>
            <Box className={styles.informationTitle}>
              <Typography variant="body2" component="div" color="#80828B" mr="0.2rem">
                Name
              </Typography>
              <Tooltip title="Cluster name." placement="top">
                <HelpIcon color="disabled" className={styles.descriptionIcon} />
              </Tooltip>
            </Box>
            <Typography variant="subtitle1" component="div" fontFamily="mabry-bold">
              {isLoading ? <Skeleton sx={{ width: '8rem' }} /> : informationList.Name}
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box className={styles.informationWrap}>
            <Box className={styles.informationTitle}>
              <Typography variant="body2" component="div" color="#80828B" mr="0.2rem">
                Description
              </Typography>
              <Tooltip title="Cluster description." placement="top">
                <HelpIcon color="disabled" className={styles.descriptionIcon} />
              </Tooltip>
            </Box>
            <Tooltip title={informationList?.BIO || '-'} placement="bottom">
              <Typography
                variant="subtitle1"
                component="div"
                fontFamily="mabry-bold"
                sx={{
                  width: '9rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  textAlign: 'center',
                }}
              >
                {isLoading ? <Skeleton sx={{ width: '8rem' }} /> : informationList?.BIO || '-'}
              </Typography>
            </Tooltip>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box className={styles.informationWrap}>
            <Box className={styles.informationTitle}>
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
              {isLoading ? <Skeleton sx={{ width: '8rem' }} /> : informationList.IsDefault ? 'Yes' : 'No'}
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box className={styles.informationWrap}>
            <Box className={styles.informationTitle}>
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
            <Typography variant="subtitle1" component="div" fontFamily="mabry-bold">
              {isLoading ? <Skeleton sx={{ width: '8rem' }} /> : informationList?.SchedulerClusterID}
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box className={styles.informationWrap}>
            <Box className={styles.informationTitle}>
              <Typography variant="body2" component="div" color="#80828B" mr="0.2rem">
                Seed Peer cluster ID
              </Typography>
              <Tooltip
                title="When the seed peer is deployed, the clusterID must be filled with this seed peer cluster ID in scheduler configuration. In this way, the seed peer will become the seed peer service of this cluster."
                placement="top"
              >
                <HelpIcon color="disabled" className={styles.descriptionIcon} />
              </Tooltip>
            </Box>
            <Typography variant="subtitle1" component="div" fontFamily="mabry-bold">
              {isLoading ? <Skeleton sx={{ width: '8rem' }} /> : informationList?.SeedPeerClusterID}
            </Typography>
          </Box>
        </Paper>
        <Paper variant="outlined" className={styles.container}>
          <Box className={styles.scopesContainer}>
            <Grid sx={{ mb: '0.6rem', display: 'flex', alignItems: 'center' }}>
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
              <Paper variant="outlined" className={styles.locationContainer}>
                <Box className={styles.iconContainer}>
                  <Box component="img" className={styles.icon} src="/icons/cluster/location.svg" />
                </Box>
                <Box>
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
                  <Tooltip title={informationList?.Scopes?.location || '-'} placement="top">
                    <Box className={styles.locationTextContainer}>
                      <Typography variant="body2" component="span" className={styles.locationContent}>
                        {isLoading ? <Skeleton sx={{ width: '8rem' }} /> : informationList?.Scopes?.location || '-'}
                      </Typography>
                    </Box>
                  </Tooltip>
                </Box>
              </Paper>
              <Paper variant="outlined" className={styles.idcContainer}>
                <Box className={styles.iconContainer}>
                  <Box component="img" className={styles.icon} src="/icons/cluster/idc.svg" />
                </Box>
                <Box>
                  <Box className={styles.idcTitle}>
                    <Typography variant="body1" component="div" color="#80828B" sx={{ mr: '0.2rem' }}>
                      IDC
                    </Typography>
                    <Tooltip
                      title={`The cluster needs to serve all peers in the IDC. When the IDC in the peer configuration matches the IDC in the cluster, the peer will preferentially use the scheduler and the seed peer of the cluster. IDC has higher priority than location in the scopes.`}
                      placement="top"
                    >
                      <HelpIcon color="disabled" className={styles.descriptionIcon} />
                    </Tooltip>
                  </Box>
                  <Tooltip title={informationList?.Scopes?.idc || '-'} placement="top">
                    <Box className={styles.idcTextContainer}>
                      <Typography variant="body2" component="div" className={styles.idcContent}>
                        {isLoading ? <Skeleton sx={{ width: '8rem' }} /> : informationList?.Scopes?.idc || '-'}
                      </Typography>
                    </Box>
                  </Tooltip>
                </Box>
              </Paper>
              <Paper variant="outlined" className={styles.cidrsContainer}>
                <Box className={styles.iconContainer}>
                  <Box component="img" className={styles.icon} src="/icons/cluster/cidrs.svg" />
                </Box>
                <Box>
                  <Box className={styles.cidrsTitle}>
                    <Typography variant="body1" component="div" color="#80828B" sx={{ mr: '0.2rem' }}>
                      CIDRs
                    </Typography>
                    <Tooltip
                      title={`The cluster needs to serve all peers in the CIDRs. The advertise IP will be reported in the peer configuration when the peer is started, and if the advertise IP is empty in the peer configuration, peer will automatically get expose IP as advertise IP. When advertise IP of the peer matches the CIDRs in cluster, the peer will preferentially use the scheduler and the seed peer of the cluster. CIDRs has higher priority than IDC in the scopes.`}
                      placement="top"
                    >
                      <HelpIcon color="disabled" className={styles.descriptionIcon} />
                    </Tooltip>
                  </Box>
                  {isLoading ? (
                    <Skeleton sx={{ width: '10rem' }} />
                  ) : (
                    <Box className={styles.cidrsTags}>
                      {informationList?.Scopes?.cidrs?.length > 0 ? (
                        <Paper variant="outlined" className={styles.cidrsContent}>
                          <Typography variant="body2" sx={{ fontFamily: 'system-ui' }}>
                            {informationList?.Scopes?.cidrs[0]}
                          </Typography>
                        </Paper>
                      ) : (
                        <>-</>
                      )}
                      {informationList?.Scopes?.cidrs?.length > 1 ? (
                        <IconButton
                          size="small"
                          onClick={() => {
                            setOpenCIDRs(true);
                          }}
                        >
                          <MoreVertIcon sx={{ color: 'var(--button-color)' }} />
                        </IconButton>
                      ) : (
                        <></>
                      )}
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
                          {informationList?.Scopes?.cidrs?.map((item: any, id: any) => (
                            <Paper key={id} elevation={0} className={styles.cidrsDialogContent}>
                              <Box component="img" className={styles.cidrsIcon} src="/icons/cluster/cidrs.svg" />
                              <Tooltip title={item} placement="top">
                                <Typography
                                  variant="body2"
                                  component="div"
                                  className={styles.cidrsText}
                                  alignSelf="center"
                                >
                                  {item}
                                </Typography>
                              </Tooltip>
                            </Paper>
                          ))}
                        </DialogContent>
                      </Dialog>
                    </Box>
                  )}
                </Box>
              </Paper>
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
                    Seed Peer load limit
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
                    <Skeleton />
                  </Box>
                ) : (
                  <Typography component="div">{informationList?.SeedPeerClusterConfig?.load_limit || '-'}</Typography>
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
                    <Skeleton />
                  </Box>
                ) : (
                  <Typography component="div"> {informationList?.PeerClusterConfig?.load_limit || '-'}</Typography>
                )}
              </Box>
              <Divider />
              <Box className={styles.configContent}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" component="div" color="#80828B" sx={{ mr: '0.2rem' }}>
                    Number of concurrent download pieces
                  </Typography>
                  <Tooltip
                    title="The number of pieces that a peer can concurrent download from other peers."
                    placement="top"
                  >
                    <HelpIcon color="disabled" className={styles.descriptionIcon} />
                  </Tooltip>
                </Box>
                {isLoading ? (
                  <Box sx={{ width: '20%' }}>
                    <Skeleton />
                  </Box>
                ) : (
                  <Typography component="div">
                    {informationList?.PeerClusterConfig?.concurrent_piece_count || '-'}
                  </Typography>
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
                    <Skeleton />
                  </Box>
                ) : (
                  <Typography component="div">
                    {informationList?.SchedulerClusterConfig?.candidate_parent_limit || '-'}
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
                    <Skeleton />
                  </Box>
                ) : (
                  <Typography component="div">
                    {informationList?.SchedulerClusterConfig?.filter_parent_limit || '-'}
                  </Typography>
                )}
              </Box>
            </Paper>
          </Box>
        </Paper>
      </Grid>
    </Box>
  );
};

export default Information;
