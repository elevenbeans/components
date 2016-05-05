	/**
	 *根据加载函数实现加载器
	 *@param {Function} load 加载函数
	 *@returns {Function} 加载器
	 */
	function createLoader(load) {
		var value, loading, handles = [], h;
		return function (handle, type) {
			//type默认为1
			//0:	不立即加载，不过加载完成之后执行回调函数
			//1:	立即加载，并在完成之后执行回调函数
			//2:	不立即加载，只在当前已经存在的情况下执行回调函数
			if (type !== 0 && !type) {
				type = 1;
			}
			if ((type & 1) && !loading) {
				loading = true;
				load(function (v) {
					value = v;
					while (h = handles.shift()) {
						h && h.apply(null, [value]);
					}
				})
			}
			if (value !== undefined) {
				handle && handle.apply(null, [value]);
				return value;
			}
			if (!(type & 2)) {
				handle && handles.push(handle);
			}//如果只在存在的情况下回调，则退出
			return value;
		}
	}

	function PageDataLoader(cfg) {
		cfg = cfg || {};
		var loaderMap = {},
			pageSize = cfg.pageSize,
			page = 0,
			maxPage = cfg.maxPage || Number.MAX_VALUE,
			preloadNum = cfg.preloadNum,
			data = {length: 0};
		return {
			get:function(index){
				
				return data[index];
			},
			/**
			 * 加载指定页码的数据
			 * */
			fetchPage: function (page, callback) {
				var self = this;
				loaderMap[page] = loaderMap[page] || createLoader(function (callback) {
					function load() {
						var dataParam = {page: page};
						cfg.onData.apply(self,[dataParam, function (pageData) {
							if (dataParam.complete) {
								return;
							}
							dataParam.complete = 1;
							var len = pageData.length;
							if(!pageSize && cfg.fixedSize){
								pageSize = len;
							}
							var start = pageSize ? page * pageSize : data.length;
							for (var i = 0; i < len; i++) {
								if (!data[i + start]) {
									data[i + start] = pageData[i];
									data.length++;
								}
							}
							if ((pageSize && pageSize > len) || !len || (self.totalPage==page+1)) {
								self.totalNum = pageSize ? (start + len) : data.length;
							}
							callback(pageData);
						}])
					}

					(page > 0 && !pageSize) ? self.fetchPage(cfg.fixedSize?0:page - 1, load) : load();

				});
				loaderMap[page](callback);
			},
			/**
			 * 加载指定索引的数据
			 * */
			fetch: function (index, callback, isPreload) {
				var self = this;
				
				if (data[index] || self.totalNum <= index || page > maxPage) {
					return callback && callback(data[index]);
				}
				function find() {
					self.fetchPage(pageSize ? Math.floor(index / pageSize) : page, function (pageData) {
						if (!data[index] && pageData && pageData.length && (self.totalNum===undefined || self.totalNum > index) && page < maxPage) {
							page++;
							return find();
						}
						callback && callback(data[index]);
						if (!isPreload && preloadNum && document.readyState === "complete") {
							self.fetch(index + preloadNum, null, true);
						}
					});
				}
				find();
			}
		}
	}
	module.exports=PageDataLoader;