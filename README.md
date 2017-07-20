# Express React Starter

This is a template for using Express and React in the same project. It is based on Create React App.

## Installing

```bash
git clone 'this-repo-url' app-name
cd app-name
npm install
```

## Running The App

The template can be run in development, or in production. For development, use the following workflow.

### Start the Express Server

```bash
node server.js
```

### Start Create React App

In a different terminal tab...

```bash
npm start
```

[IMG of App Running]

The "Welcome to React" is a message that comes from the Express server. 

### What Is Happening Here?

Create React App and the Express server are running on different processes. This is so that React can still use in memory Webpack to do hot reloads really fast.

All AJAX/fetch requests to `/api` are sent back to the Express server which is serving all `/api` routes from the `routes/index.js` file. This is done via a proxy setup in the `package.json` file.

## Building For Production

In production, you want Express to serve up your app.

### Build React App

```bash
npm build
```

Now simply visit the Express app at 'http://localhost:3000' and you will see your app served from the 'build' folder. That's all there is to it!