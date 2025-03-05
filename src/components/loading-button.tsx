import React from 'react';
import { LoadingButton } from '@mui/lab';
import CancelIcon from '@mui/icons-material/Cancel';
import { ButtonProps } from '@mui/material/Button';

interface cancelLoadingButtonProps extends ButtonProps {
  loading: boolean;
  onClick: any;
  id: string;
}

export const CancelLoadingButton: React.FC<cancelLoadingButtonProps> = ({ loading, onClick, id, ...rest }) => (
  <LoadingButton
    loading={loading}
    endIcon={<CancelIcon sx={{ color: 'var(--palette-secondary-dark)' }} />}
    size="small"
    variant="outlined"
    type="reset"
    loadingPosition="end"
    id={id}
    sx={{
      '&.MuiLoadingButton-root': {
        color: 'var(--palette-secondary-dark)',
        borderColor: 'var(--palette-secondary-dark)',
        backgroundColor: 'var(--palette--calcel-background-color)',
      },
      ':hover': {
        backgroundColor: 'var(--palette--calcel-hover-corlor)',
        borderColor: 'var(--palette-secondary-dark)',
      },
      '&.MuiLoadingButton-loading': {
        backgroundColor: 'var(--palette--button-loading-color)',
        color: 'var(--palette--button-loading-size-color)',
      },
      mr: '1rem',
      width: '7rem',
    }}
    onClick={onClick}
    {...rest}
  >
    Cancel
  </LoadingButton>
);

interface saveLoadingButtonProps {
  loading: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  id: string;
  endIcon?: React.ReactNode;
  text: string;
}

export const SavelLoadingButton: React.FC<saveLoadingButtonProps> = ({
  loading,
  onClick,
  id,
  endIcon,
  text,
  ...rest
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <LoadingButton
      loading={loading}
      endIcon={endIcon}
      size="small"
      variant="outlined"
      type="submit"
      loadingPosition="end"
      id={id}
      sx={{
        '&.MuiLoadingButton-root': {
          background: 'var(--palette--button-color)',
          color: 'var(--palette--button-text-color)',
          borderColor: 'var(--palette--button-color)',
        },
        ':hover': {
          backgroundColor: 'var(--palette--hover-button-text-color)',
          borderColor: 'var(--palette--hover-button-text-color)',
        },
        '&.MuiLoadingButton-loading': {
          backgroundColor: 'var(--palette--button-loading-color)',
          color: 'var(--palette--button-loading-size-color)',
          borderColor: 'var(--palette--button-loading-color)',
        },
        width: '7rem',
      }}
      onClick={handleClick}
      {...rest}
    >
      {text}
    </LoadingButton>
  );
};

export const DeleteLoadingButton: React.FC<saveLoadingButtonProps> = ({
  loading,
  onClick,
  id,
  endIcon,
  text,
  ...rest
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <LoadingButton
      loading={loading}
      endIcon={endIcon}
      size="small"
      variant="outlined"
      type="submit"
      loadingPosition="end"
      id={id}
      sx={{
        '&.MuiLoadingButton-root': {
          backgroundColor: 'var(--palette--delete-button-color)',
          color: 'var(--palette-common-white)',
          borderColor: 'var(--palette--delete-button-color)',
        },
        ':hover': {
          backgroundColor: 'var(--palette--delete-button-hover-color)',
          borderColor: 'var(--palette--delete-button-hover-color)',
        },
        '&.MuiLoadingButton-loading': {
          backgroundColor: 'var(--palette--delete-button-color)',

          borderColor: 'var(--palette--delete-button-color)',
        },
        width: '7rem',
      }}
      onClick={handleClick}
      {...rest}
    >
      {text}
    </LoadingButton>
  );
};
