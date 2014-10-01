var coord = function(indx,wd){
	return {x:(indx/4)%wd,y:Math.floor((indx/4)/wd)};
}

function grpPixel(indx,coord){
	this.index = indx;
	this.x = coord.x;
	this.y = coord.y;
	
	this.edge = false;
}

function pixGroup(){
	var self = this;
	this.pixels = [];
	
	this.center = function(){
		var min = {x:10000,y:10000};				//set the default min to the biggest possible value
		var max = {x:0,y:0};						//set the default max to the smallest possible value
		for(var i=0; i<self.pixels.length; i++){	//iterate
			var x = self.pixels[i].x;				
			var y = self.pixels[i].y;
			if(x>max.x) max.x=x;
			if(x<min.x) min.x=x;
			if(y>max.y) max.y=y;					//find min and max
			if(y<min.y) min.y=y;
		}
		return {x:(max.x+min.x)/2,y:(max.y+min.y)/2};	//return center of min and max
	}
}

function pixelGroups(){
	var img=null;					//var to hold image
	var data=null;					//to hold the char*
	this.pixels = [];				//keeps track of checked pixels
	this.blobs = [];				//array of extracted blobs
	
	var self =this;
	
	/****************************************************************
	* checkPixel- iterative function to find connected pixels
	* 	takes a starting position and a group to record the blob into
	*****************************************************************/
	
	function checkPixel(indx,grp){
		if(!self.checked(indx)){
			if(data[indx]){
				var newGrp=false;
				if(grp===null) grp = new pixGroup(),newGrp=true; 
				var edge=0;
				var cord = coord(indx,img.width);
				var pos = grp.pixels.push(new grpPixel(indx,cord))-1;
				self.pixels[indx/4] = 1;
				
				if(cord.x+1<img.width) edge+=checkPixel(indx+4,grp);
				if(cord.x-1>=0) edge+=checkPixel(indx-4,grp);
				if(cord.y+1<img.height) edge+=checkPixel(indx+img.width*4,grp);
				if(cord.y-1>=0) edge+=checkPixel(indx-img.width*4,grp);
				
				if(edge<4) grp.pixels[pos].edge=true;
				if(newGrp) self.blobs.push(grp);
				return 1;
			}
			else{
				self.pixels[indx/4]=0;
				return 0;
			}
		}
		else return self.pixels[indx/4];
	}
	
	this.extractBlobs = function(imgD){
		self.pixels.length = 0;
		self.blobs.length=0;
		img=imgD;
		data=imgD.data;
		self.pixels.length = data.length/4;
		for(var i=self.pixels.length; i--;){
			self.pixels[i]=null;
		}
		
		for(var i=0; i<data.length; i+=4){
			if(!self.checked(i)) checkPixel(i,null);
		}
		
		console.log(self.blobs.length);
	}
	
	
	this.checked = function(indx){
		return self.pixels[indx/4]!==null;
	}
}