/*
 @author 游侠
 */
	var zepto = require("mui/zepto/zepto"),
		Event = require("mui/zepto/event");
	function mix(){
		return zepto.extend.apply(this,arguments);
	}
	function log(message) {
		window.console && console.log(message);
	}
	/**
	 * 自定义的Buffer函数，实现下面的特点：
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


	function datalazylist(cfg) {
		var self = this;
		mix(self, cfg);
		var started ,
			dataSec,
			render,
			status,
			loader,
			scrollPanel = cfg.scrollPanel,
			dataGetter= function (ind) {
				return loader.get(ind);
			},
			run = function () {
				if (!render || !loader || !started) {
					return;
				}
				var batchNum,
					actNum,
					minIndex = self.minIndex || 0,
					maxIndex = Math.min(self.maxIndex !== undefined ? self.maxIndex : Number.MAX_VALUE, loader.totalNum !== undefined ? (loader.totalNum - 1) : Number.MAX_VALUE);
				self.onStart && self.onStart(dataSec, minIndex, maxIndex, status);
				render.start(dataSec, minIndex, maxIndex, status);
				//1. 从后向前删除
				while (dataSec[0] < dataSec[1] && (batchNum = ((dataSec[1] > maxIndex + 1 && dataSec[1] - maxIndex - 1) || render.checkRemove(dataSec[1] - 1, 1)))) {
					actNum = render.remove(dataSec[1] - 1, 1, batchNum);
					dataSec[1] -= actNum;
					log(["remove", 1, batchNum, actNum]);
				}
				//2. 从前向后删除
				while (dataSec[0] < dataSec[1] && (batchNum = ((minIndex > dataSec[0] && minIndex - dataSec[0]) || render.checkRemove(dataSec[0], -1)))) {
					actNum = render.remove(dataSec[0], -1, batchNum);
					dataSec[0] += actNum;
					log(["remove", -1, batchNum, actNum]);
				}
				//3. 调整指针位置，如果当前为空，则应该移动指针
				render.adjust(dataSec, minIndex, maxIndex);

				if (dataSec[0] < minIndex && dataSec[0] == dataSec[1]) {
					dataSec[0] = dataSec[1] = minIndex;
				}
				//4. 向前面添加
				while (dataSec[0] > minIndex && (batchNum = render.checkAdd(dataSec[0] - 1, -1))) {
					loader.fetch(dataSec[0] - 1);//先调用一次，如果数据能同步获取到，则立即能运行，避免转异步
					if (!dataGetter(dataSec[0] - 1)) {//如果当前数据没有加载，则先加载(加载数据之后会重新refresh)
						return loader.fetch(dataSec[0] - 1, load);
					}
					actNum = render.add(dataSec[0] - 1, -1, batchNum, dataGetter);
					dataSec[0] -= actNum;
					log(["add", -1, batchNum, actNum]);
				}
				//4. 向后面添加
				while (dataSec[1] <= maxIndex && (batchNum = render.checkAdd(dataSec[1], 1))) {
					loader.fetch(dataSec[1]);//先调用一次，如果数据能同步获取到，则立即能运行，避免转异步
					if (!dataGetter(dataSec[1])) {//如果当前数据没有加载，则先加载(加载数据之后会重新refresh)
						return loader.fetch(dataSec[1], load);
					}
					actNum = render.add(dataSec[1], 1, batchNum, dataGetter);
					dataSec[1] += actNum;
					log(["add", 1, batchNum, actNum]);
				}
				render.finish(dataSec, minIndex, maxIndex);
				self.onFinish && self.onFinish(dataSec, minIndex, maxIndex);
			},
			load = buffer(run, 100);

		var statusTimer,statusLastTime=0;
		function updateStatus(){
			var _time= +(new Date());
			if(status>1 || (status===1 && _time-statusLastTime<1024)){return;}
			status = 1;//切换状态为忙
			statusLastTime= _time;
			if(statusTimer){clearTimeout(statusTimer);}
			statusTimer = setTimeout(function(){
				status = 0;
				load();
			},2048);
		}

		function onEvent() {
			updateStatus();
			load();
		}

		self.setLoader = function (l) {
			loader = l;
		};
		self.setRender = function (r) {
			dataSec = [0, 0];
			render = r;
		};
		/**
		 * pause lazyload
		 */
		self.pause = function () {
			if (!started) {
				return;
			}
			Event(window).off("scroll touchmove resize", onEvent);
			if (scrollPanel) {
				Event(scrollPanel).off("scroll touchmove", onEvent);
			}
			status = 2;
			load.stop();
			run();
			started = false;
		};

		/**
		 * resume lazyload
		 */
		self.resume = function () {
			if (started) {
				return;
			}
			started = true;
			status = 0;
			updateStatus();
			Event(window).on("scroll touchmove resize", onEvent);
			if (scrollPanel) {
				Event(scrollPanel).on("scroll touchmove", onEvent);
			}
		};
		self.refresh = load;
		if (self.loader) {
			self.setLoader(self.loader);
		}
		if (self.render) {
			self.setRender(self.render);
		}
		if(self.start!==false)
		{
			self.resume();
			load();
			zepto(function () {
				load();
				setTimeout(load, 2048)
			});
		}
	}
	datalazylist.NodeRender=require("mui/datalazylist/render/node");
	datalazylist.MultiNodeRender=require("mui/datalazylist/render/multinode");
	datalazylist.FixedSizeDataLoader=function (cfg){return datalazylist.RandomSizeDataLoader(mix({fixedSize:true},cfg))};
	datalazylist.RandomSizeDataLoader=require("mui/datalazylist/loader/page");
	datalazylist.StaticDataLoader=require("mui/datalazylist/loader/static");
	module.exports= datalazylist;