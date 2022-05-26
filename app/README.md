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

## Section-1 Next.js Step 1 Project setup from scratch
