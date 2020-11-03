# GOB Management Frontend

A frontend on the GOB Management API.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), using the [Redux](https://redux.js.org/) and [Redux Toolkit](https://redux-toolkit.js.org/) template.

The project uses the [Amsterdam Styled Components](https://github.com/Amsterdam/amsterdam-styled-components) for most of its UI elements. 
[React-Bootstrap](https://react-bootstrap.github.io/) is used for any remaining styling issues.

Icons are mainly imported from the [Font Awesome](https://github.com/FortAwesome/react-fontawesome) library

## Dependencies

Both the [GOB Management API](https://github.com/Amsterdam/GOB-Management) and the [GOB API](https://github.com/Amsterdam/GOB-API) should be up.
To be able to run the GOB API a running [GOB infrastructure](https://github.com/Amsterdam/GOB-Infra) is required.

# Docker

## Requirements

* docker-compose >= 1.17
* docker ce >= 18.03

## Run

```bash
docker-compose build
docker-compose up &
```

Open http://localhost:8080 to view it in the browser.

## Tests

```bash
docker-compose -f .jenkins/test/docker-compose.yml build
docker-compose -f .jenkins/test/docker-compose.yml run test
```

# Local

## Requirements

- yarn >= 1.21
- node >= 10

## Initialisation

Install the required libraries:

```bash
yarn install
```

## Tests

Run the tests:

```bash
sh test.sh
```

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:8080](http://localhost:8080) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn test`

Runs the unit tests for the project in watch mode.

The CI tests are specified in test.sh and cover a broader spectrum of tests, including unit tests and coverage tests.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `yarn build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
