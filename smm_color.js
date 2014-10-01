function rgbToHsl(r, g, b){
	r /= 255, g /= 255, b /= 255;
	var max = Math.max(r, g, b), min = Math.min(r, g, b);
	var h, s, l = (max + min) / 2;

	if(max == min){
		h = s = 0; // achromatic
	}else{
		var d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch(max){
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}
		h /= 6;
	}

	return [h, s, l];
}

function color(nm) {
	this.r = 0;
	this.g = 0;
	this.b = 0;
	
	this.h = 0;
	this.s = 0;
	this.l = 0;
	
	this.name = nm;
	
	var self = this;
	
	this.taught = false;
	
	this.value = 0;
	
	this.string = function (){
		return "rgb("+this.r+","+this.g+","+this.b+")";
	}
	
	this.set = function(rd,gn,bl){
		if(typeof rd == 'object') this.r=rd.r, this.g=rd.g, this.b=rd.b;
		else this.r=rd,this.g=gn,this.b=bl;
		var hsl = rgbToHsl(this.r,this.g,this.b);
		this.h=hsl[0];
		this.s=hsl[1];
		this.l=hsl[2];
	}
	
	this.shadePercent = function(rd,gn,bl){
		return 1-(Math.abs(this.r-rd)+Math.abs(this.g-gn)+Math.abs(this.b-bl))/768;
	}
	
	this.huePercent = function(rd,gn,bl){
		
		var hsl = rgbToHsl(rd,gn,bl);
		
		return hsl[0]>this.h ? this.h/hsl[0] : hsl[0]/this.h;
	}
	
	this.compareFunc = function(rd,gn,bl){
		var hueFit = this.huePercent(rd,gn,bl);
		
		var fit = hueFit*(this.shadePercent(rd,gn,bl));
		
		return fit;
	}
	
	this.compare = function(col,gn,bl){
		if(typeof col == 'object') return this.compareFunc(col.r,col.g,col.b);
		else return this.compareFunc(col,gn,bl);
	}
	
	this.teach = function(rd,gn,bl,val){
		this.value = val;
		this.set(rd,gn,bl);
		taught = true;
	}
	
}