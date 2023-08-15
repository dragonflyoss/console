import {
  Box,
  Breadcrumbs,
  IconButton,
  Skeleton,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  Tooltip,
  Snackbar,
  Alert,
  Link as RouterLink,
  Divider,
} from '@mui/material';
import { useState, useEffect, useContext } from 'react';
import { getTokens, deleteTokens } from '../../../lib/api';
import { formatDate } from '../../../lib/utils';
import { useCopyToClipboard } from 'react-use';
import { LoadingButton } from '@mui/lab';
import { Link, useNavigate } from 'react-router-dom';
import { MyContext } from '../../menu/index';
import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';

export default function PersonalAccessTokens() {
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [_state, copyToClipboard] = useCopyToClipboard();
  const [openDeletToken, setOpenDeletToken] = useState(false);
  const [deleteLoadingButton, setDeleteLoadingButton] = useState(false);
  const [tokensID, setTokensID] = useState('');
  const [tokensList, setTokensList] = useState([
    { name: '', id: 0, scopes: [''], token: '', created_at: '', expired_at: '', user: { name: '' } },
  ]);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [newToken, setNewToken] = useState('');
  const [copyIcon, setCopyIcon] = useState(false);

  const navigate = useNavigate();
  const user = useContext(MyContext);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      const newToken = JSON.parse(token);
      setNewToken(newToken);
      setShowSnackbar(true);
      localStorage.removeItem('token');
    }

    (async function () {
      try {
        if (user.name === 'root') {
          const response = await getTokens();
          setTokensList(response);
          setIsLoading(false);
        } else if (user.name !== '') {
          const response = await getTokens({ user_id: String(user.id) });
          setTokensList(response);
          setIsLoading(false);
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
          setIsLoading(false);
        }
      }
    })();
  }, [user]);

  const handleChange = async (row: any) => {
    setOpenDeletToken(true);
    setTokensID(row.id);
  };

  const deletSubmit = async () => {
    setDeleteLoadingButton(true);

    try {
      await deleteTokens(tokensID);
      setDeleteLoadingButton(false);
      setSuccessMessage(true);
      setOpenDeletToken(false);

      if (user.name === 'root') {
        const response = await getTokens();
        setTokensList(response);
      } else if (user.name !== '') {
        const response = await getTokens({ user_id: String(user.id) });
        setTokensList(response);
      }
    } catch (error) {
      if (error instanceof Error) {
        setDeleteLoadingButton(false);
        setErrorMessage(true);
        setErrorMessageText(error.message);
      }
    }
  };

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorMessage(false);
    setSuccessMessage(false);
  };

  const copyToken = () => {
    copyToClipboard(newToken);
    setCopyIcon(true);

    setTimeout(() => {
      setCopyIcon(false);
    }, 1000);
  };

  return (
    <Box sx={{ width: '100%' }}>
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
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: '1rem' }}>
        <Typography>Developer</Typography>
        <Typography color="text.primary">Personal access tokens</Typography>
      </Breadcrumbs>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Typography variant="h5">Personal access tokens</Typography>
        <Button
          size="small"
          sx={{
            '&.MuiButton-root': {
              backgroundColor: 'var(--button-color)',
              borderRadius: 0,
              color: '#fff',
            },
          }}
          variant="contained"
          onClick={() => {
            navigate('/developer/personal-access-tokens/new');
          }}
        >
          <AddIcon fontSize="small" sx={{ mr: '0.4rem' }} />
          Add Personal access tokens
        </Button>
      </Box>
      <Typography variant="subtitle2" mb="1rem" mt="1rem">
        Tokens you have generated that can be used to access the Dragonfly API.
      </Typography>
      <Paper variant="outlined" sx={{ width: '100%' }}>
        {showSnackbar ? (
          <>
            <Box sx={{ display: 'flex', p: '0.8rem', alignItems: 'center', backgroundColor: 'rgba(108,198,68,.1)' }}>
              <Typography variant="body2" mr="0.2rem">
                {newToken}
              </Typography>
              <IconButton
                aria-label="delete"
                sx={{
                  p: '0',
                  width: '1.6rem',
                  height: '1.6rem',
                }}
                onClick={copyToken}
              >
                {copyIcon ? (
                  <Tooltip
                    placement="top"
                    PopperProps={{
                      disablePortal: true,
                    }}
                    onClose={() => {
                      setCopyIcon(false);
                    }}
                    open={copyIcon}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                    title="copied!"
                  >
                    <Box component="img" sx={{ width: '1.2rem', height: '1.2rem' }} src="/icons/tokens/done.svg" />
                  </Tooltip>
                ) : (
                  <Box component="img" sx={{ width: '1.2rem', height: '1.2rem' }} src="/icons/tokens/copy.svg" />
                )}
              </IconButton>
            </Box>
            <Divider />
          </>
        ) : (
          <></>
        )}
        {Array.isArray(tokensList) &&
          tokensList.map((item) => {
            return (
              <Box key={item.id}>
                <Box sx={{ display: 'flex', p: '0.8rem', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: '0.4rem' }}>
                      {isLoading ? (
                        <Skeleton sx={{ width: '2rem' }} />
                      ) : (
                        <RouterLink
                          component={Link}
                          to={`/developer/personal-access-tokens/${item?.id}`}
                          underline="hover"
                          sx={{ color: 'var(--description-color)' }}
                        >
                          {item.name}
                        </RouterLink>
                      )}
                      {isLoading ? (
                        <>
                          &nbsp;—&nbsp;
                          <Skeleton sx={{ width: '1rem' }} />
                        </>
                      ) : (
                        <Typography variant="body2">&nbsp;—&nbsp;{item?.user?.name}</Typography>
                      )}
                    </Box>
                    {isLoading ? (
                      <Skeleton />
                    ) : (
                      <>
                        <Typography variant="body2" component="span" fontFamily="mabry-bold">
                          Expires on&nbsp;
                        </Typography>
                        <Typography variant="body2" component="span">
                          {formatDate(item?.expired_at) || ''}.
                        </Typography>
                      </>
                    )}
                  </Box>
                  <Box>
                    <Button
                      size="small"
                      sx={{
                        '&.MuiButton-root': {
                          backgroundColor: 'var(--button-color)',
                          borderRadius: 0,
                          color: '#fff',
                        },
                      }}
                      variant="contained"
                      onClick={() => {
                        handleChange(item);
                      }}
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>
                <Divider />
              </Box>
            );
          })}
      </Paper>
      <Dialog
        open={openDeletToken}
        onClose={() => {
          setOpenDeletToken(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box component="img" sx={{ width: '6rem', height: '6rem' }} src="/icons/cluster/delete.svg" />
            <Typography fontFamily="mabry-bold" pt="1rem">
              Are you sure you want to delete this token?
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ display: 'flex', justifyContent: 'space-evenly', pb: '1.2rem' }}>
          <LoadingButton
            loading={deleteLoadingButton}
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
            onClick={() => {
              setOpenDeletToken(false);
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
            onClick={deletSubmit}
          >
            Delete
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
