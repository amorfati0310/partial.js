// partial.js
// History - lmn.js -> lego.js -> L.js -> abc.js -> partial.js
// Project Lead - Indong Yoo
// Maintainers - Piljung Park, Hanah Choi
// Contributors - Byeongjin Kim, Joeun Ha, Hoonil Kim
// (c) 2015-2016 Marpple. MIT Licensed.
!function(G) {
  var window = typeof window != 'object' ? G : window;
  window._ ? window.__ = _ : window._ = _;
  var ___ = window.___ = ___;

  /* Partial */
  function _(fn) {
    fn = Lambda(fn);
    var args1 = [], args3, len = arguments.length, ___idx = len;
    for (var i = 1; i < len; i++) {
      var arg = arguments[i];
      if (arg == ___ && (___idx = i) && (args3 = [])) continue;
      if (i < ___idx) args1.push(arg);
      else args3.push(arg);
    }
    return function() { return fn.apply(this, merge_args(args1, arguments, args3)); };
  }
  _.partial = _;
  function _to_unde(args1, args2, args3) {
    if (args2) args1 = args1.concat(args2);
    if (args3) args1 = args1.concat(args3);
    for (var i = 0, len = args1.length; i < len; i++) if (args1[i] == _) args1[i] = undefined;
    return args1;
  }
  function merge_args(args1, args2, args3) {
    if (!args2.length) return args3 ? _to_unde(args1, args3) : _to_unde(_.clone(args1));
    var n_args1 = _.clone(args1), args2 = _.to_array(args2), i = -1, len = n_args1.length;
    while (++i < len) if (n_args1[i] == _) n_args1[i] = args2.shift();
    if (!args3) return _to_unde(n_args1, args2.length ? args2 : undefined);
    var n_arg3 = _.clone(args3), i = n_arg3.length;
    while (i--) if (n_arg3[i] == _) n_arg3[i] = args2.pop();
    return args2.length ? _to_unde(n_args1, args2, n_arg3) : _to_unde(n_args1, n_arg3);
  }
  _.right = function() {
    var len = --arguments.length, fn = arguments[len];
    delete arguments[len];
    return fn.apply(this == _ ? null : this, arguments);
  };
  _.righta = function(args, fn) { return fn.apply(this == _ ? null : this, args); };

  /* Pipeline */
  _.pipe = pipe, _.pipec = pipec, _.pipea = pipea, _.pipea2 = pipea2;
  _.mr = mr, _.to_mr = to_mr, _.is_mr = is_mr;
  function pipe(v) {
    var i = 0, f;
    while (f = arguments[++i]) v = (v && v._mr) ? f.apply(undefined, v) : f(v);
    return v;
  }
  function pipec(self, v) {
    var i = 1, f;
    while (f = arguments[++i]) v = (v && v._mr) ? f.apply(self, v) : f.call(self, v);
    return v;
  }
  function pipea(self, v, fs) {
    var i = 0, f;
    while (f = fs[i++]) v = (v && v._mr) ? f.apply(self, v) : f.call(self, v);
    return v;
  }
  function pipea2(v, fs) {
    var i = 0, f;
    while (f = fs[i++]) v = (v && v._mr) ? f.apply(undefined, v) : f(v);
    return v;
  }
  function mr() {
    arguments._mr = true;
    return arguments;
  }
  function to_mr(args) {
    if (args.length < 2) return args;
    args._mr = true;
    return args;
  }
  function is_mr(v) { return v && v._mr; }

  _.Pipe = function() {
    var fs = arguments;
    return function() {
      return this == undefined ? pipea2(to_mr(arguments), fs) : pipea(this, to_mr(arguments), fs);
    }
  };

  _.Indent = function() {
    var fs = arguments;
    return function() { return pipea(ithis(this, arguments), to_mr(arguments), fs); }
  };
  function ithis(self, args) { return { parent: self, args: args }; }

  _.Tap = _.tap = function() {
    // var fns = C.toArray(arguments);
    // return function() { return A(arguments, fns.concat([J(arguments), to_mr]), this); };
  };
  // B.boomerang = function() { // fork
  //   var fns = arguments;
  //   return _.async.jcb(function(res, cb) {
  //     cb(res);
  //     A([res], fns, this);
  //   });
  // };
  // B.delay = function(time) {
  //   return CB(function() {
  //     var args = arguments, cb = args[args.length-1];
  //     args.length = args.length - 1;
  //     setTimeout(function() { cb.apply(null, args); }, time || 0);
  //   });
  // };

  _.Err = function() {};
  // function isERR(err) {
  //   err = is_mr(err) ? err[0] : err;
  //   return err && err.constructor == Error && err._ABC_is_err;
  // }

  _.async = function (v) {
    return async_pipe(void 0, v, arguments, 1);
  };
  _.async.Pipe = function() {
    var fs = arguments;
    return function() {
      return this == undefined ? _.async.pipea2(to_mr(arguments), fs) : _.async.pipea(this, to_mr(arguments), fs);
    }
  };
  _.async.Indent = function() {
    var fs = arguments;
    return function() { return _.async.pipea(ithis(this, arguments), to_mr(arguments), fs); }
  };
  _.async.pipe = _.async;
  _.async.pipec = function(self, v) {
    return async_pipe(self, v, arguments, 2);
  };
  _.async.pipea = function(self, v, fs) {
    return async_pipe(self, v, fs, 0);
  };
  _.async.pipea2 = function(v, fs) {
    return async_pipe(void 0, v, fs, 0);
  };
  _.cb = _.callback = _.async.callback = _.async.cb = function(f) {
    f._p_cb = true;
    return f;
  };
  _.async.jcb = function(f) {
    f._p_jcb = true;
    return f;
  };

  function has_promise() { return has_promise.__cache || (has_promise.__cache = !!_.val(window, 'Promise.prototype.then')); }
  function maybe_promise(res) { return _.isObject(res) && res.then && _.isFunction(res.then); }
  function unpack_promise(res, callback) {
    var is_r = is_mr(res);
    return (function u(i, res, length, has_promise) {
      if (i == length) {
        has_promise && callback(is_r ? res : res[0]);
        return;
      }
      return maybe_promise(res[i]) && (has_promise = true) ? (function(i) {
        res[i].then(function(v) {
          res[i] = v;
          u(i + 1, res, length, has_promise);
        });
        return true;
      })(i) : u(i + 1, res, length, has_promise);
    })(0, (res = is_r ? res : [res]), res.length, false);
  }
  function async_pipe(self, v, args, i) {
    var args_len = args.length, promise = null, resolve = null;
    function cp() { return has_promise() ? new Promise(function(rs) { resolve = rs; }) : { then: function(rs) { resolve = rs; } } }
    return (function c(res) {
      do {
        if (i === args_len) return !promise ? res : resolve ? resolve(res) : setTimeout(function() { resolve && resolve(res); }, 0);
        if (unpack_promise(res, c)) return promise || (promise = cp());
        if (!args[i]._p_cb && !args[i]._p_jcb) res = is_mr(res) ? _.Lambda(args[i++]).apply(self, res) : _.Lambda(args[i++]).call(self, res);
        else if (!args[i]._p_cb) is_mr(res) ?
          _.Lambda(args[i++]).apply(self, res[res.length++] = function() { res = to_mr(arguments); } && res) :
          _.Lambda(args[i++]).call(self, res, function() { res = to_mr(arguments); });
      } while (i == args_len || i < args_len && !args[i]._p_cb);
      if ((promise || (promise = cp())) && unpack_promise(res, c)) return promise;
      is_mr(res) ?
        _.Lambda(args[i++]).apply(self, res[res.length++] = function() { c(to_mr(arguments)); } && res) :
        _.Lambda(args[i++]).call(self, res, function() { c(to_mr(arguments)); });
      return promise;
    })(v);
  }

  /* Ice cream */
  _.noop = function() {};
  _.this = function() { return this; };
  _.i = _.identity = function(v) { return v; };
  _.args0 = _.identity;
  _.args1 = function() { return arguments[1]; };
  _.args2 = function() { return arguments[2]; };
  _.args3 = function() { return arguments[3]; };
  _.args4 = function() { return arguments[4]; };
  _.args5 = function() { return arguments[5]; };
  _.Always = _.always = function(v) { return function() { return v; }; };
  _.true = _.Always(true);
  _.false = _.Always(false);
  _.null = _.Always(null);
  _.not = function(v) { return !v; };
  _.nnot = function(v) { return !!v; };
  _.log = window.console && window.console.log ? console.log.bind ? console.log.bind(console) : function() { console.log.apply(console, arguments); } : I;
  _.loge = window.console && window.console.error ? console.error.bind ? console.error.bind(console) : function() { console.error.apply(console, arguments); } : I;
  _.Hi = _.Tap(_.log);

  _.f = function(nodes) {
    var f = _.val(G, nodes);
    var err = Error('warning: ' + nodes + ' is not defined');
    return f || setTimeout(function() { (f = f || _.val(G, nodes)) || _.loge(err) }, 500)
      && function() { return (f || (f = _.val(G, nodes))).apply(this, arguments); }
  };
  _.val = function(obj, key, keys) {
    return (function v(obj, i, keys, li) {
      return (obj = obj[keys[i]]) ? li == i ? obj : v(obj, i + 1, keys, li) : li == i ? obj : void 0;
    })(obj, 0, keys = key.split('.'), keys.length - 1);
  };

  // <respect _>
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is_' + name.toLowerCase()] = _['is' + name] = function(obj) { return Object.prototype.toString.call(obj) === '[object ' + name + ']'; }
  });
  if (typeof /./ != 'function' && typeof Int8Array != 'object') _.isFunction = function(obj) { return typeof obj == 'function' || false; };
  _.is_object = _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };
  _.has = function(obj, key) {
    return obj != null && obj.hasOwnProperty(key);
  };
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  _.is_array_like = _.isArrayLike = function(collection) {
    var length = collection && collection.length;
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };
  var slice = Array.prototype.slice;
  _.rest = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };
  _.values = function(obj) {
    var keys = _.keys(obj), length = keys.length, values = Array(length);
    for (var i = 0; i < length; i++) values[i] = obj[keys[i]];
    return values;
  };
  _.toArray = _.to_array = _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    return _.values(obj);
  };
  _.object = function(list, values) {
    for (var result = {}, i = 0, length = list.length; i < length; i++) {
      if (values) result[list[i]] = values[i];
      else result[list[i][0]] = list[i][1];
    }
    return result;
  };
  _.escape = (function(map) {
    var escaper = function(match) { return map[match]; };
    var source = '(?:' + Object.keys(map).join('|') + ')';
    var testRegexp = RegExp(source), replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  })({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '`': '&#x60;'});
  var idCounter = 0;
  _.unique_id = _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };
  _.clone = function(obj) {
    return !_.isObject(obj) ? obj : _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };
  // </respect _>

  function each(list, iter, start) {
    if (!list) return list;
    for (var i = start || 0, length = list.length; i < length ;i++) iter(list[i], i, list);
    return list;
  }
  function map(list, iter) {
    if (!list) return [];
    for (var l2 = [], i = 0, length = list.length; i < length ;i++) l2.push(iter(list[i], i, list));
    return l2;
  }
  //function times(len, func) { for (var i = 0; i < len; i++) func(i); }
  function times2(len, func) { for (var i = 1; i <= len; i++) func(i); }

  _.keys = function(obj) { return _.isObject(obj) ? Object.keys(obj) : []; };
  _.is_array = _.isArray = Array.isArray;
  _.wrapArray = _.wrap_arr = function(v) { return _.isArray(v) ? v : [v]; };
  _.parseInt = _.parse_int = function(v) { return parseInt(v, 10); };
  try { var has_lambda = true; eval('a=>a'); } catch (err) { var has_lambda = false; }
  function Lambda(str) {
    if (typeof str !== 'string') return str;
    if (Lambda[str]) return Lambda[str];
    if (!str.match(/=>/)) return Lambda[str] = new Function('$', 'return (' + str + ')');
    if (has_lambda) return Lambda[str] = eval(str); // es6 lambda
    var ex_par = str.split(/\s*=>\s*/);
    return Lambda[str] = new Function(
      ex_par[0].replace(/(?:\b[A-Z]|\.[a-zA-Z_$])[a-zA-Z_$\d]*|[a-zA-Z_$][a-zA-Z_$\d]*\s*:|this|arguments|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g, '').match(/([a-z_$][a-z_$\d]*)/gi) || [],
      'return (' + ex_par[1] + ')');
  };
  _.Lambda = Lambda;
  function bexdf(setter, obj1/* objs... */) {
    for (var i = 2, len = arguments.length; i < len; i++) setter(obj1, arguments[i]);
    return obj1;
  }
  function setter(r, s) { for (var key in s) r[key] = s[key]; }
  function dsetter(r, s) { for (var key in s) if (!_.has(r, key)) r[key] = s[key]; }
  _.extend = function() { return bexdf.apply(null, [setter].concat(_.toArray(arguments))); };
  _.defaults = function() { return bexdf.apply(null, [dsetter].concat(_.toArray(arguments))); };

  function flat(new_arr, arr, noDeep, start) {
    each(arr, function(v) {
      if (!_.isArrayLike(v) || (!_.isArray(v) && !_.isArguments(v))) return new_arr.push(v);
      noDeep ? each(v, function(v) { new_arr.push(v); }) : flat(new_arr, v, noDeep);
    }, start);
    return new_arr;
  }
  _.flatten = function (arr, noDeep, start) { return flat([], arr, noDeep, start); };
  _.method =function(obj, method) { return obj[method].apply(obj, _.rest(arguments, 2)); };

  /* mutable */
  _.set = function(obj, key, valueOrFunc) {
    if (!_.isFunction(valueOrFunc)) return _.mr(obj[key] = valueOrFunc, key, obj);
    return _.async.pipe(_.mr(obj, key), valueOrFunc, function(_value) { return _.mr(obj[key] = _value, key, obj) });
  };
  _.unset = function(obj, key) { var val = obj[key]; delete obj[key]; return _.mr(val, key, obj); };
  _.remove = function(arr, remove) { return _.mr(remove, _.removeByIndex(arr, arr.indexOf(remove)), arr); };
  _.pop = function(arr) { return _.mr(arr.pop(), arr.length, arr); };
  _.shift = function(arr) { return _.mr(arr.shift(), 0, arr); };
  _.push = function(arr, itemOrFunc) {
    if (!_.isFunction(itemOrFunc)) return _.mr(itemOrFunc, arr.push(itemOrFunc), arr);
    return _.async.pipe(arr, itemOrFunc, function(_item) { return _.mr(_item, arr.push(_item), arr); });
  };
  _.unshift = function(arr, itemOrFunc) {
    if (!_.isFunction(itemOrFunc)) return _.mr(itemOrFunc, arr.unshift(itemOrFunc), arr);
    return _.async.pipe(arr, itemOrFunc, function(_item) { return _.mr(_item, arr.unshift(_item), arr); });
  };
  _.removeByIndex = function(arr, from) {
    if (from !== -1) {
      var rest = arr.slice(from + 1 || arr.length);
      arr.length = from;
      arr.push.apply(arr, rest);
    }
    return from;
  };

  /* mutable/immutable with selector */
  _.sel = _.select = _.extend(function(start, selector) {
    return _.reduce(selector.split(/\s*->\s*/), function (mem, key) {
      return !key.match(/^\((.+)\)/) ? !key.match(/\[(.*)\]/) ? mem[key] : function(mem, numbers) {
        if (numbers.length > 2 || numbers.length < 1 || _.filter(numbers, function(v) { return isNaN(v); }).length) return _.Err('[] selector in [num] or [num ~ num]');
        var s = numbers[0], e = numbers[1]; return !e ? mem[s<0 ? mem.length+s : s] : slice.call(mem, s<0 ? mem.length+s : s, e<0 ? mem.length+e : e + 1);
      }(mem, _.map(RegExp.$1.replace(/\s/g, '').split('~'), _.parseInt)) : _.find(mem, _.Lambda(RegExp.$1));
    }, start);
  }, {
    set: function(start, selector, value) {
      var _arr = selector.split(/\s*->\s*/), last = _arr.length - 1;
      return _.to_mr([start].concat(_.set(_arr.length == 1 ? start : _.sel(start, _arr.slice(0, last).join('->')), _arr[last], value)));
    },
    unset: function(start, selector) {
      var _arr = selector.split(/\s*->\s*/), last = _arr.length - 1;
      return _.to_mr([start].concat(_.unset(_arr.length == 1 ? start : _.sel(start, _arr.slice(0, last).join('->')), _arr[last])));
    },
    remove: function(start, selector, remove) {
      if (remove) return _.to_mr([start].concat(_.remove(_.sel(start, selector), remove)));
      var _arr = selector.split(/\s*->\s*/);
      return _.to_mr([start].concat(_.remove(_.sel(start, _arr.slice(0, _arr.length - 1).join('->')), _.sel(start, selector))));
    },
    extend: function(start, selector/*, objs*/) {
      return _.to_mr([start].concat(_.extend.apply(null, [_.sel(start, selector)].concat(_.toArray(arguments).slice(2, arguments.length)))));
    },
    defaults: function(start, selector/*, objs*/) {
      return _.to_mr([start].concat(_.defaults.apply(null, [_.sel(start, selector)].concat(_.toArray(arguments).slice(2, arguments.length)))));
    },
    pop: function(start, selector) { return _.to_mr([start].concat(_.pop(_.sel(start, selector)))); },
    shift: function(start, selector) { return _.to_mr([start].concat(_.shift(_.sel(start, selector)))); },
    push: function (start, selector, item) { return _.to_mr([start].concat(_.push(_.sel(start, selector), item))); },
    unshift: function (start, selector, item) { return _.to_mr([start].concat(_.unshift(_.sel(start, selector), item))); },
    im: _.extend(function (start, selector) {
      var im_start = _.clone(start);
      return {
        start: im_start,
        selected: _.reduce(selector.split(/\s*->\s*/), im_start, function(clone, key) {
          return !key.match(/^\((.+)\)/) ? /*start*/(!key.match(/\[(.*)\]/) ? clone[key] = _.clone(clone[key]) : function(clone, numbers) {
            if (numbers.length > 2 || numbers.length < 1 || _.filter(numbers, [I, isNaN]).length) return ERR('[] selector in [num] or [num ~ num]');
            var s = numbers[0], e = numbers[1]; return !e ? clone[s] = _.clone(clone[s<0 ? clone.length+s : s]) : function(clone, oris) {
              return each(oris, function(ori) { clone[clone.indexOf(ori)] = _.clone(ori); });
            }(clone, slice.call(clone, s<0 ? clone.length+s : s, e<0 ? clone.length+e : e + 1));
          }(clone, _.map(RegExp.$1.replace(/\s/g, '').split('~'), [I, parseInt])))/*end*/ :
            function(clone, ori) { return clone[clone.indexOf(ori)] = _.clone(ori); } (clone, _.find(clone, _.Lambda(RegExp.$1)))
        })
      };
    }, {
      set: function(start, selector, value) {
        var _arr = selector.split(/\s*->\s*/), last = _arr.length - 1, im = _.sel.im(start, _arr.slice(0, _arr.length == 1 ? void 0 : last).join('->'));
        return _.to_mr([im.start].concat(_.set(_arr.length == 1 ? im.start : im.selected, _arr[last], value)));
      },
      unset: function(start, selector) {
        var _arr = selector.split(/\s*->\s*/), last = _arr.length - 1, im = _.sel.im(start, _arr.slice(0, last).join('->'));
        return _.to_mr([im.start].concat(_.unset(_arr.length == 1 ? im.start : im.selected, _arr[last])));
      },
      remove: function(start, selector, remove) {
        var _arr = selector.split(/\s*->\s*/), im = _.sel.im(start, selector);
        if (remove) return _.to_mr([start].concat(_.remove(im.selected, remove)));
        return _.to_mr([im.start].concat(_.remove(_.sel(im.start, _arr.slice(0, _arr.length - 1).join('->')), im.selected)));
      },
      extend: function(start, selector/*, objs*/) {
        var im = _.sel.im(start, selector);
        return _.to_mr([im.start].concat(_.extend.apply(null, [im.selected].concat(_.toArray(arguments).slice(2, arguments.length)))));
      },
      defaults: function(start, selector/*, objs*/) {
        var im = _.sel.im(start, selector);
        return _.to_mr([im.start].concat(_.defaults.apply(null, [im.selected].concat(_.toArray(arguments).slice(2, arguments.length)))));
      },
      pop: function(start, selector) {
        var im = _.sel.im(start, selector);
        return _.to_mr([im.start].concat(_.pop(im.selected)));
      },
      shift: function(start, selector) {
        var im = _.sel.im(start, selector);
        return _.to_mr([im.start].concat(_.shift(im.selected)));
      },
      push: function (start, selector, item) {
        var im = _.sel.im(start, selector);
        return _.to_mr([im.start].concat(_.push(im.selected, item)));
      },
      unshift: function (start, selector, item) {
        var im = _.sel.im(start, selector);
        return _.to_mr([im.start].concat(_.unshift(im.selected, item)));
      }
    })
  });

  /* Notification, Event */
  !function(_, notices) {
    _.noti = _.Noti = _.notice =  {
      on: on,
      once: _(on, _, _ , _, true),
      off: off,
      emit: emit,
      emitAll: emitAll
    };

    function on(name1, name2, func, is_once) {
      var _notice = notices[name1];
      func.is_once = !!is_once;
      if (!_notice) _notice = notices[name1] = {};
      (_notice[name2] = _notice[name2] || []).push(func);
      return func;
    }

    function off(name1, n2_or_n2s) {
      var _notice = notices[name1];
      if (arguments.length == 1) _.unset(notices, name1);
      else if (_notice && arguments.length == 2) each(_.isString(n2_or_n2s) ? [n2_or_n2s] : n2_or_n2s, _(_.unset, _notice));
    }

    function emitAll(name1, emit_args) {
      var key, _notice = notices[name1];
      if (_notice) for(key in _notice) emit_loop(emit_args, _notice, key);
    }

    function emit(name, keys, emit_args) {
      !function(_notice, keys) {
        if (!_notice) return ;
        if (_.isString(keys)) return emit_loop(emit_args, _notice, keys);
        if (_.isArray(keys)) each(keys, _(emit_loop, emit_args, _notice));
      }(notices[name], _.isFunction(keys) ? keys() : keys);
    }

    function emit_loop(emit_args, _notice, key) {
      _.set(_notice, key, _.reject(_notice[key], function(func) {
        func.apply(null, emit_args);
        return func.is_once;
      }));
    }
  }(_, {});

  /* each - reduce */
  function Iter(iter, args, num) {
    if (args.length == num) return iter;
    var args2 = _.rest(args, num), args3;
    return function() {
      if (args3) for (var i = 0, l = arguments.length; i < l; i++) args3[i] = arguments[i];
      else args3 = _.to_array(arguments).concat(args2);
      return iter.apply(null, args3);
    }
  }

  _.map = function(data, iteratee) {
    iteratee = Iter(iteratee, arguments, 2);
    if (_.isArrayLike(data))
      for (var i = 0, l = data.length, res = Array(l); i < l; i++)
        res[i] = iteratee(data[i], i, data);
    else
      for (var keys = _.keys(data), i = 0, l = keys.length, res = Array(l); i < l; i++)
        res[i] = iteratee(data[keys[i]], keys[i], data);
    return res;
  };

  _.each = function(data, iteratee) {
    iteratee = Iter(iteratee, arguments, 2);
    if (_.isArrayLike(data))
      for (var i = 0, l = data.length; i < l; i++)
        iteratee(data[i], i, data);
    else
      for (var keys = _.keys(data), i = 0, l = keys.length; i < l; i++)
        iteratee(data[keys[i]], keys[i], data);
    return data;
  };

  _.filter = function(data, predicate) {
    var res = [], predicate = Iter(predicate, arguments, 2);
    if (_.isArrayLike(data)) {
      for (var i = 0, l = data.length; i < l; i++)
        if (predicate(data[i], i, data)) res.push(data[i]);
    } else {
      for (var keys = _.keys(data), i = 0, l = keys.length; i < l; i++)
        if (predicate(data[keys[i]], keys[i], data)) res.push(data[keys[i]]);
    }
    return res;
  };

  _.reject = function(data, predicate) {
    var res = [], predicate = Iter(predicate, arguments, 2);
    if (_.isArrayLike(data)) {
      for (var i = 0, l = data.length; i < l; i++)
        if (!predicate(data[i], i, data)) res.push(data[i]);
    } else {
      for (var keys = _.keys(data), i = 0, l = keys.length; i < l; i++)
        if (!predicate(data[keys[i]], keys[i], data)) res.push(data[keys[i]]);
    }
    return res;
  };

  _.find = function(data, predicate) {
    predicate = Iter(predicate, arguments, 2);
    if (_.isArrayLike(data)) {
      for (var i = 0, l = data.length; i < l; i++)
        if (predicate(data[i], i, data)) return data[i];
    } else {
      for (var keys = _.keys(data), i = 0, l = keys.length; i < l; i++)
        if (predicate(data[keys[i]], keys[i], data)) return data[keys[i]];
    }
  };

  _.reduce = function(data, predicate, memo) {
    predicate = Iter(predicate, arguments, 3);
    if (_.isArrayLike(data))
      for (var i = 0, res = memo || data[i++], l = data.length; i < l; i++)
        res = predicate(res, data[i], i, data);
    else
      for (var i = 0, keys = _.keys(data), res = memo || data[keys[i++]], l = keys.length; i < l; i++)
        res = predicate(res, data[keys[i]], i, data);
    return res;
  };

  _.find_i = _.find_idx = _.findIndex = function(ary, predicate) {
    predicate = Iter(predicate, arguments, 2);
    for (var i = 0, l = ary.length; i < l; i++)
      if (predicate(ary[i], i, ary)) return i;
    return -1;
  };

  _.find_k = _.find_key = _.findKey = function(obj, predicate) {
    predicate = Iter(predicate, arguments, 2);
    for (var keys = _.keys(obj), key, i = 0, l = keys.length; i < l; i++)
      if (predicate(obj[key = keys[i]], key, obj)) return key;
  };

  _.every = function(data, predicate) {
    predicate = Iter(predicate, arguments, 2);
    if (_.isArrayLike(data)) {
      for (var i = 0, l = data.length; i < l; i++)
        if (!predicate(data[i], i, data)) return false;
    } else {
      for (var keys = _.keys(data), i = 0, l = keys.length; i < l; i++)
        if (!predicate(data[keys[i]], keys[i], data)) return false;
    }
    return true;
  };

  _.some = function(data, predicate) {
    predicate = Iter(predicate, arguments, 2);
    if (_.isArrayLike(data)) {
      for (var i = 0, l = data.length; i < l; i++)
        if (predicate(data[i], i, data)) return true;
    } else {
      for (var keys = _.keys(data), i = 0, l = keys.length; i < l; i++)
        if (predicate(data[keys[i]], keys[i], data)) return true;
    }
    return false;
  };

  _.uniq = function(arr, iteratee) {
    var res = [], tmp = [], cmp = iteratee ? _.map(arr, Iter(iteratee, arguments, 2)) : arr;
    for (var i = 0, l = arr.length; i < l; i++)
      if (tmp.indexOf(cmp[i]) == -1) { tmp.push(cmp[i]); res.push(arr[i]); }
    return res;
  };

  _.all = function(args) {
    var res = [], tmp;
    for (var i = 1, l = arguments.length; i < l; i++) {
      tmp = _.is_mr(args) ? arguments[i].apply(null, args) : arguments[i](args);
      if (_.is_mr(tmp))
        for (var j = 0, l = tmp.length; j < l; j++) res.push(tmp[j]);
      else
        res.push(tmp);
    }
    return _.to_mr(res);
  };

  _.spread = function(args) {
    var fns = _.rest(arguments, 1), res = [], tmp;
    for (var i = 0, fl = fns.length, al = args.length; i < fl && i < al; i++) {
      tmp = _.is_mr(args[i]) ? (fns[i] || _.i).apply(null, args[i]) : (fns[i] || _.i)(args[i]);
      if (_.is_mr(tmp))
        for (var j = 0, l = tmp.length; j < l; j++) res.push(tmp[j]);
      else
        res.push(tmp);
    }
    return _.to_mr(res);
  };

  // async each - reduce
  // function base_loop_fn(body, end_q, end, complete, iter_or_predi, params) {
  //   var context = this;
  //   var args = C.rest(arguments, 6);
  //   var list = args.shift();
  //   var keys = C.isArrayLike(list) ? null : C.keys(list);
  //   iter_or_predi = iter_or_predi || C.lambda(args.pop());
  //   var fast = !args.length && C.isFunction(iter_or_predi);
  //   if (fast && this != C && this != G) iter_or_predi = iter_or_predi.bind(this);
  //   var length = (keys || list).length;
  //   var result = [], tmp = [];
  //   var resolve = I, async = false;
  //   var go = fast ? function(list, keys, i, res, args, iter_or_predi) {
  //     var key = keys ? keys[i] : i;
  //     return iter_or_predi(list[key], key, list);
  //   } : function(list, keys, i, res, args, iter_or_predi, context) {
  //     return A(params(list, keys, i, res, args), iter_or_predi, context);
  //   };
  //   return (function f(i, res) {
  //     do {
  //       if (end_q(res = body(result, list, keys, i, res, tmp, args))) return resolve(end(list, keys, i));
  //       if (i == length) return resolve(complete(result, list, res));
  //       res = go(list, keys, i++, res, args, iter_or_predi, context);
  //     } while (!maybe_promise(res));
  //     res.then(function(res) { f(i, res); });
  //     return async || C(CB(function(cb) { resolve = cb, async = true; }));
  //   })(0);
  // }



  /* if else */
  // function IF(predicate, fn) {
  //   var store = [fn ? [predicate, fn] : [I, predicate]];
  //   return C.extend(IF, {
  //     ELSEIF: function(predicate, fn) { return store.push(fn ? [predicate, fn] : [I, predicate]) && IF; },
  //     ELSE: function(fn) { return store.push([J(true), fn]) && IF; }
  //   });
  //   function IF() {
  //     var context = this, args = arguments;
  //     return C(store, args, [
  //       B.find(function(fnset, i, l, args) { return A(args, fnset[0], context); }),
  //       function(fnset) { return fnset ? A(args, fnset[1], context) : void 0; }
  //     ]);
  //   }
  // } F.IF = window.IF = IF;


  // TDD
  // C.test = function(tests) {
  //   var fails = J([]), all = J([]), fna = J([fails(), all()]);
  //   return C([J('------------Start------------'), C.log, J(tests),
  //     B.map(function(f, k) {
  //       return IF([all, B.m('push', k + ' ----> success')])
  //         .ELSE([fna, B.map([I, B.m('push', k + ' ----> fail')])])(f());
  //     }),
  //     J('------------Fail-------------'), C.log,
  //     fails, B.each([I, C.error]),
  //     J('------------All--------------'), C.log,
  //     all, B.each([I, C.log]),
  //     J('------------End--------------'), C.log]);
  // };

  /*
  * 템플릿 시작
  * */
  var TAB_SIZE;
  var REG1, REG2, REG3, REG4 = {}, REG5, REG6, REG7, REG8;
  function s_matcher(length, key, re, source, var_names, self) {
    return self[key] || (self[key] = map(source.match(re), function(matched) {
        return new Function(var_names, "return " + matched.substring(length, matched.length-length) + ";");
      }));
  }

  var insert_datas1 = _.partial(s_exec, /\{\{\{.*?\}\}\}/g, _.escape, s_matcher.bind(null, 3, "insert_datas1")); // {{{}}}
  var insert_datas2 = _.partial(s_exec, /\{\{.*?\}\}/g, _.i, s_matcher.bind(null, 2, "insert_datas2")); // {{}}

  var TAB;
  _.TAB_SIZE = function(size) {
    TAB_SIZE = size;
    TAB = "( {" + size + "}|\\t)";
    var TABS = TAB + "+";
    REG1 = new RegExp("^" + TABS);
    REG2 = new RegExp("\/\/" + TABS + ".*?(?=((\/\/)?" + TABS + "))|\/\/" + TABS + ".*", "g");
    REG3 = new RegExp(TABS + "\\S.*?(?=" + TABS + "\\S)|" + TABS + "\\S.*", "g");
    REG4 = {}; times2(20, function(i) { REG4[i] = new RegExp(TAB + "{" + i + "}$") });
    REG5 = new RegExp("^(" + TABS + ")(\\[.*?\\]|\\{.*?\\}|\\S)+\\.(?!\\S)");
    REG6 = {}; times2(20, function(i) { REG6[i] = new RegExp("(" + TAB + "{" + i + "})", "g"); });
    REG7 = new RegExp("\\n(" + TABS + "[\\s\\S]*)");
    REG8 = new RegExp("^" + TABS + "\\|");
  };
  _.TAB_SIZE(2);
  function number_of_tab(a) {
    var snt = a.match(REG1)[0];
    var tab_length = (snt.match(/\t/g) || []).length;
    var space_length = snt.replace(/\t/g, "").length;
    return space_length / TAB_SIZE + tab_length;
  }

  //_.template = _.t = function(args) {
  //  return _.is_mr(args) ? s.apply(null, [_.t, '_.t', convert_to_html].concat(_.rest(arguments))).apply(null, args) :
  //    s.apply(null, [_.t, '_.t', convert_to_html].concat(_.rest(arguments)))(args);
  //};
  //_.template$ = _.t$ = function(args) {
  //  return _.is_mr(args) ? s.apply(null, [_.t$, '_.t$', convert_to_html].concat('$').concat(_.rest(arguments))).apply(null, args) :
  //    s.apply(null, [_.t$, '_.t$', convert_to_html].concat('$').concat(_.rest(arguments)))(args);
  //};

  _.template = _.t = function(args) {
    var f = s.apply(null, [_.t, '_.t', convert_to_html].concat(_.rest(arguments)));
    return _.is_mr(args) ? f.apply(null, args) : f(args);
  };
  _.template$ = _.t$ = function(args) {
    var f = s.apply(null, [_.t$, '_.t$', convert_to_html].concat('$').concat(_.rest(arguments)));
    return _.is_mr(args) ? f.apply(null, args) : f(args);
  };

  _.template.each = _.t.each = function() { return s_each.apply(null, [_.t].concat(_.toArray(arguments))); };

  _.Template = _.T = function() { return s.apply(null, [_.T, '_.T', convert_to_html].concat(_.toArray(arguments))); };
  _.Template$ = _.T$ = function() { return s.apply(null, [_.T$, '_.T$', convert_to_html].concat('$').concat(_.toArray(arguments))); };
  _.Template.each = _.T.each = function() { return s_each.apply(null, [_.T].concat(_.toArray(arguments))); };

  _.t.func_storage = {};

  _.string = _.s = function() { return s.apply(null, [_.s, '_.s', _.mr].concat(_.toArray(arguments))); };
  _.string$ = _.s$ = function() { return s.apply(null, [_.s$, '_.s$', _.mr].concat('$').concat(_.toArray(arguments))); };
  _.string.each = _.s.each = function() { return s_each.apply(null, [_.s].concat(_.toArray(arguments))); };

  _.String = _.S = function() { return s.apply(null, [_.S, '_.S', _.mr].concat(_.toArray(arguments))); };
  _.String$ = _.S$ = function() { return s.apply(null, [_.S$, '_.S$', _.mr].concat('$').concat(_.toArray(arguments))); };
  _.String.each = _.S.each = function() { return s_each.apply(null, [_.S].concat(_.toArray(arguments))); };

  _.s.func_storage = {};


  function s(func, obj_name, option, var_names/*, source...*/) {      // used by H and S
    var args = _.toArray(arguments);
    var source = _.map(_.rest(args, 4), function(str_or_func) {
      if (_.isString(str_or_func)) return str_or_func;

      var key = _.uniqueId("func_storage");
      func._ABC_func_storage[key] = str_or_func;
      return obj_name + ".func_storage." + key;
    }).join("");

    var self = {};
    return function() {
      return _.pipe(_.mr(source, var_names, arguments, self), remove_comment, option, insert_datas1, insert_datas2, _.i);
    }
  }
  function s_each(func, var_names/*, source...*/) {     // used by H.each and S.each
    //var map = B.map(func.apply(null, C.rest(arguments)));
    //console.log(map, _.map);
    var map = _.partial(_.map, _, func.apply(null, _.rest(arguments)));
    //var map = _.partial(_.map, _.rest(arguments), func);
    return function(ary /*, args...*/) {
      //return A([ary].concat(C.rest(arguments)), [map, function(res) { return res.join(""); }]);
      //console.log(_.rest(arguments));
      //console.log([ary].concat(_.rest(arguments)));
      //return pipea2([ary].concat(_.rest(arguments)), map, function(res) { return res.join(""); });
      //return pipea2(_.mr(ary.concat(_.rest(arguments))), map, function(res) { return res.join(""); });
      return pipe(ary, map, function(res) { return res.join(""); }); //나머지 인자가 안감
    };
  }
  function remove_comment(source, var_names, args, self) {
    return _.mr(source.replace(/\/\*(.*?)\*\//g, "").replace(REG2, ""), var_names, args, self);
  }
  function s_exec(re, wrap, matcher, source, var_names, args, self) {
    return pipe(_.mr(source.split(re), _.map(matcher(re, source, var_names, self), function(func) {
        return pipe(func.apply(null, args), wrap, return_check);
      })),
      function(s, vs) { return _.mr(map(vs, function(v, i) { return s[i] + v; }).join("") + s[s.length-1], var_names, args, self); }
    );
  }
  function convert_to_html(source, var_names, args, self) {
    if (self.convert_to_html) return _.mr(self.convert_to_html, var_names, args, self);

    var tag_stack = [];
    var ary = source.match(REG3);
    var base_tab = number_of_tab(ary[0]);
    ary[ary.length - 1] = ary[ary.length - 1].replace(REG4[base_tab] || (REG4[base_tab] = new RegExp(TAB + "{" + base_tab + "}$")), "");

    var is_paragraph = 0;
    for (var i = 0; i < ary.length; i++) {
      while (number_of_tab(ary[i]) - base_tab < tag_stack.length) { //이전 태그 닫기
        is_paragraph = 0;
        if (tag_stack.length == 0) break;
        ary[i - 1] += end_tag(tag_stack.pop());
      }
      var tmp = ary[i];
      if (!is_paragraph) {
        ary[i] = line(ary[i], tag_stack);
        if (tmp.match(REG5)) is_paragraph = number_of_tab(RegExp.$1) + 1;
        continue;s
      }
      ary[i] = ary[i].replace(REG6[is_paragraph] || (REG6[is_paragraph] = new RegExp("(" + TAB + "{" + is_paragraph + "})", "g")), "\n");
      if (ary[i] !== (ary[i] = ary[i].replace(REG7, "\n"))) ary = push_in(ary, i + 1, RegExp.$1);
    }

    while (tag_stack.length) ary[ary.length - 1] += end_tag(tag_stack.pop()); // 마지막 태그

    return _.mr(self.convert_to_html = ary.join(""), var_names, args, self);
  }
  function line(source, tag_stack) {
    source = source.replace(REG8, "\n").replace(/^ */, "");
    return source.match(/^[\[.#\w\-]/) ? source.replace(/^(\[.*\]|\{.*?\}|\S)+ ?/, function(str) {
      return start_tag(str, tag_stack);
    }) : source;
  }
  function push_in(ary, index, data) {
    var rest_ary = ary.splice(index);
    ary.push(data);
    return ary.concat(rest_ary);
  }
  function start_tag(str, tag_stack, attrs, name, cls) {
    attrs = '';
    name = str.match(/^\w+/);

    // name
    name = (!name || name == 'd') ? 'div' : name == 'sp' ? 'span' : name;
    if (name != 'input' && name != 'br' ) tag_stack.push(name);

    // attrs
    str = str.replace(/\[(.*)\]/, function(match, inner) { return (attrs += ' ' + inner) && ''; });

    // attrs = class + attrs
    (cls = _.map(str.match(/\.(\{\{\{.*?\}\}\}|\{\{.*?\}\}|[\w\-]+)/g), function(v) { return v.slice(1); }).join(' '))
    && attrs == (attrs = attrs.replace(/class\s*=\s*((\").*?\"|(\{.*?\}|\S)+)/,
      function(match, tmp, q) { return ' class=' + '"' + cls + ' ' + (q ? tmp.slice(1, -1) : tmp) + '"'; }))
    && (attrs = ' class="' + cls + '"' + attrs);

    // attrs = id + attrs
    attrs = [''].concat(_.map(str.match(/#(\{\{\{.*?\}\}\}|\{\{.*?\}\}|[\w\-]+)/g),
        function(v) { return v.slice(1); })).join(' id=') + attrs;

    return '<' + name + attrs + ' >';
  }
  function end_tag(tag) { return '</' + tag + '>'; }
  function return_check(val) { return (val == null || val == void 0) ? '' : val; }

  /*
  * 템플릿 끝
  * */

}(typeof global == 'object' && global.global == global && (global.G = global) || window);