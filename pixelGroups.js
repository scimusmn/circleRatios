var coord = function(indx,wd){
	return {x:(indx/4)%wd,y:Math.floor((indx/4)/wd)};
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
					
				if(lbl<self.labels.length) lbl = self.findRootLabel(lbl-1); //find the lowest ref number
				
				if(nLabel&&wLabel) 										//if n&w were labeled differently,
					self.labels[Math.max(nLabel,wLabel)-1]=lbl; 		//change the reference of the higher label to the lower
				else if(!nLabel&&!wLabel) self.labels.push(lbl);		//if we made a new label, add it to the stack
				
				self.pixLabels[i/4]=lbl;								//assign the label to the pixel
			}
		}
	}
	
	this.findRootLabel= function(lbl){									//finds the lowest in a stack of references
		if(lbl+1==self.labels[lbl]) return self.labels[lbl];
		else return self.findRootLabel(self.labels[lbl]-1);
	}
	
	this.groupLabels = function(){								//groups pixels according to their assigned labels
		var equi =[];												//create array to hold new group numbers
		for(var i=0; i<self.pixLabels.length; i++){						//iterate through the array of labeled pixels
			if(self.pixLabels[i]){											//if the pixel is labeled
				var lbl = self.findRootLabel(self.pixLabels[i]-1);			//find the lowest reference label
				var grpNum = equi.indexOf(lbl);								//check to see if there is a group number for that label
				if(grpNum<=-1){												//if not,
					grpNum=equi.push(lbl)-1;										//create a group number,
					self.groups.push(new pixGroup(pixels.width,pixels.height));		//and create a group
				}
				self.pixLabels[i] = lbl;									//change the pixel label to the lowest reference
				var grp = self.groups[grpNum];								//push the pixel into the appropriate group
				grp.pixels.push(i);
			}
		}
	}
}

/*******************
* This is a function for tracking the blobs of pixels moving through an image.
* 	Not currently used for anything, but mostly functioning.
********************/


function groupTracker(){
	var self = this;
	this.tracked=[];										//Create the array to hold the blobs which are tracked
	
	/*** call this function on a group of blobs, to keep track of which group is which 
	 *		will support additions and subtractions to the group of track objects
	 ***************/
	
	this.trackGroups = function(newGroups){
		if(!self.tracked.length) self.tracked = newGroups;			//if there are no tracked objects, track the new objects and continue.
		else{														// otherwise,
			var used = [newGroups.length];								//create an array to catalog which objects have been found this run through.
			var replaced = [self.tracked.length];						//create array to track which objects have been replaced by new objects this time.
			for(var i=0; i<self.tracked.length; i++){				//iterate through the tracked blob array.
				var dists= [];											//make an array to hold the distance to center of new and old blobs
				for(var j=0; j<newGroups.length; j++){					// calculate the distances between the new objs and old.
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
						i--;
					}
				}
			}
			
		}
	}
}

function pointTracker(){
	var self = this;
	var bgPoints = [];
	this.point = null;
	
	this.acquireBG = function(newGroups){
		bgPoints = newGroups;
	}
	
	this.findPoint = function(newGroups){
		if(bgPoints){
			var cut = [newGroups.length];
			var left = newGroups.length;
			for(var i=0; i<bgPoints.length; i++){
				var dists = [];
				if(bgPoints[i].pixels.length>4)
				for(var j=0; j<newGroups.length; j++){
					if(distance(bgPoints[i].center,newGroups[j].center)<25||newGroups[j].pixels.length<3){
						cut[j]=true,left--;
						if(self.point&&distance(self.point,newGroups[j].center)<=25&&newGroups[j].pixels.length>3){
							cut[j]=undefined,left++;
						}
					}
				}
			}
			console.log(left);
			if(left>0){
				var average = {x:0,y:0};
				for(var i=newGroups.length; i--;){
					if(cut[i]===undefined){
						average.x+=newGroups[i].center.x;
						average.y+=newGroups[i].center.y;
					}
				}
				average.x/=left;
				average.y/=left;
				self.point = average;
				
			}
			else self.point = null;
		}
	}
}

/*function getControlPoints(x0,y0,x1,y1,x2,y2,t){
    var d01=Math.sqrt(Math.pow(x1-x0,2)+Math.pow(y1-y0,2));
    var d12=Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
    var fa=t*d01/(d01+d12);   // scaling factor for triangle Ta
    var fb=t*d12/(d01+d12);   // ditto for Tb, simplifies to fb=t-fa
    var p1x=x1-fa*(x2-x0);    // x2-x0 is the width of triangle T
    var p1y=y1-fa*(y2-y0);    // y2-y0 is the height of T
    var p2x=x1+fb*(x2-x0);
    var p2y=y1+fb*(y2-y0);  
    return {p1:{x:p1x,y:p1y},p2:{x:p2x,y:p2y}};
}*/

function pointTrace(){
	var self = this;
	this.points = [];
	var maxPoints = 10;
	var trcWd =6;
	
	var canvas = $("main");
	var ctx = canvas.getContext("2d");
	
	this.addPoint = function(pnt){
		//console.log(pnt);				//{x: 0.0046875, y: 0.004166666666666667} 1.5, 1
		if(self.points.length){
			if(pnt.x*window.innerWidth!==self.points.last().x||pnt.y*window.innerHeight!==self.points.last().y){
				self.points.push({x:pnt.x*window.innerWidth,y:pnt.y*window.innerHeight});
				if(self.points.length>=maxPoints) self.points.splice(0,1);
			}
		}
		else self.points.push({x:pnt.x*window.innerWidth,y:pnt.y*window.innerHeight});
	}
	
	this.color="#f00";
	
	this.draw = function(x,y){
	
		if(self.points.length>2){
			ctx.beginPath();
			ctx.lineWidth=trcWd;
			ctx.strokeStyle=self.color;
			var xc = (self.points[0].x + self.points[1].x) / 2;
			var yc = (self.points[0].y + self.points[1].y) / 2;
			ctx.moveTo(xc, yc);
			for (i = 1; i < self.points.length - 1; i ++){
				xc = (self.points[i].x + self.points[i + 1].x) / 2;
				yc = (self.points[i].y + self.points[i + 1].y) / 2;
				
				/*******
				var p=self.points[i-1];
				var c=self.points[i];
				var n = self.points[i+1];
				contPt.push(getControlPoints(p.x,p.y,c.x,c.y,n.x,n.y,.5));
				*******/
				
				ctx.quadraticCurveTo(self.points[i].x, self.points[i].y, xc, yc);
			}
			
			/********
			var pnts = self.points;
			//ctx.quadraticCurveTo(pnts[1].x, pnts[1].y, contPt[0].p1.x,contPt[0].p1.y);
			for(var i=2; i<pnts.length-3; i++){
				ctx.bezierCurveTo(pnts[i].x,pnts[i].y,contPt[i].p2.x,contPt[i].p2.y,contPt[i+1].p1.x,contPt[i+1].p1.y);
			}
			********/
			
			// curve through the last two points
			var i = self.points.length-2;
			//ctx.strokeStyle="rgba(255,0,0,0)";
			//ctx.quadraticCurveTo(self.points[i].x, self.points[i].y, self.points[i+1].x,self.points[i+1].y);
			ctx.stroke();
			ctx.fillStyle=this.color;
			ctx.beginPath();
			ctx.lineWidth=1;
			ctx.arc(xc,yc,trcWd/2,0,2*Math.PI);
			ctx.arc((self.points[0].x + self.points[1].x) / 2,(self.points[0].y + self.points[1].y) / 2,trcWd/2,0,2*Math.PI);
			ctx.fill();
		}
	}
	this.clear = function(){
		self.points.length=0;
		ctx.clearRect(0,0,canvas.width,canvas.height);
	}
	
	this.jump = function(){
		self.points.length=0;
	}
	
}

function averageWhitePos(img){
	var data=img.data;
	var cnt = 0;
	var ret = {x:0,y:0};
	for(var i=0; i<data.length; i+=4){
		if(data[i]){
			cnt++;
			ret.x+=(i/4)%img.width;
			ret.y+=Math.floor((i/4)/img.width);
		}
	}
	ret.x/=cnt;
	ret.y/=cnt;
	return ret;
}