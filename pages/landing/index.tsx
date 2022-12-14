import { Box, Button, Typography, styled } from "@mui/material";
import Link from "next/link";

const LandingPage = () => {
  return (
    <>
      <Box sx={{ margin: "20rem" }}>
        <Typography variant="h3">Dragonfly-console</Typography>
        <Typography variant="h5">
          <Link href="/home">login succeeded</Link>
        </Typography>
      </Box>
    </>
  );
};

export default LandingPage;
