/**
 * @description: 结合flipsnap的列表slide组件
 */

require("../../zepto/zepto");

var win = window,

    Flipsnap = require("./flipsnap"),
    doc = document;
var getOffset = function (el) {
    var parent = el;
    var left = 0,
        top = 0;
    while (parent != null && parent != doc.body) {
        left += parent.offsetLeft;
        top += parent.offsetTop;
        parent = parent.offsetParent;
    }
    return {
        left: left,
        top: top
    };
};
var circlePoint = function (i, len) {
    return (len + (i % len)) % len;
};

/**
 * 检测环境支持
 */
var div = doc.createElement('div'),
    pfx = ['webkit', 'moz', 'MS', 'o', ''];

var ucFirst = function (str) {
    return str.charAt(0).toUpperCase() + str.substr(1);
};
var some = function (ary, callback) {
    for (var i = 0, len = ary.length; i < len; i++) {
        if (callback(ary[i], i)) {
            return true;
        }
    }
    return false;
};
var getCSSVal = function (prop) {
    if (div.style[prop] !== undefined) {
        return prop;
    }
    else {
        var ret;
        some(pfx, function (_pfx) {
            var _prop = ucFirst(_pfx) + ucFirst(prop);
            if (div.style[_prop] !== undefined) {
                ret = '-' + _pfx + '-' + prop;
                return true;
            }
        });
        return ret;
    }
};
var hasProp = function (props) {
    return some(props, function (prop) {
        return div.style[prop] !== undefined;
    });
};
var supportProp = function (prop, values) {
    return some(values, function (value) {
        div.style[prop] = value;
        var v = div.style[prop];
        return v === value;
    });
};
class Slide {
    constructor(options) {
        options = this.options = options || {};
        options.bounceTime = options.bounceTime || 300;
    }

    pluginInitializer(tabs) {
        var self = this,
            options = self.options,
            boxEl = $('.slide-box',options.el),
            listEls = $('.j_list',boxEl);

        if (!listEls) {
            window.console && console.log('请填写列表节点');
        }
        if (self.checkAnimation()) {
            self.useTransition(boxEl, listEls, tabs);
        }
        else {
            self.disableTransition(boxEl, listEls, tabs);
        }
    }

    /**
     * checkAnimation 检查是否支持css3动画
     */
    checkAnimation() {
        var self = this,
            support = {};

        support.transform3d = hasProp([
            'perspectiveProperty',
            'WebkitPerspective',
            'MozPerspective',
            'OPerspective',
            'msPerspective'
        ]);

        support.transform = hasProp([
            'transformProperty',
            'WebkitTransform',
            'MozTransform',
            'OTransform',
            'msTransform'
        ]);

        support.transition = hasProp([
            'transitionProperty',
            'WebkitTransitionProperty',
            'MozTransitionProperty',
            'OTransitionProperty',
            'msTransitionProperty'
        ]);
        return (support.transform3d || support.transform) && support.transition;
    }

    /**
     * 高级浏览器用法
     */
    useTransition(boxEl, listEls, tabs) {
        boxEl = boxEl.get(0);
        var self = this,
            options = self.options,
            bounceTime = options.bounceTime,
            tabsHeight = $(tabs.$el[0]).height(),
            snap = new Flipsnap(boxEl, {
                distance: boxEl.clientWidth,
                transitionDuration: bounceTime,
                disable3d: true,
                disableTouch: !!options.disableTouch
            }),
            minHeight = win.innerHeight - tabsHeight,
            minTop = getOffset(boxEl).top - tabsHeight,
            lastPanel, minTop,
            listLen = listEls.length,
            isTouch = 'ontouchstart' in win,
            running = false,
            prevEl, nextEl;
        $(listEls).css({height: minHeight + 'px'});
        if (isTouch) {
            snap.element.addEventListener('fstouchstart', function (e) {
                var point = snap.currentPoint,
                    curEl = listEls[point],
                    scrollY = win.scrollY,
                    top;
                top = scrollY - minTop;
                prevEl = listEls[circlePoint(point - 1, listLen)];
                nextEl = listEls[circlePoint(point + 1, listLen)];
                if (top > 0 && top < $(curEl).height() - minHeight) {
                    if (prevEl.__isShow) {
                        $(prevEl).css({
                            'margin-top': top + 'px'
                        });
                    }
                    if (nextEl.__isShow) {
                        $(nextEl).css({
                            'margin-top': top + 'px'
                        });
                    }
                }
            }, false);
        }
        snap.element.addEventListener('fspointbeforemove', function (e) {
            isTouch && nextEl && nextEl.__isShow && ($(nextEl).css('margin-top', null));
            isTouch && prevEl && prevEl.__isShow && ($(prevEl).css('margin-top', null));
            onChange();
            running = true;
            tabs.switchTo(e.currentPoint);
            running = false;
        }, false);

        tabs.on('switch', function (e) {
            if (running) {
                return;
            }
            snap.moveToPoint(tabs.curIndex, bounceTime);
        });

        tabs.on('refresh', function (e) {
            snap.distance = boxEl.clientWidth;
            snap.refresh();
        });

        if (tabs.curIndex !== 0) {
            snap.moveToPoint(tabs.curIndex, 0);
        }
        else {
            onChange();
        }

        function onChange() {
            var point = snap.currentPoint,
                panel = listEls[point];

            minTop = getOffset(boxEl).top - tabsHeight;
            //调用层的初始化
            if (panel === lastPanel) {
                return;
            }
            if (lastPanel) {
                lastPanel.__scrollTop = (win.scrollY > minTop) ? win.scrollY : minTop;
                lastPanel.__onHide && lastPanel.__onHide();
                $(lastPanel).css({height: minHeight + 'px'});
            }

            if (panel) {
                $(panel).css({height: 'auto'});
                panel.__onShow && panel.__onShow();
                !panel.__isShow && (panel.__isShow = true);
                !panel.__isRender && (panel.__isRender = true);
                // 初始化时，不需要触发window.scroll
                lastPanel && panel.__scrollTop && panel.__scrollTop>minTop && win.scrollTo(0, panel.__scrollTop || minTop);
            }
            lastPanel = panel;
        }
    }

    /**
     * 兼容低端浏览器
     */
    disableTransition(boxEl, listEls, tabs) {
        var self = this,
            showCls = 'slide-low',
            hideCls = 'slide-hide',
            panel = listEls[tabs.curIndex],
            onChange, lastPanel;

        $(boxEl).addClass(showCls);
        $(listEls).hide();
        onChange = function () {
            if (panel) {
                $(panel).show();
                panel.__onShow && panel.__onShow();
            }
            if (lastPanel) {
                $(lastPanel).hide();
                lastPanel.__onHide && lastPanel.__onHide();
            }
            lastPanel = panel;
        }
        tabs.on('switch', function (e) {
            panel = listEls[e.curIndex],
                onChange();
        });
        onChange();
    }
}
module.exports = Slide;