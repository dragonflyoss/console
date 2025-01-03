import {
  Box,
  Breadcrumbs,
  IconButton,
  Skeleton,
  Typography,
  Button,
  Dialog,
  DialogContent,
  Tooltip,
  Snackbar,
  Alert,
  Link as RouterLink,
  Divider,
  Pagination,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { getTokens, deleteTokens, getTokensResponse } from '../../../lib/api';
import { formatDate, getPaginatedList, useQuery } from '../../../lib/utils';
import { useCopyToClipboard } from 'react-use';
import { Link, useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../../lib/constants';
import { CancelLoadingButton, DeleteLoadingButton } from '../../loading-button';
import Card from '../../card';
import styles from './index.module.css';

export default function PersonalAccessTokens() {
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
        setIsLoading(true);

        const token = await getTokens({ page: 1, per_page: MAX_PAGE_SIZE });

        setToken(token);
        setIsLoading(false);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
          setIsLoading(false);
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
    setIsLoading(true);

    try {
      await deleteTokens(tokenSelectedID);
      setDeleteLoadingButton(false);

      const token = await getTokens({ page: 1, per_page: MAX_PAGE_SIZE });

      setToken(token);
      setIsLoading(false);

      setSuccessMessage(true);
      setOpenDeletToken(false);
    } catch (error) {
      if (error instanceof Error) {
        setIsLoading(false);
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
      <Breadcrumbs
        separator={
          <Box
            sx={{ width: '0.3rem', height: '0.3rem', backgroundColor: '#919EAB', borderRadius: '50%', m: '0 0.4rem' }}
          />
        }
        aria-label="breadcrumb"
        sx={{ mb: '1rem' }}
      >
        <Typography color="#1C293A">developer</Typography>
        <Typography color="inherit">personal access tokens</Typography>
      </Breadcrumbs>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Typography variant="h5">Personal access tokens</Typography>
        <Button
          size="small"
          sx={{
            '&.MuiButton-root': {
              backgroundColor: 'var(--button-color)',
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
      <Typography variant="subtitle2" mb="1.5rem" mt="1rem" color="var(--text---palette-text-secondary)">
        Tokens you have generated that can be used to access the Dragonfly API.
      </Typography>
      {showCopyColumn ? (
        <Card id="copy-column" className={styles.copyToken}>
          <Typography variant="body2" mr="0.4rem">
            {newToken || ''}
          </Typography>
          <IconButton
            id="copy-button"
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
        </Card>
      ) : (
        <></>
      )}
      {isLoading ? (
        <Card>
          <Box sx={{ display: 'flex', p: '0.8rem', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: '0.4rem' }}>
                <Skeleton data-testid="isloading" sx={{ fontSize: '0.8rem' }} width="6rem" />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" component="span">
                  <Skeleton data-testid="isloading" width="8rem" />
                </Typography>
              </Box>
            </Box>
            <Box>
              <Skeleton data-testid="isloading" width="4.5rem" height="3.2rem" />
            </Box>
          </Box>
        </Card>
      ) : allTokens.length === 0 ? (
        <Card className={styles.noData}>
          <Box component="img" className={styles.nodataIcon} src="/icons/cluster/scheduler/ic-content.svg" />
          <Typography id="no-scheduler" variant="h6" className={styles.nodataText}>
            You don't have any tokens.
          </Typography>
        </Card>
      ) : (
        <Card id="tokens-list">
          {Array.isArray(allTokens) &&
            allTokens.map((item, index) => {
              return index !== allTokens.length - 1 ? (
                <Box key={item.id}>
                  <Box
                    sx={{ display: 'flex', p: '0.8rem 1.5rem', justifyContent: 'space-between', alignItems: 'center' }}
                  >
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
                        <Typography id={`user-name-${item.id}`} variant="body2">
                          &nbsp;—&nbsp;{item?.user?.name}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" component="span" fontFamily="mabry-bold">
                          Expires on&nbsp;
                        </Typography>
                        <Typography id={`expired-at-${item?.id}`} variant="body2" component="span">
                          {formatDate(item?.expired_at) || ''}.
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Button
                        size="small"
                        id={`delete-token-${item?.id}`}
                        sx={{
                          '&.MuiButton-root': {
                            backgroundColor: 'var(--button-color)',
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
                  <Divider
                    sx={{
                      borderStyle: 'dashed',
                      borderColor: 'var(--palette-divider)',
                      borderWidth: '0px 0px thin',
                    }}
                  />
                </Box>
              ) : (
                <Box key={item.id}>
                  <Box
                    sx={{ display: 'flex', p: '0.8rem 1.5rem', justifyContent: 'space-between', alignItems: 'center' }}
                  >
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
                        <Typography id={`user-name-${item.id}`} variant="body2">
                          &nbsp;—&nbsp;{item?.user?.name}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" component="span" fontFamily="mabry-bold">
                          Expires on&nbsp;
                        </Typography>
                        <Typography id={`expired-at-${item?.id}`} variant="body2" component="span">
                          {formatDate(item?.expired_at) || ''}.
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Button
                        size="small"
                        id={`delete-token-${item?.id}`}
                        sx={{
                          '&.MuiButton-root': {
                            backgroundColor: 'var(--button-color)',
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
        </Card>
      )}
      {tokensTotalPages > 1 ? (
        <Box display="flex" justifyContent="flex-end" sx={{ marginTop: '1rem' }}>
          <Pagination
            id="tokens-pagination"
            count={tokensTotalPages}
            page={tokensPage}
            onChange={(_event: any, newPage: number) => {
              setTokensPage(newPage);
              navigate(`/developer/personal-access-tokens${newPage > 1 ? `?page=${newPage}` : ''}`);
            }}
            sx={{
              '& .Mui-selected': {
                backgroundColor: 'var(--button-color)!important',
                color: '#FFF',
              },
            }}
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: '1.2rem' }}>
            <CancelLoadingButton
              id="cancel"
              loading={deleteLoadingButton}
              onClick={() => {
                setOpenDeletToken(false);
              }}
            />
            <DeleteLoadingButton
              loading={deleteLoadingButton}
              endIcon={<DeleteIcon />}
              id="delete"
              text="Delete"
              onClick={handleDeleteToken}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
