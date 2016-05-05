/*
 @author 游侠
 */
	var Selector = require("mui/zepto/zepto");
	var isIOS = navigator.userAgent.match(/iPad|iPod|iPhone/);
	function DOMRemove(node)
	{
		node.parentNode && node.parentNode.removeChild(node)
	}
	function DOMNext(node){
		return node.nextSibling
	}

	function setCss(el,name,value){
		Selector(el).css(name,value);
	}
	function getCss(el,name){
		return Selector(el).css(name);
	}
	function viewportHeight() {
		var win = window,doc = win.document,body = doc.body,documentElement = doc.documentElement;
		return win.innerHeight || (doc.compatMode === "CSS1Compat" && documentElement.clientHeight) || body && body.clientHeight || documentElement.clientHeight;
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
	function scrollLeft() {
		var w = window,doc= w.document,ret = w.pageXOffset;
		return (w.pageYOffset || 0) * 1 + (doc.documentElement.scrollLeft || 0) * 1 + (doc.body.scrollLeft || 0) * 1;
	}

	function scrollTop() {
		var w = window, doc = w.document;
		return (w.pageXOffset || 0) * 1 + (doc.documentElement.scrollTop || 0) * 1 + (doc.body.scrollTop || 0) * 1;
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
	 * 自定义的Buffer函数，实现下面的特点：
	 * 1. 从来没有执行过或长时间没有执行过，则立即运行（这样确保初始化代码能第一时间执行）
	 * 2. 最后一次一定会被执行
	 */
	function elementFromPoint(x, y) {
		if(!document.elementFromPoint){return;}
		var el = document.elementFromPoint(x, y);
		while (el && el.__dllIndex === undefined) {
			el = el.parentElement;
		}
		return el;
	}

	function NodeRender(cfg) {
		cfg = cfg || {};
		var el = cfg.el,
			state=cfg.state,
			dataSecState = state && state.get("dataSec"),
			phState = state && state.get("ph"),
			scrollParent = cfg.scrollParent,
			sizeMap = {},
			elMap = {},
			times= 0,
			scrollPoint,
			viewSize,
			renderBuffer,
			destroyBuffer,
			scrollBuffer,
			groupSize,
			defaultSize,
			epLimit,
			spLimit;
		if (dataSecState && (dataSecState[0] < 0 || dataSecState[1] <= dataSecState[0])) {
			dataSecState = null;
		}
		if (typeof(el) == "string") {
			el = Selector(el);
		}
		if (!el.nodeType && el.get) {
			el = el.get(0);
		}
		//插入起点指示器
		var sPointer = Selector(el).find(".startPointer", el).get(0),
			ePointer = Selector(el).find(".endPointer", el).get(0)
		if (!sPointer) {
			sPointer = Selector('<div class="startPointer"></div>');
			sPointer.prependTo(el);
			sPointer = sPointer[0];
		}
		//插入终点指示器
		if (!ePointer) {
			ePointer = Selector('<div class="endPointer"></div>');
			ePointer.appendTo(el);
			ePointer = ePointer[0];
		}
		setCss(sPointer, "paddingTop", '0px');
		setCss(ePointer, "paddingBottom", '0px');
		setCss(ePointer, "clear", 'both');
		return {
			start: function(dataSec, minIndex, maxIndex,status) {
				times++;
				scrollPoint = scrollTop() + offset(document.body).top;
				viewSize = viewportHeight();
				renderBuffer = cfg.renderBuffer || ((isIOS ? 4 : 2) * viewSize);
				if (status == 2) {
					renderBuffer = Math.min(0, renderBuffer);
				}
				if (status==1) {
					renderBuffer = Math.min(viewSize / 2, renderBuffer);
				}

				destroyBuffer = Math.max(cfg.destroyBuffer || viewSize * (isIOS ? 8 : 4), renderBuffer);
				if (status == 2) {
					destroyBuffer = Math.min(viewSize / 2, destroyBuffer);
				}
				scrollBuffer = cfg.scrollBuffer || 0;
				groupSize = cfg.groupSize || 1,
				defaultSize = cfg.defaultSize || 256;
				epLimit = viewSize + scrollPoint;
				spLimit = 0 + scrollPoint;
				if (scrollParent) {
					var _offset = Math.max(offset(sPointer).top,0) - offset(scrollParent).top;
					if (_offset < 0) {
						spLimit -= _offset;
					}
					epLimit=Math.min(epLimit, _offset(scrollParent).top+ outerHeight(scrollParent));
				}
				if (dataSec[0] <= minIndex) {
					setCss(sPointer, "paddingTop", "0px");
				}
			},
			checkRemove: function (index, order) {
				
				var ind, item;
				if (order == -1) {
					for (ind = index; ; ind++) {
						item = elMap[ind];
						if (!item) {
							break;
						}
						if (offset(item).top + outerHeight(item) >= spLimit - destroyBuffer) {
							break;
						}
					}
					return Math.max(0, (ind - (ind % groupSize)) - index);
				}
				else {
					for (ind = index; ind >= 0; ind--) {
						item = elMap[ind];
						if (!item) {
							break;
						}
						if (offset(item).top <= epLimit + destroyBuffer) {
							break;
						}
					}
					return Math.max(0, index - (ind + groupSize - ind % groupSize) + 1);
				}
			},
			remove: function (index, order, batchNum) {
				
				var ind, item;
				if (order == -1) {
					var paddingTop = parseInt(getCss(sPointer, "paddingTop"), 10),
						nextItem ,
						items = [],
						phStart, phEnd;
					for (ind = index; ind < index + batchNum; ind++) {
						item = elMap[ind];
						if (!item) {
							break;
						}
						nextItem = DOMNext(item);
						items.push(item);
						if (ind == index) {
							phStart = item.offsetTop;

						}
						phEnd = item.offsetTop + item.offsetHeight;
					}
					var point = nextItem.offsetTop;
					//先占位，避免浏览器滚动高度变化
					setCss(sPointer, "paddingTop", paddingTop + (phEnd - phStart) + "px");
					for(var i=items.length-1;i>=0;i--)
					{
						DOMRemove(items[i]);
					}
					var size = point - nextItem.offsetTop + (phEnd - phStart);
					for (var i = 0; i < items.length; i++) {
						delete elMap[index + i];
						sizeMap[index + i] = size/ items.length;
					}
					setCss(sPointer, "paddingTop", paddingTop + size + "px");
					return items.length;
				}
				else {
					for (ind = index; ind > index - batchNum; ind--) {
						item = elMap[ind];
						if (!item) {
							break;
						}
						delete elMap[ind];
						DOMRemove(item);
					}
					return index - ind;
				}
			},
			adjust: function (dataSec, minIndex, maxIndex) {
				if (dataSec[0] == dataSec[1]) {
					if (dataSecState) {
						dataSec[0] = dataSec[1] = dataSecState[0];
						sPointer.style.paddingTop= (phState && phState[0] || 0) + "px";
						ePointer.style.paddingBottom = (phState && phState[1] || 0) + "px"
						state.checkScroll();
						return;
					}
					var index = dataSec[0],
						dis = (spLimit - (offset(sPointer).top + outerHeight(sPointer))),
						scrollOffset = parseInt(getCss(sPointer, "paddingTop"), 10);
					while (dis < 0 && index > minIndex) {
						var size = sizeMap[index];
						if (size === undefined) {
							size = sizeMap[index] = defaultSize
						}
						dis += size;
						scrollOffset -= size;
						index -= 1;
					}
					while (dis > 0 && index < maxIndex) {//跳跃
						var size = sizeMap[index];
						if (size === undefined) {
							size = sizeMap[index] = defaultSize
						}
						if (dis < size) {
							break;
						}
						dis -= size;
						scrollOffset += size;
						index += 1;
					}
					setCss(sPointer, "paddingTop", scrollOffset + "px");
					dataSec[0] = dataSec[1] = index-(index % groupSize);
				}
				if (dataSec[0] <= minIndex) {
					setCss(sPointer, "paddingTop", "0px");
				}
			},
			checkAdd: function (index, order) {
				if (order == -1) {
					if (dataSecState) {
						return index >= dataSecState[0] ? (index + 1 - dataSecState[0]) : 0;
					}
					if ((index + 1) % groupSize !== 0) {//如果不是一个组,则将组剩下的个数都请求
						return (index+1) % groupSize;
					}
					return (offset(sPointer).top + outerHeight(sPointer) > spLimit - renderBuffer)? groupSize:0;
				}
				else {
					if (dataSecState) {
						return index < dataSecState[1] ? (dataSecState[1] - index) : 0;
					}
					if (index % groupSize !== 0) {
						return groupSize - (index % groupSize);
					}
					return (offset(index===0?sPointer:ePointer).top < (epLimit + renderBuffer))?groupSize:0;
				}
			},
			add: function (index, order, batchNum, getter) {
				
				var items = [],
					size = 0,
					fragment=document.createDocumentFragment();
				if(order==-1)
				{
					for (var i = index; i > index- batchNum; i--) {
						if (!getter(i)) {
							break;
						}
						var _item = {item: getter(i), index: i};
						var itemEl = cfg.createDom(_item);
						if(!itemEl.nodeType && itemEl.get){itemEl=itemEl.get(0);}
						elMap[i] = _item.el =itemEl;
							itemEl.__dllIndex=i;
						Selector(_item.el).prependTo(fragment);
						items.push(_item);
					}
					var nextItem = DOMNext(sPointer),
						point = nextItem.offsetTop;
					Selector(fragment).insertAfter(sPointer);
					if(cfg.initDom){
						for(var i=0,len=items.length;i<len;i++)
						{
							cfg.initDom(items[i]);
						}
					}
					for (var i = 0; i < items.length; i++) {
						var _item = items[i];
						size += sizeMap[_item.index] || (nextItem.offsetTop - point) / items.length || defaultSize;
					}
					setCss(sPointer, "paddingTop", parseInt(getCss(sPointer, "paddingTop"), 10) - size + "px");

				}
				else
				{
					
					for (var i = index; i < index + batchNum; i++) {
						if (!getter(i)) {
							break;
						}
						var _item = {item: getter(i), index: i};
						var itemEl = cfg.createDom(_item);
						if(!itemEl.nodeType && itemEl.get){itemEl=itemEl.get(0);}
						elMap[i] = _item.el =itemEl;
						itemEl.__dllIndex = i;
						Selector(_item.el).appendTo(fragment);
						items.push(_item);
					}
					Selector(fragment).insertBefore(ePointer);
					if(cfg.initDom){
						for(var i=0,len=items.length;i<len;i++)
						{
							cfg.initDom(items[i]);
						}
					}
				}
				return items.length;
			},
			finish: function (dataSec, minIndex, maxIndex) {
				if (dataSecState) {
					if (dataSecState[0] < dataSec[0] || dataSecState[1] > dataSec[1]) {
						setCss(ePointer, "paddingBottom", (phState[1] - (ePointer.offsetTop - sPointer.offsetTop)) + "px");
					}
					else
					{
						dataSecState = null;
						phState = null;
					}
				}
				if (!dataSecState) {
					if (state) {
						var dataSecNew = [dataSec[0], dataSec[1]],
							sp = parseInt(getCss(sPointer, "paddingTop"), 10),
							ep = parseInt(getCss(ePointer, "paddingBottom"), 10) + (ePointer.offsetTop - sPointer.offsetTop),
							startEl = elMap[dataSecNew[0]],
							endEl = elMap[dataSecNew[1]-1];
						if (startEl && endEl && startEl != endEl) {
							var startOffset = offset(startEl),
								endOffset = offset(endEl),
								topEl = scrollTop() > startOffset.top+ startEl.offsetHeight && elementFromPoint(startOffset.left + 1, 1) || startEl,
								bottomEl = scrollTop()+ viewSize < endOffset.top && elementFromPoint(endOffset.left + 1, viewSize-1) || endEl;
							if (topEl != startEl) {
								sp += offset(topEl).top - startOffset.top
								dataSecNew[0] = topEl.__dllIndex;
							}
							if (bottomEl != endEl) {
								ep += endOffset.top + endEl.offsetHeight - offset(bottomEl).top - bottomEl.offsetHeight
								dataSecNew[1] = bottomEl.__dllIndex + 1;
							}
						}
						state.set("dataSec", dataSecNew);
						state.set("ph", [sp, ep - sp]);
					}
					setCss(ePointer,"paddingBottom",Math.min(scrollBuffer, (maxIndex + 1 - dataSec[1]) * defaultSize) + "px")
				}
			},
			destroy: function () {
				var node;
				while (node = sPointer.nextSibling) {
					if (node == ePointer) {
						break;
					}
					DOMRemove(node);
				}
				DOMRemove(sPointer);
				DOMRemove(ePointer);
				sPointer = null;
				ePointer = null;
				elMap={};
				sizeMap={};
				cfg={};
			}
		}
	}
	NodeRender.getDOMNode=function(el){
		return Selector(el).get(0)
	}
	module.exports=NodeRender;