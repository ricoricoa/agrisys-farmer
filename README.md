# Agrisystem

A farmer-focused starter project for the Agrisystem client, API, and database
migrations.

## Requirements

- Node.js 20.19 or newer
- npm

## Configuration

Copy `.env.example` to `.env` in the project root and update values as needed.
The server and Vite client both read their configuration from that file.

## Install and run locally

From the project root, install all workspace dependencies:

```sh
npm install
```

In separate terminals, start the API and client from the project root:

```sh
npm run dev:server
```

```sh
npm run dev:client
```

The client runs at `http://localhost:5173` and the API at
`http://localhost:3000`. Run `npm run build` from the root to build the client.
The farmer module exposes a starter status endpoint at `/api/farmer`. Add
farmer-specific features in its client and server folders as the domain
requirements are defined.

## Project layout

- `client/src/components` and `client/src/services` contain shared UI and API
  utilities.
- `client/src/modules/farmer` contains farmer-specific pages and components;
  `client/src/components` and `client/src/services` contain shared UI and API
  utilities.
- `server/src/api/middleware` and `server/src/config` contain shared API
  middleware and configuration.
- `server/src/api/modules/farmer` contains the farmer routes, controllers,
  models, and services.
- `database/migrations` contains ordered, shared SQL schema migrations.
