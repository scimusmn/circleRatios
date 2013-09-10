var coord = function(indx,wd){
	return {x:(indx/4)%wd,y:Math.floor((indx/4)/wd)};
}

function grpPixel(indx,coord){
	this.index = indx;
	this.label = null;
	this.x = coord.x;
	this.y = coord.y;
	
	this.edge = false;
}

function pixGroup(label,wd){
	var self=this;
	this.pixels = [];
	
	this.ref = label;
	
	this.center = function(){
		var min = {x:wd,y:10000};
		var max = {x:0,y:0};
		for(var i=0; i<self.pixels.length; i++){
			var x = self.pixels[i]%wd;
			var y = Math.floor(self.pixels[i]/wd);
			if(x>max.x) max.x=x;
			if(x<min.x) min.x=x;
			if(y>max.y) max.y=y;
			if(y<min.y) min.y=y;
		}
		return {x:(max.x+min.x)/2,y:(max.y+min.y)/2};
	}
	
	this.addLabel = function(lbl){
		if(labels.indexOf(lbl) <= -1) labels.push(lbl);
	}
}

function pixelGroups(){
	var pixels=null;
	var data=null,ind=0;
	this.pixLabels = [];
	this.groups = [];
	
	var self =this;
	
	
	
	this.makeGroups = function(imgD){
		self.pixLabels.length = 0;
		pixels=imgD;
		data=imgD.data;
		
		self.assignLabels();
		self.groupLabels();
	}
	
	this.assignLabels = function(){
		var wd = pixels.width;									//width of the data
		var nextLabel = 1;										//label of next group
		for(var i=0; i<data.length; i+=4){
			if(data[i]){										//if the point is white
				var n = i-4,w = i-wd*4;							// index of the points north and west of the current
				var nLabel = (n>=0)?self.pixLabels[n/4]:null;		//
				var wLabel = (w>=0)?self.pixLabels[w/4]:null;
				var lbl = (nLabel&&wLabel)?Math.min(nLabel,wLabel):		
					(nLabel)?nLabel:(wLabel)?wLabel:nextLabel++;
				
				if(nLabel&&wLabel) self.groups[Math.max(nLabel,wLabel)-1].ref=lbl;
				else if(!nLabel&&!wLabel) self.groups.push(new pixGroup(lbl,wd));
				
				self.pixLabels[i/4]=lbl;
			}
		}
	}
	
	this.findRootGroup= function(lbl){
		if(lbl+1==self.groups[lbl].ref) return self.groups[lbl];
		else return self.findRootGroup(self.groups[lbl].ref-1);
	}
	
	this.groupLabels = function(){
		for(var i=0; i<self.pixLabels.length; i++){
			if(self.pixLabels[i]){
				var grp = self.findRootGroup(self.pixLabels[i]-1);
				self.pixLabels[i] = grp.ref;
				grp.pixels.push(i);
			}
		}
	}
}