import { Container, Box, Typography, Button } from "@mui/material";
import Link from "next/link";

export default function Index() {
  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Typography>Next.js Example</Typography>
        <Link href="/">
          <Button variant="contained" color="primary">
            Got to the index page
          </Button>
        </Link>
      </Box>
    </Container>
  );
}
