(function (exports) {

  var NCHAT = 100;

  var isMobile = false;
  if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
  || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4)))
    isMobile = true;

  if (isMobile) {
    $('#dm-screen').hide();
  };

  var BUFTIME = 3; // 3 sec buffering time allowed
  var pref = {}, admin = false;

  var onadmin = function (p) {
    admin = true;
    pref = {};
    onupdate(p);

    var same = function (a, b) {
      for (var i in a) if (a[i] !== b[i]) return false;
      for (var i in b) if (a[i] !== b[i]) return false;
      return true;
    };
    var first = 1;
    var update = function () {
      var video = $('#video')[0];
      var p = {
        intro: $('#intro').val(),

        vurl: $('#vurl').val(),
        paused: video.paused,
        volume: video.volume || 1,
        time: video.currentTime || 0,

        loop: $('#loop')[0].checked,
        danmu: $('#danmu')[0].checked,
        filtering: $('#filtering')[0].checked,
        delaying: $('#delaying')[0].checked,
      };
      if (same(p, pref)) return ;
      if (p.vurl !== pref.vurl) {
        video.currentTime = p.time = 0;
      }
      onupdate(p);
      socket.emit('update', p);
    };
    $('.update').click(update);
    $('#vload').click()

    var mediaEvents = ['play', 'pause', 'volumechange', 'seeking'];
    if (admin) mediaEvents.forEach(function (e) {
      video.addEventListener(e, update);
    });

  };

  var onupdate = function (p) {
    if (p.intro !== pref.intro) {
      if (admin) $('#intro').val(p.intro);
      else {
        $('#intro').children().remove();
        p.intro.split('\n').forEach(function (e) {
          if (e) $('#intro').append($('<p>'+e+'</p>'));
        });
      }
    }

    if (isMobile) {
      pref = p;
      return ;
    }

    if (p.danmu) $('#dm-canvas').show();
    else $('#dm-canvas').hide();
    if (admin) $('#danmu')[0].checked = p.danmu;

    var video = $('#video')[0];
    if (p.vurl !== pref.vurl) {
      if (admin) $('#vurl').val(p.vurl);
      video.pause();
      video.src = p.vurl;
    }
    if (p.paused === false) video.play();
    else video.pause(); // init value = undefined
    video.volume = p.volume || 1;
    if (Math.abs(video.currentTime - p.time) > BUFTIME) {
      video.currentTime = p.time;
    }
    video.loop = p.loop;

    pref = p;
  };

  var socket = io();
  if (window.location.pathname==='/admin.html') socket.on('auth', function () {
    socket.emit('auth', prompt('Token'));
    socket.on('reject', function () {window.location.pathname='/index.html'})
    .on('accept', onadmin);
  });
  socket.on('update', onupdate);

  var damoo = new Damoo('dm-screen', 'dm-canvas', 20);
  Damoo.prototype.send = function (text) {
    this.emit({text: text, shadow: { color: "#000" }});
  };
  damoo.start();

  var full = false;
  $('#dm-screen').dblclick(function () {
    $('#dm-screen').fullScreen(full=!full);
  })

  var pool = [];
  pool.start = 0;
  pool.append = function (e) {
    pool.push(e);
    if (pool.length - pool.start > 2 * NCHAT) {
      pool.slice(pool.start, pool.start+NCHAT).forEach(function (e, i) {
        e.remove();
        delete pool[i];
      });
      pool.start += NCHAT;
    }
  };
  var idgen = function () {
    return Date.now();// + Math.random();
  };
  var append = function (raw, id, local) {
    if (!raw || typeof raw !== 'string') {
      raw = $('#comment').val();
      if (!raw) return ;
      $('#comment').val('');
    }
    id = id || idgen();

    var li = $('<li id="'+id+'">'+raw+'</li>');
    if (admin) li.dblclick(function () {
      li.remove();
      socket.emit('remove', id);
    });
    $('#chatlist').append(li).scrollTo(li);
    pool.append(li);
    damoo.send(raw);

    if (!local) socket.emit('append', {raw:raw, id:id});
  };
  socket.on('append', function (t) {
    append(t.raw, t.id, true);
  });
  var onenter = function (next) {
    return function (key) {
      if (key.which === 13) next();
    };
  };
  $('#comment').keypress(onenter(append));
  $('#send').click(append);

})(this);
