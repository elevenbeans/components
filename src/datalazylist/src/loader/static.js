/*
 @author 游侠
 */
	function StaticDataLoader(data) {
		return {
			totalNum: data.length,
			get: function (index) {
				return data[index];
			},
			/**
			 * 加载指定索引的数据,并在加载完成后刷新
			 * */
			fetch: function (index, callback) {
				callback && callback(data[index]);
			}
		}
	}
	module.exports=StaticDataLoader;