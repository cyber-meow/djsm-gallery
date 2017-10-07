import express from 'express';
import fs from 'fs';
import path from 'path';
import cache from 'memory-cache';
import im from 'imagemagick-stream';
import { error, render } from './common';
import album from './album';
import photo from './photo';

const app = express();

app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'ejs');

// Photo Page
app.get(/.+(\.(jpg|bmp|jpeg|gif|png|tif))(\?tn=0)?$/i, (req, res) => {
  const filePath = decodeURI(path.join(cache.get('staticRoot'), req.path));
  fs.stat(filePath, (err) => {
    if (err) {
      return error(req, res, 'File not found', err);
    }
    const fstream = fs.createReadStream(filePath);
    fstream.on('error', err2 => error(req, res, 'File not found', err2));
    if (!req.query.tn) {
      return fstream.pipe(res);
    }
    const resizer = im().resize('50%x50%').quality(90);
    resizer.on('error', err2 => error(req, res, 'Error in IM/GM converting file', err2));
    const resizestream = fstream.pipe(resizer);
    return resizestream.pipe(res);
  });
});

// Photo Pages - anything containing */photo/*
app.get(/(.+\/)?photo\/(.+)/i, photo, render);

// Album Page - everything that doesn't contain the photo string
app.get(/^((?!\/photo\/).)*$/, album, render);

export default app;
