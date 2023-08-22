const express = require('express');
const cors = require('cors');

const { dbConnection } = require('../database/config');
const { host } = require('../helpers/getNetwork');

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT;
    this.usersPath = '/api/users';
    this.loginPath = '/api/login';
    this.adminPath = '/api/admin';

    this.connectDB();

    this.middlewares();

    this.routes();
  }

  async connectDB() {
    await dbConnection();
  }

  middlewares() {
    this.app.use(cors());

    this.app.use(express.json());

    this.app.use(express.static('public'));
  }

  routes() {
    this.app.use(this.usersPath, require('../routes/user.routes'));
    this.app.use(this.loginPath, require('../routes/login.routes'));
    this.app.use(this.adminPath, require('../routes/admin.routes'));
  }

  listen() {
    this.app.listen(this.port, host, () => {
      console.log(`Server running at http://${host}:${this.port}/`);
    });
  }
}

module.exports = Server;
