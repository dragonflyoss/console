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
import { ReactComponent as Done } from '../../../assets/images/tokens/done.svg';
import { ReactComponent as Copy } from '../../../assets/images/tokens/copy.svg';
import { ReactComponent as IcContent } from '../../../assets/images/cluster/scheduler/ic-content.svg';
import { ReactComponent as Delete } from '../../../assets/images/cluster/delete.svg';
import ErrorHandler from '../../error-handler';

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
    setShowCopyIcon(true);
    setCopyToClipboard(newToken);

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
      <ErrorHandler errorMessage={errorMessage} errorMessageText={errorMessageText} onClose={handleClose} />
      <Box className={styles.titleContainer}>
        <Typography variant="h5" id="token-title">
          Personal access tokens
        </Typography>
        <Button
          id="new-tokens-button"
          size="small"
          sx={{
            background: 'var(--palette-button-color)',
            color: 'var(--palette-button-text-color)',
            ':hover': { backgroundColor: 'var(--palette-hover-button-text-color)' },
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
      <Breadcrumbs separator={<Box className={styles.breadcrumbs} />} aria-label="breadcrumb" sx={{ mb: '1rem' }}>
        <Typography color="text.primary">Developer</Typography>
        <Typography color="inherit">Personal access tokens</Typography>
      </Breadcrumbs>
      <Typography variant="body2" mb="1.5rem" mt="1rem" color="var(--palette-text-palette-text-secondary)">
        Tokens you have generated that can be used to access the Dragonfly API.
      </Typography>
      {showCopyColumn && (
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
                <Done id="done" className={styles.copyIcon} />
              </Tooltip>
            ) : (
              <Copy id="copy" className={styles.copyIcon} />
            )}
          </IconButton>
        </Card>
      )}
      {isLoading ? (
        <Card>
          <Box className={styles.tokenWrapper}>
            <Box>
              <Box className={styles.tokenNameWrapper}>
                <Skeleton data-testid="isloading" sx={{ fontSize: '0.8rem' }} width="6rem" />
              </Box>
              <Box className={styles.tokenExpires}>
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
          <IcContent className={styles.nodataIcon} />
          <Typography id="no-tokens" variant="h6" className={styles.nodataText}>
            You don't have any tokens.
          </Typography>
        </Card>
      ) : (
        <Card id="tokens-list">
          {Array.isArray(allTokens) &&
            allTokens.map((item, index) => {
              return (
                <Box key={item.id}>
                  <Box className={styles.tokenWrapper}>
                    <Box>
                      <Box className={styles.tokenNameWrapper}>
                        <RouterLink
                          id={item.name}
                          component={Link}
                          to={`/developer/personal-access-tokens/${item?.id}`}
                          underline="hover"
                          className={styles.tokenName}
                        >
                          {item.name}
                        </RouterLink>
                        <Typography id={`user-name-${item.id}`} variant="body2">
                          &nbsp;—&nbsp;{item?.user?.name}
                        </Typography>
                      </Box>
                      <Box className={styles.tokenExpires}>
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
                          background: 'var(--palette-button-color)',
                          color: 'var(--palette-button-text-color)',
                          ':hover': { backgroundColor: 'var(--palette-hover-button-text-color)' },
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
                  {index !== allTokens.length - 1 && (
                    <Divider
                      sx={{
                        borderStyle: 'dashed',
                        borderColor: 'var(--palette-palette-divider)',
                        borderWidth: '0px 0px thin',
                      }}
                    />
                  )}
                </Box>
              );
            })}
        </Card>
      )}
      {tokensTotalPages > 1 && (
        <Box className={styles.pagination}>
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
          <Box className={styles.deleteDialogTitle}>
            <Delete className={styles.deleteIcon} />
            <Typography fontFamily="mabry-bold" pt="1rem">
              Are you sure you want to delete this token?
            </Typography>
          </Box>
          <Box className={styles.buttonWrapper}>
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
