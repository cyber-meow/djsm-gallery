import Middleware from './middleware';
import Common from './common';

var common;

export default function(config){
  if (!config){
    throw new Error('No config specified');
  }
  
  if (!config.staticFiles || !config.urlRoot){
    throw new Error('Both staticFiles and urlRoot must be specified');
  }
  
  var common = Common(config), 
  middleware;
  
  // Remove any potential trailing or leading / from our paths
  config.urlRoot = common.friendlyPath(config.urlRoot);
  
  middleware = Middleware(config);
  
  return middleware;
  
};
