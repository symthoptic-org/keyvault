# Keyvault

Keyvault is a simple key-value database module for Node.js using SQLite.

## Installation

```bash
git clone https://github.com/symthoptic-org/keyvault.git
```

## Usage

```javascript

const keyvault = require('../keyvault');

// Configure Keyvault
keyvault.config({
  database: 'database.sqlite',
  remote: false,
});

await keyvault.set('example', 'hello world');

const value = await keyvault.get('example');
console.log(value); // Output: hello world
```

## Remote Access

To enable remote access, set remote to true in the main config and setup the Keyvault Remote config.

```javascript

keyvault.config({
  database: 'database.sqlite',
  remote: true,
});

keyvault.remote({
  port: 3000,
  password: 'kineticNibbler',
});
```

Remote endpoints:

    POST /keyvault/set: Set a key-value.
    GET /keyvault/get: Get the value for a key.
