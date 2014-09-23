function overlayDiv (el){
	var self = this;
	
	this.div = el;
	this.display = false;
	
	this.hide = function(){
		this.div.style.display = "none";
		this.display = false;
	}
	
	this.show = function(){
		this.div.style.display = "block";
		this.display = true;
	}
};