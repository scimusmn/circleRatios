
/*******************
* function coord
* Input- the index of an array of pixels and the width of the image the pixels came from.
* Return- the {x,y} point that is represented by the inputs
********************/

var coord = function(indx,wd) {
  return {x:(indx / 4) % wd, y:Math.floor((indx / 4) / wd)};    //return x,y coord based on index and width
};

/*******************
* Class- pixGroup
* A container to hold the addresses of all contiguous, similarly colored pixels.
********************/

function pixGroup(wd,hgt) {
  var _this = this;
  this.pixels = [];
  this.center = {x:0,y:0};


  /*******************
  * Function to find the center of a group of pixels.
  * No return, but stores center location in pixGroup's "center" point.
  ********************/

  this.findCenter = function() {             //calc the group center
    var min = {x:wd,y:hgt};
    var max = {x:0,y:0};
    for (var i = 0; i < _this.pixels.length; i++) {
      var x = _this.pixels[i] % wd;
      var y = Math.floor(_this.pixels[i] / wd);
      if (x > max.x) max.x = x;
      if (x < min.x) min.x = x;
      if (y > max.y) max.y = y;
      if (y < min.y) min.y = y;
    }
		
    _this.center = {x:(max.x + min.x) / 2,y:(max.y + min.y) / 2};
  };
};

/*******************
* Class pixelGroups
* Container to manage all of the groups of pixels in a 2-toned image.
********************/

function pixelGroups(){
  var pixels=null;
  var data=null,ind=0;
  this.pixLabels = [];
  this.labels = [];
  this.groups = [];

  var _this =this;

  /******** This is the function call to compile all connected points into groups *****/

  this.makeGroups = function(imgD){
    _this.pixLabels.length = 0;      //reset the pixel Label array
    pixels=imgD;          // set "pixels" to the new image
    data=imgD.data;          // set "data" to the image data

    _this.assignLabels();      //assign labels.
    _this.groupLabels();            //group pixels by labels
    for(var i=_this.groups.length; i--;){
      _this.groups[i].findCenter();    //find the center of each group.
    }
  }

  /****
  * function assignLabels
  * Steps through an image to find connected groups of pixels.
  * For each pixel, checks the pixel above and immediately to the left;
  * if either has been assigned a group number, the current pixel is assigned that group number
  * If the pixels to the left and above are valid, and have different numbers, the lowest value is assigned,
  * and the two group numbers are marked as equivalent.
  *
  * To mark groups as equivalent, each label is assigned a reference number in the pixelGroups
  * "labels" array. See "findRootLabel"
  ****/

  this.assignLabels = function(){
    var wd = pixels.width;                  //width of the data
    var nextLabel = 1;                    //label of next group
    for(var i=0; i<data.length; i+=4){
      if(data[i]){                    //if the point is white
        var n = i-4,w = i-wd*4;              //get index of the points north and west of the current
        var nLabel = (n>=0)?_this.pixLabels[n/4]:null;    //get label, if any of the north pixel
        var wLabel = (w>=0)?_this.pixLabels[w/4]:null;    //get label, if any of the north pixel
        var lbl = (nLabel&&wLabel)?Math.min(nLabel,wLabel):    // if both n and w are labeled, choose the lower of the two
          (nLabel)?nLabel:(wLabel)?wLabel:nextLabel++;    //if only one of them has a label, choose it, else, assign a new label

        if(lbl<_this.labels.length) lbl = _this.findRootLabel(lbl-1); //find the lowest ref number

        if(nLabel&&wLabel)                     //if n&w were labeled differently,
          _this.labels[Math.max(nLabel,wLabel)-1]=lbl;     //change the reference of the higher label to the lower
        else if(!nLabel&&!wLabel) _this.labels.push(lbl);    //if we made a new label, add it to the stack

        _this.pixLabels[i/4]=lbl;                //assign the label to the pixel
      }
    }
  }

  /*******************
  * Iterative function which finds lowest label number of a group.
  * If labels[x] = x+1, then it is the lowest label for a group of pixels. If labels[x]≠x+1,
  * then the function calls it_this with the next lowest label, which in this case if labels[x]-1, so
  * it calls findRootLabel(labels[x]-1)
  ********************/

  this.findRootLabel= function(lbl){                  //finds the lowest in a stack of references
    if(lbl+1==_this.labels[lbl]) return _this.labels[lbl];
    else return _this.findRootLabel(_this.labels[lbl]-1);
  }

  /*****************
  * function groupLabels
  * once the labels have been assigned to a group of pixel using "assignLabels"
  * this function is called to group all equivalently-labeled pixels into their appropriate groups.
  ******************/

  this.groupLabels = function(){                //groups pixels according to their assigned labels
    var equi =[];                        //create array to hold new group numbers
    for(var i=0; i<_this.pixLabels.length; i++){            //iterate through the array of labeled pixels
      if(_this.pixLabels[i]){                      //if the pixel is labeled
        var lbl = _this.findRootLabel(_this.pixLabels[i]-1);      //find the lowest reference label
        var grpNum = equi.indexOf(lbl);                //check to see if there is a group number for that label
        if(grpNum<=-1){                        //if not,
          grpNum=equi.push(lbl)-1;                    //create a group number,
          _this.groups.push(new pixGroup(pixels.width,pixels.height));    //and create a group
        }
        _this.pixLabels[i] = lbl;                  //change the pixel label to the lowest reference
        var grp = _this.groups[grpNum];                //push the pixel into the appropriate group
        grp.pixels.push(i);
      }
    }
  }
}

/*******************
* This is a function for tracking the blobs of pixels moving through an image.
*   Not currently used for anything, but mostly functioning.
********************/


function groupTracker(){
  var _this = this;
  this.tracked=[];                    //Create the array to hold the blobs which are tracked

  /*** call this function on a group of blobs, to keep track of which group is which
   *    will support additions and subtractions to the group of track objects
   ***************/

  this.trackGroups = function(newGroups){
    if(!_this.tracked.length) _this.tracked = newGroups;      //if there are no tracked objects, track the new objects and continue.
    else{                            // otherwise,
      var used = [newGroups.length];                //create an array to catalog which objects have been found this run through.
      var replaced = [_this.tracked.length];            //create array to track which objects have been replaced by new objects this time.
      for(var i=0; i<_this.tracked.length; i++){        //iterate through the tracked blob array.
        var dists= [];                      //make an array to hold the distance to center of new and old blobs
        for(var j=0; j<newGroups.length; j++){          // calculate the distances between the new objs and old.
          dists.push(distance(_this.tracked[i].center,newGroups[j].center));
        }
        var closest= dists.indexOf(dists.min());                  //find the index of the new blob closest to the ith tracked blob
        if(!used[closest]) _this.tracked[i] = newGroups[closest],replaced[i]=true;  //if that blob hasn't been used, replace the tracked blob with the new
        used[closest]=true;                              //and mark that blob as used.
      }

      /******* this next part isn't right TODO: add only unused blobs *******/

      while(newGroups.length>_this.tracked.length){              //if there are more new blobs than tracked blobs
        _this.tracked.push(newGroups[_this.tracked.length]);          //add the new blobs
      }

      /******* this isn't quite right either TODO: create new array with only used blobs ********/

      if(_this.tracked.length>newGroups.length){          //if there are more tracked blobs than new blobs
        for(var i=0; i<_this.tracked.length; i++){        // remove all the unused blobs from the array
          if(!replaced[i]){
            _this.tracked.splice(i,1);
            replaced.splice(i,1);
            i--;
          }
        }
      }

    }
  }
}

/****************************************************
 *  pointTracker-
 *    this is a function used to detect which blobs out of a group are background blobs,
 *      and removes them as necessary, leaving only new blobs which were not detected as part of the background.
 *    This function also allows the tracked point to move across background blobs, and
 *     be tracked continuously.
 ****************************************************/

function pointTracker(){
  var _this = this;
  var bgPoints = [];          // create the array for storing which blobs are bg
  this.point = null;          // create the var which stores the location of tracked point

  var minPtSz =10;          // define the minimum blob size which can be tracked.

  this.acquireBG = function(newGroups){  //takes a group of blobs, and sets them as the bg blobs.
    bgPoints = newGroups;
  }

  this.findPoint = function(newGroups){
    if(bgPoints){                //if there are blobs recorded in the bg
      var cut = [newGroups.length];      //init array used to store the data about which blobs are probably in the bg.
      var left = newGroups.length-1;        //init counter for num blobs not in bg; not sure why I need to subtract 1, but I do.
      for(var i=0; i<bgPoints.length; i++){      // for each blob in the bg,
        for(var j=0; j<newGroups.length; j++){      // iterate through each new blob

          /****** and see if it is smaller than allowed, or close to a bg blob ****/

          if(cut[j]===undefined&&(distance(bgPoints[i].center,newGroups[j].center)<10||newGroups[j].pixels.length<minPtSz)){
            cut[j]=true,left--;                                        // if it is, cut it,
            if(_this.point&&distance(_this.point,newGroups[j].center)<=10&&newGroups[j].pixels.length>3){    //unless it's close to the tracked point.
              cut[j]=undefined,left++;
            }
          }
        }
      }
      if(left>0){                      //if there are any blobs found beside the bg blobs,
        var average = {x:0,y:0};            // average their centers
        for(var i=newGroups.length; i--;){
          if(cut[i]===undefined){
            average.x+=newGroups[i].center.x;
            average.y+=newGroups[i].center.y;
          }
        }
        average.x/=left;
        average.y/=left;
        _this.point = average;              //and record the average as the tracked point

      }
      else _this.point = null;
    }
  }
}

/*********************************************
 * pointTrace-
 *    generalized line tracing object. To draw a line, add points to the object
 *    using the "addPoint" function (between 0 and 1 in x and y), and it will draw
 *    smooth quadratic curves between each point.
 *********************************************/

function pointTrace(){
  var _this = this;
  this.points = [];      //create the array to store points to trace.
  var maxPoints = 10;      // define the max number of points to trace.
  var trcWd =6;        // define the width of the tracing line.

  var canvas = $("trace");        //link the canvas var to the "trace" canvas element
  var ctx = canvas.getContext("2d");      // get the canvas context.

  this.addPoint = function(pnt){
    if(_this.points.length){
      //if there are points in the array, check that the next point isn't the same as the previous
      if(pnt.x*window.innerWidth!==_this.points.last().x||pnt.y*window.innerHeight!==_this.points.last().y){
        _this.points.push({x:pnt.x*window.innerWidth,y:pnt.y*window.innerHeight});      // if not, add the point
        if(_this.points.length>=maxPoints)        // if there are more points than maxPoints
          _this.points.splice(0,1);              //delete the first point
      }
    }
    else _this.points.push({x:pnt.x*window.innerWidth,y:pnt.y*window.innerHeight}); //if there are no points in the array, add point
  }

  this.color="#f00";            //default color to trace with

  this.draw = function(x,y){

    if(_this.points.length>2){
      ctx.beginPath();          //begin tracing and set line width and color
      ctx.lineWidth=trcWd;
      ctx.strokeStyle=_this.color;
      var xc = (_this.points[0].x + _this.points[1].x) / 2;    //find the center between [0] and [1]
      var yc = (_this.points[0].y + _this.points[1].y) / 2;
      var xc0=xc,yc0=yc;                    //store center for drawing dots at beginning
      ctx.moveTo(xc, yc);                    //move to that center
      for (i = 1; i < _this.points.length - 1; i ++){        //iterate through points from the second to the second-to-last
        xc = (_this.points[i].x + _this.points[i + 1].x) / 2;    //find center between [i] and [i+1]
        yc = (_this.points[i].y + _this.points[i + 1].y) / 2;

        /*********** draw a curve from the previous location to the current, using the [i]-[i+1] center as control point ******/
        ctx.quadraticCurveTo(_this.points[i].x, _this.points[i].y, xc, yc);
      }

      ctx.stroke();            //draw filled circles at beginning and end
      ctx.fillStyle=this.color;
      ctx.beginPath();
      ctx.lineWidth=1;
      ctx.arc(xc,yc,trcWd/2,0,2*Math.PI);
      ctx.arc((_this.points[0].x + _this.points[1].x) / 2,(_this.points[0].y + _this.points[1].y) / 2,trcWd/2,0,2*Math.PI);
      ctx.fill();
    }
  }
  this.clear = function(){            //empty point array and clear canvas.
    _this.points.length=0;
    ctx.clearRect(0,0,canvas.width,canvas.height);
  }

  this.jump = function(){            // empty point array.
    _this.points.length=0;
  }

}
