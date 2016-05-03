'use strict';
require('../../zepto/zepto');
require('./scratch');

$("#scratch-layer").wScratchPad({
  	size        : 35,
  	bg          : "#fff",
  	fg          : "./fg.png",
  	realtime    : true,
  	scratchDown : function(e,percent){ //start scratch callback
  		console.log('e:',e);
  	},
  	scratchUp   : function(e, percent){ //stop
  		if(percent > 20){
  			this.clear();
  			this.enable("enabled", false);
  			$("#scratch-layer").hide(300);
  			$('.pop-content').show();
  			$('.pop-layer').css({'-webkit-animation':'smogbgin 1.6s'});
  		}
  		console.log(percent);
  	},
  	scratchMove : function(e, percent){ //onMove
  		console.log(percent);
  	},
  	cursor: "crosshair"
});