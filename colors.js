function color(name) {
	var r,g,b;
	
	var handler = null;
	
	var colorName = name;
	
	var self = this;
	
	var taught =false;
	
	this.value = 0;
	
	var button = document.createElement("a");
	button.setAttribute('href',"#");
	button.setAttribute('class',"teachButton");
	button.setAttribute('style',"color:"+name);
	button.innerHTML = "Teach "+name;
	
	this.isTaught = function(){
		return taught;
	}
	
	this.title = function(){
		return colorName;
	}
	
	this.teachButton = function(){
		return button;
	}
	
	this.string = function (){
		return "rgb("+r+","+g+","+b+")";
	}
	
	this.rgb = function(){
		return {r: r, g:g, b:b};
	}
	
	this.set = function(rd,gn,bl){
		r=rd,g=gn,b=bl;
		button.setAttribute('style',"background:"+self.string());
	}
	
	this.setByColor = function(col){
		r=col.r,g=col.g,b=col.b;
		button.setAttribute('style',"background:"+self.string());
	}
	
	this.compare = function(rd,gn,bl){
		if(!rd) rd=1; if(!gn) gn=1; if(!bl) bl=1;
		if(!r) r=1; if(!g) g=1; if(!b) b=1;
		var rg1 = r/g;
		var rg2 = rd/gn;
		var fitRG = Math.abs(Math.log(rg1/rg2));
		var rb1 = r/b;
		var rb2 = rd/bl;
		var fitRB = Math.abs(Math.log(rb1/rb2));
		
		var fit = fitRG*fitRB*(Math.pow(Math.abs(r-rd),3)+Math.pow(Math.abs(g-gn),3)+Math.pow(Math.abs(b-bl),3));
		
		return fit;
	}
	
	this.compByColor = function(col){
		return this.compare(col.r,col.g,col.b);
	}
	
	this.teach = function(rd,gn,bl,val){
		this.value = val;
		this.set(rd,gn,bl);
		taught = true;
	}
	
	this.handle = function(e){
		if(handler){
			taught = true;
			var rgbRet = handler();
			this.setByColor(rgbRet.rgb());
		}
		
		e.preventDefault();
	}
	
	button.addEventListener('click',this.handle.bind(this));
	
	this.setHandler = function(fxn){
		handler = fxn;
	}
	
}