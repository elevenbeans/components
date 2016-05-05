
require('../../zepto/zepto');
let DataLazyload = require('./datalazyload');

var datalazyload = DataLazyload.instance();
datalazyload.addElements(".lazy-load-container"); // 加入lazyload
datalazyload.addElements($(".lazy-load-zepto-container")); // 也可以直接加入zepto对象
datalazyload.addElements([
  $(".lazy-load-zepto-container-1"),
  document.querySelector('.lazy-load-zepto-container-2'),
  '.lazy-load-zepto-container-3',
  [$(".lazy-load-zepto-container-4"), document.querySelectorAll('.lazy-load-zepto-container-5')],
  undefined,
  {get: function() {return '.lazy-load-zepto-container-6'}}
]); // 也可以混合使用
var callbackContainer = $(".lazy-load-zepto-callback-container");
datalazyload.addCallback(callbackContainer, function() {
  callbackContainer.html('<img src="//img.alicdn.com/tps/TB1BOzhJVXXXXXnXVXXXXXXXXXX-190-153.jpg" alt=""/>');
}); 

