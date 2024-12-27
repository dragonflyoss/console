import { Paper } from '@mui/material';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

const Card: React.FC<CardProps> = ({ children, className, id }) => {
  return (
    <Paper
      sx={{
        backgroundColor: 'var(--palette-background-paper)',
        boxShadow: 'rgba(145, 158, 171, 0.3) 0px 0px 2px 0px, rgba(145, 158, 171, 0.2) 0px 2px 24px -4px',
        borderRadius: '0.8rem',
        transition: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 0,
      }}
      id={id}
      className={className}
    >
      {children}
    </Paper>
  );
};
export default Card;
