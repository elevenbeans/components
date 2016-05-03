'use strict';
require('../../zepto/zepto');
require('../../zepto/event');

let config = {};
class Progressbar{
  /**
   * 构造函数
   * 实例化时执行该方法
   */
  constructor(options){
    this.init(options);
  }
  /**
   * 初始化
   * @param opt {object} 配置对象,可覆盖初始化的opt
   * @param config.container 进度条容器 .progressbar
   * @param config.bar 进度条 .J_progress
   * @param config.el 滑动的元素 .J-show-slider
   * @param config.elecon 滑动的元素 .J-show-slider
   */
  init(opt){
  	let me = this;
  	config = opt;
    $(config.container).css({'display':'block'});
    $(config.bar).css({'width':(config.default*100)+'%'});
    
    //var all = (8+0.3)*goodsNum; // rem
    //$('.J_content').css({'width' : all+'rem'});
    $(config.elecon).on('touchmove', me.renderProgressBar);
    
    $(config.elecon).on('touchend', function(){
      setTimeout(me.renderProgressBar,1600);
    });
  }

  renderProgressBar(){
  	//console.log('render!');
  	let me = this;
    var viewWidth = document.body.offsetWidth;
    var left = $(config.elecon).offset().left;
    //console.log('left:',left);
    left = 0-left;
    var percent = left / ($(config.elecon).width() - viewWidth);
    if(percent > config.default){	    
	    $(config.bar).css({'width':percent*100+'%'});
	    //console.log('set!');
	  }else{
	  	$(config.bar).css({'width':config.default*100+'%'});
	  }
  }
}

module.exports = Progressbar;

