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
        boxShadow: 'var(--card-box-shadow)',
        borderRadius: '0.8rem',
        transition: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 0,
        color: 'var(--palette-color)',
        backgroundImage: 'none',
        overflow: 'hidden',
      }}
      id={id}
      className={className}
    >
      {children}
    </Paper>
  );
};
export default Card;
