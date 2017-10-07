import gallery from '../lib/gallery'
import express from 'express';
import path from 'path';

// Usage example with ExpressJS
let port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000;
let host = process.env.OPENSHIFT_NODEJS_IP;

var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname));

// In your project, this would be require('node-gallery')
app.use('/gallery', gallery({
  staticFiles : '/media/yu-guan/DATA/pictures/',
  urlRoot : 'gallery',
  title : 'Example Gallery',
  render : false // 
}), function(req, res, next){
  return res.render('gallery', { galleryHtml : req.html });
});


app.listen(port, host);
host = host || 'localhost';
console.log('node-gallery listening on ' + host  + ':' + port);
