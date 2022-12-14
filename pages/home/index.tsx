import Link from "next/link";
import { Box, Button, Typography } from "@mui/material";
import Layout from "../../src/layouts/SidebarLayout";

const HomePage = () => {
  return (
    <Layout>
      <div>
        <h3>home page</h3>
        <Button href="/about" size="large" variant="contained">
          About
        </Button>
      </div>
    </Layout>
  );
};

export default HomePage;
