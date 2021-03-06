import { Container, Box, Typography, Button } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Link from "next/link";

export default function Index() {
  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Typography>Next.js Example</Typography>
        <Link href="/about">
          <Button variant="contained" color="primary">
            Got to the about page
          </Button>
        </Link>
      </Box>
    </Container>
  );
}
