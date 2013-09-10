(function (app) {
	var cam, intervalId, canvas, canvasCtx, ascii, btnStart, btnStop;

	var loopSpeed = 25;
	var width = 160;
	var height = 120;
	
	var colors = new palette();
	
	var sampCol = new color("default");
	var newCol = new color("new");
	var black = new color("black");
	black.teach(1,1,2,0);
	sampCol.teach(50,50,50,0);
	newCol.teach(50,50,50,0);
	
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
		colors.newColor("white");
	
		colors.color(1).teach(99,153,193,2);
		colors.color(3).teach(209,211,22,5);
		colors.color(5).teach(207,151,1,1);
		colors.color(6).teach(207,218,184,0);
	
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
		
		sampCol.set(colordata[pos],colordata[pos+1],colordata[pos+2]);
		
		console.log(sampCol.compare(black));
		
		if(sampCol.compare(black)<.5&&!colAve.limit()){
			$("swatch").setAttribute('style', "background-color:"+sampCol.string()) ;
			colAve.addSample(sampCol);
			$("swatch2").setAttribute('style', "background-color:"+colAve.averageColor().string()) ;
			newCol.set(colAve.averageColor());
		}
		else if(colAve.averaging()&&!colAve.limit()){
			var foundCol = colors.findColor(newCol);
			if(foundCol.name!="default"){
				$("fndCol").innerHTML = foundCol.name;
				$("fndCol").setAttribute('style', "background-color:"+foundCol.string()) ;
				
				var ball = document.createElement("div");
				ball.setAttribute('class',"ball");
				ball.setAttribute('style',"background-color:"+foundCol.string());
				ball.innerHTML = foundCol.value;
				$("balls").appendChild(ball);
				$("score").innerHTML=parseInt($("score").innerHTML)+foundCol.value;
			}
			colAve.clearSamples();
			
		}
		else if(colAve.limit()){
			var foundCol = colors.findColor(newCol);
			if(foundCol.name!="default"){
				$("fndCol").innerHTML = foundCol.name;
				$("fndCol").setAttribute('style', "background-color:"+foundCol.string()) ;
			}
			colAve.clearSamples();
		}
		
		canvasCtx.fillStyle= "#000000" ;
		rect(width/2-1,height/4,2,height/2);
		
		rect(width/4,height/2-1,width/2,2);
		
    };
    
    app.init();
    app.startCam();

}(window.asciitest = window.asciitest || {}));