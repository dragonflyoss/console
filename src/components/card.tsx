import { Paper } from '@mui/material';
import { MouseEventHandler, ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  id?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

const Card: React.FC<CardProps> = ({ children, className, id, onClick }) => {
  return (
    <Paper
      sx={{
        backgroundColor: 'var(--palette-background-paper)',
        boxShadow: 'var(--palette-card-box-shadow)',
        borderRadius: '0.6rem',
        transition: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 0,
        color: 'var(--palette-color)',
        backgroundImage: 'none',
        overflow: 'hidden',
      }}
      id={id}
      className={className}
      onClick={onClick}
    >
      {children}
    </Paper>
  );
};
export default Card;
