//this is a rudimentary way of creating classes in javascript. referred to as a singleton.
	//this is essentially a one-off class- you can also name the function and use that to create individual instances of the class
	
	function flipbook(){
	
		var self = this;
	
		//var canvas = cnvs;
		var maxFrames = 100;
		var plyBkCtx = null;
		
		var imgSld;
	
		var frames = [];			//create the array of images which we flip through
		var nDisp=0;			//stores the value of the current image being displayed
		var bPlaying=false;
		var numImg = 200;
		
		var imgPad=20;
		
		var stopCallback;
		var callbackObj;
		
		//canvas.width= 512+imgPad;
		//canvas.height = 576+imgPad;
		
		var defaultSrc = "assets/pngs/nullImage.png";
		var noFramesImg = new Image();
		noFramesImg.onload = function(){
			//canvas.width= noFramesImg.width+imgPad;
			//canvas.height = noFramesImg.height+imgPad;
		};
		noFramesImg.src = defaultSrc;
		
		var imageLoaded = 1;
		
		var refreshTimer = null;
		
		this.fps = 1;


		//this is declaring member functions of the book class. 
		
		this.init=function(){
			frames = [];
			imageLoaded = 0;
		};
		
		this.length = function(){
			return frames.length;
		};
		
		this.frame = function(num){
			if(num>=0&&num<frames.length) return frames[num];
			else return null;
		}
		
		this.clear = function(){
			bPlaying=false;
			for(var i=0; i<frames.length; i++){
				//revokeBlobURL(frames[i].src);
				frames[i].src = null;
			}
			frames = null;
			frames = [];
		}
		
		this.addFrame = function(frm){
			var img = new Image();
			frames.push(img);
			frames.last().src = frm;
		};
		
		this.addFrameFromCtx = function(ctx){
			if(frames.length<maxFrames){
				var frm = ctx.canvas.toDataURL();
				//frm = b64toBlobURL(frm,'image/png');
				var img = new Image();
				frames.push(img);
				frames.last().src = frm;
			}
		};
		
		this.popTopFrame = function(){
			if(frames.length){
				//revokeBlobURL(frames.last().src);
				frames.pop();
			}
		};
		
		this.drawFrame=function(ctx,x,y){			//display image
			var wid = ctx.canvas.width;
			var hgt = ctx.canvas.height;
			if(frames.length&&!bPlaying){
				ctx.drawImage(frames.last(), x,y,wid,hgt);
			}
			else if(bPlaying&&frames.length){
				ctx.drawImage(frames[nDisp], x,y,wid,hgt);
			}
			else{
				ctx.drawImage(noFramesImg, x,y,wid,hgt);
			}
		};
		
		this.displayFrame=function(){
			if(frames.length&&!bPlaying){
				return frames.last();
			}
			else if(frames.length) return frames[nDisp];
			else return noFramesImg;
		}
		
		this.idle=function(){						//increment the image pointer, if we are playing
			if(bPlaying&&nDisp<frames.length-1){
				if(plyBkCtx){
					self.drawFrame(plyBkCtx,0,0);
				}
				nDisp++;
			}
			if(frames.length-1<=nDisp){
				self.stop();
				nDisp = 0;
			}
		};
		
		this.connectSlider = function(sld){
			imgSld=sld;
		}
		
		this.isPlaying = function(){
			return bPlaying;
		}
		
		this.renewRefreshTimer = function(){
			clearInterval(refreshTimer);
			refreshTimer = setInterval(this.idle.bind(this),1000/this.fps);
		}
		
		this.play = function(){
			bPlaying=true;
			self.idle();
			refreshTimer = setInterval(this.idle.bind(this),1000/this.fps);
		}
		
		this.stop = function(){
			bPlaying=false;
			stopCallback.call(callbackObj);
			clearInterval(refreshTimer);
		}
		
		this.togglePlay=function(){
			if(bPlaying) this.stop();
			else this.play();
		};
		
		this.registerStopCB = function(sCB,cbObj){
			stopCallback=sCB;
			callbackObj=cbObj;
		}
		
		this.registerPlaybackCtx = function(ctx){
			plyBkCtx = ctx;
		}
		
		this.changePosByValue=function(val){
			nDisp=val;
		};
		
		this.changePosByPercent=function(perc){
			nDisp=Math.round(perc*(tiles.length-1));
		};
		
		this.reset=function(){
			nDisp=0;
			bPlaying=false;
			if(imgSld) imgSld.changeVal(0);
		};
		
	};
	