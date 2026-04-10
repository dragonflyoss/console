import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputBase,
  Paper,
  Tooltip,
  Snackbar,
  Pagination,
} from '@mui/material';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useCopyToClipboard } from 'react-use';
import { ReactComponent as LinkIcon } from '../../assets/images/cluster/hostnames.svg';
import { ReactComponent as CopyIcon } from '../../assets/images/tokens/copy.svg';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import styles from './urls-dialog.module.css';

interface UrlsDialogProps {
  open: boolean;
  onClose: () => void;
  urls: string[];
  title?: string;
}

interface DomainGroup {
  domain: string;
  urls: string[];
  originalUrls: string[];
  isExpanded: boolean;
}

const ITEMS_PER_PAGE = 5;

function extractDomain(url: string): string {
  try {
    let urlToParse = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      urlToParse = 'http://' + url;
    }
    const urlObj = new URL(urlToParse);
    return urlObj.hostname || 'other';
  } catch {
    return 'other';
  }
}

function groupUrlsByDomain(urls: string[]): DomainGroup[] {
  const groupsMap = new Map<string, DomainGroup>();

  urls.forEach((url) => {
    const domain = extractDomain(url);
    const existing = groupsMap.get(domain);
    if (existing) {
      existing.urls.push(url);
      existing.originalUrls.push(url);
    } else {
      groupsMap.set(domain, {
        domain,
        urls: [url],
        originalUrls: [url],
        isExpanded: true,
      });
    }
  });

  return Array.from(groupsMap.values()).sort((a, b) => {
    if (a.domain === 'other') return 1;
    if (b.domain === 'other') return -1;
    return a.domain.localeCompare(b.domain);
  });
}

export default function UrlsDialog({ open, onClose, urls, title = 'URLs' }: UrlsDialogProps) {
  const [, setCopyToClipboard] = useCopyToClipboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());

  useEffect(() => {
    setExpandedDomains(new Set(urls.map(extractDomain)));
  }, [urls]);

  const filteredUrls = useMemo(() => {
    if (!searchQuery.trim()) return urls;
    const query = searchQuery.toLowerCase();
    return urls.filter((url) => url.toLowerCase().includes(query));
  }, [urls, searchQuery]);

  const groupedUrls = useMemo(() => {
    const groups = groupUrlsByDomain(filteredUrls);
    return groups.map((group) => ({
      ...group,
      isExpanded: expandedDomains.has(group.domain),
    }));
  }, [filteredUrls, expandedDomains]);

  const flattenedUrls = useMemo(() => {
    const result: { url: string; domain: string }[] = [];
    groupedUrls.forEach((group) => {
      if (group.isExpanded) {
        group.urls.forEach((url) => {
          result.push({ url, domain: group.domain });
        });
      }
    });
    return result;
  }, [groupedUrls]);

  const paginatedUrls = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return flattenedUrls.slice(startIndex, endIndex);
  }, [flattenedUrls, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(flattenedUrls.length / ITEMS_PER_PAGE) || 1;
  }, [flattenedUrls.length]);

  const getGlobalIndex = useCallback(
    (url: string) => {
      const index = flattenedUrls.findIndex((item) => item.url === url);
      return index + 1;
    },
    [flattenedUrls],
  );

  const toggleDomain = useCallback((domain: string) => {
    setExpandedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) {
        next.delete(domain);
      } else {
        next.add(domain);
      }
      return next;
    });
  }, []);

  const copyUrl = useCallback(
    (url: string) => {
      setCopyToClipboard(url);
      setToastMessage('URL copied');
      setToastOpen(true);
    },
    [setCopyToClipboard],
  );

  const copyDomainGroup = useCallback(
    (domain: string) => {
      const group = groupedUrls.find((g) => g.domain === domain);
      if (group) {
        setCopyToClipboard(group.originalUrls.join('\n'));
        setToastMessage(`${group.urls.length} URLs from ${domain} copied`);
        setToastOpen(true);
      }
    },
    [groupedUrls, setCopyToClipboard],
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleClose = useCallback(() => {
    setSearchQuery('');
    setCurrentPage(1);
    onClose();
  }, [onClose]);

  const renderDomainHeader = (group: DomainGroup) => (
    <Box
      className={styles.domainHeader}
      data-testid="domain-header"
      data-domain={group.domain}
      onClick={() => toggleDomain(group.domain)}
    >
      <Box className={styles.domainInfo}>
        <Box className={`${styles.domainExpand} ${group.isExpanded ? styles.expanded : ''}`}>
          <KeyboardArrowRightIcon />
        </Box>
        <Paper elevation={0} className={styles.domainName}>
          {group.domain}
        </Paper>
        <Typography className={styles.domainCount}>{group.urls.length} URLs</Typography>
      </Box>
      <Box className={styles.domainHeaderActions}>
        <Tooltip title="Copy all in group" placement="top">
          <IconButton
            className={styles.iconButton}
            onClick={(e) => {
              e.stopPropagation();
              copyDomainGroup(group.domain);
            }}
          >
            <CopyIcon className={styles.iconButtonIcon} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  const renderUrlItem = (url: string) => {
    const globalIndex = getGlobalIndex(url);

    return (
      <Box key={url} className={styles.urlItem}>
        <Box className={styles.urlIndex}>{globalIndex}</Box>
        <Box className={styles.urlContent} onClick={(e) => e.stopPropagation()}>
          <Typography className={styles.urlText}>{url}</Typography>
          <Box className={styles.urlActions}>
            <Tooltip title="Copy link" placement="top">
              <IconButton
                className={styles.actionButton}
                onClick={(e) => {
                  e.stopPropagation();
                  copyUrl(url);
                }}
              >
                <CopyIcon className={styles.actionButtonIcon} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <>
      <Dialog
        maxWidth="lg"
        fullWidth
        open={open}
        onClose={handleClose}
        classes={{ paper: styles.dialogPaper, root: styles.dialog }}
      >
        <DialogTitle className={styles.dialogTitle}>
          <Box className={styles.dialogHeader}>
            <Box className={styles.headerLeft}>
              <Box className={styles.headerIconWrapper}>
                <LinkIcon className={styles.headerIcon} />
              </Box>
              <Box className={styles.headerTitleGroup}>
                <Typography className={styles.headerTitle}>{title}</Typography>
              </Box>
            </Box>
            <Box className={styles.headerActions}>
              <IconButton className={styles.closeButton} onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        <Box className={styles.searchBar}>
          <Box className={styles.searchInputWrapper}>
            <SearchIcon className={styles.searchIcon} />
            <InputBase
              placeholder="Search URL or domain..."
              value={searchQuery}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
          </Box>
        </Box>

        <DialogContent classes={{ root: styles.dialogContent }}>
          {paginatedUrls.length === 0 ? (
            <Box className={styles.emptyState}>
              <Typography className={styles.emptyStateText}>No data</Typography>
            </Box>
          ) : (
            groupedUrls
              .filter((group) => paginatedUrls.some((item) => item.domain === group.domain))
              .map((group) => {
                const groupUrlsInPage = paginatedUrls.filter((item) => item.domain === group.domain);

                return (
                  <Box key={group.domain} className={styles.domainGroup}>
                    {renderDomainHeader(group)}
                    {group.isExpanded && (
                      <Box className={styles.domainUrls}>{groupUrlsInPage.map(({ url }) => renderUrlItem(url))}</Box>
                    )}
                  </Box>
                );
              })
          )}
        </DialogContent>

        {totalPages > 1 && (
          <Box className={styles.pagination}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(_event, newPage) => setCurrentPage(newPage)}
              color="primary"
              size="small"
            />
          </Box>
        )}
      </Dialog>

      <Snackbar
        open={toastOpen}
        autoHideDuration={2000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={toastMessage}
        className={styles.toast}
      />
    </>
  );
}
