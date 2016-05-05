datalazyload
===============


### 支持的场景

 
name|DOM标记|description|
 --- | --- | --- |
img | img[data-ks-lazyload] | 在图片进入视图范围时设置图片的SRC属性，支持占位图功能和fadein效果 |
bgimg | *[data-ks-lazyload-bg] | 在层进入视图范围的时候设置层的背景图backgroundImage,可以结合background-size:cover\contain使用，在一些场景下比img更方便，如果样式之中设置了滤镜，会自动通过滤镜支持IE6/7/8 |
textarea | textarea[ks-datalazyload] | 在textarea进入视图范围的时候将textarea的值替换textarea层本身，用来进行HTML的按需渲染 |
addCallback | * | 对任意层可以通过脚本完全自定义该层首次进入视图范围的初始化方法 |


### config
```
diff : 50 // pre load 50px outside viewport or specified container
diff: {
  left:20, // pre load 50px outside left edge of viewport or specified container
  right:30, // pre load 50px outside right edge of viewport or specified container
  top:50, // pre load 50px outside top edge of viewport or specified container
  bottom:60 // pre load 50px outside bottom edge of viewport or specified container
}
```
| name | type | default value | description |
| ---  | ---- | ------------- | ----------- |
| diff | Integer, Object | viewport | pre load `diff` outside left edge of viewport or specified container |
| onStart | Function | null | execute before img src change|
| autoDestroy | Boolean | true | Whether destroy this component when all lazy loaded elements are loaded|
| container | HTMLElement,String | document | Container which will be monitor scroll event to lazy load elements within it |
| placeholder | String | [http://g.tbcdn.cn/s.gif](http://g.tbcdn.cn/s.gif) | Placeholder img url for lazy loaded _images if image's src is empty|


### onStart&addStartListener
* 在datalazyload执行替换src之前进行的操作

```javascript
require(['mui/datalazyload/'], function (DataLazyload) {
        var datalazyload = DataLazyload.instance();
        datalazyload.set("onStart",function(event, callback){
            console.log(event.src);
        });
        datalazyload.addElements(".lazy-load-container"); //加入lazyload
    });
```

```javascript
//addStartListener用法
require(['mui/datalazyload/'], function (DataLazyload) {
    var datalazyload = DataLazyload.instance();
    datalazyload.addStartListener(function (event, callback) {
        console.log(event.src);
    });
}
```

### Example
```javascript
require(['mui/datalazyload/'], function (DataLazyload) {
    var datalazyLoad = new DataLazyload({"container": document, "diff": 10, "autoDestroy":false});
});
```

```javascript
require(['mui/datalazyload/'], function (DataLazyload) {
    var datalazyLoad = new DataLazyload("J_LazyLoader0", {
    		"diff": 10, 
    		"autoDestroy":false
    	});
    var lazyLoadCtn = document.querySelector("J_LazyLoader3");
    datalazyLoad.addElements(["J_LazyLoader1","J_LazyLoader2",lazyLoadCtn]);
    
    datalazyLoad.addCallback('J_LazyLoader4', function(){
    	//do something
    });
});
```

#### 单例用法
```javascript
require(['mui/datalazyload/'], function (DataLazyload) {
    var datalazyload = DataLazyload.instance();
    datalazyload.addElements(".lazy-load-container"); //加入lazyload
});
```