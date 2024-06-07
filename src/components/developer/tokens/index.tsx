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
  Pagination,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { getTokens, deleteTokens, getTokensResponse } from '../../../lib/api';
import { formatDate, getPaginatedList, useQuery } from '../../../lib/utils';
import { useCopyToClipboard } from 'react-use';
import { LoadingButton } from '@mui/lab';
import { Link, useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../lib/constants';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1C293A',
    },
  },
  typography: {
    fontFamily: 'mabry-light,sans-serif',
  },
});

export default function PersonalAccessTokens() {
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [isLoding, setIsLoding] = useState(false);
  const [openDeletToken, setOpenDeletToken] = useState(false);
  const [deleteLoadingButton, setDeleteLoadingButton] = useState(false);
  const [tokenSelectedID, setTokenSelectedID] = useState('');
  const [tokensPage, setTokensPage] = useState(1);
  const [tokensTotalPages, setTokensTotalPages] = useState<number>(1);
  const [showCopyColumn, setShowCopyColumn] = useState(false);
  const [showCopyIcon, setShowCopyIcon] = useState(false);
  const [newToken, setNewToken] = useState('');
  const [, setCopyToClipboard] = useCopyToClipboard();
  const [token, setToken] = useState<getTokensResponse[]>([]);
  const [allTokens, setAllTokens] = useState<getTokensResponse[]>([]);

  const navigate = useNavigate();
  const query = useQuery();
  const page = query.get('page') ? parseInt(query.get('page') as string, 10) || 1 : 1;

  useEffect(() => {
    const token = localStorage.getItem('token');
    setTokensPage(page);

    if (token) {
      const newToken = JSON.parse(token);
      setNewToken(newToken);
      setShowCopyColumn(true);
      localStorage.removeItem('token');
    }

    (async function () {
      try {
        setIsLoding(true);

        const token = await getTokens({ page: 1, per_page: MAX_PAGE_SIZE });

        setToken(token);
        setIsLoding(false);
      } catch (error) {
        if (error instanceof Error) {
          setIsLoding(false);
          setErrorMessage(true);
          setErrorMessageText(error.message);
        }
      }
    })();
  }, [page]);

  useEffect(() => {
    if (Array.isArray(token) && token.length >= 1) {
      token.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const totalPage = Math.ceil(token.length / DEFAULT_PAGE_SIZE);
      const currentPageData = getPaginatedList(token, tokensPage, DEFAULT_PAGE_SIZE);

      if (currentPageData.length === 0 && tokensPage > 1) {
        setTokensPage(tokensPage - 1);
      }

      setTokensTotalPages(totalPage || 1);
      setAllTokens(currentPageData);
    } else {
      setTokensTotalPages(1);
      setAllTokens([]);
    }
  }, [token, tokensPage]);

  const handleDeleteClose = async (row: any) => {
    setOpenDeletToken(true);
    setTokenSelectedID(row.id);
  };

  const handleDeleteToken = async () => {
    setDeleteLoadingButton(true);

    try {
      await deleteTokens(tokenSelectedID);
      setDeleteLoadingButton(false);
      setSuccessMessage(true);
      setOpenDeletToken(false);

      const token = await getTokens({ page: 1, per_page: MAX_PAGE_SIZE });

      setToken(token);
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
    setCopyToClipboard(newToken);
    setShowCopyIcon(true);

    setTimeout(() => {
      setShowCopyIcon(false);
    }, 1000);
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
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: '1rem' }}>
        <Typography color="inherit">developer</Typography>
        <Typography color="text.primary">personal access tokens</Typography>
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
      {showCopyColumn ? (
        <Box
          sx={{
            display: 'flex',
            p: '0.8rem',
            alignItems: 'center',
            backgroundColor: 'rgba(108,198,68,.1)',
            mb: '1rem',
          }}
        >
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
            {showCopyIcon ? (
              <Tooltip
                placement="top"
                PopperProps={{
                  disablePortal: true,
                }}
                open={showCopyIcon}
                disableFocusListener
                disableHoverListener
                disableTouchListener
                title="copied!"
              >
                <Box
                  component="img"
                  id="done"
                  sx={{ width: '1.2rem', height: '1.2rem' }}
                  src="/icons/tokens/done.svg"
                />
              </Tooltip>
            ) : (
              <Box component="img" id="copy" sx={{ width: '1.2rem', height: '1.2rem' }} src="/icons/tokens/copy.svg" />
            )}
          </IconButton>
        </Box>
      ) : (
        <></>
      )}
      {isLoding ? (
        <Paper variant="outlined" id="tokens-list">
          <Box sx={{ display: 'flex', p: '0.8rem', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: '0.4rem' }}>
                <Skeleton sx={{ fontSize: '0.8rem' }} width="6rem" />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" component="span">
                  <Skeleton width="8rem" />
                </Typography>
              </Box>
            </Box>
            <Box>
              <Skeleton width="4.5rem" height="3.2rem" />
            </Box>
          </Box>
        </Paper>
      ) : allTokens.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{ height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          You don't have any tokens.
        </Paper>
      ) : (
        <Paper variant="outlined" id="tokens-list">
          {Array.isArray(allTokens) &&
            allTokens.map((item, index) => {
              return index !== allTokens.length - 1 ? (
                <Box key={item.id}>
                  <Box sx={{ display: 'flex', p: '0.8rem', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: '0.4rem' }}>
                        <RouterLink
                          id={item.name}
                          component={Link}
                          to={`/developer/personal-access-tokens/${item?.id}`}
                          underline="hover"
                          sx={{ color: 'var(--description-color)' }}
                        >
                          {item.name}
                        </RouterLink>
                        <Typography variant="body2">&nbsp;—&nbsp;{item?.user?.name}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" component="span" fontFamily="mabry-bold">
                          Expires on&nbsp;
                        </Typography>
                        <Typography variant="body2" component="span">
                          {formatDate(item?.expired_at) || ''}.
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Button
                        size="small"
                        id="delete-token"
                        sx={{
                          '&.MuiButton-root': {
                            backgroundColor: 'var(--button-color)',
                            borderRadius: 0,
                            color: '#fff',
                          },
                        }}
                        variant="contained"
                        onClick={() => {
                          handleDeleteClose(item);
                        }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>
                  <Divider />
                </Box>
              ) : (
                <Box key={item.id}>
                  <Box sx={{ display: 'flex', p: '0.8rem', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: '0.4rem' }}>
                        <RouterLink
                          id={item.name}
                          component={Link}
                          to={`/developer/personal-access-tokens/${item?.id}`}
                          underline="hover"
                          sx={{ color: 'var(--description-color)' }}
                        >
                          {item.name}
                        </RouterLink>
                        <Typography variant="body2">&nbsp;—&nbsp;{item?.user?.name}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" component="span" fontFamily="mabry-bold">
                          Expires on&nbsp;
                        </Typography>
                        <Typography variant="body2" component="span">
                          {formatDate(item?.expired_at) || ''}.
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Button
                        size="small"
                        id="delete-token"
                        sx={{
                          '&.MuiButton-root': {
                            backgroundColor: 'var(--button-color)',
                            borderRadius: 0,
                            color: '#fff',
                          },
                        }}
                        variant="contained"
                        onClick={() => {
                          handleDeleteClose(item);
                        }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>
                </Box>
              );
            })}
        </Paper>
      )}
      {tokensTotalPages > 1 ? (
        <Box display="flex" justifyContent="flex-end" sx={{ marginTop: theme.spacing(2) }}>
          <Pagination
            id="tokens-pagination"
            count={tokensTotalPages}
            page={tokensPage}
            onChange={(_event: any, newPage: number) => {
              setTokensPage(newPage);
              navigate(`/developer/personal-access-tokens${newPage > 1 ? `?page=${newPage}` : ''}`);
            }}
            color="primary"
            size="small"
          />
        </Box>
      ) : (
        <></>
      )}
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
            id="cancel"
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
            id="delete"
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
            onClick={handleDeleteToken}
          >
            Delete
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
