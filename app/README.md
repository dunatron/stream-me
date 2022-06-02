# Stream-Me Next App

this project is a client side app supporting the strem-me typegraphql

## Section-1 Next.js Step 1 Project setup from scratch

- `mkdir app`
- `cd app`
- `npm init -y`
- `npm install react react-dom next`

edit the package.json file and remove te test script replacing with

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start"
}
```

create an empty `tsconfig.json` file

add typescript as a dev dependency

- `npm install --save-dev typescript`

add the typescript packages to supply our project with types for our already installed packages

- `npm install --save-dev @types/react @types/react-dom @types/node`

we can then get next to autogenerate our tsconfig file, but first we will need a pages directory

- `mkdir pages`
- `npm run start`

your tsconfig file will now be automatically generated as it was empty.  
While next does a good job at doing this we will make some changes.

in the `compilerOptions` object add the key value pair `"baseUrl": "."` also add `"moduleResolution": "node"`
This will allow us to reference files in our project using a relative file import and we will be able to reference the files from the root directory of the app folder

instead of:

```ts
import { Component } from "../../components/example";
```

We can simply right

```ts
import { Component } from "components/example";
```

another option to change is the `"strict": false` to true which is highly recommended
[see strict mode](https://nextjs.org/docs/api-reference/next.config.js/react-strict-mode)  
we will however be leaving it off. feel free to come back and turn it on. You will need to specify types on lifecycles however

### .gitignore

next we will setup our `.gitignore` this tells source controll to ignore certain files/directories from being commited/sent to source control.

create the file and make sure it has the below in it

```.gitignore
.env
node_modules
.DS_Store
.next
```

## Pages

Next.js allows us to serve pages from a uniqueue folder called `pages`.  
In react you would typically install react-router to handle routing, in next it is done by createing folders and files in the pages directory in a certain way

`pages/index.ts` is the Homepage for a next app

```tsx
export default () => (
  <div>
    <p>Hello World!</p>
  </div>
);
```

next run the command `npm run dev`
once it starts you can visit the site at `http://localhost:3000`

## App Component

Next.js uses the App component to initialize pages. You can override it and control the page initialization. Which allows you to do amazing things like:

- Persisting layout between page changes
- Keeping state when navigating pages
- Custom error handling using componentDidCatch
- Inject additional data into pages
- Add global CSS
  To override the default App, create the file `app/pages_app.tsx` as shown below:

```tsx
import App from "next/app";
import React from "react";

class MyApp extends App {
  public render() {
    const { Component, pageProps } = this.props;

    return <Component {...pageProps} />;
  }
}

export default MyApp;
```

We will actually start with something smaller that does the same job

```tsx
import App from "next/app";
import React from "react";

export default ({ Component, pageProps }) => <Component {...pageProps} />;
```

Note: you will need to stop and restart your development server.

## Section-1 Next.js Step 2 Custom Document

We will create a custom Document Component in order to augment our application style tags  
This is necesarry because next js will inject some style sheets into the Document Object Model(DOM) using this Custom Document  
To override create a new file called `pages/_document.tsx` in the pages folder

Instead of creating a functional component like we did in \_app.tsx we will create a class Component this time round

```tsx
import Document, {
  DocumentContext,
  DocumentInitialProps,
  Head,
  Html,
  Main,
  NextScript,
} from "next/document";

class MyDocument extends Document {
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<DocumentInitialProps> {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
```

Notes: `_document.tsx` work is all done server side so you cannot do any client side work here, e.g onClick or access to the window object etc

Now we can install A component library such as Material-UI to get started building our custom components

## Section-1 Step 3 Material UI

Material UI is a react component library for faster development. Developed from the ground up with the constraint of rendering on the server but it is up to us to make sure it is correctly integrated

[Next js rendering](https://nextjs.org/learn/foundations/how-nextjs-works/rendering)

To install make sure you are not running your server then npm install  
`npm install @mui/material @emotion/react @emotion/styled @emotion/server @emotion/cache`

once that has finished we will begin creating our light and dark themes.  
Create a new folder called lib and a file inside it called theme.ts `app/lib/theme.ts` we will begin by creating two themes, "themeDark" and "themeLight" and setting the palettes for them. We then export the two themes to use

```tsx
import { grey } from "@mui/material/colors";
import { createTheme } from "@mui/material/styles";

const themeDark = createTheme({
  palette: {
    primary: { main: grey[200] },
    secondary: { main: grey[400] },
    mode: "dark",
  },
});
const themeLight = createTheme({
  palette: {
    primary: { main: grey[800] },
    secondary: { main: grey[900] },
    mode: "light",
  },
});

export { themeDark, themeLight };
```

Next we will create a new file to setup the emotion css cache.
`app/lib/createEmotionCache.ts`

```tsx
import createCache from "@emotion/cache";

// prepend: true moves MUI styles to the top of the <head> so they're loaded first.
// It allows developers to easily override MUI styles with other styling solutions, like CSS modules.
export default function createEmotionCache() {
  return createCache({ key: "css", prepend: true });
}
```

We will then modify the `_document.tsx` and `_app.tsx` files in the pages directory to correctly integrate material with emotion. In the \_document.tsx file

`_document.tsx`

```tsx
import Document, {
  DocumentContext,
  DocumentInitialProps,
  Head,
  Html,
  Main,
  NextScript,
} from "next/document";
import createEmotionServer from "@emotion/server/create-instance";

import createEmotionCache from "lib/createEmotionCache";
import { themeDark } from "lib/theme";

const theme = themeDark;

interface CustomDocumentInitialProps extends DocumentInitialProps {
  emotionStyleTags: React.ReactElement[] | React.ReactFragment;
}

class MyDocument extends Document {
  // `getInitialProps` belongs to `_document` (instead of `_app`),
  // it's compatible with static-site generation (SSG).
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<CustomDocumentInitialProps> {
    // Resolution order
    //
    // On the server:
    // 1. app.getInitialProps
    // 2. page.getInitialProps
    // 3. document.getInitialProps
    // 4. app.render
    // 5. page.render
    // 6. document.render
    //
    // On the server with error:
    // 1. document.getInitialProps
    // 2. app.render
    // 3. page.render
    // 4. document.render
    //
    // On the client
    // 1. app.getInitialProps
    // 2. page.getInitialProps
    // 3. app.render
    // 4. page.render
    const originalRenderPage = ctx.renderPage;

    // You can consider sharing the same emotion cache between all the SSR requests to speed up performance.
    // However, be aware that it can have global side effects.
    const cache = createEmotionCache();
    const { extractCriticalToChunks } = createEmotionServer(cache);

    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: (App: any) =>
          function EnhanceApp(props) {
            return <App emotionCache={cache} {...props} />;
          },
      });

    const initialProps = await Document.getInitialProps(ctx);

    // This is important. It prevents emotion to render invalid HTML.
    // See https://github.com/mui/material-ui/issues/26561#issuecomment-855286153
    const emotionStyles = extractCriticalToChunks(initialProps.html);
    const emotionStyleTags = emotionStyles.styles.map((style) => (
      <style
        data-emotion={`${style.key} ${style.ids.join(" ")}`}
        key={style.key}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: style.css }}
      />
    ));

    return {
      ...initialProps,
      emotionStyleTags,
    };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          {/* PWA primary color */}
          <meta name="theme-color" content={theme.palette.primary.main} />
          <link rel="shortcut icon" href="/static/favicon.ico" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
          />
          {/* Inject MUI styles first to match with the prepend: true configuration. */}
          {(this.props as any).emotionStyleTags}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
```

`_app.tsx`

```tsx
import App from "next/app";
import React from "react";
import Head from "next/head";
import { AppProps } from "next/app";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { CacheProvider, EmotionCache } from "@emotion/react";
import { themeLight, themeDark } from "lib/theme";
import createEmotionCache from "lib/createEmotionCache";

const useDarkTheme = true;

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={useDarkTheme ? themeDark : themeLight}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </CacheProvider>
  );
}
```

Your css should now be loaded correctly server and client side and there should be no flicker. You can check by inspecting the network tab and refreshing. the page should have a dark background when checking the localhost preview on the network tab.  
Hint: try commenting this code out then reloaded to see the flicker

```tsx
{
  (this.props as any).emotionStyleTags;
}
```

## Section-1 Step 4 Linking Pages

next we will create a new page called about and import some material components and the `Link` component from next js. first modify the contents of
`pages/index.tsx`

```tsx
import { Container, Box, Typography, Button } from "@mui/material";
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
```

next create the about page which will be a copy of the index page but will take us to the home page instead

```tsx
import { Container, Box, Typography, Button } from "@mui/material";
import Link from "next/link";

export default function Index() {
  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Typography>Next.js Example</Typography>
        <Link href="/">
          <Button variant="contained" color="primary">
            Got to the index/home page
          </Button>
        </Link>
      </Box>
    </Container>
  );
}
```

This ends Section 1. Please see Section two in the main README
