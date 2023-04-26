import Layout from 'components/layout';
import { NextPageWithLayout } from '../../../_app';
import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Paper from '@mui/material/Paper';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
const Security: NextPageWithLayout = () => {
  const [open, setOpen] = React.useState(false);
  const [openUpdata, setOpenUpdata] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClickUpdataOpen = () => {
    setOpenUpdata(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleUpdata = () => {
    setOpenUpdata(false);
  };
  const router = useRouter();
  const str = router.asPath.split('/');
  const routers = str[3].split('?');

  const schedulers = [
    {
      id: 1,
      created_at: '2023-04-12T06:36:51Z',
      updated_at: '2023-04-19T03:34:42Z',
      host_name: 'f3b1ddbbe0f9',
      idc: '',
      location: '',
      ip: '11.122.202.34',
      port: 8002,
      state: 'active',
      features: ['schedule', 'preheat'],
      SchedulerClusterID: 1,
    },
    {
      id: 2,
      created_at: '2023-04-12T06:36:51Z',
      updated_at: '2023-04-19T03:34:42Z',
      host_name: 'f3b233ddbbe0f9',
      idc: '',
      location: '',
      ip: '11.122.202.34',
      port: 8003,
      state: 'active',
      features: ['schedule', 'preheat'],
      SchedulerClusterID: 1,
    },
  ];
  const schedulersKey = [
    {
      label: 'ID',
      en_US: 'id',
    },
    {
      label: 'created_at',
      en_US: 'created_at',
    },
    {
      label: 'updated_at',
      en_US: 'updated_at',
    },
    {
      label: 'host_name',
      en_US: 'host_name',
    },
    {
      label: 'type',
      en_US: 'type',
    },
    {
      label: 'idc',
      en_US: 'idc',
    },
    {
      label: 'location',
      en_US: 'location',
    },
    {
      label: 'ip',
      en_US: 'ip',
    },
    {
      label: 'port',
      en_US: 'port',
    },
    {
      label: 'state',
      en_US: 'state',
    },
    {
      label: 'features',
      en_US: 'features',
    },
    {
      label: 'SchedulerClusterID',
      en_US: 'SchedulerClusterID',
    },
  ];

  const info = [
    {
      key: 'bio',
      label: 'bio',
      tab: '1',
      noNeed: true,
      formprops: {
        required: true,
      },
      props: {
        placeholder: 'Please enter cluster name',
      },
      en_US: 'bio',
    },
    {
      key: 'is_default',
      label: 'is_default',
      noNeed: true,
      tab: '1',
      en_US: 'is_default',
    },
    {
      key: 'name',
      label: 'name',
      noNeed: true,
      tab: '1',
      en_US: 'name',
    },
    {
      key: 'Peer cluster config',
      label: 'Peer cluster config',
      type: 'json',
      title: true,
      tab: '2',
      formprops: {
        tooltip: 'scheduler cluster config info',
        required: true,
      },
      en_US: 'Peer cluster config',
    },
    {
      key: 'Concurrent Piece Count',
      label: 'Concurrent Piece Count',
      tab: '1',
      formprops: {
        tooltip: 'description',
      },
      props: {
        placeholder: 'Please enter cluster description',
      },
      en_US: 'Concurrent Piece Count',
    },
    {
      key: 'Load Limit',
      label: 'Load Limit',
      tab: '1',
      formprops: {
        tooltip: 'description',
      },
      props: {
        placeholder: 'Please enter cluster description',
      },
      en_US: 'Load Limit',
    },
    ,
    {
      key: 'Scheduler Cluster Config',
      label: 'Scheduler Cluster Config',
      type: 'json',
      title: true,
      tab: '2',
      formprops: {
        tooltip: 'scheduler cluster config info',
        required: true,
      },
      en_US: 'Scheduler Cluster Config',
    },
    {
      key: 'Filter Parent Limit',
      label: 'Filter Parent Limit',
      tab: '1',
      formprops: {
        tooltip: 'description',
      },
      props: {
        placeholder: 'Please enter cluster description',
      },
      en_US: 'Filter Parent Limit',
    },
    {
      key: 'Filter Parent Range Limit',
      label: 'Filter Parent Range Limit',
      tab: '1',
      formprops: {
        tooltip: 'description',
      },
      props: {
        placeholder: 'Please enter cluster description',
      },
      en_US: 'Filter Parent Range Limit',
    },
    {
      key: 'Scopes',
      label: 'Scopes',
      type: 'json',
      title: true,
      tab: '2',
      formprops: {
        tooltip: 'scheduler cluster config info',
        required: true,
      },
      en_US: 'Scopes',
    },
    {
      key: 'Cidrs',
      label: 'Cidrs',
      tab: '1',
      formprops: {
        tooltip: 'description',
      },
      props: {
        placeholder: 'Please enter cluster description',
      },
      en_US: 'Cidrs',
    },
    {
      key: 'idc',
      label: 'IDC',
      tab: '1',
      parent: 'scopes',
      props: {
        placeholder: 'Please enter IDC, separated by "|" characters',
      },
      en_US: 'IDC',
    },
    {
      key: 'location',
      label: 'Location',
      tab: '1',
      parent: 'scopes',
      props: {
        placeholder: 'Please enter Location, separated by "|" characters',
      },
      en_US: 'Location',
    },
    {
      key: 'Seed Peer Cluster Config',
      label: 'Seed Peer Cluster Config',
      type: 'json',
      title: true,
      tab: '2',
      formprops: {
        tooltip: 'scheduler cluster config info',
        required: true,
      },
      en_US: 'Seed Peer Cluster Config',
    },
    {
      key: 'Load Limit',
      label: 'Load Limit',
      tab: '1',
      formprops: {
        tooltip: 'description',
      },
      props: {
        placeholder: 'Please enter cluster description',
      },
      en_US: 'Load Limit',
    },
  ];

  return (
    <>
      <Button variant="contained" onClick={handleClickOpen} size="small">
        Updata Cluster
      </Button>
      <Button variant="contained" size="small" onClick={handleClickUpdataOpen}>
        Delete Cluster
      </Button>
      <Dialog
        open={openUpdata}
        onClose={handleUpdata}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{' Updata Cluster'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">Are you sure to delete this cluster?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUpdata}>Disagree</Button>
          <Button onClick={handleUpdata} autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Cluster</DialogTitle>
        <DialogContent>
          {info.map((sub: any, _idx: number) => {
            if (sub.title) {
              return <h3 key={sub.key}>{sub.en_US}</h3>;
            } else {
              return (
                <TextField
                  margin="normal"
                  color="success"
                  required
                  fullWidth
                  name={sub.key}
                  key={sub.key}
                  label={sub.en_US}
                  {...(sub.formprops || '')}
                ></TextField>
              );
            }
          })}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Subscribe</Button>
        </DialogActions>
      </Dialog>
      <div>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Scheduler
        </Typography>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                {schedulersKey.map((item) => (
                  <TableCell align="center" key={item.label}>
                    {item.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {schedulersKey.map((item) => {
                  const source: any = schedulers[0] || {};
                  return <TableCell align="center">{source[item.en_US] || '-'}</TableCell>;
                })}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  );
};
export default Security;
Security.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};
