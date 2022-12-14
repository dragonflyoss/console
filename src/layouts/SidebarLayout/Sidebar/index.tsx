// import { useContext } from 'react';
import Scrollbar from "../../../components/Scrollbar";
import { Box, Drawer, styled, Divider, useTheme, Button } from "@mui/material";
import SidebarMenu from "./SidebarMenu";

const SidebarWrapper = styled(Box)(
  ({ theme }) => `
        min-width: 250px;
        color: red;
        position: relative;
        z-index: 7;
        height: 100%;
        padding-bottom: 68px;
`
);

const Sidebar = () => {
  const theme = useTheme();

  return (
    <>
      <SidebarWrapper
        sx={{
          display: {
            xs: "none",
            lg: "inline-block",
          },
          position: "fixed",
          left: 0,
          top: 0,
          background: "#666",
        }}
      >
        <Scrollbar>
          <Box mt={3}>
            <Box
              mx={2}
              sx={{
                width: 52,
              }}
            ></Box>
          </Box>
          <Divider
            sx={{
              mt: theme.spacing(8),
              mx: theme.spacing(2),
              background: "pink",
            }}
          />
          <SidebarMenu />
        </Scrollbar>
      </SidebarWrapper>
    </>
  );
};

export default Sidebar;
