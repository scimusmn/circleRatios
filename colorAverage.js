var colAve = new function () {
	var samps = [];
	
	var sampleLimit = 100;
	
	this.averaging = function(){
		return samps.length;
	}
	
	this.limit = function(){
		return samps.length>=sampleLimit;
	}
	
	this.addSample = function(col){
		var newCol = new color("new");
		newCol.setByColor(col.rgb());
		samps.push(newCol);
	}
	
	this.clearSamples = function(){
		samps.length = 0;
	}
	
	this.averageColor = function(){
		var aves = []
		for(var j=0; j<3; j++){
			aves[j] = 0;
		}
		for(var i=0; i<samps.length; i++){
			console.log(i+":"+samps[i].rgb().r);
			aves[0] += samps[i].rgb().r;
			aves[1] += samps[i].rgb().g;
			aves[2] += samps[i].rgb().b;
		}
		for(var j=0; j<3; j++){
			aves[j] /= samps.length;
			aves[j] = Math.round(aves[j]);
		}
		
		
		
		var aveCol = new color("ave");
		aveCol.set(aves[0],aves[1],aves[2]);
		return aveCol;
	}
}