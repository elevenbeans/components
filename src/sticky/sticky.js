// /**
//  * 一点说明：
//  * 这里js实现的的sticky效果并没有在ios6+设备上使用，
//  * 因为它们支持更流畅的position:sticky方式。
//  * position:sticky生效条件较为苛刻，如果你发现在ios上无法吸顶，
//  * 请查看这篇文章：//www.atatech.org/articles/23740
//  */
// const win = window,
//     resizeEvt = 'onorientationchange' in win ? 'orientationchange' : 'resize';

// const STICKY_POLYFILL_CLASSNAME = 'mui-sticky-polyfill';

// class Sticky {

//     /**
//      * @constructor
//      * @param options {Object}
//      *      @param options.el {String|HTMLElement} 需要sticky的对象
//      *      @param [options.offsetTop] {Number} sticky时的偏移量
//      *      @param [options.useSticky] {Boolean} 强制不使用sticky属性
//      */
//     constructor(options) {
//         this.options = Object.assign({
//             //距离顶部的偏移量
//             offsetTop : 0,
//             useSticky: true
//         }, options);

//         let el = this.options.el;

//         this.el = typeof el === 'string' ? document.querySelector(el) : el;

//         this._bindStickyEvt();
//     }

//     _bindStickyEvt(){
//         let me = this ;
//         let rAF = win.requestAnimationFrame	||
//             win.webkitRequestAnimationFrame	||
//             function (callback) { setTimeout(callback, 16); };

//         let stickyEvt = function() {
//             if (me.pholder.getBoundingClientRect().top < me.options.offsetTop) {
//                 if (me.stickyChange === 1) {
//                     me.stickyChange = 0;
//                     me.pholder.style.height = me.el.offsetHeight + 'px';
//                     me.el.style.cssText = 'position: fixed; z-index: 1; -webkit-transform: translateZ(0); top:' + me.options.offsetTop + 'px; width: 100%;';
//                     me.el.classList.add(STICKY_POLYFILL_CLASSNAME);
//                 }
//             } else {
//                 if (me.stickyChange === 0) {
//                     me.stickyChange = 1;
//                     me.pholder.style.height = 0;
//                     me.el.style.cssText = '';
//                     me.el.classList.remove(STICKY_POLYFILL_CLASSNAME);
//                 }
//             }
//         };

//         //强制不使用或不支持原生sticky
//         if(!me.options.useSticky || !Sticky.supportSticky()){
//             me.pholder = document.createElement('div');
//             me.pholder.style.height = 0;
//             me.el.parentNode.insertBefore(me.pholder, me.el);

//             me.stickyChange = 1;
//             win.addEventListener('scroll', function(){
//                 rAF(function(){
//                     stickyEvt();
//                 })
//             });
//             stickyEvt();

//             //旋转屏幕时
//             //判断是否处于fixed定位，处于fixed定位需要获取J_navPholder的offsets
//             win.addEventListener(resizeEvt, function(){
//                 rAF(function(){
//                     stickyEvt();
//                 })
//             });
//         }else{
//             me.el.style.cssText = 'position: -webkit-sticky; z-index: 1; top:' + me.options.offsetTop + 'px';
//         }
//     }

//     static supportSticky() {
//         var t, n = '-webkit-sticky',
//             e = document.createElement("i");
//         e.style.position = n;
//         t = e.style.position;
//         e = null;
//         return t === n;
//     }
// }

// module.exports = Sticky;