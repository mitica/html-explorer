var request = require('request');
var Promise = require('bluebird');
var external = module.exports;
external._ = require('lodash');
external.Promise = require('bluebird');
external.url = require('url');


external.request = function(options) {
  return new Promise(function(resolve, reject) {
    request(options, function(error, response, body) {
      if (error) return reject(error);
      resolve({
        body: body,
        response: response
      });
    });
  });
};

external.noop = function() {};

external.encode = function(html) {
  if (!html) return html;
  var entities = require('entities');

  return entities.encodeHTML(html);
};

external.decode = function(html) {
  if (!html) return html;
  var entities = require('entities');

  return entities.decodeHTML(html);
};

external.strip = function(html) {
  if (!html) return html;
  return html.replace(/<\/?[^<>]*>/gi, '');
};