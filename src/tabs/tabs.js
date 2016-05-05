/**
 * Tabs
 */
require('../../zepto/zepto');
require('../../zepto/event');
require('../../zepto/touch');

let win = window,
    tapEvt = ('ontouchstart' in win) ? 'tap' : 'click',
    resizeEvt = 'onorientationchange' in win ? 'orientationchange' : 'resize',
//选中状态类名
    activeCss = 'active',
//左侧按钮
    leftBtnCss = 'mui-tabs-btn-l',
//右侧滚动按钮
    rightBtnCss = 'mui-tabs-btn-r',
//下拉按钮
    dropBtnCss = 'mui-tabs-btn',
//判断是否是android
    isAndroid = /Android/i.test(navigator.userAgent),

    rAF = win.rAF = win.requestAnimationFrame	||
        win.webkitRequestAnimationFrame	||
        function (callback) { win.setTimeout(callback, 16); };

/**
 * 使用class创建一个tabs类
 */
class Tabs {
    /**
     * 构造函数
     * 实例化时执行该方法
     */
    constructor($el, options) {
        let me = this,
            idx,
            dropdown,
            rolling,
            isIcon;

        me._events = {};
        //将参数缓存起来
        //合并参数
        me.options = Object.assign({},{
            idx : null,
            dropdown : 'auto',
            rolling : 'hide',
            isIcon : false
        },options);
        //tab容器id
        me.$el = $($el);
        //cache 一些变量
        me.$body = $('body');
        me.$win = $(win);
        //iscroll
        me.scroll = null;
        //页面宽度
        me.pageWidth = 0;
        //单个item的宽度
        me.itemsWidth = 0;
        //用来判断是否需要iscroll
        //如果设置了idx属性，iscroll异步加载，会导致无法跳转到对应的idx上，故需要设置一个参数
        me.hasIscroll = null;
        //使用有button
        me.hasBtn = null;
        ////默认选中第一个元素
        me.curIndex = parseInt(me.options.idx, 10) || 0;

        idx = me.$el.attr('data-idx');
        dropdown = me.$el.attr('data-dropdown');
        rolling = me.$el.attr('data-rolling');
        isIcon = me.$el.attr('data-icon');
        //获取节点上的属性进行初始化
        idx && (me.options.idx = idx - 0);
        dropdown && (me.options.dropdown = dropdown);
        rolling && (me.options.rolling = rolling);
        isIcon && (me.options.isIcon = isIcon);
        me._render();
        me._bindEvt();
    }

    plug(plugin){
        plugin.pluginInitializer(this);
        return this;
    }

    _render() {
        let me = this;

        me.$items = me.$el.find('li');
        me.maxItemWidth = 0;
        //li总数
        me.itemsLength = me.$items.length;
        //TODO 这里的宽度计算是否可以改用纯css完成?
        me.$items.each(function (index,item) {
            let $item = $(item);
            //添加属性 用于展开后 重新定位到当前元素
            $item.attr('data-x', me.itemsWidth);
            //留个坑,如果li使用了 padding\margin 则会导致计算有误,因为zepto不支持outerWidth
            //目前没有业务设置了样式,所以该问题暂不修复.
            //如果需要修复 请see:https://gist.github.com/alanhogan/3935463
            var outerWidth = $item.width();
            me.itemsWidth += outerWidth;// + 2; //主要部分android机宽度不够
            me.maxItemWidth = me.maxItemWidth < outerWidth ? outerWidth : me.maxItemWidth;
        });

        //加入mask
        me.$mask = $('<div class="mui-tabs-mask"></div>').appendTo(me.$body);

        //如果指定了idx 则默认先跳转到这个位置上
        if (me.options.idx && !me.hasIscroll) {
            me._updateNav(me.options.idx)
        }

        //按钮渲染
        me._renderBtn();
    }


    _renderBtn() {
        let me = this,
            dropdown = me.options.dropdown,
            rolling = me.options.rolling,
            isIcon = me.options.isIcon;

        //dropdown = 'show';
        //获取外层容器宽度
        me.pageWidth = me._getPageWidth();
        /**
         * 宽度不够，就肯定不显示了
         * 或者明确的声明不需要下拉按钮 dropdown === hide 或者不是icon样式
         * itemsWidth刚好等于pageWidth时也不需要显示按钮
         */
        if (me.itemsWidth <= me.pageWidth || (dropdown === 'hide' && rolling === 'hide' && !isIcon)) {
            //http://gitlab.alibaba-inc.com/mui/tabs/issues/9
            //这里需要等分之后的宽度大于最宽的item的宽度，否则会出现被挤压的情况
            if (me.itemsLength && (me.pageWidth / me.itemsLength) > me.maxItemWidth) {
                me.$el.addClass('mui-tabs-nobtn');      //flex多列等分布局
            } else {
                me.$el.addClass('mui-tabs-nobtn-auto'); //table-cell 自适应宽度布局
            }
            return;
        }
        //先从左右滚动按钮开始，因为左右滚动是二级按钮
        //二级分类判断
        if (rolling !== 'hide') {
            //如果dom结构中没有按钮 则加入
            if (!me.$el.find('.mui-tabs-btn-sub').length) {
                me.$el.prepend('<a href="javascript:;" class="mui-tabs-btn mui-tabs-btn-l"></a><a href="javascript:;" class="mui-tabs-btn mui-tabs-btn-r"></a>');
            }
            //按钮宽度
            //me.itemsWidth += 80;
            //加载iscroll
            me.hasIscroll = true;
            me._loadIscroll();
            me.hasBtn = 'rolling';

        } else if (dropdown !== 'hide') {
            //一级分类判断，若干item个数超过15个，则显示下拉按钮
            //自动计算
            if ((dropdown === 'auto' && me.itemsLength > 15 && !isIcon) || (dropdown === 'show')) {
                if (!me.$el.find('.mui-tabs-btn').length) {
                    me.$el.prepend('<div class="mui-tabs-text">切换分类</div><a href="javascript:;" class="mui-tabs-btn mui-global-border"></a>');
                }
                //按钮宽度 及 左侧间距 这里的40 是css里按钮的宽度
                //TODO 后续要改成自动化
                me.itemsWidth += 40;
                me.hasBtn = 'dropdown';
            } else {
                me.$el.prepend('<div class="mui-tabs-opacity"></div>');

                me.hasBtn = 'opacity';
            }
            //加载iscroll
            me.hasIscroll = true;
            me._loadIscroll();

        } else {
            //没有按钮的话则加个类名控制下样式吧
            me.$el.addClass('mui-tabs-nobtn');
        }
    }

    /**
     * 显示或隐藏按钮
     * @private
     */
    _toggleSubBtn(type) {
        let me = this;
        if (me.hasBtn === 'opacity') {
            if (type === 'right') {
                me.$el.find('.mui-tabs-opacity').addClass('hide');
            } else {
                me.$el.find('.mui-tabs-opacity').removeClass('hide');
            }

        } else if (me.hasBtn === 'rolling') {
            if (type === 'left') {
                me.$el.find('.' + leftBtnCss).addClass('disable');
                me.$el.find('.' + rightBtnCss).removeClass('disable');
            } else if (type === 'right') {
                me.$el.find('.' + leftBtnCss).removeClass('disable');
                me.$el.find('.' + rightBtnCss).addClass('disable');
            } else {
                me.$el.find('.mui-tabs-btn-sub').removeClass('disable');
            }
        }

    }

    /**
     * 加载iscroll
     * @private
     */
    _loadIscroll(callback) {
        let me = this,
            config = {
                scrollX: true,
                scrollY: false,
                eventPassthrough: true  //不阻止纵向原生滚动
            };
        //判断如果是android的话 就不加上pd
        config.preventDefault = !!isAndroid;

        require(['./iscroll-lite'],  iScroll => {

            me.scroll = new iScroll(me.$el.find('.mui-tabs-iscroll')[0], config);
            //如果指定了idx 则默认先跳转到这个位置上
            if (me.options.idx) {
                me._updateNav(me.options.idx)
            }
            callback && callback();
        });
    }

    /**
     * 事件绑定
     * @private
     */
    _bindEvt() {

        var me = this;
        //点击效果
        me.$el.on(tapEvt, 'li', e => {
                var index = $(e.currentTarget).index();
                //判断是否已展开 已展开则收起
                if (me.$el.hasClass('open')) {
                    me.close();
                }
                //跳转到相应的屏数
                me.switchTo(index);
                return false;
            })
            //展开收起效果
            .on(tapEvt, '.' + dropBtnCss, () => {
                me.$el.hasClass('open') ? me.close() : me.open();
                return false;
            })
            //左按钮
            .on(tapEvt, '.' + leftBtnCss,  () => {
                me.prev();
                return false;
            })
            //右按钮
            .on(tapEvt, '.' + rightBtnCss,  () => {
                me.next();
                return false;
            })
            .on('touchend', 'li', (e)=>{
                e.preventDefault();
            });

        //页面滚动效果
        me.$win.on(resizeEvt,  () => {
            me.refresh();
        });

        //mask
        me.$mask.on(tapEvt,  () => {
            me.close();
            return false;
        });
    }


    /**
     * 获取宽度
     * @returns {Number}
     * @private
     */
    _getPageWidth() {
        var me = this,
            width = this.$el.width();
        if (me.options.rolling !== 'hide') {
            width -= 80;
        }
        return width;
    }

    /**
     * 更新导航
     * @param idx
     * @private
     */
    _updateNav(idx) {
        var me = this;
        var $active = me.$items.eq(idx),
            x = $active.attr('data-x'),
            tempWidth = me.pageWidth - me.itemsWidth,
        //TODO 20是 右侧按钮宽度 需要自动化计算处理
            scrollDistance = -(x - me.pageWidth / 2 + $active.width() - 20);
        //css切换
        me.$items.filter('.' + activeCss).removeClass(activeCss);
        $active.addClass(activeCss);
        //判断滚动的距离 避免滚动回弹
        //同时判断左右滚动的按钮是否需要隐藏
        if (scrollDistance > 0) {
            scrollDistance = 0;
            me._toggleSubBtn('left');
        } else if (scrollDistance < tempWidth) {
            scrollDistance = tempWidth;
            me._toggleSubBtn('right');
        } else {
            me._toggleSubBtn('show');
        }

        //先cache一下滚动的位置，方便展开收起时恢复到之前的状态
        me.$el.attr('scroll-x', scrollDistance);
        rAF(function () {
            //如果是展开状态下 就清除
            if (!me.$el.hasClass('open')) {
                if (me.hasIscroll && !me.scroll) {
                    me._loadIscroll( () => {
                        me.scroll.scrollTo(scrollDistance, 0, 0);
                    });
                } else if (me.scroll) {
                    me.scroll.scrollTo(scrollDistance, 0, 200);
                }
            }
        })

    }

    /**
     * 跳转到相应的分类
     * @param index
     */
    switchTo(index) {
        var me = this;
        //如果超出索引 或者选择的是当前索引
        if (index === undefined || index < 0 || index >= me.itemsLength || me.curIndex === index) return;
        //索引更新
        me.prevIndex = me.curIndex;
        me.curIndex = index;
        me._updateNav(index);
        //自定义事件 switch
        me.trigger('switch', {
            prevIndex: me.prevIndex,
            prevTarget: me.$items.eq(me.prevIndex),
            curIndex: index,
            curTarget: me.$items.eq(index)
        });
    }

    /**
     * 跳转到上一个
     */
    prev() {
        var prevIdx = this.curIndex - 1;
        this.switchTo(prevIdx);
    }

    /**
     * 跳转到下一个
     */
    next() {
        var nextIdx = this.curIndex + 1;
        this.switchTo(nextIdx);
    }

    /**
     * 展开更多分类，同时会触发 `open` 事件
     * @method open
     */
    open() {
        var me = this;
        me.trigger('open');
        me.$el.add(me.$mask).addClass('open');
        me.disable();
        //打开时禁止页面滚动
        me.$body.on('touchmove', e => {
            e.preventDefault();
        });
    }

    /**
     * 收起更多分类，同时会触发 `close` 事件
     * @method close
     */
    close() {
        let me = this;
        me.trigger('close');
        me.$el.add(me.$mask).removeClass('open');
        me.enable();
        me.$body.off('touchmove');
    }

    /**
     * 开启iscroll的左右拖曳效果
     * @method enable
     */
    enable() {
        let me = this,
            scrollDistance;
        //开启时先还原之前的位置信息
        if (me.scroll) {
            scrollDistance = +me.$el.attr('scroll-x');
            me.scroll.scrollTo(scrollDistance, 0, 0);
            me.scroll.enable();
        }
    }

    /**
     * 关闭iscroll的左右拖曳效果
     * @method disable
     */
    disable() {
        let me = this;
        //跳转到第一个元素
        if (me.scroll) {
            me.scroll.scrollTo(0, 0, 0);
            me.scroll.disable();
        }
    }

    /**
     * 销毁实例
     */
    destructor() {
        this.scroll.destroy();
    }


    /**
     * 更新页面宽度值，刷新iscroll状态
     * 一般用于屏幕旋转事件
     * @method refresh
     */
    refresh() {
        let me = this;
        if (me.scroll) {
            me.pageWidth = me._getPageWidth();
            me.scroll.refresh();
        }
        me.trigger('refresh');
    }

    /**
     * on 事件绑定
     * @param type
     * @param listener
     * @returns {Tabs}
     */
    on(type, listener) {
        var listeners = this._events[type] ||(this._events[type] = []);
        if(listeners.indexOf(listener) != -1) {
            return this
        }
        listeners.push(listener);
        return this
    }

    /**
     * 派发自定义事件
     * @param type
     * @param args
     * @returns {boolean}
     */
    trigger(type, ...args){
        var listeners = this._events[type];
        if(!listeners || !listeners.length) {
            return false
        }
        listeners.forEach(fn => fn.apply(null, args));
        return true
    }
}

module.exports = Tabs;