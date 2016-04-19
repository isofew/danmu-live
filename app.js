const TOKEN = 'iamadmin';
const DELAY = 3000; // 3 sec
const LENGTH = 140;

var escape = require('escape-html');
var filter = require('./filter');// TODO
// var valid = require('./validPref'); // TODO
var valid = () => true;

var express = require('express');
var app = express();
app.use( express.static(__dirname + '/public') );

var server = require('http').createServer(app);
var io = require('socket.io')(server);

var text = {};
var pref = {
  intro: 'Welcome to Danmu Live!',
  danmu: true,
  filtering: true,
  delaying: true
};
var ts = ()=>Date.now()/1000;
var lastUpdate;

var update = (socket) => {
  var p = pref;
  if (lastUpdate && p.paused === false) {
    p.time += ts() - lastUpdate;
  }
  socket.emit('update', p);
};

io.on('connection', (socket) => {
  update(socket);
  socket.join('guest');
  socket.emit('auth');

  socket.on('auth', (token) => {
    if (token !== TOKEN) {
      socket.emit('reject');
    } else {
      socket.emit('accept', pref);
      socket.leave('guest');
      socket.join('admin');
      socket.admin = true;
    }
  })
  .on('append', (t) => {
    var raw = t.raw, id = t.id;
    if (!raw || !id || typeof raw !== 'string' || text[id]) return ;

    if (pref.filtering) raw = filter(raw);
    raw = escape(raw).slice(0, LENGTH);

    socket.to('admin').emit('append', {raw:raw, id:id});
    setTimeout(() => {
      if (text[id]) socket.to('guest').emit('append', {raw:text[id]});
    }, pref.delaying && !socket.admin ? DELAY : 100);
    text[id] = raw;
  })
  .on('remove', (id) => {
    if (!socket.admin || !text[id]) return ;
    text[id] = '';
  })
  .on('update', (p) => {
    console.log(p);
    if (!socket.admin || !valid(p)) return ;
    lastUpdate = ts();
    socket.broadcast.emit('update', (pref = p));
  });
});

server.listen(8081);
