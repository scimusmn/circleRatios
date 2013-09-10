var coord = function(indx,wd){
	return {x:(indx/4)%wd,y:Math.floor((indx/4)/wd)};
}

function grpPixel(indx,coord){
	this.index = indx;
	var self = this;
	this.x = coord.x;
	this.y = coord.y;
	
	this.edge = false;
}

function pixelGroup(){
	var pixels=null;
	var data=null,ind=0,variance=0;
	this.pixels = [];
	
	var self =this;
	
	var grey = function(i){
		return (data[i]+data[i+1]+data[i+2])/3;
	}
	
	var gray = 0;
	
	function checkPixel(indx){
		if(!self.inGroup(indx)){
			var edge=0;
			var cord = coord(indx,pixels.width);
			if(Math.abs(grey(indx)-gray)<=variance){
				var cur = new grpPixel(indx,cord);
				var pos = self.pixels.push(cur)-1;
				if(cord.x+1<pixels.width) edge+=checkPixel(indx+4);
				if(cord.x-1>=0) edge+=checkPixel(indx-4);
				if(cord.y+1<pixels.height) edge+=checkPixel(indx+pixels.width*4);
				if(cord.y-1>=0) edge+=checkPixel(indx-pixels.width*4);
				if(edge<4) self.pixels[pos].edge=true;
				return 1;
			}
			else return 0;
		}
		else return 1;
	}
	
	this.center = function(){
		var min = {x:pixels.width,y:pixels.height};
		var max = {x:0,y:0};
		for(var i=0; i<self.pixels.length; i++){
			var x = self.pixels[i].x;
			var y = self.pixels[i].y;
			if(x>max.x) max.x=x;
			if(x<min.x) min.x=x;
			if(y>max.y) max.y=y;
			if(y<min.y) min.y=y;
		}
		return {x:(max.x+min.x)/2,y:(max.y+min.y)/2};
	}
	
	this.makeGroup = function(imgD,i,vari){
		self.pixels.length = 0;
		pixels=imgD;
		data=imgD.data;
		ind = i;
		variance = vari;
		gray = grey(ind);
		
		checkPixel(ind);
		//console.log(self.pixels.length);
	}
	
	
	this.inGroup = function(indx){
		var ret = false;
		for(var i=0; i<self.pixels.length; i++){
			if(self.pixels[i].index==indx) ret = true;
		}
		return ret;
	}
}