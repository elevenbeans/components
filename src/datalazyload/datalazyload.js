/**
 * @ignore
 * 数据延迟加载组件
 */

    //var Selector;
    require("../../zepto/zepto");
    //var Event;
    require("../../zepto/event");

//console.log('selector:',Selector);
//console.log('event:',Event);
    var win = window,
        doc = win.document,
        IMG_SRC_DATA = 'data-ks-lazyload',
        AREA_DATA_CLS = 'ks-datalazyload',
        CUSTOM = '-custom',
        DEFAULT = 'default',
        NONE = 'none',
        SCROLL = 'scroll',
        TOUCH_MOVE = 'touchmove',
        RESIZE = 'resize',
        DURATION = 100,
        IND = 0,
        isIOS = navigator.userAgent.match(/iPad|iPod|iPhone/),
        isFadeStyle;

    function isArray(arg){
        return Array.isArray?Array.isArray(arg):Object.prototype.toString.call(arg) === '[object Array]';
    }

    function isDOMNode(el) {
        return el.nodeType === 1 || el.nodeType === 9;
    }

function getDOMNodes(els) {
    if(typeof els.getDOMNodes === 'function'){
        els = els.getDOMNodes();
    }
    els = isArray(els) ? els : [els];
    return els.reduce(function (rst, el) {
        if (!el) return rst;
        if (isArray(el)) {
            return rst.concat(getDOMNodes(el));
        } else if (el.length && typeof el === 'object') {
            return rst.concat(getDOMNodes(Array.prototype.slice.call(el)));
        } else if (typeof el === 'string') {
            return rst.concat(DomQuery(el));
        } else if (isDOMNode(el)) {
            return rst.concat(el);
        } else if (typeof el.get === 'function') {
            el = el.get();
            return rst.concat(el ? getDOMNodes(el) : void(0));
        }
        return rst;
    }, []);
}

    function addStyleSheet(cssText){
        var elem = document.createElement('style');
        // 先添加到 Dom 树中，再给 cssText 赋值，否则 css hack 会失效
        document.head.appendChild(elem);
        if (elem.styleSheet) { // IE
            elem.styleSheet.cssText = cssText;
        } else { // W3C
            elem.appendChild(doc.createTextNode(cssText));
        }
    }

    function getComputedStyle(elem, name) {
        var val = '', computedStyle;

        try {
            if (computedStyle = document.defaultView.getComputedStyle(elem, null)) {
                val = computedStyle.getPropertyValue(name) || computedStyle[name];
            }
        } catch (ex) {

        }
        try {
            if (val === '') {
                val = elem.currentStyle[name];
            };
        } catch (ex) {

        }

        if (val === '') {
            val = elem.style[name];
        }
        return val;
    }

    function addEvent(elem,event,handle)
    {
        $(elem).on(event,handle);
    }
    function removeEvent(elem,event,handle){
        $(elem).off(event,handle);
    }

    function DomGet(selector,elem) {
        return DomQuery(selector,elem)[0];
    }
    function DomQuery(selector,elem) {
        if (typeof(selector) !== "string") {
            selector = getDOMNodes(selector);
            return selector;
        }
        return $(elem||document).find(selector).get();
    }
    function DomHtml(elem,html,execScript){
        return $(elem).html(html);
    }

    function scrollLeft() {
        var w = window,doc= w.document,ret = w.pageXOffset;
        return (w.pageYOffset || 0) * 1 + (doc.documentElement.scrollLeft || 0) * 1 + (doc.body.scrollLeft || 0) * 1;
    }

    function scrollTop() {
        var w = window, doc = w.document;
        return (w.pageXOffset || 0) * 1 + (doc.documentElement.scrollTop || 0) * 1 + (doc.body.scrollTop || 0) * 1;
    }

    function viewportWidth() {
        var win = window,doc = win.document,body = doc.body,documentElement = doc.documentElement;
        return win.innerWidth || (doc.compatMode === "CSS1Compat" && documentElement.clientWidth) || body && body.clientWidth || documentElement.clientWidth;
    }

    function viewportHeight() {
        var win = window,doc = win.document,body = doc.body,documentElement = doc.documentElement;
        return win.innerHeight || (doc.compatMode === "CSS1Compat" && documentElement.clientHeight) || body && body.clientHeight || documentElement.clientHeight;
    }

    function outerWidth(elem) {
        if (elem.nodeType == 9) {
            return Math.max(
                document.document.documentElement.scrollWidth || 0,
                document.body.documentElement.scrollWidth || 0,
                viewportWidth());
        }
        var val =  elem.offsetWidth ;

        if (val > 0) {
            return val;
        }
        // Fall back to computed then un computed css if necessary
        val = getComputedStyle(elem, 'width');
        if (val == null || (Number(val)) < 0) {
            val = elem.style.width|| 0;
        }
        // Normalize '', auto, and prepare for extra
        val = parseFloat(val) || 0;
        val += parseFloat(getComputedStyle(elem, 'paddingLeft')) || 0;
        val += parseFloat(getComputedStyle(elem, 'borderLeftWidth')) || 0;
        val += parseFloat(getComputedStyle(elem, 'paddingRight')) || 0;
        val += parseFloat(getComputedStyle(elem, 'borderRightWidth')) || 0;
        return val;
    }

    function outerHeight(elem) {
        if (elem.nodeType == 9) {
            return Math.max(
                document.document.documentElement.scrollHeight || 0,
                document.body.documentElement.scrollHeight || 0,
                viewportHeight());
        }
        var val = elem.offsetHeight;

        if (val > 0) {
            return val;
        }
        // Fall back to computed then un computed css if necessary
        val = getComputedStyle(elem, 'height');
        if (val == null || (Number(val)) < 0) {
            val = elem.style.height || 0;
        }
        // Normalize '', auto, and prepare for extra
        val = parseFloat(val) || 0;
        val += parseFloat(getComputedStyle(elem, 'paddingTop')) || 0;
        val += parseFloat(getComputedStyle(elem, 'borderTopHeight')) || 0;
        val += parseFloat(getComputedStyle(elem, 'paddingBottom')) || 0;
        val += parseFloat(getComputedStyle(elem, 'borderBottomHeight')) || 0;
        return val;
    }

    /**
     *返回节点相对于页面左上角的位置，没有使用DOM.offset是因为需要支持zoom的场景
     *@param {DOM} el 节点
     *@returns {Object} {left:x,top:y}
     */
    function offset(el){
        var x= scrollLeft() , y= scrollTop();
        if (el.getBoundingClientRect) {
            var box = el.getBoundingClientRect(),
                doc =document,
                body = doc.body,
                docElem = doc && doc.documentElement,
                zoom = (window.getComputedStyle && window.getComputedStyle(el).zoom)||1;
            x += box.left* zoom-(docElem.clientLeft || body.clientLeft || 0);
            y += box.top* zoom-(docElem.clientTop || body.clientTop || 0);
        }
        return { left: x, top: y };
    }

    /**
     *根据加载函数实现加载器，实现的加载器主要有下面的功能：
     * 1. 一次加载，多处使用；
     * 2. 按需加载，在首次调用加载的时候才去加载
     *@param {Function} load 加载函数，加载函数有一个callback参数，在加载完成之后回调此callback参数即可；
     *@returns {Function} 加载器
     */
    function createLoader(load) {
        var value, loading, handles = [], h;
        return function (handle, type) {
            // type默认为1
            // 0:   不立即加载，不过加载完成之后执行回调函数
            // 1:   立即加载，并在完成之后执行回调函数
            // 2:   不立即加载，只在当前已经存在的情况下执行回调函数
            if (type !== 0 && !type) {
                type = 1;
            }
            if ((type & 1) && !loading) {
                loading = true;
                load(function (v) {
                    value = v;
                    while (h = handles.shift()) {
                        try {
                            h && h.apply(null, [value]);
                        } catch (e) {
                            setTimeout(function () {
                                throw e;
                            }, 0)
                        }
                    }
                })
            }
            if (value) {
                handle && handle.apply(null, [value]);
                return value;
            }
            if (!(type & 2)) {
                handle && handles.push(handle);
            }// 如果只在存在的情况下回调，则退出
            return value;
        }
    }

    /**
     * 自定义的Buffer函数，用来避免一个过程被过于频繁的调用，实现下面的特点：
     * 1. 从来没有执行过或长时间没有执行过，则立即运行（这样确保初始化代码能第一时间执行）
     * 2. 最后一次一定会被执行
     */
    function buffer(fn, ms, context) {
        var timer, lastStart = 0, lastEnd = 0,
            ms = ms || 150;

        function run() {
            if (timer) {
                timer.cancel();
                timer = 0;
            }
            lastStart = +new Date();
            fn.apply(context || this, arguments);
            lastEnd = +new Date();
        }
        function timeout(handle,timeout){
            var id = setTimeout(handle,timeout);
            return {
                cancel:function(){
                    clearTimeout(id);
                }
            }
        }
        var handle = function () {
            var argu = arguments;
            if (
                (!lastStart) || // 从未运行过
                (lastEnd >= lastStart && (+new Date()) - lastEnd > ms) || // 上次运行成功后已经超过ms毫秒
                (lastEnd < lastStart && (+new Date()) - lastStart > ms * 8)   // 上次运行或未完成，后8*ms毫秒
            ) {
                run();
            } else {
                if (timer) {
                    timer.cancel();
                }
                timer = timeout(function () {
                    run.apply(null, argu);
                }, ms);
            }
        };
        handle.stop = function () {
            if (timer) {
                timer.cancel();
                timer = 0;
            }
        }
        return handle;
    }

    /**
     * 异步运行一个数组队列，并在运行完成之后调用callback回调，
     * 队列的之中的每个函数运行的时候都会有(event,callback)两个参数，完成事件的异步处理后，应该回调callback
     */
    function runAsyncQueue(queue, event, callback) {
        var i = queue.length;

        function run() {
            i? queue[--i].call(null, event, run): callback(event);
        }

        run();
    }

    /**
     * whether part of elem can be seen by user.
     * note: it will not handle display none.
     * @ignore
     */
    function elementInViewport(elem, windowRegion, containerRegion) {
        // it's better to removeElements,
        // but if user want to append it later?
        // use addElements instead
        // if (!inDocument(elem)) {
        //    return false;
        // }
        // display none or inside display none
        if (!elem.offsetWidth && !elem.offsetHeight) {
            return false;
        }
        var elemOffset = offset(elem),
            zoom = (window.getComputedStyle && window.getComputedStyle(elem).zoom) || 1,
            inContainer = true,
            inWin,
            left = elemOffset.left,
            top = elemOffset.top,
            elemRegion = {
                left: left,
                top: top,
                right: left + (elem._ks_lazy_width || (elem._ks_lazy_width = outerWidth(elem)* zoom)),
                bottom: top + (elem._ks_lazy_height || (elem._ks_lazy_height = outerHeight(elem)* zoom))
            };
        inWin = isCross(windowRegion, elemRegion);

        if (inWin && containerRegion) {
            inContainer = isCross(containerRegion, elemRegion); // maybe the container has a scroll bar, so do this.
        }

        // 确保在容器内出现
        // 并且在视窗内也出现
        return inContainer && inWin;
    }

	function onWinLoad(callback) {
		if (/^(loaded|complete)$/.test(document.readyState)) {
			return callback();
		}
		if (window.addEventListener) {
			return window.addEventListener('load', callback, false);
		}
		if (window.attachEvent) {
			return window.attachEvent('onload', callback);
		}
	}
    /**
     * 检查css3 animation的支持情况；
     */
    function captureCss (type) {
      var pfx = ['webkit', ''],
        div = doc.createElement('div'),
        i = pfx.length;

      for (var i = 0, len = pfx.length; i < len; i++) {
        if (!pfx[i]) {
          type = type.toLowerCase();
        }
        if (div.style[pfx[i] + type] !== undefined) {
          return true;
        }
      }
      return false;
    }

    /**
     * LazyLoad elements which are out of current viewPort.
     * @class KISSY.DataLazyload
     * @extends KISSY.Base
     */
    function DataLazyload(container, config) {
        var self = this;
        // factory or constructor
        if (!(self instanceof DataLazyload)) {
            return new DataLazyload(container, config);
        }
        var newConfig = container;

        if (!container || (container.nodeType || typeof(container)==="string" || typeof(container.get)=== 'function'  || container.getDOMNode)) {
            newConfig = config || {};
            if(container)
            {
                newConfig.container=container;
            }
        }
        self.set("diff",DEFAULT);
        self.set("placeholder",((window.ActiveXObject && !document.documentMode)?'//g.alicdn.com/s.gif':'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='));
        self.set("execScript",true);
        self.set("fade",true);
        self.set("diff",DEFAULT);
        self.set("autoDestroy",true);
        for(var key in newConfig){
            if(!newConfig.hasOwnProperty(key)){continue;}
            self.set(key,newConfig[key]);
        }
        if(!self.get("container")){
            self.set("container",document.body);
        }
		/**
		 * diff的自动计算比例参数，该参数将在没有设置diff参数的时候自动调整diff参数的大小，以实现下面的功能：
		 * 1. 初始化的时候，考虑到初始化(页面加载)性能，该值设置为0；
		 * 2. 在页面onLoad后设置为IOS 2x,其他浏览器 1x
		 * 3. 在首次滚动后设置为IOS 4x,其他浏览器 2x
		 */
        self._diffRatio = 0;
		// 和延迟项绑定的回调函数
        self._callbacks = {};
        self._startLis = [];
        self._containerIsNotDocument = self.get('container').nodeType != 9 && self.get('container') !== document.body && self.get('container').nodeType;
        self._fade = captureCss('Animation') && !(/Android (\d+\.\d+)/i.test(win.navigator.userAgent) && parseFloat(RegExp['$1']) < 4.3);
        // 兼容 1.2 传入数组，进入兼容模式，不检测 container 区域
        if (isArray(newConfig.container)) {
            self._backCompact = 1;
        }
        self['_initLoadEvent']();
        newConfig.container && self.addElements(newConfig.container);
        self.resume();
        addEvent(document,"DOMContentLoaded",self._loadFn);
		onWinLoad(function () {
			self._diffRatio = Math.max(isIOS ? 2 : 1, self._diffRatio);
			self._loadFn();
		});
        self._inited=true;
    }

    // 两块区域是否相交
    function isCross(r1, r2) {
        var r = {};
        r.top = Math.max(r1.top, r2.top);
        r.bottom = Math.min(r1.bottom, r2.bottom);
        r.left = Math.max(r1.left, r2.left);
        r.right = Math.min(r1.right, r2.right);
        return r.bottom >= r.top && r.right >= r.left;
    }

    DataLazyload.prototype={
        get: function (name) {
            return this["ATTR_" + name];
        },
        set: function (name, value) {
            this["ATTR_" + name] = value;
        },
        /**
         * 添加开始处理的监听，在进行img和textarea替换的时候调用此函数进行异步处理，
         * 该函数可以更改最终img的src和textarea的html属性，
         * 如果函数设置event.returnValue=false,，则代表拦截此处理过程
         * @private
         */
        addStartListener: function (lis) {
            //去重
            var _startLis = this._startLis;
            if(!lis){return;}
            for(var i=_startLis.length-1;i>=0;i--)
            {
                if(_startLis[i]==lis){return;}
            }
            _startLis.push(lis);
        },
    /**
     * attach scroll/resize event
     * @private
     */
    _initLoadEvent: function () {
        var self = this;

            //支持onStart参数
            self.addStartListener(function (event, callback) {
                var onStart = self.get('onStart');
                if (onStart) {
                    var result = onStart.apply(this, arguments);
                    if (result === true || result === false) {
                        event.returnValue = result;
                    }
                }
                callback();
            });
            //支持webpReplacer参数
            self.addStartListener(function (event, callback) {
            	if(event.type!="img"){
            		callback();
            		return;
            	}
                var webpReplacer = self.get('webpReplacer');
                if (typeof(webpReplacer)=="function") {
                    require(['./webp'], function (WebP) {
                        WebP.isSupport(function (isSupport) {
                            if (isSupport) {
                                event.src = webpReplacer(event.src);
                            }
                            callback();
                        });
                    });
                }
                else {
                    callback();
                }
            });

            self.imgHandle = function () {
                // 加载图片 src
                var img = this,
                    flag = self.get('imgFlag') || IMG_SRC_DATA,
                    dataSrc = img.getAttribute(flag);
                if(!dataSrc){return;}
                runAsyncQueue(self._startLis, {
                    type: 'img',
                    elem: img,
                    src: dataSrc
                }, function (event) {
                    if(event.returnValue===false){return;}
                    if (event.src && img.src != event.src) {
                        // img加载完成后，再使用fadeIn效果
                        if (self.isFade) {
                            var cls = 'img-ks-lazyload',
                              beforeCls = 'img-ks-beforeload';
                            function onload() {
                                removeEvent(img, 'load', onload);
                                $(img).removeClass(beforeCls);
                                $(img).addClass(cls);
                                self.refresh();
                            }
                            addEvent(img, 'load', onload);
                        }
                        img.src = event.src;
                    }
                    img.removeAttribute(flag);
                });
            };
		self.bgimgHandle = function () {
			// 加载图片 src
			var div = this,
				flag = (self.get('imgFlag') || IMG_SRC_DATA) + '-bg',
				dataSrc = div.getAttribute(flag);
            if(!dataSrc){return;}
			runAsyncQueue(self._startLis, {
				type: 'bgimg',
				elem: div,
				bgimgSrc : dataSrc
			}, function (event) {
				if (event.returnValue === false) {
					return;
				}
				if (event.bgimgSrc) {
					var filters = div && div.filters, alphaImageLoader, matrix;
					try {
						alphaImageLoader = filters && filters.item("DXImageTransform.Microsoft.AlphaImageLoader")
						matrix = filters && filters.item("DXImageTransform.Microsoft.Matrix")
					}
					catch (e) {
					}
					if(alphaImageLoader)
					{//IE8及以下不支持background-size，可能需要通过滤镜来设置图片
						alphaImageLoader.src= event.bgimgSrc;
						alphaImageLoader.enabled = true;
						function getImg(src,callback) {
							var img = new Image();
							img.style.position = 'absolute';
							img.style.visibility = 'visible';
							img.onload = img.onerror = function () {
								callback(img);
								document.body.removeChild(img);
								img = null;
							};
							document.body.appendChild(img);
							img.src = src;
						}
						if (!matrix || !div.offsetWidth || !div.offsetHeight) {
							return ;
						}
						getImg(event.bgimgSrc, function (img) {
							if (!img.offsetWidth || !img.offsetHeight) {
								return ;
							}
							var backgroundSize = div.currentStyle["background-size"]=="cover"?"cover":"contain";
							if ((img.offsetHeight / img.offsetWidth > div.offsetHeight / div.offsetWidth) === (backgroundSize == "contain")) {
								matrix.M11 = (div.offsetHeight * img.offsetWidth) / (div.offsetWidth * img.offsetHeight);
								matrix.M22 = 1;
								matrix.Dx = div.offsetWidth * (1 - matrix.M11) / 2;
								matrix.Dy = 0;
							}
							else {
								matrix.M11 = 1;
								matrix.M22 = (div.offsetWidth * img.offsetHeight) / (div.offsetHeight * img.offsetWidth);
								matrix.Dx = 0;
								matrix.Dy = div.offsetHeight * (1 - matrix.M22) / 2;
							}
							matrix.enabled = true;
						});
					}
					else
					{
						div.style.backgroundImage = 'url('+event.bgimgSrc+')';
					}
				}
				div.removeAttribute(flag);
			});
		};
            self.textareaHandle = function () {
                // 在textarea区域内部可能还存在image、textarea，所以需要addElements
                // 从 textarea 中加载数据
                // 采用隐藏 textarea 但不去除方式，去除会引发 Chrome 下错乱
                var textarea = this;
                textarea.style.display = NONE;
                textarea.className = ''; // clear hook
                var content = document.createElement('div');
                // textarea 直接是 container 的儿子
                textarea.parentNode.insertBefore(content, textarea);

                runAsyncQueue(self._startLis, {
                    type: 'textarea',
                    elem: textarea,
                    value: textarea.value
                }, function (event) {
                    if (event.returnValue === false) {
                        return;
                    }
                    DomHtml(content, event.value, self.get('execScript'));
                    self.addElements(content);
					self.refresh();
                });
            };

            // 加载函数
            self._loadFn = buffer(function () {// 加载延迟项
                if (self._inited && self._started && self.get('autoDestroy')) {
                    var callbacks = self._callbacks,isEmpty=true;
                    for (var key in callbacks) {
                        if (callbacks.hasOwnProperty(key) && callbacks[key]!==undefined) {
                            isEmpty = false;
                            break;
                        }
                    }
                    if(isEmpty)
                    {
                        self.destroy();
                    }
                }
                if(!self._started){return;}
                self['_loadItems']();
            }, DURATION, self);

            self._onScroll = function(e){
				self._diffRatio = Math.max(isIOS ? 4 : 2, self._diffRatio);
				self._loadFn();
            }
        },

        /**
         * force datalazyload to recheck constraints and load lazyload
         *
         */
        refresh: function () {
            this._loadFn();
        },

        /**
         * lazyload all items
         * @private
         */
        _loadItems: function () {
            var self = this,
                container = self.get('container'),
                _callbacks = self._callbacks;
            // container is display none
            if (self._containerIsNotDocument && !container.offsetWidth) {
                return;
            }
            self._windowRegion = self['_getBoundingRect']();
            // 兼容，不检测 container
            if (!self._backCompact && self._containerIsNotDocument) {
                self._containerRegion = self['_getBoundingRect'](self.get('container'));
            }
            for(var key in _callbacks)
            {
                if(!_callbacks.hasOwnProperty(key)){continue;}
                var callback = _callbacks[key];
                callback && self._loadItem(key, callback);
            }
        },
        _loadItem: function (key, callback) {
            var self = this,
                callback = callback || self._callbacks[key];
            if (!callback) {
                return true;
            }
            if(self._lastDiff!=self.get("diff"))
            {
                self._windowRegion = self['_getBoundingRect']();
                if (!self._backCompact && self._containerIsNotDocument) {
                    self._containerRegion = self['_getBoundingRect'](self.get('container'));
                }
                self._lastDiff=self.get("diff");
            }
            var el = callback.el,
                remove = false,
                fn = callback.fn;
            if (self.get('force') || elementInViewport(el, self._windowRegion, self._containerRegion)) {
				try {
					remove = fn.call(el);
				} catch (e) {
					setTimeout(function () {
						throw e;
					}, 0);
				}
            }
            if (remove !== false) {
                delete self._callbacks[key];
            }
            return remove;
        },

        /**
         * Register callback function. When el is in viewport, then fn is called.
         * @param {HTMLElement|String} el html element to be monitored.
         * @param {function(this: HTMLElement): boolean} fn
         * Callback function to be called when el is in viewport.
         * return false to indicate el is actually not in viewport( for example display none element ).
         */
        addCallback: function (el, fn) {
            el = DomGet(el);

            var self = this,
                callbacks = self._callbacks,
                callback = {
                    el: el || document, // It is necessary for public method to do fault-tolerant something.
                    fn: fn || function(){}
                },
                key = ++IND;

            callbacks[key] = callback;

            // add 立即检测，防止首屏元素问题
            if (self._windowRegion) {
                self._loadItem(key, callback);
            } else {
                self.refresh();
            }
            return key;
        },

        /**
         * Remove a callback function. See {@link KISSY.DataLazyload#addCallback}
         * @param {HTMLElement|String} el html element to be monitored.
         * @param {Function} [fn] Callback function to be called when el is in viewport.
         *                        If not specified, remove all callbacks associated with el.
         */
        removeCallback: function (el, fn) {
            el = DomGet(el);
            var callbacks = this._callbacks;
            for(var key in callbacks){
                if(!callbacks.hasOwnProperty(key)){continue;}
                var callback = callbacks[key];
                if (callback.el == el && (fn ? callback.fn == fn : 1)) {
                    delete callbacks[key];
                }
            }
        },

        /**
         * get to be lazy loaded elements
         * @return {Object} eg: {images: [...], textareas: [...]}
         */
        getElements: function () {
            var self = this,
                images = [],
                textareas = [],
                callbacks = self._callbacks;
            for(var key in callbacks){
                if(!callbacks.hasOwnProperty(key)){continue;}
                var callback = callbacks[key];
                if (callback.fn == self.imgHandle) {
                    images.push(callback.el);
                }
                if (callback.fn == self.textareaHandle) {
                    textareas.push(callback.el);
                }
            }
            return {
                images: this._images,
                textareas: this._textareas
            };
        },

        /**
         * Add a array of elements to be lazy loaded to monitor list.
         * @param {HTMLElement[]|String} els Array of elements to be lazy loaded or selector
         */
        addElements: function (els, type) {
            els = getDOMNodes(els);
            var self = this;
            // 每次addElements前，检测是否改变了fade
            self._addStyle();
            function createImgCallback(img){
                return function (placeholder) {
                    if (!img.src) {
                        img.src = placeholder;
                    }
                }
            }
            function createKeyCallback(key){
                return function () {
                    setTimeout(function(){
                        self._loadItem(key);
                    },0);
                }
            }
            for(var k=0;k<els.length;k++){
                var el = els[k];
                if(!el){return;}
                if (!type || type === 'img') {
                    var imgs = [el].concat(DomQuery('img', el));
                    for(var i=0;i<imgs.length;i++){
                        var img = imgs[i];
                        if(!(img.getAttribute && img.getAttribute(self.get('imgFlag') || IMG_SRC_DATA))){continue;}
                        var key = self.addCallback(img, self.imgHandle);
                        if (!img.offsetWidth) {
                            img.onload = img.onerror = createKeyCallback(key);
                            if(!img.src) {
                                self.onPlaceHolder = createLoader(function (callback) {
                                        var img = self._phImg = new Image(),
                                            placeholder = self.get('placeholder');
                                        img.onload = img.onerror = function () {
                                            callback(placeholder)
                                        };
                                        img.src = placeholder;
                                    });
                                self.onPlaceHolder(createImgCallback(img));
                            }
                        }
                    }
                }

                if (!type || type === 'bgimg') {
                	var bgimgFlag= (self.get('imgFlag') || IMG_SRC_DATA) + '-bg',
                        imgs=[el].concat(DomQuery('[' + bgimgFlag+' ]', el));
                    for(var i=0;i<imgs.length;i++) {
                        var img = imgs[i];
                        if (img.getAttribute && img.getAttribute(bgimgFlag)){
                            self.addCallback(img, self.bgimgHandle);
                        }
                    }
                }

                if (!type || type === 'textarea') {
                    var textareas = DomQuery('textarea.' + (self.get('areaFlag') || AREA_DATA_CLS), el);
                    for(var key in textareas){
                        self.addCallback(textareas[key], self.textareaHandle);
                    }
                }
            }
        },

        /**
         * Remove a array of element from monitor list. See {@link KISSY.DataLazyload#addElements}.
         * @param {HTMLElement[]|String} els Array of imgs or textareas to be lazy loaded
         */
        removeElements: function (els) {
            els = getDOMNodes(els);
            var self = this,
                callbacks = self._callbacks;
            for (var key in callbacks) {
                if(!callbacks.hasOwnProperty(key)){continue;}
                var el = callbacks[key].el, found = false;
                for (var i = els.length - 1; i >= 0; i--) {
                    if (els[i] == el) {
                        delete callbacks[key];
                        found = true;
                        break;
                    }
                }
                if (found) {
                    break;
                }
            }
        },

        /**
         * get c's bounding textarea.
         * @param {window|HTMLElement} [c]
         * @private
         */
        _getBoundingRect: function (c) {
            var vh, vw, left, top;

            if (c !== undefined) {
                vh = outerHeight(c);
                vw = outerWidth(c);
                var elemOffset = offset(c);
                left = elemOffset.left;
                top = elemOffset.top;
            } else {
                vh = viewportHeight();
                vw = viewportWidth();
                left = scrollLeft();
                top = scrollTop();
            }

			var diff = this.get('diff'),
				diffRatio=this._diffRatio;
			if (diff === DEFAULT) {//默认值
				diff = {
					left: 0,
					top: 0,
					right: vw * diffRatio,
					bottom: vh * diffRatio
				}
			}
			else if (typeof(diff)!=="object") {//数值
				diff = {
					left: diff,
					top: diff,
					right: diff,
					bottom: diff
				}
			}

			return {
				left: left - (diff.left || 0),
				top: top - (diff.top || 0),
				right: left + vw + (diff.right || 0),
				bottom: top + vh + (diff.bottom || 0)
			};
        },

        /**
         * pause lazyload
         */
        pause: function () {
            var self = this,
            	onScroll =self._onScroll,
                load = self._loadFn;
            if (self._destroyed || !self._started) {
                return;
            }
            removeEvent(win, SCROLL, onScroll);
            removeEvent(win, TOUCH_MOVE, onScroll);
            removeEvent(win, RESIZE, load);
            load.stop();
            if (self._containerIsNotDocument) {
                var c = self.get('container');
                removeEvent(c, SCROLL, onScroll);
                removeEvent(c, TOUCH_MOVE, onScroll);
            }
            self._started = false;
        },

        /**
         * resume lazyload
         */
        resume: function () {
            var self = this,
				onScroll = self._onScroll,
                load = self._loadFn;
            if (self._destroyed || self._started) {
                return;
            }
            // scroll 和 resize 时，加载图片
            addEvent(win, SCROLL, onScroll);
            addEvent(win, TOUCH_MOVE, onScroll);
            addEvent(win, RESIZE, load);
            if (self._containerIsNotDocument) {
                var c = self.get('container');
                addEvent(c, SCROLL, onScroll);
                addEvent(c, TOUCH_MOVE, onScroll);
            }
            self._started = true;
            self._loadFn();
        },

        /**
         * Destroy this component.Will fire destroy event.
         */
        destroy: function () {
            var self = this;
            self.pause();
            self._callbacks = {};
            // window.console && console.log('datalazyload is destroyed!');
            self._destroyed = 1;
        },

        /**
         * 增加fade-in css样式
         */
        _addStyle: function () {
          var self = this;
          if (self._fade) {
            self.isFade = self.get('fade');
            if (self.isFade && !isFadeStyle) {
              isFadeStyle = true;
                addStyleSheet('@-webkit-keyframes ks-fadeIn{0%{opacity:0}100%{opacity:1}}'
                + '@keyframes ks-fadeIn{0%{opacity:0}100%{opacity:1}}'
                + '.img-ks-lazyload{-webkit-animation:ks-fadeIn 350ms linear 0ms 1 normal both;animation:ks-fadeIn 350ms linear 0ms 1 normal both;opacity:1}'
                + '.img-ks-beforeload{opacity:0}');
            }
          }
        }
    }

    /**
     * Load lazyload textarea and imgs manually.
     * @ignore
     * @method
     * @param {HTMLElement[]} containers Containers with in which lazy loaded elements are loaded.
     * @param {String} type Type of lazy loaded element. "img" or "textarea"
     * @param {String} [flag] flag which will be searched to find lazy loaded elements from containers.
     * @param {Function} [onStart] called before process lazyload content
     * Default "data-ks-lazyload-custom" for img attribute and "ks-lazyload-custom" for textarea css class.
     */
    function loadCustomLazyData(containers, type, flag, onStart) {

        if (type === 'img-src') {
            type = 'img';
        }
        // 支持数组
        if (!isArray(containers)) {
            containers = [DomGet(containers)];
        }

        var datalazyload = new DataLazyload(doc, {});
        datalazyload.set('imgFlag', flag || (IMG_SRC_DATA + CUSTOM));
        datalazyload.set('areaFlag', flag || (AREA_DATA_CLS + CUSTOM));
        datalazyload.set('onStart', onStart);
        datalazyload.set('force', true);
        datalazyload.addElements(containers, type);

    }

    DataLazyload.loadCustomLazyData = loadCustomLazyData;
    var defIns;
    DataLazyload.instance = function () {
        return defIns || (defIns = new DataLazyload(null, {
            autoDestroy: false
        }))
    }

    module.exports=DataLazyload;