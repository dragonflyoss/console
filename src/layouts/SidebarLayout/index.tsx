import { FC, ReactNode } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

import Sidebar from './Sidebar';

interface SidebarLayoutProps {
  children?: ReactNode;
}

const SidebarLayout: FC<SidebarLayoutProps> = ({ children }) => {
  return (
    <>
      <Box
        sx={{
          flex: 1,
          height: '100%',
        }}
      >
        <Sidebar />
        <Box
          sx={{
            position: 'relative',
            zIndex: 5,
            display: 'block',
            flex: 1,
            ml: `250px`,
            pt: `100px`,
          }}
        >
          <Box display="block">{children}</Box>
        </Box>
      </Box>
    </>
  );
};

SidebarLayout.propTypes = {
  children: PropTypes.node,
};

export default SidebarLayout;
