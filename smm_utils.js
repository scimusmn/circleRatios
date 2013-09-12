var $ = function( id ) { 

	switch(id.charAt(0)){
		case '#':
			return document.getElementById( id.substr(1) );
			break;
		case '.':
			return document.getElementsByClassName( id.substr(1) );
			break;
		case '$': 
			return document.getElementsByTagName( id.substr(1) );
			break;
		default:
			return document.getElementById( id );
			break;
	}

};

function sign(x) {
    return (x > 0) - (x < 0);
}

function constrain(num, a, b){
	return num = Math.min(Math.max(num, a), b);
}

function degToRad(d) {
    // Converts degrees to radians
    return d * 0.0174532925199432957;
}

function extractNumber(value)
{
    var n = parseInt(value);
	
    return n == null || isNaN(n) ? 0 : n;
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