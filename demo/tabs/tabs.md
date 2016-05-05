# Tabs

MUI 4.0 规范中的 Tab组件

组件效果图:

![image](http://img3.tbcdn.cn/5476e8b07b923/TB1D9cYGVXXXXcPXVXXXXXXXXXX)

![](http://img3.tbcdn.cn/5476e8b07b923/TB1LNqUIpXXXXaSXXXXXXXXXXXX)


## Use

* femodule 使用方式，worehole环境下推荐使用，数据格式可参考[schema](http://dip.alibaba-inc.com/api/v2/services/schema/mock/2825?spm=0.0.0.0.pzr095)，或者demo文件夹下的data1--5.json

```
{{ use ("mui://tabs/index.xtpl", $data.data3) }}
<script>
    require([
        'mui/tabs/index',
        'mui/tabs/sticky'
    ],function(Tabs,Sticky){
        var tabs = new Tabs('#J_tabs3').plug(new Sticky());
        tabs.on('switch',function(e){
            var curIndex = e.curIndex,
                    prevIndex = e.prevIndex,
                    curTarget = e.curTarget,
                    prevTarget = e.prevTarget;
            console.log(curIndex,prevIndex,curTarget,prevTarget);

        });
    });
</script>

```

* 非femodule使用方式，直接将html输出在页面上

```html

<!-- css建议同步加载，因为分类的宽度计算依赖于css绘制后的实际宽度，如果不带上css，可能会出现异常哦 -->
<div id="J_nav" class="mui-tabs">
    <div class="mui-tabs-iscroll">
        <ul>
            <!-- 这里是分类的内容 -->
            <li class="active"><span>全部</span></li>
            {{set(x = $data.tehData.list)}}
            {{#each(x)}}
            <li data-cateid="{{this.code}}"><span>{{this.name}}</span></li>
            {{/each}}
        </ul>
    </div>
</div>

```

![](http://img3.tbcdn.cn/5476e8b07b923/TB1zy9AIpXXXXX6XVXXXXXXXXXX)

* 非femodule使用方式，**带上图标的样式结构**，主要区别是容器加了个类名：`mui-tabs-icon` 同时 `li`里面有`<i>`

```
<div id="J_nav" class="mui-tabs mui-tabs-icon">
    <div class="mui-tabs-iscroll">
        <ul>
            <!-- 这里是分类的内容 -->
            <li class="active"><i>&#xe603;</i><span>全部</span></li>
            {{set(x = $data.tehData.list)}}
            {{#each(x)}}
            <li data-cateid="{{this.code}}"><i>&#xe603;</i><span>{{this.name}}</span></li>
            {{/each}}
        </ul>
    </div>
</div>
```

**注意：若使用带图标的结构，需要手动指定iconfont的样式信息**

```
@font-face {
    font-family: 'iconfont';
    src: url('//at.alicdn.com/t/font_1433746919_3212137.eot'); /* IE9*/
    src: url('//at.alicdn.com/t/font_1433746919_3212137.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */ url('//at.alicdn.com/t/font_1433746919_3212137.woff') format('woff'), /* chrome、firefox */ url('//at.alicdn.com/t/font_1433746919_3212137.ttf') format('truetype'), /* chrome、firefox、opera、Safari, Android, iOS 4.2+*/ url('//at.alicdn.com/t/font_1433746919_3212137.svg#iconfont') format('svg'); /* iOS 4.1- */
}


```

![](http://img3.tbcdn.cn/5476e8b07b923/TB1pZuVIpXXXXaFXXXXXXXXXXXX)

## 调用方法

### 基础调用

tabs默认不包含sticky效果，因为有时候不需要，比如fixed定位的时候，实际上是不需要的，所以把sticky效果单独做成了插件。

```javascript

require(['mui/tabs/index'],function(Tabs){
        var tabs = new Tabs('#J_nav')
    })
    
```




### Slide插件(实现左右滑动功能)

```html

    <div class="mui-tabs" id="J_nav">
        <div class="mui-tabs-iscroll">
            <ul>
                 <li class="active"><span>tab1</span></li>
                 <li><span>tab2</span></li>
            </ul>
        </div>
    </div>
    <div class="mui-tabs-slide expert-container">
        <div class="slide-box">
            <div class="slide-list clearfix j_list">content 1</div>
            <div class="slide-list clearfix j_list">content 2</div>
        </div>
    </div>
```

```js
const $ = require('mui/zepto/zepto');
const Tabs = require('mui/tabs/index');
const Sticky = require('mui/tabs/sticky');
const Slide = require('mui/tabs/slide');

var tagsEl = $('#J_nav').get(0),
    startIndex = 0,
    bounceTime = 300,
    sticky, slide, tabs;

sticky = new Sticky();
slide = new Slide({
    el: $('.mui-tabs-slide').get(0),
    bounceTime: bounceTime
});

tabs = new Tabs(tagsEl, {
    idx: startIndex
})
.plug(sticky)
.plug(slide);

//如果slide容器中有动态加载的内容，需要加入以下代码，在点击时初始化加载
var listContainers = $('.j_list');
listContainers.each(function(  curIndex, el ){
    el.__onShow = function () {
        // 加载页面数据
    };
    el.__onHide = function () {
        // 暂停页面数据加载
    };
});

```

### Sticky插件（实现悬浮置顶效果）

```js

require([
    'mui/tabs/index',
    'mui/tabs/sticky'
],function(Tabs,Sticky){
    var tabs = new Tabs('#J_nav')
        .plug(new Sticky(offsetTop:0));
});

```


### Stair插件（实现电梯跳转效果）

```js

require([
    'mui/tabs/index',
    'mui/tabs/stair'
],function(Tabs,Stair){
    var tabs = new Tabs('#J_nav')
        .plug(new Stair({offsetTop:0,delay:512}));
});

```

## femodule data

* 使用femoduel的xtpl方式同步渲染，所需的数据格式请参看[json schema](http://dip.alibaba-inc.com/pages/schemas/2825?spm=0.0.0.0.pzr095) ： 

![](http://img3.tbcdn.cn/5476e8b07b923/TB1zjKSIpXXXXbRXXXXXXXXXXXX)

* mock 数据

mock 数据可查看demo文件夹下 `data1.json`，或者查看DIP平台提供的mack数据：[http://dip.alibaba-inc.com/api/v2/services/schema/mock/2825](http://dip.alibaba-inc.com/api/v2/services/schema/mock/2825)

## 样式覆盖

* 默认tab的选中态，只需要修改如下css中的颜色即可

```
.mui-tabs li.active span{color: #2766cf;border-bottom: 3px solid #2766cf; }
```

* 带图标tab的选中态

```
.mui-tabs-icon li.active{background: #28AAFA;}
.mui-tabs-icon li.active:after{border-top-color: #28aafa;}
```


## Config


| name | type | default value | description |
| ---  | --- | --- | --- |
| idx | int | null | 默认展示的索引位置，也就是默认高亮哪个tab |
| dropdown | string | auto | 下拉按钮，枚举类型，auto： 自动判断，hide：隐藏，show：显示|
| rolling | string | hide | 左右滚动按钮，枚举类型，auto： 自动判断，hide：隐藏，show：显示 |
| text | string | 切换分类 | 用于展开时候的文字描述 |
| id | string | null | femodule所需的组件ID |
| spm | string| null |  femodule所需的spm C位埋点 |

![](http://img3.tbcdn.cn/5476e8b07b923/TB14kYcHFXXXXXuXFXXXXXXXXXX)
![](http://img3.tbcdn.cn/5476e8b07b923/TB1lznhHFXXXXX1XpXXXXXXXXXX)
![](http://img3.tbcdn.cn/5476e8b07b923/TB1tr98HFXXXXbwXFXXXXXXXXXX)

## Methods


### switchTo(idx)

跳转分类，idx为楼层index索引值，序号从0开始。
同时会触发`switch`事件

```javascript
tabs.switchTo(1);   //跳转到第二个分类

```


### prev()

跳转到上一个分类
同时会触发`switch`事件

```javascript
tabs.prev();    //跳转到上一个

```

### next()

跳转到下一个分类
同时会触发`switch`事件

```javascript
tabs.goTo(1);   //跳转到第二个分类

```

### open()

展开更多分类，同时会触发 `open` 事件
该方法主要用于内部展开更多分类的事件，一般不建议直接使用。
可以通过监听`open`事件来实现相同的功能。

### close()

收起更多分类，同时会触发 `close` 事件
该方法主要用于内部展开更多分类的事件，一般不建议直接使用。
可以通过监听`close`事件来实现相同的功能。

### enable()

开启iscroll的左右拖曳效果

### disable()

关闭iscroll的左右拖曳效果

### destroy()

销毁实例

### refresh()

更新页面宽度值，刷新iscroll状态,一般用于屏幕旋转事件




### Events


### open

```js
tabs.on('open',function(){
    console.log('tab open now')
})
```

### close

```js
tabs.on('close',function(){
    console.log('tab close now')
})
```

### switch

该事件使用的频率很高，一般用于tab分类切换时做相应的逻辑操作

```js
tabs.on('switch',function(e){
    //上一个选中的tab index
    e.prevIndex
    //当前选中的tab index
    e.curIndex
    console.log('tab close now')
})
```

## changelog

* v 4.0.0
    * 符合MUI4.0规范，使用ES6 + zepto开发 

* v 3.1.27
    * 符合MUI3.0 二期新规范样式
    * 新增带图标的tab样式

* v 3.1.15
    * 新增 `destroy ` 方法
    * 新增femodule使用方式

