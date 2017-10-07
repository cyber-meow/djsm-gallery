import path from 'path';

function friendlyPath(unfriendlyPath) {
  return decodeURI(unfriendlyPath).replace(/^\//, '').replace(/\/$/, '');
}

function error(req, res, message, errorObject) {
  return res.status(404).json({ message, error: errorObject });
}

function breadcrumb(filePath) {
  const pathSegs = filePath.split('/');
  const breadcrumbUrls = pathSegs.reduce((acc, pathSeg) => {
    const newItem = {
      name: pathSeg,
      url: path.join(acc[acc.length - 1].url, pathSeg),
    };
    return acc.concat([newItem]);
  }, [{ name: 'Gallery', url: '/' }]);
  return breadcrumbUrls;
}

function render(req, res) {
  if (req.accepts('html')) {
    return res.render(req.tpl, req.data);
  }
  return res.json(req.data);
}

export { friendlyPath, error, breadcrumb, render };
