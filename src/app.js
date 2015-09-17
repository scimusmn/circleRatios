include(['src/webcam.js', 'src/pixelGroups.js', 'src/smm_graph.js'], function() {
  function app() {};

  var intervalId;
  var canvas;
  var ctx;

  app.refreshRate = 30;

  var loopSpeed = 5;
  var width = 320;
  var height = 240;

  var track = new pointTracker();

  var trace  = $('trace');
  trace.lineColor = '#d00';
  trace.lineWidth = 4;

  var grabBG = false;
  var clearScreen = false;

  app.init = function() {
    //Get all the page element we need
    //cam = document.getElementById('cam');
    canvas = document.getElementById('main');
    ctx = canvas.getContext('2d');

    setTimeout(app.grabBackground, 5000);
    intervalId = setInterval(app.loop, 1000 / app.refreshRate);
  };

  app.resize = function() {
    trace.width = window.innerWidth;
    trace.height = window.innerHeight;
  };

  app.resize();

  window.onresize = app.resize;

  /*trace.addEventListener('mousemove', function(evt) {
    var rect = this.getBoundingClientRect();
    this.mouse = {
      x: (evt.clientX - rect.left)/this.width,
      y: (evt.clientY - rect.top)/this.height
    };
    this.addPoint(this.mouse);
  }, false);*/

  app.loop = function() {
    var r, g, b, gray;
    var character, line = '';

    //clear canvas
    ctx.clearRect(0, 0, width, height);

    //draw the video frame
    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(cam.img, 0, 0, width, height);
    ctx.restore();

    ctx.fillStyle = '#fff';                //Need this dot at the top,
    ctx.fillRect(width / 2, 0, 1, 1);          //else, the groups don't record, I guess.

    //accessing pixel data
    var pixels = ctx.getImageData(0, 0, width, height);    //
    var colordata = pixels.data;

    for (var i = 0; i < colordata.length; i += 4) {      //threshold the image
      r = colordata[i];
      g = colordata[i + 1];
      b = colordata[i + 2];

      //converting the pixel into grayscale
      gray = (r + g + b) / 3; //r*0.2126 + g*0.7152 + b*0.0722;

      if (gray < 200) gray = 0;                //below 200 is black
      else gray = 255;

      colordata[i] = colordata[i + 1] = colordata[i + 2] = gray;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var pxlGrps = new pixelGroups();
    pxlGrps.makeGroups(pixels);

    ctx.putImageData(pixels, 0, 0);

    if (grabBG) track.acquireBG(pxlGrps.groups),grabBG = false,console.log('hello');

    track.findPoint(pxlGrps.groups);

    if (track.point !== null) {
      trace.addPoint({x:track.point.x / width,y:(track.point.y - 40) / (height - 55)});
    } else trace.clear();

    trace.draw();

  };

  app.grabBackground = function() {
    grabBG = true;
  }

  document.onkeydown = function(e) {
    switch (e.which) {
      // key code for left arrow
      case 37:
        grabBG = true;
        break;
      case charCode(' '):
        trace.erase();
        break;
      case charCode('R'):
        trace.lineColor = '#d00';
        break;
      case charCode('G'):
        trace.lineColor = '#3b0';
        break;
      case charCode('B'):
        trace.lineColor = '#50f';
        break;
    }
  };

  app.init();

});
