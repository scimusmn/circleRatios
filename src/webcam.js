//object to initialize webcam usage; this works optimally when being run from an ssl server, so that no dialogues need to be pressed.

function camera() {
  var _this = this;

  this.img = document.createElement('video');//document.getElementById('cam');  //grab the video element named 'cam'

  this.startCam = function() {
    // Get specific vendor methods: this takes care of naming for Firefox, Chrome, and IE
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

    // If browser supports user media
    if (navigator.getUserMedia) {
      navigator.getUserMedia({video: true, toString: function() { return 'video'; } },

        function successCallback(stream) {
          console.log('webcam is loaded');
          if (navigator.getUserMedia == navigator.mozGetUserMedia) {
            _this.img.src = stream;                  //set the video source to the stream if on Firefox
          } else {
            _this.img.src = window.URL.createObjectURL(stream) || stream; //else, set it to the blob of the stream
          }

          _this.img.play();    //autoplay the video on success
        },

        function errorCallback(error) {
          alert('An error ocurred getting user media. Code:' + error.code);
        });
    }    else
    {
      //Browser doesn't support user media
      alert('Your browser does not support user media');
    }
  };

  this.stopCam = function() {
    _this.img.src = '';
  };

  this.startCam();
};

var cam = new camera();
