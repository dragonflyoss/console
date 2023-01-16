// import { useContext } from 'react';
import Scrollbar from '../../../components/Scrollbar';
import { Box, styled, Divider } from '@mui/material';
import SidebarMenu from './SidebarMenu';

const SidebarWrapper = styled(Box)(
  ({}) => `
        min-width: 250px;
        color: red;
        position: relative;
        z-index: 7;
        height: 100%;
        padding-bottom: 68px;
`,
);

const Sidebar = () => {
  return (
    <>
      <SidebarWrapper
        sx={{
          display: {
            xs: 'none',
            lg: 'inline-block',
          },
          position: 'fixed',
          left: 0,
          top: 0,
          background: '#666',
        }}
      >
        <Scrollbar>
          <Box mt={3}>
            <Box mx={2}></Box>
          </Box>
          <Divider
            sx={{
              marginTop: 2,
              mx: 1,
              background: 'pink',
            }}
          />
          <SidebarMenu />
        </Scrollbar>
      </SidebarWrapper>
    </>
  );
};

export default Sidebar;
