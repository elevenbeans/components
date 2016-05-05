	var $ = require("mui/zepto/zepto"),
		Dll = require("mui/datalazylist/index"),
		Xtpl = require("mui/xtemplate/index");
	function isArray(arg){
		return Array.isArray?Array.isArray(arg):Object.prototype.toString.call(arg) === '[object Array]';
	}
	function mix(){
		return $.extend.apply(this,arguments);
	}
	function viewportHeight() {
		var win = window,doc = win.document,body = doc.body,documentElement = doc.documentElement;
		return win.innerHeight || (doc.compatMode === "CSS1Compat" && documentElement.clientHeight) || body && body.clientHeight || documentElement.clientHeight;
	}

    function Dllview(conf) {
		var render ,
			Loader = conf.loader.pageSize ? Dll.FixedSizeDataLoader : Dll.RandomSizeDataLoader,
			pad = conf.viewPadding || 9,
			row = conf.viewRow || 1,
			column = conf.viewColumn || 1,
			tplEl = $(conf.viewItemTpl).get(0),
			tpl = tplEl.nodeName=="TEXTAREA"?tplEl.value:tplEl.innerHTML,
			renderCfg = conf.render || {},
			loaderCfg = conf.loader || {},
			needLazy = tpl.indexOf("lazyload") > 0,//是否需要进行lazyload
			isIE6 = window.ActiveXObject && !window.XMLHttpRequest,
			isIE7 = window.ActiveXObject && window.XMLHttpRequest && (!document.documentMode || document.documentMode==7),
			viewHeight = viewportHeight(),
			viewWidth = conf.el.offsetWidth;
		function initDom(item) {
			if (needLazy) {
				require(["mui/datalazyload/"], function (Datalazyload) {
					var datalazyload = Datalazyload.instance ? Datalazyload.instance() : new Datalazyload();
					datalazyload.addElements(item.el);
				})
			}
			if (renderCfg.initDom)
				renderCfg.initDom.apply(this, arguments);
		}
		switch (conf.viewType) {
			case 'cascade':
				var html = "";
				for (var i = 0; i < column; i++) {
					var width = (isIE7 || isIE6)? Math.floor((1 - pad * column / viewWidth) / column * 10000) / 100: Math.floor(1 / column * 10000) / 100,
						style = isIE7 ?
						'margin-left:' + Math.floor(i / column * 10000 * pad / viewWidth) / 100 + '%;margin-right:' + Math.floor(10000 * ((column - i - 1) / column) * pad / viewWidth) / 100 + '%;width:' + width + '%' :
						'box-sizing: border-box;padding-left:' + (i / column) * pad + 'px;padding-right:' + ((column - i - 1) / column) * pad + 'px;width:' + width + '%';
					html += '<div class="dllView-cascade" style="float:left;' + style + '";></div>';
				}
				conf.el.innerHTML = html;
				var xtpl = new Xtpl(tplEl.innerHTML);
				render = new Dll.MultiNodeRender(mix(mix({
					scrollBuffer: viewHeight * 1
				}, renderCfg), {
					els: conf.el.childNodes,
					groupSize: row,
					createDom: function (item) {
						return $(xtpl.render(item.item)).get(0);
					},
					initDom: initDom}))
				break;
			case 'grid':
			default:
				var width = (isIE7 || isIE6) ? Math.floor((1 - pad * (column - 1) / viewWidth) / column * 10000) / 100 : Math.floor(1 / column * 10000) / 100,
					style = isIE7 ?
					'margin-left:{{(_col / ' + column + ') * ' + Math.floor(100 * pad / viewWidth) + '}}%;margin-right:{{((' + column + ' - _col - 1) / ' + column + ') * ' + Math.floor(10000 * pad / viewWidth) / 100 + '}}%;width:' + width + '%' :
					'box-sizing: border-box;padding-left:{{(_col / ' + column + ') * ' + pad + '}}px;padding-right:{{((' + column + ' - _col - 1) / ' + column + ') * ' + pad + '}}px;width:' + width + '%';
				var xtpl = new Xtpl('<div class="dllView-grid" style="float:left;' + style + '">' + tpl + '</div>');

				render = new Dll.NodeRender(mix(mix({
					scrollBuffer: viewHeight * 1
				}, renderCfg), {
					el: conf.el,
					groupSize: column * row,
					createDom: function (item) {
						item.item._col = item.index % column;
						return $(xtpl.render(item.item)).get(0);
					},
					initDom: initDom
				}));
				break;
		}
		if(!loaderCfg.onData)
		{
			loaderCfg.onData = function (param, callback) {
				require(["mui/fetch/fetch"], function (fetch) {
					fetch(loaderCfg.url && (loaderCfg.url+ (param.page+1)),mix({
						method: 'jsonp'
					},loaderCfg)).then(function (response) {
						return response.json();
					}).then(function (result) {
						if (loaderCfg.onList) {
							return loaderCfg.onList(result, callback);
						}
						callback(result && ((false ||
								(isArray(result) && result) ||
								(isArray(result.result) && result.result) ||
								(isArray(result.list) && result.list) ||
								(isArray(result.data) && result.data)
							)));
					})
				})
			}
		}
		return new Dll(mix({}, conf, {
			render: render,
			loader: new Loader(loaderCfg)
		}));
	}
	Dllview.initView=function(el, cfg, holder, callback){
		callback(new Dllview(mix(true,{
			el:el
		},cfg)));
	}
	module.exports= Dllview;