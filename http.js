




















var util = require('util');
var EventEmitter = require('events').EventEmitter;


exports.IncomingMessage = require('_http_incoming').IncomingMessage;


var common = require('_http_common');
exports.METHODS = util._extend([], common.methods).sort();


exports.OutgoingMessage = require('_http_outgoing').OutgoingMessage;


var server = require('_http_server');
exports.ServerResponse = server.ServerResponse;
exports.STATUS_CODES = server.STATUS_CODES;


var agent = require('_http_agent');
var Agent = exports.Agent = agent.Agent;
exports.globalAgent = agent.globalAgent;

var client = require('_http_client');
var ClientRequest = exports.ClientRequest = client.ClientRequest;

exports.request = function(options, cb) {
  return new ClientRequest(options, cb);
};

exports.get = function(options, cb) {
  var req = exports.request(options, cb);
  req.end();
  return req;
};

exports._connectionListener = server._connectionListener;
var Server = exports.Server = server.Server;

exports.createServer = function(requestListener) {
  return new Server(requestListener);
};




function Client(port, host) {
  if (!(this instanceof Client)) return new Client(port, host);
  EventEmitter.call(this);

  host = host || 'localhost';
  port = port || 80;
  this.host = host;
  this.port = port;
  this.agent = new Agent({ host: host, port: port, maxSockets: 1 });
}
util.inherits(Client, EventEmitter);
Client.prototype.request = function(method, path, headers) {
  var self = this;
  var options = {};
  options.host = self.host;
  options.port = self.port;
  if (method[0] === '/') {
    headers = path;
    path = method;
    method = 'GET';
  }
  options.method = method;
  options.path = path;
  options.headers = headers;
  options.agent = self.agent;
  var c = new ClientRequest(options);
  c.on('error', function(e) {
    self.emit('error', e);
  });
  
  
  
  c.on('socket', function(s) {
    s.on('end', function() {
      if (self._decoder) {
        var ret = self._decoder.end();
        if (ret)
          self.emit('data', ret);
      }
      self.emit('end');
    });
  });
  return c;
};

exports.Client = util.deprecate(Client,
    'http.Client will be removed soon. Do not use it.');

exports.createClient = util.deprecate(function(port, host) {
  return new Client(port, host);
}, 'http.createClient is deprecated. Use `http.request` instead.');
