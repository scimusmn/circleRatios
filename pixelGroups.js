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

function pixGroup(wd,hgt){
	var self=this;
	this.pixels = [];
	this.center = {x:0,y:0};
	
	this.findCenter = function(){
		var min = {x:wd,y:hgt};
		var max = {x:0,y:0};
		for(var i=0; i<self.pixels.length; i++){
			var x = self.pixels[i]%wd;
			var y = Math.floor(self.pixels[i]/wd);
			if(x>max.x) max.x=x;
			if(x<min.x) min.x=x;
			if(y>max.y) max.y=y;
			if(y<min.y) min.y=y;
		}
		self.center = {x:(max.x+min.x)/2,y:(max.y+min.y)/2};
	}
}

function pixelGroups(){
	var pixels=null;
	var data=null,ind=0;
	this.pixLabels = [];
	this.labels = [];
	this.groups = [];
	
	var self =this;
	
	
	
	this.makeGroups = function(imgD){
		self.pixLabels.length = 0;
		pixels=imgD;
		data=imgD.data;
		
		self.assignLabels();
		self.groupLabels();
		for(var i=self.groups.length; i--;){
			self.groups[i].findCenter();
		}
	}
	
	this.assignLabels = function(){
		var wd = pixels.width;									//width of the data
		var nextLabel = 1;										//label of next group
		for(var i=0; i<data.length; i+=4){
			if(data[i]){										//if the point is white
				var n = i-4,w = i-wd*4;							//get index of the points north and west of the current
				var nLabel = (n>=0)?self.pixLabels[n/4]:null;		//get label, if any of the north pixel
				var wLabel = (w>=0)?self.pixLabels[w/4]:null;		//get label, if any of the north pixel
				var lbl = (nLabel&&wLabel)?Math.min(nLabel,wLabel):		// if both n and w are labeled, choose the lower of the two
					(nLabel)?nLabel:(wLabel)?wLabel:nextLabel++;		//if only one of them has a label, choose it, else, assign a new label
					
				if(lbl<self.labels.length) lbl = self.findRootLabel(lbl-1);
				
				if(nLabel&&wLabel) 										//if n&w were labeled differently,
					self.labels[Math.max(nLabel,wLabel)-1]=lbl; 		//change the reference of the higher label to the lower
				else if(!nLabel&&!wLabel) self.labels.push(lbl);
				
				self.pixLabels[i/4]=lbl;
			}
		}
	}
	
	this.findRootLabel= function(lbl){
		if(lbl+1==self.labels[lbl]) return self.labels[lbl];
		else return self.findRootLabel(self.labels[lbl]-1);
	}
	
	this.groupLabels = function(){
		var equi =[];
		for(var i=0; i<self.pixLabels.length; i++){
			if(self.pixLabels[i]){
				var lbl = self.findRootLabel(self.pixLabels[i]-1);
				var grpNum = equi.indexOf(lbl);
				if(grpNum<=-1){
					grpNum=equi.push(lbl)-1;
					self.groups.push(new pixGroup(pixels.width,pixels.height));
				}
				self.pixLabels[i] = lbl;
				var grp = self.groups[grpNum];
				grp.pixels.push(i);
			}
		}
	}
}

function distance(p1,p2){
	return Math.sqrt(Math.pow((p2.x-p1.x),2)+Math.pow((p2.y-p1.y),2));
}

Array.prototype.min = function(){
	return Math.min.apply({},this);
}

Array.prototype.max = function(){
	return Math.max.apply({},this);
}

Array.prototype.last = function(){
	return this[this.length-1];
}

function groupTracker(){
	var self = this;
	this.tracked=[];
	
	this.trackGroups = function(newGroups){
		if(!self.tracked.length) self.tracked = newGroups;
		else{
			var used = [newGroups.length];
			var replaced = [self.tracked.length];
			for(var i=0; i<self.tracked.length; i++){
				var dists= [];
				for(var j=0; j<newGroups.length; j++){
					dists.push(distance(self.tracked[i].center,newGroups[j].center));
				}
				var closest= dists.indexOf(dists.min());
				if(!used[closest]) self.tracked[i] = newGroups[closest],replaced[i]=true;
				used[closest]=true;
			}
			while(newGroups.length>self.tracked.length){
				self.tracked.push(newGroups[self.tracked.length]);
			}
			if(self.tracked.length>newGroups.length){
				for(var i=0; i<self.tracked.length; i++){
					if(!replaced[i]){
						self.tracked.splice(i,1);
						replaced.splice(i,1);
					}
				}
			}
			
		}
	}
}