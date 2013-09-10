(function (app) {
	var cam, intervalId, canvas, ctx, ascii, btnStart, btnStop;

	var loopSpeed = 50;
	var width = 320;
	var height = 240;

    app.init = function () {
		//Get all the page element we need
        cam = document.getElementById('cam');
        ascii = document.getElementById("asciiText");
		canvas = document.getElementById("main");
		ctx = canvas.getContext("2d");
		btnStart = document.getElementById('startbtn');
        btnStop = document.getElementById('stopbtn');
        
        //Init events
        btnStart.addEventListener('click',app.startCam);
        btnStop.addEventListener('click',app.stopCam);
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
					btnStart.style.display = "none";
					btnStop.style.display = "inline-block";
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
		btnStop.style.display = "none";
		btnStart.style.display = "inline-block";
    };

    
    app.loop = function () {
		var r, g, b, gray;
		var character, line = "";

		//clear canvas
		ctx.clearRect (0, 0, width, height);

		//draw the video frame
		ctx.drawImage(cam, 0, 0, width, height);
		
		/*ctx.fillStyle="#000";
        ctx.fillRect(0,0,canvas.width,canvas.height);
		
		ctx.fillStyle="#fff";
        ctx.fillRect(50,50,20,20);
		ctx.fillRect(60,60,20,20);*/

		//accessing pixel data
		var pixels = ctx.getImageData(0, 0, width, height);
		var colordata = pixels.data;
		
		

		for(var i = 0; i < colordata.length; i +=4){
			r = colordata[i];
			g = colordata[i+1];
			b = colordata[i+2];
			//converting the pixel into grayscale
			gray = r*0.2126 + g*0.7152 + b*0.0722;
			
			if(gray<200) gray = 0;
			else gray = 255;
			
			colordata[i] = colordata[i+1] = colordata[i+2] = gray;
		}
		ctx.clearRect (0, 0, width, height);
		//ctx.putImageData(pixels,0,0);
		/*var pxlGrps = new pixelGroups();
		for(var i = 0; i < colordata.length; i +=4){
			if(colordata[i]>=255&&!pxlGrp.inGroup(i)){
				pxlGrp.makeGroup(pixels,i,10),console.log(pxlGrp.pixels.length);
				ctx.fillStyle="#000";
				ctx.beginPath();
				ctx.arc(pxlGrp.center().x,pxlGrp.center().y,10,0,2*Math.PI);
				ctx.fill();
			}
		}*/
		
		/*var pxlGrps = new pixelGroups();
		pxlGrps.makeGroups(pixels);
		var num = 0;
		
		
		//console.log(num);
		ctx.putImageData(pixels,0,0);
		
		for(var i= 0; i< pxlGrps.groups.length; i++){
			var grp = pxlGrps.groups[i];
			if(grp.pixels.length){
				num++;
				var pix = grp.pixels;
				for(var j=0; j<pix.length; j++){
					colordata[pix[j]*4] = num%6*20+150;
					colordata[pix[j]*4+1] = num%5*25+150;
					colordata[pix[j]*4+2] = num%4*33+150;
				}
				ctx.fillStyle="#fff";
				ctx.beginPath();
				ctx.arc(grp.center().x,grp.center().y,10,0,2*Math.PI);
				ctx.fill();
			}
		}*/
		
		var pxlGrps = new pixelGroups();
		pxlGrps.extractBlobs(pixels);
		
		
		for(var i= 0; i< pxlGrps.blobs.length; i++){
			var grp = pxlGrps.blobs[i];
			ctx.fillStyle="#000";
			ctx.beginPath();
			ctx.arc(grp.center().x,grp.center().y,10,0,2*Math.PI);
			ctx.fill();
			for(var j=0; j<grp.pixels.length; j++){
				var pix = grp.pixels[j];
				if(pix.edge){
					colordata[pix.index] = 255;
					colordata[pix.index+1] = colordata[pix.index+2] = 0;
				}
				//else colordata[pix.index] = colordata[pix.index+1] = colordata[pix.index+2] = 0;
			}
		}
		
		//ctx.putImageData(pixels,0,0);
		
		/*for(var i= 0; i< pxlGrp.pixels.length; i++){
			var pix = pxlGrp.pixels[i];
			if(pix.edge){
				colordata[pix.index] = 255;
				colordata[pix.index+1] = colordata[pix.index+2] = 0;
			}
			else colordata[pix.index] = colordata[pix.index+1] = colordata[pix.index+2] = 0;
		}*/
    };
    
    app.init();
    app.startCam();

}(window.asciitest = window.asciitest || {}));