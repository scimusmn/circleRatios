function playback(bk){
	this.fps = extractNumber($("fps").innerHTML);  //Grab the initial value for fps from the index.html
	var self = this;
	var pbCnvs = $("plyBk");					//grab the canvas element to be used for playback
	var ctx = pbCnvs.getContext("2d");			//get the 2d context from the pb canvas
	
	var dCnvs = document.createElement("canvas");	//make a dummy canvas for resizing images for playback
	var dCtx = dCnvs.getContext("2d");				//get the context of the dummy canvas
	
	this.book = bk;				//bind "book" to the flipbook object which was passed in the constructor
	var timer = null;			//create the variable to store the setInterval for drawing new frames to screen
	
	var playing = false;		//boolean holding play state; probably could use the "timer" variable, but meh.
	var pos = 0;				//variable holding playback position
	
	var stopCB = null;			//pointer to function called when the playback stops
	var cbObj = null;			//pointer to the object used to call stopCB

	//resizes the playback canvas and the dummy canvas. Dummy canvas should be the size of the frames in "book"
	this.resize = function(wid,hgt,dWid,dHgt){
		pbCnvs.width = wid;
		dCnvs.width = dWid;
		pbCnvs.height= hgt;
		dCnvs.height= dHgt;
	}
	
	//function called during playback. Increments frames and draws new pictures.
	var idle = function(){
		if(playing&&pos<self.book.length()-1){	//if the current frame number is less than the number of frames
			//put imageData into the dummy canvas at normal size
			dCtx.putImageData(self.book.frame(pos),0,0);
			//draw the dummy canvas onto the playback canvas at a scaled size.
			ctx.drawImage(dCnvs,0,0,pbCnvs.width,pbCnvs.height);
			//increment the position marker
			pos++;
		}
		else if(self.book.length()-1<=pos){ //if the current frame number is >= the number of frames
			self.stop();					//stop playback
			pos = 0;						//reset the current frame number
		}
	}
	
	//returns the play state
	this.isPlaying = function(){
		return playing;
	}
		
	//resets the period of the refresh timer. Stops the interval if we are playing, and calls setInterval again.
	this.renewRefreshTimer = function(){
		clearInterval(timer);
		timer = setInterval(idle.bind(this),1000/this.fps);
	}
	
	//play the movie
	this.play = function(){
		playing=true;
		idle();			//calls idle once, to start playback
		timer = setInterval(idle.bind(this),1000/this.fps); //establish the interval at which idle is called.
	}
	
	//stops playback and calls the stopCB function
	this.stop = function(){
		playing=false;
		stopCB.call(cbObj);
		clearInterval(timer);  //clear the interval, stopping the idle function from being called.
	}
	
	//if playing, stops playback, and if stopped, begins playback.
	this.togglePlay=function(){
		if(playing) this.stop();
		else this.play();
	};
	
	//register the function to call when playback stops.
	this.registerStopCB = function(sCB,cbob){
		stopCB=sCB;
		cbObj=cbob;
	}
	
	//resets the current frame number.
	this.reset = function(){
		pos=0;
	}
	
	//doubles the current frame rate and resets the interval, if playing.
	this.doubleFrameRate = function(){
		if(this.fps*2<=32) this.fps *=2;
		if(playing) this.renewRefreshTimer(); 
	}
	
	//halves the current frame rate, if possible, and resets the interval.
	this.halveFrameRate = function(){
		if(this.fps/2>1) this.fps /=2;
		if(playing) this.renewRefreshTimer(); 
	}
};
