function smmCanvas (el){
	this.elem = el;
	var self = this;
	this.ctx = el.getContext("2d");
	
	this.clear = function(){
		self.elem.width = self.elem.width;
	}
	
	this.mirror = function(){
		self.ctx.translate(self.elem.width, 0);
        self.ctx.scale(-1, 1);
	}
	
	this.resize = function(nw,nh){
		self.elem.width = nw;
		self.elem.height = nh;
	}
};