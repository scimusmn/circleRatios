(function (app) {
	var intervalId, canvas, ctx, ascii, btnStart, btnStop;
	
	var live = new smmCanvas($("#live"));				//create the live feed canvas object
	var last = new smmCanvas($("#lastFrame"));			//create the canvas object to display the previous frame
	//var plyBk = new smmCanvas($("#plyBk"));
	var book = new flipbook();							//create the frame storage container
	var plyBk = new playback(book);						//create the playback environment using the storage container
	var resetOLay = new overlayDiv($("delOverlay"));		//create the screen overlays
	var playOLay = new overlayDiv($("playOverlay"));
	
	var screenCap = false;		//declare the boolean which is used to grab new frames

	var loopSpeed = 50;			//set the refresh rate of the camera image
	var imgWid = 480;			//set the initial camera image size
	var imgHgt = 360;
	
	var drawTimer;									//variable to store the interval for refreshing
	
	//keeps track of the change of a variable; could also turn on the Number.protoptype.hasChanged function
	// in the smm_utils.js file.
	var xFPS = new trackChange(book.fps);			
	var xFrames = new trackChange(book.length());
	
	//set the app size to the window size
	app.width = window.innerWidth;
	app.height = window.innerHeight;
	
	//function to resize the app to the size of the window on resize 
	app.resize = function (){
		app.width = window.innerWidth;
		app.height = window.innerHeight;
		
		//resize the background canvas, and redraw
		bgImage.resize(app.width,app.height);
		drawBG();
		
		//reset the image size proportional to .425 the window height
		imgHgt = .85*app.height/2;
		imgWid = 4*imgHgt/3;
	
    	live.resize(imgWid,imgHgt);  //resize the live image canvas
    	
		last.resize(imgWid,imgHgt);		//resize the previous image canvas
		book.drawFrame(last.ctx,0,0);
		plyBk.resize(imgWid*1.25,1.25*imgHgt,imgWid,imgHgt);	//resize the playback canvas
		fStrip.resize(.75*app.width,.1*app.height,imgWid,imgHgt);	//resize the fps strip and redraw
		fStrip.draw();
    }

	//initializing function: this is run at the application start to set the refresh timer and resize the app 
    app.init = function () {
		
		app.resize();
		
		drawTimer = setInterval(app.draw, loopSpeed);
    };
    
	//function which is called when the playback is stopped.
    app.stopCB = function(){
    	playOLay.show();			//display the playback overlay.
    }

	
	//book.registerPlaybackCtx(plyBk.ctx);
	plyBk.registerStopCB(app.stopCB,app);		//register the app.stopCB to the playback object
	
	//pass the playback object to the fps strip, so it can know how many fps we are running at.
	fStrip.registerPB(plyBk);
	
	//not currently used, but maybe it should be used in place of the screenCap variable
	app.capture = function(){
		live.ctx.drawImage(cam.img, 0, 0, imgWid, imgHgt);		//draw the image to the canvas
		book.addFrameFromCtx(live.ctx);						//tell the "book" object to capture a frame
		whiteNum=5.;										
		updateNumFrames(1);					//call the update function for changes to number of frames
	}
	
	//var to store the number of white frames to display and the current white counter
	var maxWhite = 5;
	var whiteNum =0;
	
	var updateNumFrames = function(addd){
		//update the text in the number of frames element
		$("numFrames").innerHTML = book.length() + " frame"+(book.length()==1?"":"s")+" total";
		
		//move the strip left or right depending on adding or removing frames
		if(addd) fStrip.newFrame();
		else fStrip.popFrame();
		
		//redraw the previous image into the "last" canvas.
		book.drawFrame(last.ctx,0,0);
	}
	
	var updateFPS = function(){
		$("fps").innerHTML = plyBk.fps + " frames per second";
		fStrip.draw();
	}
	
	var dir = 1;
	
	//function to automate testing
	app.automate = function(){
		if(book.length()>=99) dir = 0;
		else if(book.length()==0) dir =1;
		
		if(dir) screenCap = true;
		else {
			book.popTopFrame();
			updateNumFrames(0);
		}
	}
	
	//establish interval for capturing or popping frames
	//setInterval(app.automate.bind(this),500);
	
	//draw function: updates the live and last frames canvases
    app.draw = function () {

		//clear canvas
		live.clear();
		live.ctx.drawImage(cam.img, 0, 0, imgWid, imgHgt);
		
		//if the capture button was just pressed
		if(screenCap){
		//tell the "book" object to capture a frame
			book.addFrameFromCtx(live.ctx);
		//set the white frame counter to the max number of white frames to display after capture
			whiteNum=maxWhite;
		//deactivate the screenCap variable
			screenCap=false;
		//update the number of frames text and the sliding of the frame strip
			updateNumFrames(1);
		}
		
		//draw the onionskin over the current camera view.
		if(book.length()){
			live.ctx.globalAlpha = 0.5;
			live.ctx.drawImage(last.elem,0,0);
			live.ctx.globalAlpha =1;
		}
		
		//draw the camera "flash" after a frame capture
		if(whiteNum){
			//set the alpha value of the canvas to the ratio of the number of white frames 
			//displayed to the max number of white frames to display
			live.ctx.globalAlpha = whiteNum/maxWhite;
			
			//draw a white rectangle over the full screen
			live.ctx.beginPath();
			live.ctx.rect(0,0,imgWid,imgHgt);
			live.ctx.fillStyle= '#ffffff';
			live.ctx.fill();
			
			//decrement the whiteNum
			whiteNum--;
			live.ctx.globalAlpha = 1; //reset global opacity
		}
		
    };
    
	document.onkeydown = function(e) {
	//if the movie is playing, and any key besides the slower or faster button is pressed, stop playback.
		if(!(e.which==charCode('S')||e.which==charCode('F'))&&plyBk.isPlaying()) plyBk.stop();
	//else, if the reset movie button has been pressed, hide the overlay if any button besides the reset button is pressed
		else if(e.which!=charCode('N')&&resetOLay.display) resetOLay.hide();
	//else, if the movie just finished playing, if any button besides play is pressed,
		else if(e.which!=charCode('P')&&playOLay.display){
			playOLay.hide();							//hide the play overlay
			$("playbackCont").style.display = 'none';	// and switch the screen back to teh capture canvases.
    		$("captureCont").style.display = 'block';
		}
	//if none of the above are true, then...
		else switch (e.which) { 
			case charCode('S'):				//if the slower button was pressed
				plyBk.halveFrameRate();		//halve the frame rate
				updateFPS();				// and update the text fields and frame strip
				break;
			case charCode('F'):				//if the "faster" button was pressed
				plyBk.doubleFrameRate();	//double the frame rate
				updateFPS();				// and update the text fields and frame strip
				break;
			case charCode('C'):					//if the capture button was pressed
				if(!whiteNum) screenCap=true;	//set the screenCap boolean to true
				//app.capture();
				break;
			case charCode('N'):					//if the reset button was pressed
				if(resetOLay.display){			//if the reset overlay is showing
					book.clear();			//clear the frames from the flipbook object
					resetOLay.hide();			//hide the reset overlay
					updateNumFrames(0);			
				}
				else resetOLay.show();			//if the reset overlay was not showing, display it
				break;
			case charCode('D'):				//if the delete last picture button was pressed
				if(book.length()){			//if there are any frames in "book"
					book.popTopFrame();		// pop the top frame off
					updateNumFrames(0);		// and update the things dependent on frame number
				}
				break;
			case charCode('P'):							//if the play button was pressed
				if(playOLay.display) playOLay.hide();	//if the play overlay was showing, hide it
				if(book.length()){						//and if there are any frames in "book"
					plyBk.reset();						//reset the playback position
					plyBk.play();								//start playback
					$("playbackCont").style.display = 'block';	// and switch screens from capture to playback
					$("captureCont").style.display = 'none';
				}
				break;
		}
	}
    
    app.init();

	window.onresize = app.resize;
}(window.asciitest = window.asciitest || {}));