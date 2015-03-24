/*jshint strict:true, trailing:false, unused:true, node:true */
'use strict';

require("babel/register");

var debug = require('debug')('librarian');
var http = require('http');
var qs    = require('qs');

var Client = function() {
};

['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].forEach(function(method) {
  Client.prototype[method.toLowerCase()] = function(path, query, body) {
    return this.request(method, path, query, body);
  };
});

Client.prototype.request = function(method, path, query, body) {

  var headers = {
    'User-Agent'    : 'Librarian Client',
    'Accept'        : 'application/json'
  };

  if (body) headers['Content-Type'] = 'application/json';

  var options = {
    hostname: 'libraries.io',
    port:     80,
    method:   method,
    path:     query ? path + '?' + qs.stringify(query) : path,
    headers:  headers
  };

  return new Promise(function(resolve, reject) {
    var responseHandler = function(res) {
      res.setEncoding('utf8');

      var data = '';
      res.on('data', function(chunk) { data += chunk; });

      res.on('end', function() { resolve(JSON.parse(data)); });

      debug('L.IO: ' + res.statusCode + ' ' + method + ' ' + options.path);

      if ([200,201].indexOf(res.statusCode) === -1) {
        return reject(new Error(res.statusCode));
      }
    };

    var req = http.request(options, responseHandler);
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

module.exports = Client;