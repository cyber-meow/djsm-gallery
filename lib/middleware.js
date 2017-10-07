import express from 'express';
import fs from 'fs';
import path from 'path';
import Common from './common';
import Album from './album';
import Photo from './photo';

export default function(config){
  let app = express(),
  staticFiles = config.staticFiles,
  common = Common(config),
  album = Album(config),
  photo = Photo(config);
 
  app.get('/gallery.css', function(req, res, next){
    var fstream = fs.createReadStream(path.join(__dirname, '..', 'css/gallery.css'));
    res.type('text/css');
    fstream.on('error', function(err){
      return common.error(req, res, next, 404, 'CSS File not found', err);
    });
    return fstream.pipe(res);
  });

  app.set('views', path.join(__dirname, '..', 'views'));
  app.set('view engine', 'ejs');

  // Photo Page
  app.get(/.+(\.(jpg|bmp|jpeg|gif|png|tif)(\?tn=(1|0))?)$/i, function(req, res, next){
    var filePath = path.join(staticFiles, req.path),
    fstream;
    
    filePath = decodeURI(filePath);
    
    fs.stat(filePath, function(err){
      if (err){
        return common.error(req, res, next, 404, 'File not found', err);
      }
      fstream = fs.createReadStream(filePath);
      fstream.on('error', function(err){
        return common.error(req, res, next, 404, 'File not found', err);
      });
      
      return fstream.pipe(res);
    });
    
  });
  
  // Photo Pages - anything containing */photo/*
  app.get(/(.+\/)?photo\/(.+)/i, photo, common.render);
  // Album Page - everything that doesn't contain the photo string
  // regex source http://stackoverflow.com/questions/406230/regular-expression-to-match-string-not-containing-a-word
  app.get(/^((?!\/photo\/).)*$/, album, common.render);
  return app;
}
