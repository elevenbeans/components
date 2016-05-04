require('../../zepto/zepto');
require('../../zepto/event');
require('../../zepto/fx');
require('../../zepto/fx_methods');
require('./swiper-3.3.1.jquery.min')

var swiper = new Swiper('.swiper-container');

swiper.on('onTouchStart',function(){//切换动作发生时隐藏所有动画，为下一页动画播放做准备，免得判断页码
	console.log('heh');
	setTimeout(function(){
		requestAnimationFrame(function(){
			$(".cardF-col1-left,.cardF-col3-right-b,.cardT-col1-left,.cardT-col2-left-b-l").css({
				'visibility':'hidden',
				'-webkit-animation': ''
			});
		});
	},0);
}).on('onTouchEnd',function(){//切换完成后显示所有动画，免得判断页码				
	setTimeout(function(){
		requestAnimationFrame(function(){
			$(".cardF-col1-left").css({
				'-webkit-animation': 'showthird 1.5s ease 1',
				'visibility':'visible'
			});
			$(".cardF-col3-right-b,.cardT-col1-left").css({
				'-webkit-animation': 'showfourth 1.5s ease 1',
				'visibility':'visible'
			});
			$(".cardT-col2-left-b-l").css({
				'-webkit-animation': 'showsecond 1.5s ease 1',
				'visibility':'visible'
			});
		});
	},0);
});


//Logo延时0.5秒,之后执行第一页动画
setTimeout(function(){
	requestAnimationFrame(function(){
		$('.logo').fadeOut(1.5,function(){ 
			$(".cardF-col2-left").css({
				'-webkit-animation': 'showfirst 1.5s ease 1',
				'visibility':'visible'
			});
			$(".cardF-col1-right,.cardF-col2-right,.cardF-col3-left").css({
				'-webkit-animation': 'showsecond 1.5s ease 1',
				'visibility':'visible'
			});
			$(".cardF-col1-left,.cardF-col3-right-t").css({
				'-webkit-animation': 'showthird 1.5s ease 1',
				'visibility':'visible'
			});
			$(".cardF-col3-right-b").css({
				'-webkit-animation': 'showfourth 1.5s ease 1',
				'visibility':'visible'
			});
		});
	});
},500);