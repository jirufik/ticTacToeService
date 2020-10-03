import config from 'config';

const {MongoClient} = require('mongodb');
const mongoDbConfig = config.get('mongoDb');

class MongoDbConnector {

  constructor() {

    this.uri = this.getUri();
    this.client = new MongoClient(this.uri, {useUnifiedTopology: true, useNewUrlParser: true});
    this.db = null;

  }

  getUri() {

    const port = process.env.DB_PORT || mongoDbConfig.port || 27017;
    const host = process.env.DB_HOST || mongoDbConfig.host || '127.0.0.1';
    const user = process.env.DB_USER || mongoDbConfig.user;
    const password = process.env.DB_PASSWORD || mongoDbConfig.password;

    let uri = `mongodb://`;
    if (user) uri += `${encodeURIComponent(user)}`;
    if (password) uri += `:${encodeURIComponent(password)}`;
    if (user) uri += `@`;
    uri += `${host}:${port}/?poolSize=20&w=majority`;

    return uri;

  }

  async connectToDb() {

    if (this.db) return this.db;

    const dbName = this.getDbName();

    await this.client.connect();
    const db = await this.client.db(dbName);
    this.db = db;

    return this.db;

  }

  async getCollection(collectionName) {
    const db = await this.connectToDb();
    return db.collection(collectionName);
  }

  getDbName() {
    const dbName = process.env.DB_NAME || mongoDbConfig.db;
    if (!dbName) throw new Error('Wrong db name');
    return dbName;
  }

  async close() {
    await this.client.close();
  }

}

const mongoDbConnector = new MongoDbConnector();

module.exports = mongoDbConnector;








