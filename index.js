const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

let db;
let app;
let remoteEnabled = false;

const keyvault = {
  config: (options) => {
    db = new sqlite3.Database(options.database);
    remoteEnabled = options.remote || false;

    // Check if the keyvault table exists, create it if not
    db.run(`
      CREATE TABLE IF NOT EXISTS keyvault (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);
  },

  set: async (key, value) => {
    return new Promise((resolve, reject) => {
      db.run('INSERT OR REPLACE INTO keyvault (key, value) VALUES (?, ?)', [key, JSON.stringify(value)], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },

  get: async (key) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT value FROM keyvault WHERE key = ?', [key], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row ? JSON.parse(row.value) : null);
        }
      });
    });
  },

  remote: (options) => {
    if (remoteEnabled) {
      app = express();
      app.use(bodyParser.json());

      const password = options.password || null;
      app.use((req, res, next) => {
        const providedPassword = req.headers['x-password'];
        if (password && providedPassword !== password) {
          res.status(401).json({ success: false, error: 'Unauthorized' });
        } else {
          next();
        }
      });

      app.post('/keyvault/set', async (req, res) => {
        const { key, value } = req.body;
        try {
          await keyvault.set(key, value);
          res.status(200).json({ success: true });
        } catch (error) {
          res.status(500).json({ success: false, error: error.message });
        }
      });

      app.get('/keyvault/get', async (req, res) => {
        const key = req.query.key;
        try {
          const value = await keyvault.get(key);
          res.status(200).json({ success: true, value });
        } catch (error) {
          res.status(500).json({ success: false, error: error.message });
        }
      });

      app.listen(options.port, () => {
        console.log(`keyvault server listening on port ${options.port}`);
      });
    }
  },
};
