/**
 * loom.js v1.0
 * author: liven
 * license: MIT
 */
(function(global, factory) {
    typeof module !== 'undefined' && typeof exports === 'object'
     ? module.exports = factory(global)
     : typeof define === 'function' && define.amd
        ? define('loom',[],function(){ return factory(global);})
        : (global.Loom = factory(global));
}(this, function(global, undefined) {
    'use strict';

    var version = '1.0';

    var
        doc = global.document,
        noop = function () {},
        _warn = function (msg) {
            msg = '[loom warn] '+ msg;
            console.warn(msg);
        },
        _error = function (msg) {
            msg = '[loom error] '+ msg;
            throw msg;
        };

    var
        objProto = Object.prototype,
        arrProto = Array.prototype,
        nativeForEach = arrProto.forEach,
        slice = arrProto.slice,
        hasOwn = objProto.hasOwnProperty,
        objToString = objProto.toString,
        defineProp = Object.defineProperty,
        createObj = Object.create,
        nativeIndexOf = arrProto.indexOf;

    var
        isString = function util$isString(obj){
            return objToString.call(obj) === '[object String]';
        },
        isNumber = function util$isNumber(obj){
            return objToString.call(obj) === '[object Number]';
        },
        isWindow = function util$isWindow(obj){
            if(obj && obj === obj.window){
                return true;
            }
            return false;
        },
        isFunction = function util$isFunction(obj){
            return objToString.call(obj) === '[object Function]';
        },
        isPlainObject = function util$isPlainObject(obj){
            return objToString.call(obj) === '[object Object]';
        },
        isArray = function util$isArray(obj){
            return objToString.call(obj) === '[object Array]';
        },
        isArrayLike = function util$isArrayLike(obj){
            var length;
            if(!obj){
                return false;
            }
            if(isString(obj) || isWindow(obj) || isFunction(obj)){
                return false;
            }
            if(isArray(obj)){
                return true;
            }
            if((length = obj.length) && isNumber(length)){
                return length === 0 || length > 0 && hasOwn.call(obj, length - 1);
            }
            return false;
        },
        makeArray = function util$makeArray(obj) {
            var result = [];
            if(!obj){
                return result;
            }
            if(isArrayLike(obj)){
                result = slice.call(obj, 0);
            } else {
                result.push(obj);
            }
            return result;
        },
        protoMixin  = function util$protoMixin(constuctor, protoObj) {
            constuctor.prototype = protoObj;
            defineProp(protoObj, 'constuctor', {
                enumerable: false,
                writable: true,
                configurable: true,
                value: constuctor
            });
            return constuctor;
        },
        idMaker = function util$idMaker() {
            return 'loom' + (Date.now() + 1);
        };

    var breaker = createObj(null);
    var each = function util$each(obj, iterator, context) {
        if (!obj) {
            return obj;
        }
        if (nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
            var i = 0, length = obj.length;
            for (; i < length; i++) {
                if (iterator.call(context, obj[i], i, obj) === breaker) {
                    return;
                }
            }
        } else {
            for (var key in obj) {
                if (hasOwn.call(obj, key)) {
                    if (iterator.call(context, obj[key], key, obj) === breaker) {
                        return;
                    }
                }
            }
        }
        return obj;
    };

    var indexOf = function util$indexOf(array, item) {
        if (!array) {
            return -1;
        }
        if (nativeIndexOf && array.indexOf === nativeIndexOf){
            return array.indexOf(item);
        }
        var i = 0, length = array.length;
        for (; i < length; i++) {
            if (array[i] === item) {
                return i;
            }
        }
        return -1;
    };

    /**
     * 获取属性对象
     */
    var getAttrNode = function util$getAttrNode(elm, attrName){
        if(!elm || elm.nodeType !== 1){
            return null;
        }
        return attrName ? elm.attributes[attrName] : elm.attributes;
    };

    /**
     * 获取属性值
     */
    var getAttrValue = function util$getAttrValue(elm, attrName){
        if(!elm || elm.nodeType !== 1 || !attrName){
            return null;
        }
        return elm.getAttribute(attrName+'');
    };

    /**
     * 设置属性值
     */
    var setAttrValue = function util$setAttrValue(elm, attrName, value){
        if(!elm || elm.nodeType !== 1 || !attrName){
            return null;
        }
        elm.setAttribute(attrName+'', value || '');
        return elm;
    };

    var isHTMLTag = function (tag) {
        var htmlTagList =  ('html,body,base,head,link,meta,style,title,' +
        'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
        'div,dd,dl,dt,figcaption,figure,hr,img,li,main,ol,p,pre,ul,' +
        'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
        's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
        'embed,object,param,source,canvas,script,noscript,del,ins,' +
        'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
        'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
        'output,progress,select,textarea,' +
        'details,dialog,menu,menuitem,summary,' +
        'content,element,shadow,template')
            .split(',');

        return indexOf(htmlTagList, tag) !== -1;
    };

    var isSVG = function (tag) {
        var svgTagList = ( 'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,' +
        'font-face,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
        'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view')
            .split(',');
        return indexOf(svgTagList, tag) !== -1;
    };

    var isReservedTag = function (tag) {
        return isHTMLTag(tag) || isSVG(tag);
    };

    var isCommonAttr = function (tag) {
        var attrList = ['id','class','name','style','title'];
       /* 'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
        'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
        'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
        'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
        'required,reversed,scoped,seamless,selected,sortable,translate,' +
        'truespeed,typemustmatch,visible';*/
        return indexOf(attrList, tag) !== -1;
    };

    /**
     *选择器
     */
    var selectorRE = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/;
    var find = function util$find(selector, context){
        var elem;
        if(!context || context.nodeType !== 1 || context.nodeType !== 9){
            context = doc;
        }
        if(!selector || typeof selector !== "string"){
            return [];
        }
        var match = selectorRE.exec(selector);
        if(match){
            if (match[1]) {
                //#id
                elem = context.getElementById(match[1]);
            } else if (match[2]) {
                //tag
                elem = context.getElementsByTagName(match[2]);
            } else if (match[3]){
                //.class
                elem = context.getElementsByClassName(match[3]);
            }
        } else {
            try {
                elem = context.querySelectorAll(selector);
            } catch(e){
                _error(e);
            }
        }
        return makeArray(elem);
    };

    /**
     * 是否是特殊标签
     */
    var isSpecialTag = function (str) {
        var stagList = ['script','link','template'];
        return indexOf(stagList, str.toLowerCase()) !== -1;
    };
    var singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/;
    /**
     * html解析器
     */
    var parseHtml = function util$parseHtml(tpl){
        var elem;
        if(!tpl) {
            return [];
        }
        if (typeof tpl === "string") {
            tpl = tpl.trim();
            if (tpl[0] === "<" && tpl[tpl.length - 1] === ">" && tpl.length >= 3) {
                //检查是否是只有一个层级的html标签
                var match = singleTagRE.exec(tpl);
                if (match) {
                    !isSpecialTag(match[1])
                    ? (elem = doc.createElement(match[1]))
                    : _warn('"'+ match[1] + '" is a special HTML element that will not be parsed');
                } else {
                    try {
                        var fragment = doc.createDocumentFragment(),
                            tmpDiv = fragment.appendChild(doc.createElement('div'));
                        tmpDiv.innerHTML = tpl;
                        elem = tmpDiv.childNodes;
                    }catch(e){
                        _error(e);
                    }
                }
            }
        } else if (tpl.nodeType === 1 || objProto.toString.call(tpl) === '[object HTMLCollection]'
            || objProto.toString.call(tpl) === '[object NodeList]' || ('jQuery' in global && tpl instanceof jQuery)) {
            elem = tpl;
        }
        return makeArray(elem);
    };

    /**
    * 将中划线连接格式转换为驼峰格式
    */
    var camelizeRE = /-(\w)/g;
    var camelize = function util$camelize(str) {
        if(str.indexOf('-') === -1){
            return str;
        }
        return str.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : ''; });
    };

    /**
     * 头字母大写
     */
    var capitalize = function util$capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    /**
     * 将驼峰格式转换为中划线连接格式
     */
    var kebabRE = /([^-])([A-Z])/g;
    var kebabCase = function util$kebabCase(str) {
        return str
            .replace(kebabRE, '$1-$2')
            .replace(kebabRE, '$1-$2')
            .toLowerCase();
    };

    var _$root,
        _$Ds = createObj(null),// 指令配置信息
        _$DEs = createObj(null);// 指令对象

    function Loom$Root(){
        this._init.apply(this, arguments);
    }
    protoMixin(Loom$Root, {
        _$DEs: _$DEs,
        _init: function (options) {
            this.$options = isPlainObject(options) ? options : {};
            this.$rootElm = find(this.$options.rootElm);
            this.$data = this.$options.data || {};
            if(this.$rootElm.length) {
                _parse(this.$rootElm);
            }
            return this;
        }
    });

    /**
     * Loom构造函数
    *@param {object} options
    * options.rootElm {element | selector} 指定启动的根节点,默认body
    */
    function Loom(options){
        if(!(this instanceof Loom)){
            _warn('Loom is a constructor and should be called with the `new` keyword');
            return;
        }
        return _$root = new Loom$Root(options);
    }

    Loom.$version = version;
    Loom.directive = _$Loom$$directive;
    Loom.compile = _$Loom$$compile;
    Loom.find = _$Loom$$find;

    /**
     * 指令对象构造函数
     * @param {object} options
     * @param {element} node
     */
    function Loom$DScope(options, node){
        this._init.apply(this, arguments);
    }

    protoMixin(Loom$DScope, {
        find: _$Loom$$find,
        _init: _$DScope$init,
        _bind: _$DScope$bind
    });

    /**
    *定义指令
    *@param {object | function} definition
    * object:
    * {
    * type: 'E|A',
    * props:[],
    * beforeBind: function(scope, elm){}
    * bind: function(scope, elm, props){}
    * }
    * function:
    * function (){
    * return {};
    *
    * }
   */
    function _$Loom$$directive(name, definition) {
        if(!name){
            return;
        }

        if(isFunction(definition)){
            definition = definition.call(null);
        }

        if(!isPlainObject(definition)){
            return;
        }

        if(definition.type !== 'E' && definition.type !== 'A'){
            definition.type = 'E';
        }

        //不允许使用内置的html标签名称作为指令的名称
        if(definition.type === 'E' && isReservedTag(name)){
            _warn(
                'Do not use built-in or reserved HTML elements as directive name: ' + name
            );
            return;
        }
        //不允许使用常用的属性名称作为指令的名称
        if(definition.type === 'A' && isCommonAttr(name)){
            _warn(
                'Do not use common HTML attributes as directive name: ' + name
            );
            return;
        }
        _$Ds[name] = definition;
        return definition;
    }

    /**
    * 获取指令对象
     * Loom.find(id);
    */
    function _$Loom$$find(id){
        return _$DEs[id];
    }

    /**
     * 编译方法
     * @param {string | node}  node
     * Loom.compile('<div id="main"></div>')
     * Loom.compile(document.getElementById('main'))
     */
    function _$Loom$$compile(content) {
        var nodes = parseHtml(content);
        if(nodes.length){
            _parse(nodes);
        }
        return nodes;
    }

    /**
    *指令对象初始化函数
    */
    function _$DScope$init(options, node){
        this.$options = isPlainObject(options) ? options : {};
        this._bind(node);
    }

    function _$DScope$bind(node){
        if(!node || (node.nodeType !== 1 && node.nodeType !== 2)){
            _error('Node must be a avaiable HTML element or HTML attribute');
            return;
        }

        if(node.nodeType === 2){
            node = node.ownerElement;
        }

        var id;
        if(!(id = getAttrValue(node, 'loom-id'))){
            id = idMaker();
            setAttrValue(node, 'loom-id', id);
        }

        this.$id = id;
        this.$ref = node;
        this.$attrs = _collectAttrs(this.$ref.attributes, this.$options.props);
        this.$data = _convertData(this.$attrs);

        //注册指令对象
        _$DEs[id] = this;

        var bind = isFunction(this.$options.bind) ? this.$options.bind : noop;
        this.$stuff = bind.apply(null, [this, this.$ref, this.$data]);
    }

    /**
     * 解析
     * @param {array} nodes
     */
    function _parse(nodes){
        if(!nodes || !nodes.length){
            return;
        }
        each(nodes, function(item){
            if(item.nodeType === 1){
                _parseElem(item);
            } else if(item.nodeType === 2){
                _parseAttr(item);
            }
        });
    }

    /**
    * 解析element
     * @param {HTMLelement} elem
    */
    function _parseElem(elem){
        if(elem.nodeType !== 1){
            return;
        }
        var directives = _$Ds,
            elemName = camelize(elem.nodeName.toLowerCase()),
            directiveOptions;
        // 标签类指令
        if(hasOwn.call(directives, elemName) && (directiveOptions = directives[elemName]).type === 'E'){
            //绑定指令对象
            new Loom$DScope(directiveOptions, elem);
        }

        //解析属性
        var attrs = getAttrNode(elem);
        if (attrs.length) {
            _parse(attrs);
        }

        //解析子节点
        var childNodes = elem.childNodes;
        if (childNodes.length) {
            _parse(slice.call(childNodes, 0));
        }
    }

    /**
    * 解析attribute
     * @param {HTMLattribute} attr
    */
    function _parseAttr(attr){
        if(attr.nodeType !== 2){
            return;
        }
        var directives = _$Ds,
            attrName = camelize(attr.name.toLowerCase()),
            directiveOptions;
        if(hasOwn.call(directives, attrName) && (directiveOptions = directives[attrName]).type === 'A'){
            //绑定指令对象
            new Loom$DScope(directiveOptions, attr);
        }
    }

    /**
     * 收集props中声明的属性值
     */
    function _collectAttrs(attrs, props){
        var result = {};
        if(!attrs || !isArray(props) || !props.length){
            return result;
        }
        var attrObj,
            kebabCaseName;
        each(props, function(name){
            kebabCaseName = kebabCase(name);
            attrObj = attrs[kebabCaseName];
            result[name] = attrObj ? attrObj.value : null;
        });
        return result;
    }

    /**
     * 将属性值转换为可用数据
     */
    function _convertData(attrs){
        var result = {},
            match,
            valueExp,
            linkScopeId,
            scope;
        if(!attrs){
            return result;
        }
        each(attrs, function (value, key) {
            //value "linkScopeId:a.b.c"|"a"|"1"
            if(value) {
                match = value.split(':');
                valueExp = match[match.length - 1];
                if (match.length > 1) {// 指定了关联作用域
                    linkScopeId = match[0];
                    scope = linkScopeId === 'root' ? _$root : _$DEs[linkScopeId];
                    result[key] = _parseExpforData(scope.$data, valueExp);
                } else {
                    result[key] = valueExp;
                }
            }
        });
        return result;
    }

    function _parseExpforData (obj, valueExp) {
        if (!obj || !valueExp) {
            return null;
        }
        var parts = valueExp.split('.'),
            i = 0,
            len = parts.length;
        for (; i < len; i++) {
            obj = obj[parts[i]];
            if (!obj) {
                break;
            }
        }
        return obj;
    }

    return Loom;
}));
