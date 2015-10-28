var fs      = require('fs');
var raven   = require('raven');
var config  = require('config');
var Monitor = require('./lib/monitor');

// Sentry
var sentry = new raven.Client(config.sentry_dsn);
sentry.patchGlobal(function() {
  console.log('Sent error to Sentry. Terminating process.');
  process.exit(1);
});

// start the monitor
monitor = Monitor.createMonitor(config.monitor);

// load plugins
config.plugins.forEach(function(pluginName) {
  var plugin = require(pluginName);
  if (typeof plugin.initMonitor !== 'function') return;
  console.log('loading plugin %s on monitor', pluginName);
  plugin.initMonitor({
    monitor: monitor,
    config:  config
  });
});

monitor.start();

module.exports = monitor;