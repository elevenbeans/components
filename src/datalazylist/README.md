## 功能
组件实现单列或者多列的网格（每个item的高度一致）或者瀑布流（每个item的高度不一定相同）实现，主要用于无线端。

## Demo

### 1. 网格 单列 布局

![](http://gtms02.alicdn.com/tps/i2/TB1cqBiJpXXXXXHXFXXsqt6QVXX-660-1090.png)

### 2. 网格 多列 布局

![](http://gtms01.alicdn.com/tps/i1/TB1HNNxJpXXXXX3XXXXk4UL0XXX-662-1090.png)

### 3. 瀑布流 布局

![](http://gtms03.alicdn.com/tps/i3/TB1sXpdJpXXXXc0XFXXtUNbVXXX-658-1014.png)

## 基本用法
--- 
 
组件的初始化通过创建datalazylist对象，传入两个配置项：数据加载器loader和DOM渲染器render。

loader负责数据的加载，render负责DOM的渲染。

简单demo
  
    KISSY.use("dom,mui/datalazylist/", function (S, DOM, datalazylist) {
        var list = new datalazylist({
            //渲染器render
            render: new datalazylist.NodeRender({
                el: "#listPanel",//渲染的容器
                createDom: function (item) { //创建itemDOM元素
                    var itemData = item.item;
                    return DOM.create('<div><a href="' + itemData.url + '"><div class="itemImg"><img src="' + itemData.img + '_600x600.jpg"/></div></a></div>');
                }
            }),
            //加载器loader
            loader: new datalazylist.FixedSizeDataLoader({
                preloadNum:10,
                onData: function (query, callback) {//加载数据
                    S.use("io", function (IO) {
                        IO.jsonp("http://s.m.tmall.com/m/search_data.htm?q=%D3%F0%C8%DE%B7%FE&unify=yes&p=" + (query.page + 1), function (result) {
                            callback(result.srp);
                        })
                    });
                }})
        });
    });
    

### 1.数据加载器loader

loader根据数据获取的方式分为

* 异步获取数据：RandomSizeDataLoader（不限制每页的数据个数）、FixedSizeDataLoader（固定每页的数据个数）

* 同步获取数据：StaticDataLoader

#### 1.1RandomSizeDataLoader（常用）

初始化时,利用配置项onData异步获取数据，其有两个形参query和callback。当数据加载完毕时，调用callback回调。

    new datalazylist.RandomSizeDataLoader({
        onData: function(query, callback) {
            S.use("io", function(IO) {
                IO.jsonp("//list.tmall.com/api/s.htm?from=mtop&_input_charset=utf-8&q=女装&page=" + (query.page + 1), function(result) {                    
                    callback(result.item);
                })
            });
        }
    })
    

除了常用的配置项onData,还有

    preloadNum:9, //预先加载第10条数据
    pageSize:20, //每页需加载的数据项个数，当此值固定时，loader加载第几页与此pageSize的值有关
    maxPage:3, //允许加载的最大页的索引（如值为3代表最多加载4页）
    fixedSize:true //每页是否固定个数，如果该值为真，且没有设置pageSize，则loader会将第一页加载的数据个数作为pageSize

#### 1.2FixedSizeDataLoader

FixedSizeDataLoader只是将RandomSizeDataLoader的配置项fixedSize设为true而已。

    FixedSizeDataLoader: function (cfg){return PageDataLoader(S.mix({fixedSize:true},cfg))}

### 2.DOM渲染器render

render获取来自loader的数据，在DOM上绘制。根据绘制的方式，分为

* 网格布局（每个item的高度一致）：NodeRender
* 瀑布流布局（每个item的高度不一致，可实现错位的瀑布流效果）：MultiNodeRender

#### 2.1 NodeRender

初始化render也是通过传入配置项实现。其中，

* groupSize 决定单次在页面上批量渲染的item元素的个数
* scrollBuffer 直接影响padding-bottom的值.直观地说，当值为0时，滚动条滚动到最底部才刷出新的数据，用户体验较差；当值>0（常设置成DOM.viewportHeight()），滚动条无需滚动到最底部，就刷出新的数据了，用户体验较好。
* destroyBudder 与 scrollBuffer 可以通过下面的GIF来理解(效果demo可以参见下面的Demo链接 )

每种不同的颜色色块代表渲染的元素，中间未设置透明遮罩的表示viewport，被遮罩遮住的部分可以看出元素消亡的过程。

![](http://gtms02.alicdn.com/tps/i2/TB1voEkJXXXXXaiXFXXyyeV5pXX-329-588.gif)

可以看出 当页面向上滑动时，瀑布流头部超出destroyBuffer的item就被销毁，底部新增的item不会超出renderBuffer。

render拥有的配置项在下方示例中全部列出

    new datalazylist.NodeRender({
        el: "#listPanel",  //渲染的容器
        renderBuffer: 1,    //绘制缓冲区，默认开始为0，onLoad之后为1屏，在用户滚动开始后为两屏
        destroyBuffer: 1,   //销毁缓冲区（区域外才开始销毁）默认为4屏
        groupSize: 9,
        scrollBuffer: 1,    //滚动缓存区，在底部数据未渲染完成时的滚动占位高度，默认为4屏
        defaultSize: 431,   //每一项高度（可不设置，设置正确之后可以避免因为调整高度差带来的跳动）
        maxIndex:16,    //最大索引号，之后的数据不再渲染
        scrollParent:null,  //滚动层，必须包含container,或是container本身
        createDom: function (item) {
            var itemData = item.item;
            return DOM.create('<div><a href="' + itemData.url + '"><div class="itemImg"><img src="' + itemData.img + '_600x600.jpg"/></div></a></div>');
        },
        initDom:function (){
            //此处通常实现图片懒加载
        }
    })


#### 2.2 MultiNodeRender

MultiNodeRender用于实现瀑布流布局。配置项基本与NodeRender一致，除了要渲染的容器els根据瀑布流的列数而变化。

    new datalazylist({
        render: new datalazylist.MultiNodeRender({
            els: ["#listPanel1", "#listPanel2"],
            ...
    })
    
## 可运行的demo链接
---

* 单列的网格布局：[http://gitlab.alibaba-inc.com/mui/datalazylist/raw/master/demo/basic.html](http://gitlab.alibaba-inc.com/mui/datalazylist/raw/master/demo/basic.html)
* 多列的网格布局：[http://gitlab.alibaba-inc.com/mui/datalazylist/raw/master/demo/grid.html](http://gitlab.alibaba-inc.com/mui/datalazylist/raw/master/demo/grid.html)
* 瀑布流布局:[http://gitlab.alibaba-inc.com/mui/datalazylist/raw/master/demo/pinterest.html](http://gitlab.alibaba-inc.com/mui/datalazylist/raw/master/demo/pinterest.html)



更多demo可进入组件的Demo目录下查看。


## 高级用法
---
#### Q1:经常出现加载最后一页时，padding-bottom有一定的高度。同时，发现loader多加载了一页空的数据。
Answer1：这是因为loader计算是否已加载完所有数据时，计算不精确的原因。可通过设置loader的属性totalNum来解决。totalNum确定了加载的数据的个数，如此，loader能够精确地判断是否加载到最后一页，从而避免多加载一页空数据的情况。

    new datalazylist.FixedSizeDataLoader({
            onData: function(query, callback) {
                var self=this;//self指向loader
                S.use("io", function(IO) {
                    IO.jsonp("//list.tmall.com/api/s.htm?from=mtop&_input_charset=utf-8&q=女装&page=" + (query.page + 1), function(result) {
                        this.totalNum=result.totalNum;//设置totalNum
                        callback(result.item);
                    })
                });
            }
        })

## 原理
---
组件提供两个demo，解释datalazylist实现的原理
* [demo.html](http://gitlab.alibaba-inc.com/mui/datalazylist/blob/daily/3.1.7/demo/demo.html) (by 游侠)

该Demo可看出：renderBuffer,destroyBuffer 代表的含义。即，当页面瀑布流向上滑动时，瀑布流头部超出destroyBuffer的item就被销毁，底部新增的item不会超出renderBuffer。

* [demo2.html](http://gitlab.alibaba-inc.com/mui/datalazylist/blob/daily/3.1.7/demo/demo2.html) (by 静沫)

该Demo可看出：

groupSize代表每次批量渲染的个数（通过console台可清楚的看出每次添加删除元素的个数）；

padding-top不断增加，实现占位，防止页面抖动；

padding-bottom基本随着scrollBuffer的设置而变化。

### src/index.js 

下图讲述了index.js主要实现的过程。

![](http://gtms04.alicdn.com/tps/i4/TB179u5IFXXXXbkXVXXY2drYpXX-2180-1002.png)