import fs from 'fs';
import path from 'path';
import cache from 'memory-cache';
import { breadcrumb, error, friendlyPath } from './common';

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
    const file = files.find((fileName) => {
      const fileBasebame = path.basename(fileName, path.extname(fileName));
      return fileBasebame === photoName;
    });
    if (!file) {
      return error(req, res, 'Photo not found', {});
    }
    const photoUrl = path.join(albumPath, file);
    req.tpl = 'photo.ejs';
    req.data = {
      name: photoName,
      breadcrumb: breadcrumb(friendlyPath(photoBreadcrumbPath)),
      src: photoUrl,
    };
    return next();
  });
}
