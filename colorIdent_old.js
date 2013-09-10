(function (app) {
	var cam, intervalId, canvas, canvasCtx, ascii, btnStart, btnStop;

	var loopSpeed = 25;
	var width = 160;
	var height = 120;
	
	var colors = new palette();
	
	var sampCol = new color("default");
	var newCol = new color("new");
	var black = new color("black");
	black.set(1,1,1);
	sampCol.set(50,50,50);
	newCol.set(50,50,50);
	
	app.sampleColor = function(){
		return newCol;
	};
	

    app.init = function () {
		//Get all the page element we need
        cam = document.getElementById('cam');
        ascii = document.getElementById("asciiText");
		canvas = document.getElementById("main");
		canvasCtx = canvas.getContext("2d");
		
		colors.newColor("pink"),
		colors.newColor("blue"),
		colors.newColor("green"),
		colors.newColor("yellow"),
		colors.newColor("purple"),
		colors.newColor("orange");
	
        colors.addHandlers(app.sampleColor);
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
    
    
function rect(x,y,w,h) {
  canvasCtx.beginPath();
  canvasCtx.rect(x,y,w,h);
  canvasCtx.closePath();
  canvasCtx.fill();
}

    //The generation of the ascii text was taken from this great sample from thecodeplayer:
    //http://thecodeplayer.com/walkthrough/cool-ascii-animation-using-an-image-sprite-canvas-and-javascript
    app.loop = function () {
		var gray;
		var character, line = "";

		//clear canvas
		canvasCtx.clearRect (0, 0, width, height);

		//draw the video frame
		canvasCtx.drawImage(cam, 0, 0, width, height);
		
		var pixels = canvasCtx.getImageData(0, 0, width, height);
		var colordata = pixels.data;
		
		var pos = 4*(width/2+width*height/2);
		
		/*var rAve=0,gAve=0,bAve=0;
		
		var sWid = 4;
		var sHgt = 4;
		for(var i=0; i<sWid; i++){
			for(var j=0; j<sHgt; j++){
				var wPos = (width/2-sWid/2+i);
				var hPos = (height/2-sHgt/2+j);
				var sPos = 4*(wPos+width*hPos);
				rAve += colordata[sPos];
				gAve += colordata[sPos+1];
				bAve += colordata[sPos+2];
			}
		}
		
		rAve/=sWid*sHgt;
		gAve/=sWid*sHgt;
		bAve/=sWid*sHgt;
		
		console.log(rAve);
		
		sampCol.set(rAve,gAve,bAve);*/
		
		sampCol.set(colordata[pos],colordata[pos+1],colordata[pos+2]);
		
		//console.log(sampCol.compByColor(black.rgb()));
		
		if(sampCol.compByColor(black.rgb())>15000){
			$("swatch").setAttribute('style', "background-color:"+sampCol.string()) ;
			newCol.setByColor(sampCol.rgb());
			var foundCol = colors.findColor(sampCol);
			if(foundCol.title()!="default"){
				$("fndCol").innerHTML = foundCol.title();
				$("fndCol").setAttribute('style', "background-color:"+foundCol.string()) ;
			}
		}
		
		canvasCtx.fillStyle= "#000000" ;
		rect(width/2-1,height/4,2,height/2);
		
		rect(width/4,height/2-1,width/2,2);
		
    };
    
    app.init();
    app.startCam();

}(window.asciitest = window.asciitest || {}));