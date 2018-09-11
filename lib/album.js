import fs from 'fs';
import path from 'path';
import cache from 'memory-cache';
import { breadcrumb, error, friendlyPath } from './common';

let getThumbPath;

const getAlbums = function getAlbumsIn(files, staticFilesPath, pathFromReq) {
  let filesTmp = files.filter((file) => {
    const stat = fs.statSync(path.join(staticFilesPath, file));
    return stat.isDirectory();
  });
  filesTmp = filesTmp.map(albumName => ({
    url: path.join(pathFromReq, albumName),
    name: albumName,
    thumbPath: getThumbPath(
      path.join(staticFilesPath, albumName), path.join(pathFromReq, albumName)),
  }));
  return filesTmp;
};

const getPhotos = function getPhotosIn(files, staticFilesPath, pathFromReq) {
  const isPhoto = /(\.(jpg|bmp|jpeg|gif|png|tif))$/i;
  let filesTmp = files.filter((file) => {
    const stat = fs.statSync(path.join(staticFilesPath, file));
    return file.match(isPhoto) && !stat.isDirectory();
  });
  filesTmp = filesTmp.map((photoFileName) => {
    const photoName = photoFileName.replace(isPhoto, '');
    const photoInfo = {
      url: path.join(pathFromReq, 'photo', photoName),
      path: path.join(pathFromReq, photoFileName),
      name: photoName,
    };
    return photoInfo;
  });
  return filesTmp;
};

getThumbPath = function getThumbPathIn(albumPath, pathFromReq) {
  const cached = cache.get(`${albumPath}_thumb`);
  if (cached &&
      fs.existsSync(path.join(cache.get('staticRoot'), cached))) {
    return cached;
  }
  const files = fs.readdirSync(albumPath);
  const photos = getPhotos(files, albumPath, pathFromReq);
  if (photos.length > 0) {
    cache.put(`${albumPath}_thumb`, photos[0].path);
    return photos[0].path;
  }
  const albums = getAlbums(files, albumPath, pathFromReq);
  const thumbPath = albums.reduce((acc, album) => acc || album.thumbPath, null);
  cache.put(`${albumPath}_thumb`, thumbPath);
  return thumbPath;
};

export default function (req, res, next) {
  // Retrieve the path, decoding %20s etc, replacing leading & trailing slash
  const pathFromReq = friendlyPath(req.path);
  const staticFilesPath = path.join(cache.get('staticRoot'), pathFromReq);

  fs.readdir(staticFilesPath, (err, files) => {
    if (err) {
      return error(req, res, 'No album found', err);
    }

    const data = {};
    data.isRoot = (req.path === '/' || req.path === '');
    data.breadcrumb = breadcrumb(pathFromReq);
    data.name = data.breadcrumb[data.breadcrumb.length - 1].name || 'Home';

    data.albums = getAlbums(files, staticFilesPath, pathFromReq);
    data.photos = getPhotos(files, staticFilesPath, pathFromReq);

    req.data = data;
    req.tpl = 'album.ejs';
    return next();
  });
}
