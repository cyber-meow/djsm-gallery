import fs from 'fs';
import path from 'path';
import cache from 'memory-cache';
import { breadcrumb, error, friendlyPath } from './common';

const getBaseName = file => path.basename(file, path.extname(file));

export default function (req, res, next) {
  // This CAN be undefined, if a photo exists at root
  const albumPath = req.params[0] || '';
  const photoName = req.params[1];
  const photoBreadcrumbPath = path.join(albumPath, photoName);
  const albumStaticPath = path.join(cache.get('staticRoot'), albumPath);

  fs.readdir(albumStaticPath, (err, files) => {
    if (err || files.length === 0) {
      return error(req, res, 'Photo not found', err);
    }

    const isImg = /(\.(jpg|bmp|jpeg|gif|png|tif))$/i;
    const imgFiles = files.filter((file) => {
      const stat = fs.statSync(
        path.join(cache.get('staticRoot'), albumPath, file));
      return file.match(isImg) && !stat.isDirectory();
    });
    imgFiles.sort();

    const fileIndex = imgFiles.findIndex(
      fileName => getBaseName(fileName) === photoName);

    if (fileIndex === -1) {
      return error(req, res, 'Photo not found', {});
    }

    const photoUrl = path.join(albumPath, imgFiles[fileIndex]);
    const photoStaticPath = path.join(albumStaticPath, imgFiles[fileIndex]);

    const lastUrl = fileIndex === 0 ?
      null : path.join(albumPath, 'photo', getBaseName(imgFiles[fileIndex - 1]));
    const nextUrl = fileIndex === imgFiles.length - 1 ?
      null : path.join(albumPath, 'photo', getBaseName(imgFiles[fileIndex + 1]));

    req.tpl = 'photo.ejs';
    req.data = {
      name: photoName,
      breadcrumb: breadcrumb(friendlyPath(photoBreadcrumbPath)),
      src: photoUrl,
      path: photoStaticPath,
      lastUrl: JSON.stringify(lastUrl),
      nextUrl: JSON.stringify(nextUrl),
    };
    return next();
  });
}
