function palette(){
	var colors = [];
	
	var buttonHolder = $("buttons");
	
	var checkButton = $("check");
	
	var rgbRef = null;
	
	this.color = function (i){
		return colors[i];
	}
	
	this.newColor = function(colorName){
		var newCol = new color(colorName);
		var newPos = colors.push(newCol)-1;
		
		buttonHolder.appendChild(colors[newPos].teachButton());
	}
	
	this.addHandlers = function(handlerFunc){
		for(var i=0; i<colors.length; i++){
			colors[i].setHandler(handlerFunc);
		}
	}
	
	this.findColor = function(col){
		var compVal = 195075;
		var found = 0;
		for(var i=0; i<colors.length; i++){
			if(colors[i].isTaught()){
				var comp = colors[i].compByColor(col.rgb())
				if(!isNaN(comp)){
					if(comp<=compVal) {compVal=comp;found=i+1;}
				}
			}
		}
		if(found&&compVal<12000){
			return colors[found-1];
			
		}
		else return new color("default");
	}
}