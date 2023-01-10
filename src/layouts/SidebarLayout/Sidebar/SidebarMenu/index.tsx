import { useEffect } from 'react';
import { Box, styled, Button } from '@mui/material';
import NextLink from 'next/link';
import BrightnessLowTwoToneIcon from '@mui/icons-material/BrightnessLowTwoTone';
import MmsTwoToneIcon from '@mui/icons-material/MmsTwoTone';

const MenuWrapper = styled(Box)(
  `
  .MuiButton-root {
    display: flex;
    color: #fff;
    background-color: transparent;
    width: 100%;
    justify-content: flex-start;
    padding: 20px;

    .MuiButton-text{
      color:red;
    }
    .MuiButton-startIcon,
    .MuiButton-endIcon {
      .MuiSvgIcon-root {
        font-size: inherit;
        transition: none;
      }
      &:hover {
        background-color: pink;
        color: #fff;

        .MuiButton-startIcon,
        .MuiButton-endIcon {
          color: #000;
        }
      }

    }
  }
    `,
);

const SidebarMenu = () => {
  // const router = useRouter();
  // const currentRoute = router.pathname;
  // useEffect(() => {
  //   console.log(currentRoute, 'currentRoute');
  // }, []);

  return (
    <>
      <MenuWrapper>
        <Box>
          <NextLink href="/home">
            <Button
              variant="outlined"
              startIcon={<BrightnessLowTwoToneIcon />}
              // className={currentRoute === "/home" ? "active" : ""}
            >
              home
            </Button>
          </NextLink>
        </Box>
        <Box>
          <NextLink href="/about" passHref>
            <Button
              variant="outlined"
              startIcon={<MmsTwoToneIcon />}
              // className={currentRoute === "/about" ? "active" : ""}
            >
              about
            </Button>
          </NextLink>
        </Box>
      </MenuWrapper>
    </>
  );
};

export default SidebarMenu;
