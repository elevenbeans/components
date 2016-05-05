/*
 @author 游侠
 */
	var NodeRender= require("mui/datalazylist/render/node");
	function MultiNodeRender(cfg) {
		cfg = cfg || {};
		var els = cfg.els, state = cfg.state, renders = [], dataSecs = [ ], len = els.length, ceil = Math.ceil;
		for(var ind=0,len = els.length;ind<len;ind++)
		{
			el = NodeRender.getDOMNode(els[ind]);
			dataSecs.push([0, 0]);
			cfg.el=el;
			cfg.els=null;
			cfg.state=state && state.getState("C" + ind);
			renders.push(new NodeRender(cfg));
		}
		function cInd(index,i){
			return ceil(Math.max(index - i, 0) / len);
		}
		function pInd(index,i){
			return index * len + i;
		}
		return {
			start: function (dataSec, minIndex, maxIndex, status) {
				for (var i = 0; i < len; i++) {
					renders[i].start(dataSecs[i], cInd(minIndex, i), cInd(maxIndex+1, i)-1, status);
				}
			},
			checkRemove: function (index, order) {
				if (order == -1) {
					var minIndex = Number.MAX_VALUE;
					for (var i = index; i < index + len; i++) {
						var batchNum = renders[i % len].checkRemove(cInd(i, i % len), order);
						minIndex = Math.min(minIndex, i + batchNum * len);
					}
					return minIndex - index;
				}
				else {
					var maxIndex = 0;
					for (var i = index; i >= 0 && i > index - len; i--) {
						var batchNum = renders[i % len].checkRemove(cInd(i, i % len), order);
						maxIndex = Math.max(maxIndex, i - batchNum * len);
					}
					return index - maxIndex;
				}
			},
			remove: function (index, order, batchNum) {
				var num = 0;
				if (order == -1) {
					for (var i = index; i < index + batchNum && i < index + len; i++) {
						var actNum = renders[i % len].remove(cInd(i, i % len), order, ceil((batchNum - (i - index)) / len));
						dataSecs[i % len][0] += actNum;
						num += actNum;
					}
				}
				else {
					for (var i = index; i >= 0 && i > index - batchNum && i > index - len; i--) {
						var actNum = renders[i % len].remove(cInd(i, i % len), order, ceil((batchNum - (index - i)) / len));
						dataSecs[i % len][1] -= actNum;
						num += actNum;
					}
				}
				return num;
			},
			adjust: function (dataSec, minIndex, maxIndex) {
				var dataSecStart = Number.MAX_VALUE;
				for (var i = 0; i < len; i++) {
					renders[i].adjust(dataSecs[i], cInd(minIndex, i), cInd(maxIndex, i));
					dataSecStart = Math.min(dataSecStart, pInd(dataSecs[i][0] , i))
				}
				if (dataSec[0] == dataSec[1]) {
					dataSec[0] = dataSec[1] = dataSecStart;
					for (var i = 0; i < len; i++) {
						dataSecs[i][0] = dataSecs[i][1] = ceil(Math.max(dataSecStart - i, 0) / len);
					}
				}
			},
			checkAdd: function (index, order) {
				if (order == -1) {
					var minIndex = index + 1;
					for (var i = index; i >= 0 && i > index - len; i--) {
						var batchNum = renders[i % len].checkAdd(cInd(i, i % len), order);
						if (batchNum) {
							minIndex = Math.min(minIndex, i - (batchNum - 1) * len);
						}
					}
					return (index + 1) - minIndex;
				}
				else {
					var maxIndex = index - 1;
					for (var i = index; i < index + len; i++) {
						var batchNum = renders[i % len].checkAdd(cInd(i, i % len), order);
						if (batchNum) {
							maxIndex = Math.max(maxIndex, i + (batchNum - 1) * len);
						}
					}
					return maxIndex - (index - 1);
				}
			},
			add: function (index, order, batchNum, getter) {
				
				var num = 0;
				if (order == -1) {
					for (var i = index; i >= 0 && i > index - batchNum && i > index - len; i--) {
						var actNum = renders[i % len].add(cInd(i, i % len), order, ceil((batchNum - (index - i)) / len), function (j) {
							return getter(pInd(j, i%len));
						});
						dataSecs[i % len][0] -= actNum;
						num += actNum;
					}
				}
				else {
					for (var i = index; i < index + batchNum && i < index + len; i++) {
						var actNum = renders[i % len].add(cInd(i, i % len), order, ceil((batchNum - (i - index)) / len), function (j) {
							return getter(pInd(j, i % len));
						});
						dataSecs[i % len][1] += actNum;
						num += actNum;
					}
				}
				return num;
			},
			finish: function (dataSec, minIndex, maxIndex) {
				for(var i=0,len = renders.length;i<len;i++)
				{
					renders[i].finish(dataSecs[i], cInd(minIndex, i), cInd(maxIndex+1, i)-1);
				}
			},
			destroy: function () {
				for(var i=0,len = renders.length;i<len;i++)
				{
					renders[i].destroy();
				}
			}
		}
	}
	module.exports=MultiNodeRender;