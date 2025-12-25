import { Alert, Snackbar } from '@mui/material';
import GlobalAlertPortal from './GlobalAlertPortal';

interface ErrorHandlerProps {
  errorMessage: boolean;
  errorMessageText: string;
  onClose: (event: any, reason?: string) => void;
}

const ErrorHandler = ({ errorMessage, errorMessageText, onClose }: ErrorHandlerProps) => {
  return (
    <GlobalAlertPortal>
      <Snackbar
        open={errorMessage}
        autoHideDuration={3000}
        onClose={onClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ 
          pointerEvents: 'auto',
          zIndex: 9999,
        }}
      >
        <Alert 
          onClose={onClose} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {errorMessageText}
        </Alert>
      </Snackbar>
    </GlobalAlertPortal>
  );
};

export default ErrorHandler;
