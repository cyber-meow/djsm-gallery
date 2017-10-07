import express from 'express';
import fs from 'fs';
import path from 'path';
import cache from 'memory-cache';
import { error, render } from './common';
import album from './album';
import photo from './photo';

const app = express();

app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'ejs');

// Photo Page
app.get(/.+(\.(jpg|bmp|jpeg|gif|png|tif))$/i, (req, res) => {
  const filePath = decodeURI(path.join(cache.get('staticRoot'), req.path));
  fs.stat(filePath, (err) => {
    if (err) {
      return error(req, res, 'File not found', err);
    }
    const fstream = fs.createReadStream(filePath);
    fstream.on('error', err2 => error(req, res, 'File not found', err2));
    return fstream.pipe(res);
  });
});

// Photo Pages - anything containing */photo/*
app.get(/(.+\/)?photo\/(.+)/i, photo, render);

// Album Page - everything that doesn't contain the photo string
app.get(/^((?!\/photo\/).)*$/, album, render);

export default app;
