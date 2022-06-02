# Description

Welcome to Strongly Typed Next.js!

Next.js gives you the best developer experience with all the features you need for production: hybrid static & server rendering, TypeScript support, smart bundling, route pre-fetching, and more. No config needed.

`Course highlights:`

- Create a full stack GraphQL API and web client

- User authentication with the React Context API

- Style JSX components with Material UI themes

- Build a monorepo server with yarn workspaces

`What is a monorepo`
This is a big deal but may be overwhelming to start off with. Please do read and perhaps have a re-read later
read all about it here [What is monorepo? (and should you use it?)](https://semaphoreci.com/blog/what-is-monorepo)

`How long is this course?`

The entire course should take between two to four weeks to complete.

By the end, you'll have plenty of new skills for building full stack web applications.

`What are we building?`

We are building a simple streaming service called "Stream-me"

Our app will feature the following functionality:

Users can login or signup and create streams.

Dark mode switch to dim the lights.

Embed music, videos or social media content.

Share streaming content with embedded links.

We are not building a "live streaming" service like twitch.

We are building a service which supports sharing embedded post content.

`Pre-requisites`

Before we dive into the implementation, here are a few things you’ll need to follow along.

Node 6 or higher

Yarn

NPM

Basic Knowledge of GraphQL and Node.js

Who this course is for:
Developers looking to learn GraphQL
Developers looking to learn NextJS

GIT knowledge to navigate this tutorial

## How to use

The course covers off a few sections

- Section 1 Next.js
- Section 2 TypeGraphQL
- Section 3 Typegoose
- Section 4 Apollo Server
- Section 5 Apollo Client
- Section 6 Authentication
- Section 7 Streaming
- Section 8 Deployment

Each section will tell you what you need to do and can have various steps as branches you can dive into to see the code at that point in time

# Section 1 Next.js

To start off navigate to the `app/README.md` file where we will kick things off for this section

# Section 2 TypeGraphQL

In this section we will build a GraphQL API server with MongoDB as our Database  
We Will Also use TypeGraphQL with Typegoose.  
TypeGraphQl will be primarily responsible for helping us define our database and our schema.  
Typegoose will allow us to define Mongoose models using Typescript classes

The strength of using these two together is that we have the flexability of a graphql query interface with a strongly typed schema that typegoose and typescript provide.

We are basically building on top of Mongoose models using Typescript to support the functionality

TypeGraphQl is used to declare models and there respective properties. With each model we want to have the ability to select which models fields are nullable as well as what fields need to be defined by our database.

alright lets get started by installing TypeGraphQL and Mongoose.
We will create a new folder at the root of this project called `api` so our project folder structure will look like

- stream-me

  - app
  - api

from the root of stream-me run the following command in your terminal  
`mkdir api`  
then navigate into the folder  
`cd api`  
and then create a new npm project  
`npm init -y`  
then install the project dependecies  
`npm install typescript type-graphql graphql reflect-metadata`  
Then install some types for node  
`npm install --save-dev @types/node`  
Then we will install some typescript dependecies  
`npm install @typegoose/typegoose mongoose connect-mongo`  
Then we can install the types for typegoose etc  
`npm install --save-dev @types/mongoose`  
Next we will install express and jwt to run our server and do authentication  
`npm install express jsonwebtoken`  
Then install the types using a shorthand syntax for --save-dev  
`npm install -D @types/jsonwebtoken @types/express`

Finally we will create our tsconfig file automatically
`npx tsc --init`

Next you can create a README.md file where you can document the api. It is also where we will finish this section
`api/README.md`

## Steps

- [Section 1 Next.js Step-1: Project setup](https://github.com/dunatron/stream-me/tree/section-1-step-1/app)
- [Section 1 Next.js Step-2: Custom Document](https://github.com/dunatron/stream-me/tree/section-1-step-2)

- [Section 1 Next.js Step-3: Material UI](https://github.com/dunatron/stream-me/tree/section-1-step-3)

- [Section 1 Next.js Step-4: Linking Pages](https://github.com/dunatron/stream-me/tree/section-1-step-4)
