var frameStrip = function(){
	var self = this;
	var strip = new smmCanvas($("strip"));							//declare the frame strip canvas
	var temp = new smmCanvas(document.createElement("canvas"));		//create a temporary canvas to draw image data to.
	
	//declare variables to store dimensions.
	var wid = 0;
	var hgt = 0;
	var pb = null;			//the playback object
	var ctx = strip.ctx;	//the strip context
	
	//slide is the offset position of the drawing frames; this is used to
	//create the sliding on or off effect when a frame is added or removed.
	var slide =0;		
	var slideInc =0;
	
	//resizes the strip canvas and the temporary (not displayed) canvas.
	this.resize = function(w,h,imgW,imgH){
		wid=w;
		hgt=h;
		strip.resize(w,h);
		
		//temp must be sized to the captured frame size, since we are writing imageData to this canvas
		temp.resize(imgW,imgH);		
	}
	
	//bind the playback function to the strip canvas, so we can access pb.fps and pb.book.frame
	this.registerPB = function(plyBk){
		pb=plyBk;
	}
	
	//function used to draw the strip on screen. Only called on resize, frame capturing or deleting, and changing fps
	this.draw = function(){
		strip.clear();					//clear the canvas
		
		//draw a black rectangle over the whole canvas
		ctx.beginPath();			
		ctx.rect(0,0,wid,hgt);
		ctx.fillStyle="#000000";
		ctx.fill();
		//if the playback object has been registered...
		if(pb){
			for(var i=0; i<pb.fps+1; i++){ 				//for each frame per second of playback rate
				var tWid = wid/pb.fps;					//define the width of a cell
				var tX = wid-(i+1)*wid/pb.fps+slide;	// and its starting position
				
				//if there are at least i frames in the "book" object...
				if(i<pb.book.length()){
					//write the frame data to the temporary canvas
					temp.ctx.putImageData(pb.book.frame((pb.book.length()-1)-i),0,0);
					//and use that canvas to draw the rescaled image into the frame cell.
					ctx.drawImage(temp.elem,tX+5,5,tWid-10,hgt-10);
					
					//we do this because images cannot be scaled when using putImageData
				}
				else { //if there are more cells than frames in "book"
					//draw a blue rectangle
					ctx.beginPath();
					ctx.rect(tX+5,5,tWid-10,hgt-10);
					ctx.fillStyle='rgba(0,122,165,.5)';
					ctx.fill();
				}
				//draw a white frame around the frame cell
				ctx.beginPath();
				ctx.rect(tX+5,5,tWid-10,hgt-10);
				ctx.strokeStyle="#ffffff";
				ctx.lineWidth=2;
				ctx.stroke();
				//and write "1 frame" into the middle of the cell, rotating if the text is too long to fit horizontally
				ctx.fillStyle="#ffffff";
				ctx.font = "bold 12px sans-serif";
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.save();
				if(ctx.measureText("1 frame").width>(tWid-10)*.8){
					ctx.rotate(degToRad(90));
					ctx.fillText("1 frame",hgt/2,-(tX+5+(tWid-10)/2));
				}
				else ctx.fillText("1 frame",tX+5+(tWid-10)/2,hgt/2);
				ctx.restore();
			}
		}
		if(Math.abs(slide)>=Math.abs(slideInc)){		//if "slide" is greater than 4,
			slide+=slideInc;			//increment "slide" by slideInc
			setTimeout(self.draw.bind(self),20);	//and set draw to be called again in 20 milliseconds
		}
		else slide = 0; 		//if slide is less than 4, set slide to zero. This needs to be done because after incrementing by slideInc,
		//slide won't necessarily reach zero; it could be up to 4 off. 
	}
	
	this.newFrame = function(){
		slide = Math.floor(wid/pb.fps);					//set the value of slide to exactly the width of one cell in the frame strip
		slideInc=-(Math.floor((wid/pb.fps)/5));			//set the increment to -1/5th the initial value of slide.
		this.draw();									//start drawing the sliding frames.
	}
	
	this.popFrame = function(){
		slide = -Math.floor(wid/pb.fps);				//set the value of slide to exactly the negative width of one cell in the frame strip
		slideInc=(Math.floor((wid/pb.fps)/5));			//set the increment to 1/5th the initial value of slide.
		this.draw();									// start drawing the sliding strip
	}
};

var fStrip = new frameStrip();