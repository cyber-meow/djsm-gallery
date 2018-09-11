import path from 'path';
import fs from 'fs';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cache from 'memory-cache';
import randomstring from 'randomstring';
import middleware from './lib/middleware';

const mongoDB = 'mongodb://localhost/doujinshi-manager';
mongoose.connect(mongoDB, {
  useMongoClient: true,
});

// Get the default connection
const db = mongoose.connection;

// Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const ConfigSchema = new mongoose.Schema({
  name: String,
  staticRoot: String,
});

const Config = mongoose.model('Config', ConfigSchema);

// Set staticRoot
Config.findOne({ name: 'main' }, (err, config) => {
  if (err) throw err;
  if (!config) {
    Config.create({
      name: 'main',
      staticRoot: '/media/yu-guan/DATA/pictures',
    });
    cache.put('staticRoot', '/media/yu-guan/DATA/pictures');
  } else {
    cache.put('staticRoot', config.staticRoot);
  }
});

// Usage example with ExpressJS
const port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000;
const host = process.env.OPENSHIFT_NODE || 'localhost';

const app = express();
app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(express.static(`${__dirname}/public`));

app.use(middleware);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));

const favoritePath = '/media/yu-guan/DATA/pictures/本/favorite';
const addToFavorite = function addFav(file) {
  const filepathObj = path.parse(file);
  fs.copyFile(
    file,
    path.join(
      favoritePath,
      filepathObj.name.concat(randomstring.generate()).concat(filepathObj.ext)),
    (err) => { if (err) console.log(err); });
};
app.post('*', (req, res) => {
  if (req.body.filePath) {
    addToFavorite(req.body.filePath);
    res.redirect('back');
  }
  if (req.body.deleteFilePath) {
    fs.unlink(req.body.deleteFilePath, (err) => { if (err) console.log(err); });
    res.redirect('..');
  }
});

app.listen(port, host);
console.log(`node-gallery listening on ${host}:${port}`);
