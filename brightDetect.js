(function (app) {
	var cam, intervalId, canvas, ctx, ascii, btnStart, btnStop;

	var loopSpeed = 5;
	var width = 320;
	var height = 240;

    app.init = function () {
		//Get all the page element we need
        cam = document.getElementById('cam');
		canvas = document.getElementById("main");
		ctx = canvas.getContext("2d");
		
		canvas.addEventListener('mousemove', function(evt) {
			mousePos = getMousePos(canvas, evt);
		}, false);
		
		setTimeout(app.grabBackground,500);
    };

    app.startCam = function (e) {
		// Get specific vendor methods
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
		window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

		// If browser supports user media
		if (navigator.getUserMedia) {
			navigator.getUserMedia({video: true, toString: function() { return "video"; } },
				function successCallback(stream) {
					if(navigator.getUserMedia==navigator.mozGetUserMedia) {
						cam.src = stream;
					} else {
						cam.src = window.URL.createObjectURL(stream) || stream;
					}
					cam.play();
					intervalId = setInterval(app.loop, loopSpeed);
				},
				function errorCallback(error) {
					alert("An error ocurred getting user media. Code:" + error.code);
				});
		}
		else
		{
			//Browser doesn't support user media
			alert("Your browser does not support user media");
		}

		e.preventDefault();
    };

    app.stopCam = function (e) {
		clearInterval(intervalId);
		cam.src = "";
		e.preventDefault();
    };
	
	var mousePos = {x:0,y:0};
	
	function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
      }

	//var track = new groupTracker();
	var track = new pointTracker();
	var trace = new pointTrace();
	var grabBG =false;
	var clearScreen=false;
    
    app.loop = function () {
		var r, g, b, gray;
		var character, line = "";

		//clear canvas
		ctx.clearRect (0, 0, width, height);

		//draw the video frame
        ctx.save();
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
		ctx.drawImage(cam, 0, 0, width, height);
		ctx.restore();
        
		ctx.fillStyle="#fff";								//Need this dot at the top,
        ctx.fillRect(width/2,0,1,1);					//else, the groups don't record, I guess.
        
		//accessing pixel data
		var pixels = ctx.getImageData(0, 0, width, height);
		var colordata = pixels.data;
		
		

		for(var i = 0; i < colordata.length; i +=4){
			r = colordata[i];
			g = colordata[i+1];
			b = colordata[i+2];
			//converting the pixel into grayscale
			gray = (r+g+b)/3//r*0.2126 + g*0.7152 + b*0.0722;
			
			if(gray<200) gray = 0;
			else gray = 255;
			
			colordata[i] = colordata[i+1] = colordata[i+2] = gray;
		}
		
		ctx.clearRect (0, 0, canvas.width, canvas.height);
		
		
		var pxlGrps = new pixelGroups();
		pxlGrps.makeGroups(pixels);
		
		ctx.putImageData(pixels,0,0);
		
		if(grabBG) track.acquireBG(pxlGrps.groups),grabBG=false,console.log("hello");
		
		
		
		track.findPoint(pxlGrps.groups);
		
		if(track.point!==null){
			trace.addPoint({x:track.point.x/width,y:(track.point.y-50)/(height-75)});
		}
		else trace.jump();
		
		
		trace.draw(0,0);
		
		
    };
    
    app.grabBackground = function(){
    	grabBG=true;
    }
	
	document.onkeydown = function(e) {
		switch (e.which) {
			// key code for left arrow
			case 37:
				grabBG=true;
				break;
			case charCode(' '):
				trace.clear();
				break;
			case charCode('R'):
				trace.color="#d00";
				break;
			case charCode('G'):
				trace.color="#3b0";
				break;
			case charCode('B'):
				trace.color="#50f";
				break;
		}
	}
    
    app.init();
    app.startCam();

}(window.asciitest = window.asciitest || {}));