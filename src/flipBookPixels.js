	function flipbook(){
	
		var self = this;
	
		//var canvas = cnvs;
		var maxFrames = 100;
		var top = 0;
	
		var frames = new Array(maxFrames);			//create the array of images which we flip through
		
		//define what image to show if there are no images in the stack
		var defaultSrc = "assets/pngs/nullImage.png";
		var noFramesImg = new Image();
		//define what to do when the image loads; in this case, nothing!
		noFramesImg.onload = function(){
		};
		//define src after the onload()
		noFramesImg.src = defaultSrc;
		
		//define reference-able vars for frames per second and dimensions  
		this.fps = 1;
		this.width = 0;
		this.height =0;

		//no reason to have this!
		this.init=function(){
		};
		
		//returns the total number of frames in the stack
		this.length = function(){
			return top;
		};
		
		//returns the imageData stored in the NUMth frame, if available, else NULL
		this.frame = function(num){
			if(num>=0&&num<top) return frames[num];
			else return null;
		}
		
		//clears the frame stack, setting each frame to null, and zeroing "top"
		this.clear = function(){
			for(var i=0; i<maxFrames; i++){
				frames[i] = null;
			}
			top = 0;
		}
		
		//adds a new frame, using the imageData from a canvas context object.
		this.addFrameFromCtx = function(ctx){
			if(top<maxFrames){					//if we haven't filled up the stack
				this.width = ctx.canvas.width;		//get the dimensions of the frame
				this.height = ctx.canvas.height;
				
				//and grab the full frame using getImageData
				var frm = ctx.getImageData(0,0,ctx.canvas.width,ctx.canvas.height);
				frames[top] = frm; //store the data in the "top" frame, and increment "top"
				top++;
				//frames.last().src = frm;
			}
		};
		
		//if there is a frame in the stack, pop the top frame and decrement "top"
		this.popTopFrame = function(){
			if(top){
				frames[top]=null;
				top--;
			}
		};
		
		//draw an image into a context, if available. If no frames in stack, display null image.
		this.drawFrame=function(ctx,x,y){			//display image
			var wid = ctx.canvas.width;
			var hgt = ctx.canvas.height;
			if(top){
				ctx.putImageData(frames[top-1], x,y);
			}
			else{
				ctx.drawImage(noFramesImg, x,y,wid,hgt);
			}
		};
	};
	