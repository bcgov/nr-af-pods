/*!
* powerpod 0.6.2
* https://github.com/bcgov/nr-af-pods/powerpod
*
* @license GPLv3 for open source use only
*
* Copyright (C) 2024 https://github.com/bcgov/nr-af-pods/powerpod - A project by Mihai Listov
*/

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.powerpod = factory());
})(this, (function () { 'use strict';

  function _iterableToArrayLimit(r, l) {
    var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (null != t) {
      var e,
        n,
        i,
        u,
        a = [],
        f = !0,
        o = !1;
      try {
        if (i = (t = t.call(r)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = !1;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
      } catch (r) {
        o = !0, n = r;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function (r) {
        return Object.getOwnPropertyDescriptor(e, r).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread2(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {
        _defineProperty(e, r, t[r]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
        Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
      });
    }
    return e;
  }
  function _regeneratorRuntime() {
    _regeneratorRuntime = function () {
      return e;
    };
    var t,
      e = {},
      r = Object.prototype,
      n = r.hasOwnProperty,
      o = Object.defineProperty || function (t, e, r) {
        t[e] = r.value;
      },
      i = "function" == typeof Symbol ? Symbol : {},
      a = i.iterator || "@@iterator",
      c = i.asyncIterator || "@@asyncIterator",
      u = i.toStringTag || "@@toStringTag";
    function define(t, e, r) {
      return Object.defineProperty(t, e, {
        value: r,
        enumerable: !0,
        configurable: !0,
        writable: !0
      }), t[e];
    }
    try {
      define({}, "");
    } catch (t) {
      define = function (t, e, r) {
        return t[e] = r;
      };
    }
    function wrap(t, e, r, n) {
      var i = e && e.prototype instanceof Generator ? e : Generator,
        a = Object.create(i.prototype),
        c = new Context(n || []);
      return o(a, "_invoke", {
        value: makeInvokeMethod(t, r, c)
      }), a;
    }
    function tryCatch(t, e, r) {
      try {
        return {
          type: "normal",
          arg: t.call(e, r)
        };
      } catch (t) {
        return {
          type: "throw",
          arg: t
        };
      }
    }
    e.wrap = wrap;
    var h = "suspendedStart",
      l = "suspendedYield",
      f = "executing",
      s = "completed",
      y = {};
    function Generator() {}
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}
    var p = {};
    define(p, a, function () {
      return this;
    });
    var d = Object.getPrototypeOf,
      v = d && d(d(values([])));
    v && v !== r && n.call(v, a) && (p = v);
    var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p);
    function defineIteratorMethods(t) {
      ["next", "throw", "return"].forEach(function (e) {
        define(t, e, function (t) {
          return this._invoke(e, t);
        });
      });
    }
    function AsyncIterator(t, e) {
      function invoke(r, o, i, a) {
        var c = tryCatch(t[r], t, o);
        if ("throw" !== c.type) {
          var u = c.arg,
            h = u.value;
          return h && "object" == typeof h && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) {
            invoke("next", t, i, a);
          }, function (t) {
            invoke("throw", t, i, a);
          }) : e.resolve(h).then(function (t) {
            u.value = t, i(u);
          }, function (t) {
            return invoke("throw", t, i, a);
          });
        }
        a(c.arg);
      }
      var r;
      o(this, "_invoke", {
        value: function (t, n) {
          function callInvokeWithMethodAndArg() {
            return new e(function (e, r) {
              invoke(t, n, e, r);
            });
          }
          return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
        }
      });
    }
    function makeInvokeMethod(e, r, n) {
      var o = h;
      return function (i, a) {
        if (o === f) throw new Error("Generator is already running");
        if (o === s) {
          if ("throw" === i) throw a;
          return {
            value: t,
            done: !0
          };
        }
        for (n.method = i, n.arg = a;;) {
          var c = n.delegate;
          if (c) {
            var u = maybeInvokeDelegate(c, n);
            if (u) {
              if (u === y) continue;
              return u;
            }
          }
          if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) {
            if (o === h) throw o = s, n.arg;
            n.dispatchException(n.arg);
          } else "return" === n.method && n.abrupt("return", n.arg);
          o = f;
          var p = tryCatch(e, r, n);
          if ("normal" === p.type) {
            if (o = n.done ? s : l, p.arg === y) continue;
            return {
              value: p.arg,
              done: n.done
            };
          }
          "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg);
        }
      };
    }
    function maybeInvokeDelegate(e, r) {
      var n = r.method,
        o = e.iterator[n];
      if (o === t) return r.delegate = null, "throw" === n && e.iterator.return && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y;
      var i = tryCatch(o, e.iterator, r.arg);
      if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y;
      var a = i.arg;
      return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y);
    }
    function pushTryEntry(t) {
      var e = {
        tryLoc: t[0]
      };
      1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e);
    }
    function resetTryEntry(t) {
      var e = t.completion || {};
      e.type = "normal", delete e.arg, t.completion = e;
    }
    function Context(t) {
      this.tryEntries = [{
        tryLoc: "root"
      }], t.forEach(pushTryEntry, this), this.reset(!0);
    }
    function values(e) {
      if (e || "" === e) {
        var r = e[a];
        if (r) return r.call(e);
        if ("function" == typeof e.next) return e;
        if (!isNaN(e.length)) {
          var o = -1,
            i = function next() {
              for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next;
              return next.value = t, next.done = !0, next;
            };
          return i.next = i;
        }
      }
      throw new TypeError(typeof e + " is not iterable");
    }
    return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", {
      value: GeneratorFunctionPrototype,
      configurable: !0
    }), o(GeneratorFunctionPrototype, "constructor", {
      value: GeneratorFunction,
      configurable: !0
    }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) {
      var e = "function" == typeof t && t.constructor;
      return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name));
    }, e.mark = function (t) {
      return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t;
    }, e.awrap = function (t) {
      return {
        __await: t
      };
    }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () {
      return this;
    }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) {
      void 0 === i && (i = Promise);
      var a = new AsyncIterator(wrap(t, r, n, o), i);
      return e.isGeneratorFunction(r) ? a : a.next().then(function (t) {
        return t.done ? t.value : a.next();
      });
    }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () {
      return this;
    }), define(g, "toString", function () {
      return "[object Generator]";
    }), e.keys = function (t) {
      var e = Object(t),
        r = [];
      for (var n in e) r.push(n);
      return r.reverse(), function next() {
        for (; r.length;) {
          var t = r.pop();
          if (t in e) return next.value = t, next.done = !1, next;
        }
        return next.done = !0, next;
      };
    }, e.values = values, Context.prototype = {
      constructor: Context,
      reset: function (e) {
        if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t);
      },
      stop: function () {
        this.done = !0;
        var t = this.tryEntries[0].completion;
        if ("throw" === t.type) throw t.arg;
        return this.rval;
      },
      dispatchException: function (e) {
        if (this.done) throw e;
        var r = this;
        function handle(n, o) {
          return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o;
        }
        for (var o = this.tryEntries.length - 1; o >= 0; --o) {
          var i = this.tryEntries[o],
            a = i.completion;
          if ("root" === i.tryLoc) return handle("end");
          if (i.tryLoc <= this.prev) {
            var c = n.call(i, "catchLoc"),
              u = n.call(i, "finallyLoc");
            if (c && u) {
              if (this.prev < i.catchLoc) return handle(i.catchLoc, !0);
              if (this.prev < i.finallyLoc) return handle(i.finallyLoc);
            } else if (c) {
              if (this.prev < i.catchLoc) return handle(i.catchLoc, !0);
            } else {
              if (!u) throw new Error("try statement without catch or finally");
              if (this.prev < i.finallyLoc) return handle(i.finallyLoc);
            }
          }
        }
      },
      abrupt: function (t, e) {
        for (var r = this.tryEntries.length - 1; r >= 0; --r) {
          var o = this.tryEntries[r];
          if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) {
            var i = o;
            break;
          }
        }
        i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null);
        var a = i ? i.completion : {};
        return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a);
      },
      complete: function (t, e) {
        if ("throw" === t.type) throw t.arg;
        return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y;
      },
      finish: function (t) {
        for (var e = this.tryEntries.length - 1; e >= 0; --e) {
          var r = this.tryEntries[e];
          if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y;
        }
      },
      catch: function (t) {
        for (var e = this.tryEntries.length - 1; e >= 0; --e) {
          var r = this.tryEntries[e];
          if (r.tryLoc === t) {
            var n = r.completion;
            if ("throw" === n.type) {
              var o = n.arg;
              resetTryEntry(r);
            }
            return o;
          }
        }
        throw new Error("illegal catch attempt");
      },
      delegateYield: function (e, r, n) {
        return this.delegate = {
          iterator: values(e),
          resultName: r,
          nextLoc: n
        }, "next" === this.method && (this.arg = t), y;
      }
    }, e;
  }
  function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : String(i);
  }
  function _typeof(o) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
  }
  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }
    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }
  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
        args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);
        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }
        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }
        _next(undefined);
      });
    };
  }
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _extends() {
    _extends = Object.assign ? Object.assign.bind() : function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    return _extends.apply(this, arguments);
  }
  function _objectDestructuringEmpty(obj) {
    if (obj == null) throw new TypeError("Cannot destructure " + obj);
  }
  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;
    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }
    return target;
  }
  function _objectWithoutProperties(source, excluded) {
    if (source == null) return {};
    var target = _objectWithoutPropertiesLoose(source, excluded);
    var key, i;
    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
      for (i = 0; i < sourceSymbolKeys.length; i++) {
        key = sourceSymbolKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
        target[key] = source[key];
      }
    }
    return target;
  }
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }
  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var win = window;
  var doc = document;
  var Environment = {
    DEV: 'dev',
    TEST: 'test',
    PROD: 'prod'
  };
  var Hosts = _defineProperty(_defineProperty(_defineProperty({}, Environment.DEV, 'af-pods-dev.powerappsportals.com'), Environment.TEST, 'af-pods-test.powerappsportals.com'), Environment.PROD, 'af-pods.powerappsportals.com');
  var ClaimPaths = ['/claim/', '/claim-dev/'];
  var ApplicationPaths = ['/application/', '/application-dev/'];
  var Form = {
    Application: 'Application',
    Claim: 'Claim'
  };
  var HtmlElementType = {
    Input: 'Input',
    FileInput: 'FileInput',
    SingleOptionSet: 'SingleOptionSet',
    MultiOptionSet: 'MultiOptionSet',
    DropdownSelect: 'DropdownSelect',
    DatePicker: 'DatePicker'
  };
  var FormStep = {
    // Shared Steps:
    Documents: 'DocumentsStep',
    DeclarationAndConsent: 'DeclarationAndConsentStep',
    // Application Steps:
    ApplicantInfo: 'ApplicantInfoStep',
    Eligibility: 'EligibilityStep',
    Project: 'ProjectStep',
    DeliverablesBudget: 'DeliverablesBudgetStep',
    DemographicInfo: 'DemographicInfoStep',
    // Claim Steps:
    ClaimInfo: 'ClaimInfoStep',
    ProjectIndicators: 'ProjectIndicatorsStep',
    Consent: 'ConsentStep',
    // Unknown
    Unknown: 'UnknownStep'
  };
  var TabNames = _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty({}, FormStep.Documents, 'Documents'), FormStep.DeclarationAndConsent, 'Application Declaration and Consent'), FormStep.ApplicantInfo, 'Applicant Information'), FormStep.Eligibility, 'Eligibility'), FormStep.Project, 'Project'), FormStep.DeliverablesBudget, 'Deliverables & Budget'), FormStep.DemographicInfo, 'Demographic Information'), FormStep.ClaimInfo, 'Claim Information'), FormStep.ProjectIndicators, 'Project Results');
  var YES_VALUE = '255550000';
  var NO_VALUE = '255550001';
  var OTHER_VALUE = '255550010';
  var GROUP_APPLICATION_VALUE = '255550001';
  var SECTOR_WIDE_ID_VALUE = '6ce2584f-4740-ee11-be6e-000d3af3ac95';

  // TODO: move this to some kind of state management module
  // cache common elements
  var POWERPOD = {
    test: {},
    shared: {}
  };

  // here goes validation logic specific to application
  function validateIsConsultantEitherBciaOrCpa() {
    var bciaElement = document.querySelector('#quartech_bciaregisteredconsultant');
    var cpaElement = document.querySelector('#quartech_cpaconsultant');
    var projectCategoryElement = document.querySelector('#quartech_completingcategory');
    if (!bciaElement || !projectCategoryElement || !cpaElement) return '';

    // if "Self-developed Business Plan ($1,250 in funding)" selected or empty, exit early
    if (
    // @ts-ignore
    projectCategoryElement.value === '255550000' ||
    // @ts-ignore
    projectCategoryElement.value === '') return '';
    if (
    // @ts-ignore
    bciaElement.value === '255550002' &&
    // @ts-ignore
    cpaElement.value === '255550002') {
      return '<div><span>You must select YES to either "Is the consultant registered with the BC Institute of Agrologists (BCIA)?" OR "If the consultant is NOT registered with the BC Institute of Agrologists (BCIA), is the consultant a Chartered Professional Accountant (CPA)?"</span><span style="color:red;"> The consultant must be registered with BCIA or CPA.</span></div>';
    }
    return '';
  }
  function validateDemographicInfoRequiredFields() {
    var validationErrorHtml = validateStepFields('DemographicInfoStep', true);
    var demographicPercentageValidationError = validateDemographicPercentages();
    validationErrorHtml = validationErrorHtml.concat(demographicPercentageValidationError);
    displayValidationErrors(validationErrorHtml);
  }
  function validateDemographicPercentages() {
    var indigenousTotal = 0;
    var womenTotal = 0;
    var youthTotal = 0;

    // Percentage of shares owned by Indigenous, First Nations (including status and non-status)
    var firstNationsElement = document.querySelector('#quartech_firstnationssharepercentage');
    var firstNationsElementValue = $(firstNationsElement).val();
    // @ts-ignore
    var firstNationsPercentage = parseFloat(firstNationsElementValue);
    indigenousTotal += !!firstNationsPercentage && firstNationsPercentage;

    // Inuk (Inuit) share percentage
    var inuitElement = document.querySelector('#quartech_inukinuitsharepercentage');
    var inuitElementValue = $(inuitElement).val();
    // @ts-ignore
    var inuitPercentage = parseFloat(inuitElementValue);
    indigenousTotal += !!inuitPercentage && inuitPercentage;

    // Métis share percentage
    var metisElement = document.querySelector('#quartech_mtissharepercentage');
    var metisElementValue = $(metisElement).val();
    // @ts-ignore
    var metisPercentage = parseFloat(metisElementValue);
    indigenousTotal += !!metisPercentage && metisPercentage;

    // Indigenous - Not specified share percentage
    var notSpecifiedElement = document.querySelector('#quartech_indigenoussharepercentage');
    var notSpecifiedElementValue = $(notSpecifiedElement).val();
    // @ts-ignore
    var notSpecifiedPercentage = parseFloat(notSpecifiedElementValue);
    indigenousTotal += !!notSpecifiedPercentage && notSpecifiedPercentage;

    // Women share percentage
    var womenElement = document.querySelector('#quartech_womensharepercentage');
    var womenElementValue = $(womenElement).val();
    // @ts-ignore
    var womenPercentage = parseFloat(womenElementValue);
    womenTotal += !!womenPercentage && womenPercentage;

    // Youth share percentage
    var youthElement = document.querySelector('#quartech_youth40orundersharepercentage');
    var youthElementValue = $(youthElement).val();
    // @ts-ignore
    var youthPercentage = parseFloat(youthElementValue);
    youthTotal += !!youthPercentage && youthPercentage;

    // Non-Indigenous, non-women, non-youth share percentage
    var nonElement = document.querySelector('#quartech_nonindiginousnonwomennonyouthshare');
    var nonElementValue = $(nonElement).val();
    // @ts-ignore
    var nonPercentage = parseFloat(nonElementValue);
    indigenousTotal += !!nonPercentage && nonPercentage;
    womenTotal += !!nonPercentage && nonPercentage;
    youthTotal += !!nonPercentage && nonPercentage;

    // Unable to answer/identify share percentage
    var unableToAnswerElement = document.querySelector('#quartech_unabletoansweridentifysharepercentage');
    var unableToAnswerElementValue = $(unableToAnswerElement).val();
    // @ts-ignore
    var unableToAnswerPercentage = parseFloat(unableToAnswerElementValue);
    indigenousTotal += !!unableToAnswerPercentage && unableToAnswerPercentage;
    womenTotal += !!unableToAnswerPercentage && unableToAnswerPercentage;
    youthTotal += !!unableToAnswerPercentage && unableToAnswerPercentage;
    var validationErrorHtml = '';
    var genericErrorMsg = 'Please check your answers. The total of shares held by';
    var errorMessage = 'should NOT add up to more than 100%';
    if (indigenousTotal > 100) {
      validationErrorHtml += "<div><span>".concat(genericErrorMsg, " Indigenous owners + Not-Indigenous/Not-Women/Not-Youth + Unable to answer<span style=\"color:red;\"> ").concat(errorMessage, "</span></div>");
    }
    if (womenTotal > 100) {
      validationErrorHtml += "<div><span>".concat(genericErrorMsg, " Women owners + Not-Indigenous/Not-Women/Not-Youth + Unable to answer<span style=\"color:red;\"> ").concat(errorMessage, "</span></div>");
    }
    if (youthTotal > 100) {
      validationErrorHtml += "<div><span>".concat(genericErrorMsg, " Youth owners + Not-Indigenous/Not-Women/Not-Youth owners + Unable to answer<span style=\"color:red;\"> ").concat(errorMessage, "</span></div>");
    }
    return validationErrorHtml;
  }

  var LogType = {
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error'
  };
  _defineProperty(_defineProperty(_defineProperty({}, LogType.INFO, 10), LogType.WARN, 20), LogType.ERROR, 90);
  function log(_ref) {
    var namespace = _ref.namespace,
      fn = _ref.fn,
      level = _ref.level,
      message = _ref.message,
      data = _ref.data;
    var _getOptions = getOptions(),
      enableLogging = _getOptions.logging;
    if (!win.console || !win.console[level]) win.console.error('[POWERPOD]: issue using logger');
    var logFn = win.console[level]; // default log

    var prefix = '';
    prefix += namespace ? " (".concat(namespace, ")") : '';
    prefix += fn && typeof fn === 'function' && fn.name ? " ".concat(fn.name) : '';
    if (enableLogging) {
      logFn('[POWERPOD]' + prefix + ': ' + message);
      if (data && _typeof(data) === 'object') logFn(data);
    }
  }
  function Logger() {
    var namespace = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    return {
      info: function info(_ref2) {
        var _ref2$fn = _ref2.fn,
          fn = _ref2$fn === void 0 ? null : _ref2$fn,
          message = _ref2.message,
          _ref2$data = _ref2.data,
          data = _ref2$data === void 0 ? null : _ref2$data;
        return log({
          namespace: namespace,
          fn: fn,
          level: LogType.INFO,
          message: message,
          data: data
        });
      },
      error: function error(_ref3) {
        var _ref3$fn = _ref3.fn,
          fn = _ref3$fn === void 0 ? null : _ref3$fn,
          message = _ref3.message,
          _ref3$data = _ref3.data,
          data = _ref3$data === void 0 ? null : _ref3$data;
        return log({
          namespace: namespace,
          fn: fn,
          level: LogType.ERROR,
          message: message,
          data: data
        });
      },
      warn: function warn(_ref4) {
        var _ref4$fn = _ref4.fn,
          fn = _ref4$fn === void 0 ? null : _ref4$fn,
          message = _ref4.message,
          _ref4$data = _ref4.data,
          data = _ref4$data === void 0 ? null : _ref4$data;
        return log({
          namespace: namespace,
          fn: fn,
          level: LogType.WARN,
          message: message,
          data: data
        });
      }
    };
  }

  var logger$i = Logger('common/config');
  POWERPOD.config = {
    getGlobalConfigData: getGlobalConfigData,
    getClaimConfigData: getClaimConfigData,
    getApplicationConfigData: getApplicationConfigData
  };
  function getGlobalConfigData() {
    var _JSON$parse;
    var programData = localStorage.getItem('programData');
    var configDataJSON = (_JSON$parse = JSON.parse(programData)) === null || _JSON$parse === void 0 || (_JSON$parse = _JSON$parse.quartech_ApplicantPortalConfig) === null || _JSON$parse === void 0 ? void 0 : _JSON$parse.quartech_configdata;
    var podsConfigData = JSON.parse(configDataJSON);
    logger$i.info({
      fn: getApplicationConfigData,
      message: 'successfully fetched global config data from storage',
      data: podsConfigData
    });
    return podsConfigData;
  }
  function getClaimConfigData() {
    var _JSON$parse2;
    var programData = localStorage.getItem('programData');
    var configDataJSON = (_JSON$parse2 = JSON.parse(programData)) === null || _JSON$parse2 === void 0 ? void 0 : _JSON$parse2.quartech_applicantportalclaimformjson;
    var podsConfigData = JSON.parse(configDataJSON);
    logger$i.info({
      fn: getApplicationConfigData,
      message: 'successfully fetched claim config data from storage',
      data: podsConfigData
    });
    return podsConfigData;
  }
  function getApplicationConfigData(programId) {
    var _JSON$parse3;
    var programData = localStorage.getItem('programData');
    var configDataJSON = (_JSON$parse3 = JSON.parse(programData)) === null || _JSON$parse3 === void 0 ? void 0 : _JSON$parse3.quartech_applicantportalapplicationformconfigjson;
    var podsConfigData = JSON.parse(configDataJSON);
    logger$i.info({
      fn: getApplicationConfigData,
      message: 'successfully fetched application config data from storage',
      data: podsConfigData
    });
    return podsConfigData;
  }

  const logger$h = new Logger('common/program');
  POWERPOD.program = {
      getProgramId,
      getProgramAbbreviation,
      getCurrentStep,
  };
  /**
   * Gets the ID of the currently active program.
   * @function
   */
  function getProgramId() {
      var programId = $('#quartech_program').val(), params = new URLSearchParams(doc.location.search), programIdParam = params.get('programid');
      if (!programIdParam) {
          return programId;
      }
      if (programId && programIdParam && programId != programIdParam) {
          // @ts-ignore
          let newUrl = doc.location.href.replace(programIdParam, programId);
          location.replace(newUrl);
          return programId;
      }
      else {
          return programIdParam;
      }
  }
  function getProgramAbbreviation() {
      var _a;
      const programData = localStorage.getItem('programData');
      const programAbbreviation = (_a = JSON.parse(programData)) === null || _a === void 0 ? void 0 : _a.quartech_programabbreviation;
      return programAbbreviation;
  }
  function getCurrentStep() {
      var _a;
      let activeStep = FormStep.Unknown;
      const activeTabName = htmlDecode($('div > ol > li.list-group-item.active').html());
      if (!activeTabName || activeTabName.length === 0) {
          logger$h.error({
              fn: getCurrentStep,
              message: 'Failed to get activeTabName',
              data: { activeTabName },
          });
          return activeStep;
      }
      activeStep =
          (_a = Object.keys(TabNames).find((formStep) => TabNames[formStep] === activeTabName)) !== null && _a !== void 0 ? _a : activeStep;
      logger$h.info({
          fn: getCurrentStep,
          message: `Validating current step ${activeStep}`,
          data: {
              activeTabName,
              TabNames,
          },
      });
      // Check to ensure that the step valid before returning
      if (activeStep &&
          activeStep !== FormStep.Unknown &&
          Object.values(FormStep).includes(activeStep)) {
          logger$h.info({
              fn: getCurrentStep,
              message: `Successfully found current step ${activeStep}`,
          });
          return activeStep;
      }
      if (!activeStep || activeStep === FormStep.Unknown) {
          logger$h.error({
              fn: getCurrentStep,
              message: 'Unable to determine current step',
              data: { activeStep, activeTabName, TabNames, FormStep },
          });
      }
      return FormStep.Unknown;
  }
  function getProgramEmailAddress() {
      var _a;
      const programData = localStorage.getItem('programData');
      const programEmailAddress = (_a = JSON.parse(programData)) === null || _a === void 0 ? void 0 : _a.quartech_programemailaddress;
      return programEmailAddress;
  }

  POWERPOD.fields = {
    getFieldsBySection: getFieldsBySection,
    getFieldsBySectionOld: getFieldsBySectionOld,
    getFieldsBySectionNew: getFieldsBySectionNew
  };
  var logger$g = Logger('common/fields');

  // To be used with new global & application level configs
  function getFieldsBySectionNew(sectionName) {
    var _applicationSection$f, _applicationSection$f2, _globalSection$fields, _globalSection$fields2;
    var forceRefresh = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var programName = getProgramAbbreviation();

    // load cached results unless forceRefresh flag is passed
    if (!forceRefresh) {
      var savedData = localStorage.getItem("fieldsData-".concat(programName, "-").concat(sectionName));
      if (savedData) {
        return JSON.parse(savedData);
      }
    }
    var globalConfigData = getGlobalFieldsConfig();
    logger$g.info({
      fn: getFieldsBySectionNew,
      message: 'globalConfigData:',
      data: globalConfigData
    });
    var applicationConfigData = getApplicationConfigData();
    logger$g.info({
      fn: getFieldsBySectionNew,
      message: 'applicationConfigData:',
      data: applicationConfigData
    });
    var globalSections = globalConfigData === null || globalConfigData === void 0 ? void 0 : globalConfigData.sections;
    var applicationSections = applicationConfigData === null || applicationConfigData === void 0 ? void 0 : applicationConfigData.sections;
    var applicationSection = applicationSections === null || applicationSections === void 0 ? void 0 : applicationSections.find(function (s) {
      return s.name === sectionName;
    });
    var globalSection = globalSections.find(function (s) {
      return s.name === sectionName;
    });
    var fields = [];
    if (!applicationSection && !globalSection) {
      logger$g.error({
        fn: getFieldsBySectionNew,
        message: "no configuration section found by sectionName: ".concat(sectionName),
        data: {
          sectionName: sectionName,
          forceRefresh: forceRefresh,
          globalSections: globalSections,
          applicationSections: applicationSections
        }
      });
      return;
    }
    if (!applicationSection || !((_applicationSection$f = applicationSection.fields) !== null && _applicationSection$f !== void 0 && _applicationSection$f.length)) {
      logger$g.warn({
        fn: getFieldsBySectionNew,
        message: "no applicationSection section found by sectionName: ".concat(sectionName),
        data: {
          sectionName: sectionName,
          forceRefresh: forceRefresh,
          globalSections: globalSections,
          applicationSections: applicationSections
        }
      });
    } else if ((_applicationSection$f2 = applicationSection.fields) !== null && _applicationSection$f2 !== void 0 && _applicationSection$f2.length) {
      var _fields;
      (_fields = fields).push.apply(_fields, _toConsumableArray(applicationSection.fields));
    }
    if (!globalSection || !((_globalSection$fields = globalSection.fields) !== null && _globalSection$fields !== void 0 && _globalSection$fields.length)) {
      logger$g.warn({
        fn: getFieldsBySectionNew,
        message: "no globalSection section found by sectionName: ".concat(sectionName),
        data: {
          sectionName: sectionName,
          forceRefresh: forceRefresh,
          globalSections: globalSections,
          applicationSections: applicationSections
        }
      });
    } else if ((_globalSection$fields2 = globalSection.fields) !== null && _globalSection$fields2 !== void 0 && _globalSection$fields2.length) {
      // if so, merge them, with application-level config taking precedence
      var globalFields = globalSection.fields;
      fields = mergeFieldArrays(globalFields, fields, 'name');
    }
    fields.forEach(function (s) {
      logger$g.info({
        fn: getFieldsBySectionNew,
        message: "showing field name: ".concat(s.name)
      });
      showFieldRow(s.name);
    });
    localStorage.setItem("fieldsData-".concat(programName, "-").concat(sectionName), JSON.stringify(fields));
    logger$g.info({
      fn: getFieldsBySectionNew,
      message: 'fieldsData:',
      data: fields
    });
    return fields;
  }
  function getGlobalFieldsConfig() {
    var _getGlobalConfigData;
    // @ts-ignore
    logger$g.info({
      data: getGlobalConfigData()
    });
    return (_getGlobalConfigData = getGlobalConfigData()) === null || _getGlobalConfigData === void 0 || (_getGlobalConfigData = _getGlobalConfigData.FieldsConfig) === null || _getGlobalConfigData === void 0 || (_getGlobalConfigData = _getGlobalConfigData.programs) === null || _getGlobalConfigData === void 0 ? void 0 : _getGlobalConfigData.find(function (program) {
      return program.name === 'ALL';
    });
  }

  // TODO: Remove this old func
  // Still used in application.js
  function getFieldsBySectionOld(sectionName) {
    var _getGlobalConfigData2;
    var forceRefresh = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var programName = getProgramAbbreviation();
    var generateFilterCondition = function generateFilterCondition(program) {
      return program.name === 'ALL' || program.name === programName;
    };

    // if this is for KTTP program, add additional check for KTTP JSON config
    if (programName.includes('KTTP')) {
      generateFilterCondition = function generateFilterCondition(program) {
        return program.name === 'ALL' || program.name === 'KTTP' || program.name === programName;
      };
    }
    if (!forceRefresh) {
      var savedData = localStorage.getItem("fieldsData-".concat(programName, "-").concat(sectionName));
      if (savedData) {
        return JSON.parse(savedData);
      }
    }
    var fieldsConfigData = (_getGlobalConfigData2 = getGlobalConfigData()) === null || _getGlobalConfigData2 === void 0 ? void 0 : _getGlobalConfigData2.FieldsConfig;
    logger$g.info({
      fn: getFieldsBySectionOld,
      message: 'fieldsConfigData:',
      data: fieldsConfigData
    });
    if (!fieldsConfigData || !fieldsConfigData.programs) return;
    var fields = [];
    fieldsConfigData === null || fieldsConfigData === void 0 || fieldsConfigData.programs.filter(function (program) {
      return generateFilterCondition(program);
    }).forEach(function (program) {
      var _program$sections;
      if (!program.sections) return;
      var programSection = program === null || program === void 0 || (_program$sections = program.sections) === null || _program$sections === void 0 ? void 0 : _program$sections.find(function (section) {
        return (section === null || section === void 0 ? void 0 : section.name) === sectionName;
      });
      if (!programSection || !programSection.fields) return;
      var sectionFields = programSection.fields;
      sectionFields.forEach(function (field) {
        if (fields && fields.length) {
          var existingFieldIndex = fields.findIndex(function (f) {
            return f.name === field.name;
          });
          if (existingFieldIndex > -1) {
            fields.splice(existingFieldIndex, 1);
          }
        }
        fields.push(field);
      });
    });
    localStorage.setItem("fieldsData-".concat(programName, "-").concat(sectionName), JSON.stringify(fields));
    logger$g.info({
      fn: getFieldsBySectionOld,
      message: 'fieldsData:',
      data: fields
    });
    return fields;
  }
  function getFieldsBySection(sectionName) {
    var _getClaimConfigData;
    var forceRefresh = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var programName = getProgramAbbreviation();

    // load cached results unless forceRefresh flag is passed
    if (!forceRefresh) {
      var savedData = localStorage.getItem("fieldsData-".concat(programName, "-").concat(sectionName));
      if (savedData) {
        return JSON.parse(savedData);
      }
    }
    var fieldsConfigData = (_getClaimConfigData = getClaimConfigData()) === null || _getClaimConfigData === void 0 ? void 0 : _getClaimConfigData.FieldsConfig;
    logger$g.info({
      fn: getFieldsBySection,
      message: 'fieldsConfigData:',
      data: fieldsConfigData
    });
    if (!fieldsConfigData || !fieldsConfigData.programs) return;
    var fields = [];
    fieldsConfigData === null || fieldsConfigData === void 0 || fieldsConfigData.programs.filter(function (program) {
      return program.name === programName;
    }).forEach(function (program) {
      var _program$sections2;
      if (!program.sections) return;
      var programSection = program === null || program === void 0 || (_program$sections2 = program.sections) === null || _program$sections2 === void 0 ? void 0 : _program$sections2.find(function (section) {
        return (section === null || section === void 0 ? void 0 : section.name) === sectionName;
      });
      if (!programSection || !programSection.fieldsets) return;
      var sectionFieldsets = programSection.fieldsets;
      sectionFieldsets.forEach(function (fieldset) {
        if (!fieldset.name || !fieldset.fields) return;
        var fieldsetName = fieldset.name;
        var fieldsetFields = fieldset.fields;

        // if config exists for a fieldset, unhide it
        showFieldsetElement(fieldsetName);
        fieldsetFields.forEach(function (field) {
          // if config exists for a field, unhide it
          showFieldRow(field.name);
          fields.push(field);
        });
      });
    });

    // cache results to avoid future processing for config
    localStorage.setItem("fieldsData-".concat(programName, "-").concat(sectionName), JSON.stringify(fields));
    logger$g.info({
      fn: getFieldsBySection,
      message: 'fieldsData:',
      data: fields
    });
    return fields;
  }

  var logger$f = Logger('common/validation');
  function validateRequiredFields() {
    var currentStep = getCurrentStep();
    if (currentStep === FormStep.DemographicInfo) {
      validateDemographicInfoRequiredFields();
      return;
    }
    validateStepFields(currentStep);
  }
  function validateStepFields(stepName, returnString) {
    if (!stepName) {
      stepName = getCurrentStep();
    }
    var validationErrorHtml = '';

    // TODO: Remove this old func usage
    var fields;
    if (getOptions().form === Form.Application) {
      // fields = getFieldsBySectionOld(stepName);
      fields = getFieldsBySectionNew(stepName);
    } else {
      fields = getFieldsBySection(stepName);
    }
    if (!fields) return '';
    var _loop = function _loop() {
      var _fields$i = fields[i],
        name = _fields$i.name,
        required = _fields$i.required,
        elementType = _fields$i.elementType,
        validation = _fields$i.validation;
      if (required) {
        var errorMsg = '';
        if (elementType) {
          errorMsg = validateRequiredField(name, elementType);
        } else {
          errorMsg = validateRequiredField(name);
        }
        validationErrorHtml = validationErrorHtml.concat(errorMsg);
      }
      if ((validation === null || validation === void 0 ? void 0 : validation.type) === 'numeric') {
        var value = validation.value,
          comparison = validation.comparison;
        var _errorMsg = validateNumericFieldValue(name, value, comparison);
        validationErrorHtml = validationErrorHtml.concat(_errorMsg);
      }
      if ((validation === null || validation === void 0 ? void 0 : validation.type) === 'length') {
        var _value = validation.value,
          _comparison = validation.comparison,
          forceRequired = validation.forceRequired,
          postfix = validation.postfix,
          overrideDisplayValue = validation.overrideDisplayValue;
        var _errorMsg2 = validateFieldLength(name, _value, _comparison, forceRequired, postfix, overrideDisplayValue);
        // Display instant feedback on field input
        if (_errorMsg2 && _errorMsg2.length > 0) {
          $("#".concat(name, "_error_message")).html(_errorMsg2);
          $("#".concat(name)).on('focusout', function () {
            $("#".concat(name, "_error_message")).css({
              display: ''
            });
            $("#".concat(name)).css({
              border: '1px solid #e5636c'
            });
          });
          var fieldLabelText = $("#".concat(name, "_label")).text();
          var errorMsgPrefix = "<span>\"".concat(fieldLabelText, "\"</span>");
          validationErrorHtml = validationErrorHtml.concat("<div>".concat(errorMsgPrefix).concat(_errorMsg2, "</div>"));
        } else {
          $("#".concat(name)).off('focusout');
          $("#".concat(name, "_error_message")).css({
            display: 'none'
          });
          $("#".concat(name)).css({
            border: ''
          });
        }
      }
    };
    for (var i = 0; i < fields.length; i++) {
      _loop();
    }

    // check which fields we are dynamically requiring validation
    Object.keys(localStorage).filter(function (x) {
      return x.startsWith('shouldRequire_');
    }).forEach(function (x) {
      var fieldId = x.replace('shouldRequire_', '');
      var fieldDefinition = fields.find(function (field) {
        return field.name === fieldId;
      });

      // if the field has already been required via JSON, no need to generate another error msg
      if (fieldDefinition && fieldDefinition.required) return;
      var errorMsg = '';
      if (fieldDefinition && fieldDefinition.elementType) {
        errorMsg = validateRequiredField(fieldId, fieldDefinition.elementType);
      } else {
        errorMsg = validateRequiredField(fieldId);
      }
      validationErrorHtml = validationErrorHtml.concat(errorMsg);
    });
    if (returnString) {
      return validationErrorHtml;
    }
    if (stepName === 'ProjectStep') {
      var programAbbreviation = getProgramAbbreviation();
      if (programAbbreviation && programAbbreviation === 'NEFBA') {
        var consultantBciaOrCpaErrorMsg = validateIsConsultantEitherBciaOrCpa();
        validationErrorHtml = validationErrorHtml.concat(consultantBciaOrCpaErrorMsg);
      }
    }
    displayValidationErrors(validationErrorHtml);
  }
  function validateRequiredField(fieldName) {
    var _$, _$2;
    var elemType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : HtmlElementType.Input;
    var errorMessage = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'IS REQUIRED';
    var isVisible = $("#".concat(fieldName, "_label")).is(':visible');
    var skipValidationAsNotVisible = !isVisible;
    if (skipValidationAsNotVisible) return '';
    var validationErrorHtml = '';
    var isEmptyField = true;
    switch (elemType) {
      case HtmlElementType.FileInput:
        isEmptyField =
        // @ts-ignore
        ((_$ = $("#".concat(fieldName, "_AttachFile"))) === null || _$ === void 0 ? void 0 : _$.val().length) === 0 &&
        // @ts-ignore
        ((_$2 = $("#".concat(fieldName))) === null || _$2 === void 0 ? void 0 : _$2.val().length) === 0;
        break;
      case HtmlElementType.MultiOptionSet:
        isEmptyField = $("li[id*='".concat(fieldName, "-selected-item-']")).length == 0;
        break;
      case HtmlElementType.DropdownSelect:
        isEmptyField =
        // @ts-ignore
        document.querySelector("#".concat(fieldName)).value.length == 0;
        break;
      case HtmlElementType.SingleOptionSet:
      case HtmlElementType.DatePicker:
      default:
        // HtmlElementTypeEnum.Input
        isEmptyField = $("#".concat(fieldName)).val() == '';
        break;
    }
    if (isEmptyField) {
      var fieldLabelText = $("#".concat(fieldName, "_label")).text();
      validationErrorHtml = "<div><span>\"".concat(fieldLabelText, "\"</span><span style=\"color:red;\"> ").concat(errorMessage, "</span></div>");
      // $(`#${fieldName}`).on("focusout", function () {
      //   $(`#${fieldName}_error_message`).css({ display: "" });
      //   $(`#${fieldName}`).css({ border: "1px solid #e5636c" });
      // });
      // Display the field's validation error div here?
    }
    // else {
    //   $(`#${fieldName}`).off("focusout");
    //   $(`#${fieldName}_error_message`).css({ display: "none" });
    //   $(`#${fieldName}`).css({ border: "" });
    // }

    return validationErrorHtml;
  }
  function validateNumericFieldValue(fieldName, comparisonValue, operator, forceRequired) {
    var element = document.querySelector("#".concat(fieldName));
    if (!element) return;

    // @ts-ignore
    if (element.value === '' && !forceRequired) {
      return '';
    }
    var value = parseFloat(
    // @ts-ignore
    element.value.replace(/,/g, '').replace('$', ''));
    var fieldLabelText = $("#".concat(fieldName, "_label")).text();
    var genericErrorMsg = "<div><span>\"".concat(fieldLabelText, "\"</span><span style=\"color:red;\"> Please enter a valid number");
    switch (operator) {
      case 'greaterThan':
        // @ts-ignore
        return !(value > comparisonValue) || value === '' ? "".concat(genericErrorMsg, ". The value must be greater than ").concat(comparisonValue, ".</span></div>") : '';
      case 'lessThan':
        // @ts-ignore
        return !(value < comparisonValue) || value === '' ? "".concat(genericErrorMsg, ". The value must be less than ").concat(comparisonValue, ".</span></div>") : '';
      case 'equalTo':
        // @ts-ignore
        return !(value === comparisonValue) || value === '' ? "".concat(genericErrorMsg, ". The value must be equal to ").concat(comparisonValue, ".</span></div>") : '';
      case 'greaterThanOrEqualTo':
        // @ts-ignore
        return !(value >= comparisonValue) || value === '' ? "".concat(genericErrorMsg, ". The value must be greater than or equal to ").concat(comparisonValue, ".</span></div>") : '';
      case 'lessThanOrEqualTo':
        // @ts-ignore
        return !(value <= comparisonValue) || value === '' ? "".concat(genericErrorMsg, ". The value must be less than or equal to ").concat(comparisonValue, ".</span></div>") : '';
      default:
        return 'Invalid operator';
    }
  }
  function validateFieldLength(fieldName, comparisonValue, operator) {
    var forceRequired = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
    var postfix = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : undefined;
    var overrideDisplayValue = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;
    var isVisible = $("#".concat(fieldName, "_label")).is(':visible');
    var skipValidationAsNotVisible = !isVisible;
    if (skipValidationAsNotVisible) return '';
    var element = document.querySelector("#".concat(fieldName));
    if (!element) return;

    // @ts-ignore
    if (element.value === '' && !forceRequired) {
      return '';
    }

    // @ts-ignore
    var value = element.value.length;
    var genericErrorMsg = "<span style=\"color:red;\"> Please enter a valid length";
    switch (operator) {
      case 'greaterThan':
        return !(value > comparisonValue) || value === '' ? "".concat(genericErrorMsg, ". The length must be greater than ").concat(overrideDisplayValue !== null && overrideDisplayValue !== void 0 ? overrideDisplayValue : comparisonValue).concat(postfix ? " ".concat(postfix) : '', ".</span>") : '';
      case 'lessThan':
        return !(value < comparisonValue) || value === '' ? "".concat(genericErrorMsg, ". The length must be less than ").concat(overrideDisplayValue !== null && overrideDisplayValue !== void 0 ? overrideDisplayValue : comparisonValue).concat(postfix ? " ".concat(postfix) : '', ".</span>") : '';
      case 'equalTo':
        return !(value === comparisonValue) || value === '' ? "".concat(genericErrorMsg, ". The length must be equal to ").concat(overrideDisplayValue !== null && overrideDisplayValue !== void 0 ? overrideDisplayValue : comparisonValue).concat(postfix ? " ".concat(postfix) : '', ".</span>") : '';
      case 'greaterThanOrEqualTo':
        return !(value >= comparisonValue) || value === '' ? "".concat(genericErrorMsg, ". The length must be greater than or equal to ").concat(overrideDisplayValue !== null && overrideDisplayValue !== void 0 ? overrideDisplayValue : comparisonValue).concat(postfix ? " ".concat(postfix) : '', ".</span>") : '';
      case 'lessThanOrEqualTo':
        return !(value <= comparisonValue) || value === '' ? "".concat(genericErrorMsg, ". The length must be less than or equal to ").concat(overrideDisplayValue !== null && overrideDisplayValue !== void 0 ? overrideDisplayValue : comparisonValue).concat(postfix ? " ".concat(postfix) : '', ".</span>") : '';
      default:
        return 'Invalid operator';
    }
  }
  function validateEmailAddressField(fieldName) {
    var fieldElement = document.querySelector("#".concat(fieldName));
    var errorMessageElement = document.querySelector("#".concat(fieldName, "_error_message"));
    if (!fieldElement) return;
    if (!errorMessageElement) {
      var div = document.createElement('div');
      div.id = "".concat(fieldName, "_error_message");
      div.className = 'error_message';
      // @ts-ignore
      div.style = 'display:none;';
      $("#".concat(fieldName)).parent().append(div);
      errorMessageElement = document.querySelector("#".concat(fieldName, "_error_message"));
      if (!errorMessageElement) return;
    }
    var pattern = /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i;
    $(fieldElement).on('keyup keydown', function () {
      // @ts-ignore
      var input = fieldElement.value;
      if (!input || !pattern.test(input)) {
        $(fieldElement).css({
          border: '1px solid #e5636c'
        });
        $(errorMessageElement).html('<span>Email: must be a valid email.</span>');
        $(errorMessageElement).css({
          display: ''
        });
      } else {
        $(fieldElement).css({
          border: ''
        });
        $(errorMessageElement).css({
          display: 'none'
        });
      }
    });
  }
  function displayValidationErrors(validationErrorHtml) {
    var validationErrorsDiv = $('#error_messages_div');
    logger$f.info({
      fn: displayValidationErrors,
      message: 'displaying validation errors'
    });
    if (validationErrorsDiv.length == 0) {
      // @ts-ignore
      validationErrorsDiv = document.createElement('div');
      // @ts-ignore
      validationErrorsDiv.id = "error_messages_div";
      var actionsDiv = $("#NextButton").parent().parent();
      actionsDiv.prepend(validationErrorsDiv);
      actionsDiv.attr('id', 'actions_div');
    } else {
      // @ts-ignore
      validationErrorsDiv = validationErrorsDiv[0];
    }
    if (validationErrorHtml == '') {
      // @ts-ignore
      validationErrorsDiv.innerHTML = '';
      // @ts-ignore
      validationErrorsDiv.style = 'display:none;';
      $('#NextButton').prop('disabled', false);
    } else {
      // @ts-ignore
      validationErrorsDiv.innerHTML = validationErrorHtml + '</br>';
      // @ts-ignore
      validationErrorsDiv.style = 'display:block;';
      $('#NextButton').prop('disabled', true);
    }
  }
  function addValidationCheck(fieldName, validation) {
    if (validation !== null && validation !== void 0 && validation.intervalBased) {
      setInterval(function () {
        return validateStepFields();
      }, 100);
    } else {
      var _validation$event;
      $("input[id*='".concat(fieldName, "']")).on((_validation$event = validation === null || validation === void 0 ? void 0 : validation.event) !== null && _validation$event !== void 0 ? _validation$event : 'onchange', function () {
        validateStepFields();
      });
    }
  }
  function setInputMaxLength(fieldName, maxLength) {
    $("#".concat(fieldName)).attr('maxlength', maxLength);
  }
  function setFieldReadOnly(fieldName) {
    // @ts-ignore
    $("#".concat(fieldName)).attr('readonly', true);
    $("#".concat(fieldName)).on('mousedown', function (e) {
      e.preventDefault();
      this.blur();
      window.focus();
    });
    $("#".concat(fieldName)).attr('style', 'background-color: #eee !important');
  }

  function showFieldsetElement(fieldsetName) {
    var sectionElement = $("fieldset[aria-label=\"".concat(fieldsetName, "\"]"));
    if (sectionElement) {
      sectionElement.css({
        display: ''
      });
    }
  }
  function showFieldRow(fieldName) {
    var _$, _$2;
    var fieldLabelElement = document.querySelector("#".concat(fieldName, "_label"));
    if (!fieldLabelElement) return;
    var fieldRow = fieldLabelElement.closest('tr');
    if (!fieldRow) return;
    (_$ = $(fieldRow)) === null || _$ === void 0 || _$.css({
      display: ''
    });

    // check if a fieldset exists and make sure it's visible if so
    var nearestFieldSet = fieldRow.closest('fieldset');
    (_$2 = $(nearestFieldSet)) === null || _$2 === void 0 || _$2.css({
      display: ''
    });
  }
  function addTextAboveField(fieldName, htmlContentToAdd) {
    var fieldLabelDivContainer = $("#".concat(fieldName, "_label")).parent();
    if (!fieldLabelDivContainer) return;
    fieldLabelDivContainer.prepend(htmlContentToAdd);
  }
  function addTextBelowField(fieldName, htmlContentToAdd) {
    var fieldLabelDivContainer = $("#".concat(fieldName, "_label")).parent().parent();
    if (!fieldLabelDivContainer) return;
    fieldLabelDivContainer.append(htmlContentToAdd);
  }
  function observeChanges(element, customFunc) {
    // initial load:
    if (customFunc) {
      customFunc();
    } else {
      validateRequiredFields();
    }

    // watch for changes
    var observer = new MutationObserver(function (mutations, observer) {
      if (customFunc) {
        customFunc();
      } else {
        validateRequiredFields();
      }
    });
    observer.observe(element, {
      attributes: true,
      childList: true,
      characterData: true
    });
  }
  function observeIframeChanges(funcToExecute, fieldNameToPass, fieldNameToObserve) {
    var iframe = document.querySelector('fieldset[aria-label="Coding Section (DO NOT REMOVE)"] iframe');
    // wait for iframe to load / watch for changes
    if (iframe !== null && iframe !== void 0 && iframe.nodeType) {
      observeChanges($(iframe)[0], function () {
        funcToExecute(fieldNameToPass);
        var iframe = document.querySelector('fieldset[aria-label="Coding Section (DO NOT REMOVE)"] iframe');
        // @ts-ignore
        var innerDoc = iframe !== null && iframe !== void 0 && iframe.contentDocument ? // @ts-ignore
        iframe === null || iframe === void 0 ? void 0 : iframe.contentDocument : // @ts-ignore
        iframe === null || iframe === void 0 ? void 0 : iframe.contentWindow.document;
        if (innerDoc !== null && innerDoc !== void 0 && innerDoc.nodeType) {
          observeChanges(innerDoc, function () {
            var iframe = document.querySelector('fieldset[aria-label="Coding Section (DO NOT REMOVE)"] iframe');
            // @ts-ignore
            var innerDoc = iframe.contentDocument ?
            // @ts-ignore
            iframe.contentDocument :
            // @ts-ignore
            iframe.contentWindow.document;
            funcToExecute(fieldNameToPass);
            var element = innerDoc === null || innerDoc === void 0 ? void 0 : innerDoc.getElementById(fieldNameToObserve);
            if (element !== null && element !== void 0 && element.nodeType) {
              observeChanges(element, function () {
                funcToExecute(fieldNameToPass);
              });
            }
          });
        }
      });
    }
  }
  function hideFieldByFieldName(fieldName, validationFunc) {
    var doNotBlank = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var fieldLabelElement = document.querySelector("#".concat(fieldName, "_label"));
    if (!fieldLabelElement) return;
    var fieldRow = fieldLabelElement.closest('tr');
    var fieldInputElement = document.querySelector("#".concat(fieldName));
    if (!fieldRow || !fieldInputElement) return;
    $(fieldRow).css({
      display: 'none'
    });
    $("#".concat(fieldName, "_label")).parent().removeClass('required');
    localStorage.removeItem("shouldRequire_".concat(fieldName));
    if (validationFunc) {
      validationFunc();
    }
    $(fieldInputElement).off('change');
    if (!doNotBlank) {
      $(fieldInputElement).val('');
    }
  }
  function hideQuestion(fieldName) {
    $("#".concat(fieldName)).css('display', 'none');
    $("#".concat(fieldName)).val('');
    var fieldLabelElement = document.querySelector("#".concat(fieldName, "_label"));
    var fieldRow = fieldLabelElement.closest('tr');
    $(fieldRow).css({
      display: 'none'
    });
    validateRequiredFields();
  }
  function showOrHideAndReturnValue(valueElementId, descriptionElementId) {
    var valueElement = $("#".concat(valueElementId));
    var descriptionElement = $("#".concat(descriptionElementId));

    // @ts-ignore
    var value = parseFloat(valueElement.val().replace(/,/g, ''));
    if (isNaN(value)) value = 0.0;
    var hideDescription = value == 0.0;
    if (hideDescription) {
      descriptionElement.val('');
      descriptionElement.closest('td').css('display', 'none');
      valueElement.closest('td').attr('colspan', '2');
    } else {
      descriptionElement.closest('td').css('display', 'block');
      descriptionElement.closest('td').attr('colspan', '1');
      valueElement.closest('td').attr('colspan', '1');
    }
    return value;
  }

  /**
   * Programmatically set a field value and trigger change event.
   * Ensures validation checks pick up on change event.
   * @function
   * @param {string} name - The name of the associated field id.
   * @param {string} value - The value to set the field to.
   */
  function setFieldValue(name, value) {
    var element = document.querySelector("#".concat(name));
    if (!element) return;
    // @ts-ignore
    element.value = value;
    var e = new Event('change');
    element.dispatchEvent(e);
  }
  function combineElementsIntoOneRow(valueElementId, descriptionInputElementId) {
    var descriptionInputElement = $("#".concat(descriptionInputElementId));
    var descriptionInputElementCol = descriptionInputElement.closest('td');
    var descriptionInputElementColClone = descriptionInputElementCol.clone();
    descriptionInputElementColClone.attr('colspan', '1');
    descriptionInputElementCol.remove();
    var valueElement = $("#".concat(valueElementId));
    var valueElementCol = valueElement.closest('td');
    valueElementCol.attr('colspan', '1');
    var valueElementRow = valueElement.closest('tr');
    valueElementRow.append(descriptionInputElementColClone);
  }
  function hideAllStepSections() {
    $('fieldset > table').parent().css('display', 'none');
  }
  function hideFields() {
    var hidden = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    var selector = 'tr:has([id$="_label"])';
    var fieldRows = document.querySelectorAll(selector);
    fieldRows.forEach(function (row) {
      if (hidden) {
        // @ts-ignore
        row.style.display = 'none';
      } else {
        // @ts-ignore
        row.style.display = '';
      }
    });
  }
  function hideFieldSets() {
    var hidden = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    var fieldsetsWithAriaLabel = document.querySelectorAll('fieldset[aria-label]');
    fieldsetsWithAriaLabel.forEach(function (fieldset) {
      if (hidden) {
        // @ts-ignore
        fieldset.style.display = 'none';
      } else {
        // @ts-ignore
        fieldset.style.display = '';
      }
    });
  }
  function hideFieldsAndSections() {
    var hidden = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    hideFields(hidden);
    hideFieldSets(hidden);
  }
  function htmlDecode(input) {
    var _doc$documentElement$;
    var doc = new DOMParser().parseFromString(input, 'text/html');
    return (_doc$documentElement$ = doc.documentElement.textContent) === null || _doc$documentElement$ === void 0 ? void 0 : _doc$documentElement$.replace(/[^\x00-\x7F]/g, '');
  }

  /**
   * Extends a given Object properties and its childs.
   */
  function deepExtend(out) {
    out = out || {};
    for (var i = 1, len = arguments.length; i < len; ++i) {
      var obj = arguments[i];
      if (!obj) {
        continue;
      }
      for (var key in obj) {
        if (!obj.hasOwnProperty(key) || key == '__proto__' || key == 'constructor') {
          continue;
        }

        // based on https://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
        if (Object.prototype.toString.call(obj[key]) === '[object Object]') {
          out[key] = deepExtend(out[key], obj[key]);
          continue;
        }
        out[key] = obj[key];
      }
    }
    return out;
  }

  // Merges two arrays of objects joining on a given prop, e.g. "name"
  function mergeFieldArrays(ArrayA, ArrayB, prop) {
    var mergedObj = {};

    // Merge objects from ArrayB and ArrayA into the object
    for (var _i = 0, _arr = [].concat(_toConsumableArray(ArrayB), _toConsumableArray(ArrayA)); _i < _arr.length; _i++) {
      var obj = _arr[_i];
      var key = obj[prop];
      if (key in mergedObj) {
        // Merge properties if the object already exists in the object
        mergedObj[key] = _objectSpread2(_objectSpread2({}, mergedObj[key]), obj);
      } else {
        // If the object doesn't exist in the object, add it
        mergedObj[key] = _objectSpread2({}, obj);
      }
    }

    // Check if the result should be an array or object
    return prop ? Object.values(mergedObj) : mergedObj;
  }
  function hasUpperCase(str) {
    return str && str !== str.toLowerCase();
  }

  // TODO: Update for production
  var ALLOWED_ENVS = [Environment.DEV, Environment.TEST, Environment.PROD];
  var ALLOWED_HOSTS = [Hosts[Environment.DEV], Hosts[Environment.TEST], Hosts[Environment.PROD]];
  var ALLOWED_PATHS = ['/claim/', '/claim-dev/', '/application/', '/application-dev/'];
  var defaultOptions = {
    autoinit: true,
    env: Environment.DEV,
    logging: true,
    // TODO: implement log level filtering
    logLevel: 90,
    // Only show errors on PROD
    form: null,
    // if null, will try to auto-detect the form
    allowedHosts: [].concat(ALLOWED_HOSTS),
    allowedPaths: [].concat(ALLOWED_PATHS),
    allowedEnvs: [].concat(ALLOWED_ENVS)
  };
  var g_options = null;
  deepExtend({}, defaultOptions); //deep copy

  function getOptions() {
    return g_options || defaultOptions;
  }
  function setOptions(options) {
    g_options = deepExtend({}, defaultOptions, options);
    Object.assign({}, g_options);
    return g_options;
  }
  function setOption(name, value) {
    defaultOptions[name] = value;
  }

  var logger$e = Logger('common/scripts');
  POWERPOD.useScript = useScript;
  var Scripts = {
    jquerymask: 'jquerymask'
  };
  var script = {
    loadmap: [],
    // used to track already loaded scripts
    sourcemap: {
      jquery: 'https://code.jquery.com/jquery-3.6.2.min.js',
      chosen: 'https://cdnjs.cloudflare.com/ajax/libs/chosen/1.4.2/chosen.jquery.js',
      jquerymask: 'https://cdnjs.cloudflare.com/ajax/libs/jquery.mask/1.14.16/jquery.mask.min.js'
    },
    callstack: {} // used to handle stacked function calls while loading a script
  };

  /**
   * Marks a script as fully loaded in memory.
   * @function
   * @param {string} id - The id of the associated script.
   */
  function markScriptFullyLoaded(id) {
    script.loadmap[id] = true;
  }

  /**
   * Checks if a script is added.
   * @function
   * @param {string} id - The id of the associated script.
   */
  function isScriptAdded(id) {
    var _script$sourcemap;
    if (!id || !((_script$sourcemap = script.sourcemap) !== null && _script$sourcemap !== void 0 && _script$sourcemap[id])) return;
    var src = script.sourcemap[id];
    return Boolean(doc.querySelector('script[src="' + src + '"]'));
  }

  /**
   * Marks a script fully loaded.
   * @function
   * @param {string} id - The id of the associated script.
   */
  function isScriptFullyLoaded(id) {
    return id in script.loadmap && script.loadmap[id];
  }

  /**
   * Allows use of a pre-defined script, employs lazy-loading.
   * @function
   * @param {string} id - The id of the associated script.
   * @param {function} onload - A function to be executed on load of the script.
   * @param {function} onerror - A function to be executed on error.
   */
  function useScript(id) {
    var _script$sourcemap2;
    var onload = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var onerror = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    if (!id || !((_script$sourcemap2 = script.sourcemap) !== null && _script$sourcemap2 !== void 0 && _script$sourcemap2[id])) return;
    var src = script.sourcemap[id];

    // Check if the script is already loaded
    if (isScriptAdded(id)) {
      // If script already loaded successfully, trigger the callback function
      if (isScriptFullyLoaded(id)) {
        logger$e.warn({
          fn: useScript,
          message: "Script already loaded. Skipping: ".concat(id)
        });
        if (onload) {
          logger$e.warn({
            fn: useScript,
            message: "Script already loaded. Calling onload for: ".concat(id)
          });
          onload();
        }
        return;
      }
      if (onload) {
        var _script$callstack, _script$callstack2;
        logger$e.warn({
          fn: useScript,
          message: "Script still loading, adding to call stack: ".concat(id),
          data: script
        });
        script.callstack = _objectSpread2(_objectSpread2({}, script.callstack ? script.callstack : {}), {}, _defineProperty({}, id, [].concat(_toConsumableArray((_script$callstack = script.callstack) !== null && _script$callstack !== void 0 && _script$callstack[id] ? (_script$callstack2 = script.callstack) === null || _script$callstack2 === void 0 ? void 0 : _script$callstack2[id] : []), [onload])));
      } else {
        logger$e.warn({
          fn: useScript,
          message: "Script still loading: ".concat(id)
        });
      }
      return;
    }

    // Loading the script using DOM...
    var scriptEl = doc.createElement('script');
    scriptEl.setAttribute('async', '');
    scriptEl.src = src;
    doc.head.appendChild(scriptEl);
    if (onload && typeof onload === 'function') {
      script.callstack = _objectSpread2(_defineProperty({}, id, [onload]), script.callstack);
    }
    scriptEl.onload = function () {
      var _script$callstack3;
      logger$e.info({
        fn: useScript,
        message: "script onload successfully called ".concat(id),
        data: script
      });
      markScriptFullyLoaded(id);
      if ((_script$callstack3 = script.callstack) !== null && _script$callstack3 !== void 0 && _script$callstack3[id]) {
        var _script$callstack4;
        (_script$callstack4 = script.callstack) === null || _script$callstack4 === void 0 || _script$callstack4[id].forEach(function (fn) {
          return fn();
        });
        script.callstack = _objectSpread2(_objectSpread2({}, script.callstack ? script.callstack : {}), {}, _defineProperty({}, id, []));
      }
    };
    scriptEl.onerror = function () {
      logger$e.error({
        fn: useScript,
        message: "Failed to load: ".concat(id)
      });

      // Optional callback on script load failure
      if (onerror && typeof onerror === 'function') onerror();
    };
  }

  var _excluded = ["programId", "beforeSend", "onSuccess"],
    _excluded2 = ["programId", "beforeSend", "onSuccess"],
    _excluded3 = ["onSuccess"],
    _excluded4 = ["searchStr", "onSuccess"],
    _excluded5 = ["topicSourceId"],
    _excluded6 = ["topicId"];
  var logger$d = Logger('common/fetch');
  POWERPOD.fetch = {
    getEnvVarsData: getEnvVarsData,
    getApplicationFormData: getApplicationFormData,
    getClaimFormData: getClaimFormData,
    getMunicipalData: getMunicipalData,
    getOrgbookAutocompleteData: getOrgbookAutocompleteData,
    getOrgbookTopicData: getOrgbookTopicData,
    getOrgbookCredentialsData: getOrgbookCredentialsData
  };
  var ENDPOINT_URL = {
    get_env_vars_data: "/_api/environmentvariabledefinitions?$filter=contains(schemaname,'quartech_')&$select=schemaname,environmentvariabledefinitionid&$expand=environmentvariabledefinition_environmentvariablevalue($select=value)",
    get_application_form_data: function get_application_form_data(programId) {
      return "/_api/msgov_programs(".concat(programId, ")?$select=msgov_programid, quartech_disabledchefsdemographicinfo, msgov_programname, quartech_applicantportalprogramname, quartech_applicantportalprogramstreamjsonconfig, quartech_portalapplicationpagetitle, quartech_portalapplicationpagesubtitle, quartech_portalapplicationpagedescription, quartech_programabbreviation, quartech_programemailaddress, quartech_portalappactivityinfohiddenfields, quartech_portalappprojectdeschiddenfields, quartech_portalappfieldsdisplaynamesmapping, quartech_typesofbusinesstodisplay, quartech_applicantportalapplicationformconfigjson, quartech_activitiestypestodisplay&$expand=quartech_ApplicantPortalConfig($select=quartech_name,quartech_configdata)");
    },
    get_claim_form_data: function get_claim_form_data(programId) {
      return "/_api/msgov_programs(".concat(programId, ")?$select=msgov_programid, msgov_programname, quartech_applicantportalprogramname, quartech_claimformheaderhtmlcontent, quartech_applicantportalclaimformjson, quartech_applicantportalprogramstreamjsonconfig, quartech_portalapplicationpagetitle, quartech_portalapplicationpagesubtitle, quartech_portalapplicationpagedescription, quartech_programabbreviation, quartech_programemailaddress, quartech_portalappactivityinfohiddenfields, quartech_portalappprojectdeschiddenfields, quartech_portalappfieldsdisplaynamesmapping, quartech_typesofbusinesstodisplay, quartech_applicantportalapplicationformconfigjson, quartech_activitiestypestodisplay&$expand=quartech_ApplicantPortalConfig($select=quartech_name,quartech_configdata)");
    },
    get_municipal_data: '/_api/quartech_municipals?$select=quartech_name,quartech_municipalid&$expand=quartech_RegionalDistrict($select=quartech_name,quartech_regionaldistrictid,_quartech_censusofagricultureregion_value)',
    get_orgbook_autocomplete_data: 'https://orgbook.gov.bc.ca/api/v3/search/autocomplete',
    get_orgbook_topic_data: 'https://orgbook.gov.bc.ca/api/v4/search/topic',
    get_orgbook_credentials_data: function get_orgbook_credentials_data(topicId) {
      return "https://orgbook.gov.bc.ca/api/v4/topic/".concat(topicId, "/credential-set");
    }
  };
  var CONTENT_TYPE = {
    json: 'application/json; charset=utf-8'
  };
  var DATATYPE = {
    json: 'json'
  };
  var setODataHeaders = function setODataHeaders(XMLHttpRequest) {
    XMLHttpRequest.setRequestHeader('Accept', 'application/json');
    XMLHttpRequest.setRequestHeader('OData-MaxVersion', '4.0');
    XMLHttpRequest.setRequestHeader('OData-Version', '4.0');
    XMLHttpRequest.setRequestHeader('Prefer', 'odata.include-annotations="*"');
  };
  var CACHED_RESULTS = {};

  // Note: Cross-domain requests and dataType: "jsonp" requests do not support synchronous operation
  // async: false with jqXHR ($.Deferred) is deprecated; you must use the success/error/complete
  // callback options instead of the corresponding methods of the jqXHR object such as jqXHR.done().

  // TODO: cleanup usage of ".done()" deprecated method in project, functions still using:
  // e.g. "getTopic" & "getTopicCredentials" in src/js/application/steps/applicantInfo.js
  function fetch(_x) {
    return _fetch.apply(this, arguments);
  }
  function _fetch() {
    _fetch = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(params) {
      var _params$method, method, url, _beforeSend, onSuccess, onError, _params$async, async, _params$data, data, datatype, contentType, _params$includeODataH, includeODataHeaders, _params$skipCache, skipCache, _params$returnData, returnData, reqHash, _CACHED_RESULTS$reqHa, _data, textStatus, xhr;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            _params$method = params.method, method = _params$method === void 0 ? 'GET' : _params$method, url = params.url, _beforeSend = params.beforeSend, onSuccess = params.onSuccess, onError = params.onError, _params$async = params.async, async = _params$async === void 0 ? true : _params$async, _params$data = params.data, data = _params$data === void 0 ? {} : _params$data, datatype = params.datatype, contentType = params.contentType, _params$includeODataH = params.includeODataHeaders, includeODataHeaders = _params$includeODataH === void 0 ? false : _params$includeODataH, _params$skipCache = params.skipCache, skipCache = _params$skipCache === void 0 ? false : _params$skipCache, _params$returnData = params.returnData, returnData = _params$returnData === void 0 ? false : _params$returnData; // check cache if used
            reqHash = JSON.stringify(params);
            if (!(!skipCache && CACHED_RESULTS[reqHash])) {
              _context.next = 8;
              break;
            }
            _CACHED_RESULTS$reqHa = CACHED_RESULTS[reqHash], _data = _CACHED_RESULTS$reqHa.data, textStatus = _CACHED_RESULTS$reqHa.textStatus, xhr = _CACHED_RESULTS$reqHa.xhr;
            logger$d.info({
              fn: fetch,
              message: "returning cached data for url: ".concat(url),
              data: {
                data: _data,
                params: params
              }
            });
            if (!returnData) {
              _context.next = 7;
              break;
            }
            return _context.abrupt("return", Promise.resolve(_data));
          case 7:
            return _context.abrupt("return", Promise.resolve(onSuccess(_data, textStatus, xhr)));
          case 8:
            return _context.abrupt("return", $.ajax({
              method: method,
              url: url,
              contentType: contentType,
              datatype: datatype,
              data: data,
              async: async,
              beforeSend: function beforeSend(XMLHttpRequest) {
                if (includeODataHeaders) setODataHeaders(XMLHttpRequest);
                if (_beforeSend && typeof _beforeSend === 'function') _beforeSend();
              },
              success: function success(data, textStatus, xhr) {
                if (!skipCache) CACHED_RESULTS[reqHash] = {
                  data: data,
                  textStatus: textStatus,
                  xhr: xhr
                };
                if (returnData) {
                  logger$d.info({
                    fn: fetch,
                    message: "skipping onSuccess handler call: ".concat(url),
                    data: {
                      data: data,
                      params: params
                    }
                  });
                  return;
                }
                if (onSuccess && typeof onSuccess === 'function') {
                  onSuccess(data, textStatus, xhr);
                }
              },
              error: function error(xhr, textStatus, errorThrown) {
                logger$d.error({
                  fn: fetch,
                  message: xhr === null || xhr === void 0 ? void 0 : xhr.responseText,
                  data: {
                    xhr: xhr,
                    textStatus: textStatus,
                    errorThrown: errorThrown
                  }
                });
                if (onError && typeof onError === 'function') {
                  onError(xhr, textStatus, errorThrown);
                }
              }
            }).then(function (data) {
              if (returnData && data) {
                logger$d.info({
                  fn: fetch,
                  message: "returning data for url: ".concat(url),
                  data: {
                    data: data,
                    params: params
                  }
                });
                return Promise.resolve(data);
              }
            }));
          case 9:
          case "end":
            return _context.stop();
        }
      }, _callee);
    }));
    return _fetch.apply(this, arguments);
  }
  function getEnvVarsData() {
    return _getEnvVarsData.apply(this, arguments);
  }
  function _getEnvVarsData() {
    _getEnvVarsData = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
      var _ref,
        options,
        _args2 = arguments;
      return _regeneratorRuntime().wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            _ref = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : {}, options = _extends({}, (_objectDestructuringEmpty(_ref), _ref));
            return _context2.abrupt("return", fetch(_objectSpread2({
              url: ENDPOINT_URL.get_env_vars_data,
              contentType: CONTENT_TYPE.json,
              datatype: DATATYPE.json,
              includeODataHeaders: true,
              async: false,
              returnData: true
            }, options)));
          case 2:
          case "end":
            return _context2.stop();
        }
      }, _callee2);
    }));
    return _getEnvVarsData.apply(this, arguments);
  }
  function getApplicationFormData(_x2) {
    return _getApplicationFormData.apply(this, arguments);
  }
  function _getApplicationFormData() {
    _getApplicationFormData = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(_ref2) {
      var programId, beforeSend, onSuccess, options;
      return _regeneratorRuntime().wrap(function _callee3$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
          case 0:
            programId = _ref2.programId, beforeSend = _ref2.beforeSend, onSuccess = _ref2.onSuccess, options = _objectWithoutProperties(_ref2, _excluded);
            return _context3.abrupt("return", fetch(_objectSpread2({
              url: ENDPOINT_URL.get_application_form_data(programId),
              contentType: CONTENT_TYPE.json,
              datatype: DATATYPE.json,
              includeODataHeaders: true,
              async: false,
              beforeSend: beforeSend,
              onSuccess: onSuccess
            }, options)));
          case 2:
          case "end":
            return _context3.stop();
        }
      }, _callee3);
    }));
    return _getApplicationFormData.apply(this, arguments);
  }
  function getClaimFormData(_x3) {
    return _getClaimFormData.apply(this, arguments);
  }
  function _getClaimFormData() {
    _getClaimFormData = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(_ref3) {
      var programId, beforeSend, onSuccess, options;
      return _regeneratorRuntime().wrap(function _callee4$(_context4) {
        while (1) switch (_context4.prev = _context4.next) {
          case 0:
            programId = _ref3.programId, beforeSend = _ref3.beforeSend, onSuccess = _ref3.onSuccess, options = _objectWithoutProperties(_ref3, _excluded2);
            return _context4.abrupt("return", fetch(_objectSpread2({
              url: ENDPOINT_URL.get_claim_form_data(programId),
              contentType: CONTENT_TYPE.json,
              datatype: DATATYPE.json,
              includeODataHeaders: true,
              async: false,
              beforeSend: beforeSend,
              onSuccess: onSuccess
            }, options)));
          case 2:
          case "end":
            return _context4.stop();
        }
      }, _callee4);
    }));
    return _getClaimFormData.apply(this, arguments);
  }
  function getMunicipalData(_x4) {
    return _getMunicipalData.apply(this, arguments);
  }
  function _getMunicipalData() {
    _getMunicipalData = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(_ref4) {
      var _ref4$onSuccess, onSuccess, options;
      return _regeneratorRuntime().wrap(function _callee5$(_context5) {
        while (1) switch (_context5.prev = _context5.next) {
          case 0:
            _ref4$onSuccess = _ref4.onSuccess, onSuccess = _ref4$onSuccess === void 0 ? null : _ref4$onSuccess, options = _objectWithoutProperties(_ref4, _excluded3);
            return _context5.abrupt("return", fetch(_objectSpread2({
              url: ENDPOINT_URL.get_municipal_data,
              contentType: CONTENT_TYPE.json,
              datatype: DATATYPE.json,
              includeODataHeaders: true,
              async: false,
              onSuccess: onSuccess
            }, options)));
          case 2:
          case "end":
            return _context5.stop();
        }
      }, _callee5);
    }));
    return _getMunicipalData.apply(this, arguments);
  }
  function getOrgbookAutocompleteData(_x5) {
    return _getOrgbookAutocompleteData.apply(this, arguments);
  }
  function _getOrgbookAutocompleteData() {
    _getOrgbookAutocompleteData = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(_ref5) {
      var searchStr, onSuccess, options;
      return _regeneratorRuntime().wrap(function _callee6$(_context6) {
        while (1) switch (_context6.prev = _context6.next) {
          case 0:
            searchStr = _ref5.searchStr, onSuccess = _ref5.onSuccess, options = _objectWithoutProperties(_ref5, _excluded4);
            return _context6.abrupt("return", fetch(_objectSpread2({
              url: ENDPOINT_URL.get_orgbook_autocomplete_data,
              data: {
                q: searchStr,
                inactive: 'false',
                revoked: 'false',
                latest: 'true'
              },
              onSuccess: onSuccess
            }, options)));
          case 2:
          case "end":
            return _context6.stop();
        }
      }, _callee6);
    }));
    return _getOrgbookAutocompleteData.apply(this, arguments);
  }
  function getOrgbookTopicData(_x6) {
    return _getOrgbookTopicData.apply(this, arguments);
  }
  function _getOrgbookTopicData() {
    _getOrgbookTopicData = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(_ref6) {
      var topicSourceId, options;
      return _regeneratorRuntime().wrap(function _callee7$(_context7) {
        while (1) switch (_context7.prev = _context7.next) {
          case 0:
            topicSourceId = _ref6.topicSourceId, options = _objectWithoutProperties(_ref6, _excluded5);
            return _context7.abrupt("return", fetch(_objectSpread2({
              url: ENDPOINT_URL.get_orgbook_topic_data,
              data: {
                q: topicSourceId
              }
            }, options)));
          case 2:
          case "end":
            return _context7.stop();
        }
      }, _callee7);
    }));
    return _getOrgbookTopicData.apply(this, arguments);
  }
  function getOrgbookCredentialsData(_x7) {
    return _getOrgbookCredentialsData.apply(this, arguments);
  }
  function _getOrgbookCredentialsData() {
    _getOrgbookCredentialsData = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(_ref7) {
      var topicId, options;
      return _regeneratorRuntime().wrap(function _callee8$(_context8) {
        while (1) switch (_context8.prev = _context8.next) {
          case 0:
            topicId = _ref7.topicId, options = _objectWithoutProperties(_ref7, _excluded6);
            return _context8.abrupt("return", fetch(_objectSpread2({
              url: ENDPOINT_URL.get_orgbook_credentials_data(topicId)
            }, options)));
          case 2:
          case "end":
            return _context8.stop();
        }
      }, _callee8);
    }));
    return _getOrgbookCredentialsData.apply(this, arguments);
  }

  /******************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */

  function __awaiter(thisArg, _arguments, P, generator) {
      function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
      return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
          function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
          function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
  }

  typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
      var e = new Error(message);
      return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
  };

  const logger$c = Logger('common/env');
  POWERPOD.env = {
      getEnvVars,
      getEnv,
  };
  function getEnv() {
      const { host } = win.location;
      const env = Object.keys(Hosts).find((key) => Hosts[key] === host);
      if (!env) {
          logger$c.error({
              fn: getEnv,
              message: 'Unable to determine current env',
              data: { host, Hosts },
          });
          return;
      }
      return env;
  }
  function getEnvVars() {
      var _a;
      return __awaiter(this, void 0, void 0, function* () {
          const data = yield getEnvVarsData();
          if ((_a = data === null || data === void 0 ? void 0 : data['value']) === null || _a === void 0 ? void 0 : _a.length) {
              const definitionsArray = data['value'];
              const res = definitionsArray.reduce((acc, def) => {
                  var _a, _b;
                  const key = def['schemaname'];
                  const value = (_b = (_a = def['environmentvariabledefinition_environmentvariablevalue']) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b['value'];
                  return Object.assign(Object.assign({}, acc), { [key]: value });
              }, {});
              logger$c.info({
                  fn: getEnvVars,
                  message: 'successfully extracted env vars:',
                  data: res,
              });
              return Promise.resolve(res);
          }
          let errorMsg = 'failed to extract env vars from data';
          logger$c.warn({
              fn: getEnvVars,
              message: errorMsg,
              data,
          });
          return Promise.reject(new Error(errorMsg));
      });
  }

  var logger$b = Logger('common/loading');

  /**
   * Hides the loading animation by removing the div and the styling element.
   * Note: The styles hide the page content & display the loader, so removing
   * it simply hides the animation & displays page content. The div and header
   * are defined in the page & HTML in Portal Management (MS Dynamics 365).
   * @function
   */
  function hideLoadingAnimation() {
    logger$b.info({
      fn: hideLoadingAnimation,
      message: 'attempting to hide loading animation...'
    });
    var loader = doc.getElementById('loader');
    if (loader) {
      var _loader$parentNode;
      logger$b.info({
        fn: hideLoadingAnimation,
        message: 'loader found & finished loading, removing element'
      });
      (_loader$parentNode = loader.parentNode) === null || _loader$parentNode === void 0 || _loader$parentNode.removeChild(loader);
    } else {
      logger$b.warn({
        fn: hideLoadingAnimation,
        message: 'loader not found!'
      });
    }
    var loaderStyle = doc.getElementById('loader-style');
    if (loaderStyle) {
      var _loaderStyle$parentNo;
      logger$b.info({
        fn: hideLoadingAnimation,
        message: 'loaderStyle found & finished loading, removing element'
      });
      (_loaderStyle$parentNo = loaderStyle.parentNode) === null || _loaderStyle$parentNo === void 0 || _loaderStyle$parentNo.removeChild(loaderStyle);
    } else {
      logger$b.warn({
        fn: hideLoadingAnimation,
        message: 'loaderStyle not found!'
      });
    }
  }

  function customizeDeliverablesBudgetStep() {
    var programAbbreviation = getProgramAbbreviation();
    setStepRequiredFields('DeliverablesBudgetStep');

    // START ALL PROGRAMS/STREAMS CUSTOMIZATION
    var deliverablesBudgetTabTitleElement = document.querySelector('#EntityFormView > h2');
    if (deliverablesBudgetTabTitleElement && deliverablesBudgetTabTitleElement.textContent.includes('Deliverables & Budget')) {
      $(deliverablesBudgetTabTitleElement).css('display', 'none');
    }
    // END ALL PROGRAMS/STREAMS CUSTOMIZATION

    // START KTTP PROGRAMS/STREAMS CUSTOMIZATION
    if (programAbbreviation && programAbbreviation.includes('KTTP')) {
      customizeEstimatedActivityBudgetStepForKTTP();
      setOnKeypressBudgetInput('quartech_smefee');
      setOnKeypressBudgetInput('quartech_smetravelairfareparkingetc');
      setOnKeypressBudgetInput('quartech_smeaccommodation');
      setOnKeypressBudgetInput('quartech_facilityequipmenttechnologyrental');
      setOnKeypressBudgetInput('quartech_advertisingcommunications');
      setOnKeypressBudgetInput('quartech_administrationcosts');
      setOnKeypressBudgetInput('quartech_othercost');
      setOnKeypressBudgetInput('quartech_costsharecontributioncashorinkinddonation');
      var deliverablesBudgetSectionElement = document.querySelector('#EntityFormView > div.tab.clearfix > div > div > fieldset:nth-child(1) > legend > h3');
      if (deliverablesBudgetSectionElement.textContent.includes('Deliverables & Budget')) {
        deliverablesBudgetSectionElement.textContent = 'Estimated Activity Budget';
      }

      // SET read-only: Total Activity Cost
      $('#quartech_estimatedbudgettotalactivitycost').prop('readonly', true);
      $('#quartech_estimatedbudgettotalactivitycost').off('change');
      $('#quartech_estimatedbudgettotalactivitycost').off('input');
      $('#quartech_estimatedbudgettotalactivitycost').off('keypress');
      $('#quartech_estimatedbudgettotalactivitycost').attr('style', 'background-color: #eee !important');

      // text to add below Cost-Share Contribution (cash or in-kind donation)
      if (!document.querySelector('#costShareContributionNote')) {
        var htmlContentToAddBelowCostShareContribution = "<div id=\"costShareContributionNote\" style=\"padding-bottom: 50px;\">\n      All applicants are expected to provide a minimal cost-shared amount of 25% for ELIGIBLE EXPENSES ONLY. Cash and in-kind can include the organization's own contributions and/or contributions from other sponsoring partners. The Province reserves the right to waive the cost-shared requirement for groups who may face barriers to the program including groups supporting or run by underserved populations. Please provide the total dollar amount (including in-kind). You will be asked to show the contribution when submitting reimbursement request. A list of eligible and ineligible expenses are provided in the Program Guide.\n      </div>";
        addTextAboveField('quartech_totalfundingrequiredfromtheprogram', htmlContentToAddBelowCostShareContribution);
      }

      // SET read-only: Total Funding Required From The Program
      $('#quartech_totalfundingrequiredfromtheprogram').prop('readonly', true);
      $('#quartech_totalfundingrequiredfromtheprogram').off('change');
      $('#quartech_totalfundingrequiredfromtheprogram').off('input');
      $('#quartech_totalfundingrequiredfromtheprogram').off('keypress');
      $('#quartech_totalfundingrequiredfromtheprogram').attr('style', 'background-color: #eee !important');
    }
    // END KTTP PROGRAMS/STREAMS CUSTOMIZATION

    setStepRequiredFields('DeliverablesBudgetStep');
  }
  function setOnKeypressBudgetInput(elementId) {
    $(document).on('keypress', "#".concat(elementId), function () {
      calculateEstimatedActivityBudget();
    });
  }
  function customizeEstimatedActivityBudgetStepForKTTP() {
    addEstimatedActivityBudgetDescription();
    setupEstimatedActivityBudget();
    calculateEstimatedActivityBudget();
  }
  function addEstimatedActivityBudgetDescription() {
    var div = document.createElement('div');
    div.innerHTML = '<p>Please provide an estimated budget</p>' + '<p><b><i>A detailed itemized list of expenses, invoice, event report, and reimbursement form must be submitted within 30 days post-activity. All invoices for eligible activity costs incurred and proof of payment of goods and receipts should be kept for seven years as there is a chance you may be audited.</i></b></p>' + '<p><span style="color:red">*</span> <span>required field</span></p>';
    $("[data-name='tab_Estimated_Activity_Budget']").parent().prepend(div);
  }
  function initialDeliverablesBudgetSingleRowSetup() {
    var tableElement = $('table[data-name="tab_DeliverablesBudget_section_General"]');

    // find and delete colgroup config
    tableElement.find('colgroup').remove();
    tableElement.find('tbody > tr > td[colspan="1"]').each(function () {
      $(this).attr('colspan', '2');
    });
  }
  function setupEstimatedActivityBudget() {
    // setup table config to support single row
    initialDeliverablesBudgetSingleRowSetup();

    // SME Travel (airfare, parking, etc)
    var travelValueElementId = 'quartech_smetravelairfareparkingetc';
    var travelDescriptionElementId = 'quartech_pleasedescribemodeoftravelifapplicable';
    combineElementsIntoOneRow(travelValueElementId, travelDescriptionElementId);

    // SME Accommodation
    var accommodationValueElementId = 'quartech_smeaccommodation';
    var accommodationDescriptionElementId = 'quartech_pleasedescribeaccommodationwherewillthesme';
    combineElementsIntoOneRow(accommodationValueElementId, accommodationDescriptionElementId);

    // Facility, Equipment, Technology Rental
    var rentalValueElementId = 'quartech_facilityequipmenttechnologyrental';
    var rentalDescriptionElementId = 'quartech_pleasedescribeequipmentrequiredifapplicable';
    combineElementsIntoOneRow(rentalValueElementId, rentalDescriptionElementId);

    // Advertising/Communications
    var advertisingValueElementId = 'quartech_advertisingcommunications';
    var advertisingDescriptionElementId = 'quartech_pleasedescribewhatformsofadvertisingcommunic';
    combineElementsIntoOneRow(advertisingValueElementId, advertisingDescriptionElementId);

    // Administration Costs
    var administrationValueElementId = 'quartech_administrationcosts';
    var administrationDescriptionElementId = 'quartech_pleasedescribetheadministrativecoststobeinc';
    combineElementsIntoOneRow(administrationValueElementId, administrationDescriptionElementId);

    // Other Costs
    var otherValueElementId = 'quartech_othercost';
    var otherDescriptionElementId = 'quartech_pleaseexplainotherifapplicable';
    combineElementsIntoOneRow(otherValueElementId, otherDescriptionElementId);

    // Cost-Share Contribution (cash or in-kind donation)
    var costShareValueElementId = 'quartech_costsharecontributioncashorinkinddonation';
    var costShareDescriptionElementId = 'quartech_pleaseexplainwhotheotherpartnersareandwha';
    combineElementsIntoOneRow(costShareValueElementId, costShareDescriptionElementId);
  }
  function calculateEstimatedActivityBudget() {
    // @ts-ignore
    var fee = parseFloat($('#quartech_smefee').val().replace(/,/g, ''));
    if (isNaN(fee)) fee = 0.0;

    // SME Travel (airfare, parking, etc)
    var travelValueElementId = 'quartech_smetravelairfareparkingetc';
    var travelDescriptionElementId = 'quartech_pleasedescribemodeoftravelifapplicable';
    var travel = showOrHideAndReturnValue(travelValueElementId, travelDescriptionElementId);

    // SME Accommodation
    var accommodationValueElementId = 'quartech_smeaccommodation';
    var accommodationDescriptionElementId = 'quartech_pleasedescribeaccommodationwherewillthesme';
    var accommodation = showOrHideAndReturnValue(accommodationValueElementId, accommodationDescriptionElementId);

    // Facility, Equipment, Technology Rental
    var rentalValueElementId = 'quartech_facilityequipmenttechnologyrental';
    var rentalDescriptionElementId = 'quartech_pleasedescribeequipmentrequiredifapplicable';
    var rental = showOrHideAndReturnValue(rentalValueElementId, rentalDescriptionElementId);

    // Advertising/Communications
    var advertisingValueElementId = 'quartech_advertisingcommunications';
    var advertisingDescriptionElementId = 'quartech_pleasedescribewhatformsofadvertisingcommunic';
    var advertising = showOrHideAndReturnValue(advertisingValueElementId, advertisingDescriptionElementId);

    // Administration Costs
    var administrationValueElementId = 'quartech_administrationcosts';
    var administrationDescriptionElementId = 'quartech_pleasedescribetheadministrativecoststobeinc';
    var administration = showOrHideAndReturnValue(administrationValueElementId, administrationDescriptionElementId);

    // Other Costs
    var otherValueElementId = 'quartech_othercost';
    var otherDescriptionElementId = 'quartech_pleaseexplainotherifapplicable';
    var otherCosts = showOrHideAndReturnValue(otherValueElementId, otherDescriptionElementId);

    // Cost-Share Contribution (cash or in-kind donation)
    var costShareValueElementId = 'quartech_costsharecontributioncashorinkinddonation';
    var costShareDescriptionElementId = 'quartech_pleaseexplainwhotheotherpartnersareandwha';
    var costShareContribution = showOrHideAndReturnValue(costShareValueElementId, costShareDescriptionElementId);

    // Calculate total
    var totalActivityCost = fee + travel + accommodation + rental + advertising + administration + otherCosts;
    var totalFundingRequired = totalActivityCost - costShareContribution;
    var totalActivityCostWithCurrencyFormat = CURRENCY_FORMAT.format(totalActivityCost);
    $('#quartech_estimatedbudgettotalactivitycost').val(totalActivityCostWithCurrencyFormat.replace('CA$', ''));
    var totalFundingRequiredWithCurrencyFormat = CURRENCY_FORMAT.format(totalFundingRequired);
    $('#quartech_totalfundingrequiredfromtheprogram').val(totalFundingRequiredWithCurrencyFormat.replace('CA$', ''));
  }

  var logger$a = Logger('common/currency');
  var CURRENCY_FORMAT = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 2
  });
  function customizeCurrencyInput(_ref) {
    var inputId = _ref.inputId,
      _ref$skipCalculatingB = _ref.skipCalculatingBudget,
      skipCalculatingBudget = _ref$skipCalculatingB === void 0 ? false : _ref$skipCalculatingB,
      _ref$maxDigits = _ref.maxDigits,
      maxDigits = _ref$maxDigits === void 0 ? 10 : _ref$maxDigits,
      _ref$limitInputValue = _ref.limitInputValue,
      limitInputValue = _ref$limitInputValue === void 0 ? undefined : _ref$limitInputValue,
      _ref$hideDollarSign = _ref.hideDollarSign,
      hideDollarSign = _ref$hideDollarSign === void 0 ? false : _ref$hideDollarSign;
      _ref.emptyInitialValue;
      var _ref$allowNegatives = _ref.allowNegatives,
      allowNegatives = _ref$allowNegatives === void 0 ? false : _ref$allowNegatives;
    var inputCtr = $("#".concat(inputId));
    var existingLabel = document.querySelector("#".concat(inputId, "_span_currency_label"));
    if (!existingLabel && !inputCtr.val() && !hideDollarSign) {
      inputCtr.parent().addClass('input-group');
      var span = document.createElement('span');
      span.id = "".concat(inputId, "_span_currency_label");
      span.innerText = '$';
      span.className = 'input-group-addon';
      inputCtr.parent().prepend(span);

      // inputCtr.val("0.00");
    }
    inputCtr.on('keydown', function (event) {
      var inputValue = inputCtr.val();
      var pressedKeyCode = event.which; // pressed key on the keyboard.

      var currentInputCursor = document.getElementById(inputCtr[0].id
      // @ts-ignore
      ).selectionStart;

      // pressed '.'
      // if pressed next to a decimal point, just move cursor over 1 space to right
      if (pressedKeyCode === 190) {
        // @ts-ignore
        var nextChar = inputValue.charAt(currentInputCursor);
        if (nextChar === '.') {
          document.getElementById(inputCtr[0].id)
          // @ts-ignore
          .setSelectionRange(currentInputCursor + 1, currentInputCursor + 1);
          event.preventDefault();
          return;
        }
      }

      //delete
      if (pressedKeyCode === 46) {
        // @ts-ignore
        var charToDelete = inputValue.charAt(currentInputCursor);
        if (charToDelete === '0' && currentInputCursor === 0) {
          document.getElementById(inputCtr[0].id)
          // @ts-ignore
          .setSelectionRange(currentInputCursor + 1, currentInputCursor + 1);
          event.preventDefault();
          return;
        }
        if (charToDelete === '.' || charToDelete === ',') {
          document.getElementById(inputCtr[0].id)
          // @ts-ignore
          .setSelectionRange(currentInputCursor + 1, currentInputCursor + 1);
          event.preventDefault();
          return;
        }
        var isDecimalPlace = false;
        // @ts-ignore
        if (currentInputCursor >= inputValue.length - 2) {
          isDecimalPlace = true;
        }

        // @ts-ignore
        if (isDecimalPlace && currentInputCursor !== inputValue.length) {
          var newValue =
          // @ts-ignore
          inputValue.substring(0, currentInputCursor) + '0' +
          // @ts-ignore
          inputValue.substring(currentInputCursor + 1);
          inputCtr.val(newValue);
          document.getElementById(inputCtr[0].id)
          // @ts-ignore
          .setSelectionRange(currentInputCursor + 1, currentInputCursor + 1);
          event.preventDefault();
          return;
        }
      }

      // backspace
      if (pressedKeyCode === 8) {
        // @ts-ignore
        var _charToDelete = inputValue.charAt(currentInputCursor - 1);

        // if backspace pressed behind a decimal point, just move cursor over 1 space to left
        if (_charToDelete === '.' || _charToDelete === ',') {
          document.getElementById(inputCtr[0].id)
          // @ts-ignore
          .setSelectionRange(currentInputCursor - 1, currentInputCursor - 1);
          event.preventDefault();
          return;
        }

        // pressing backspace on any number values after the decimal place should set them to zero
        // and move cursor over 1 position to the left
        // @ts-ignore
        if (currentInputCursor >= inputValue.length - 2) {
          var _newValue =
          // @ts-ignore
          inputValue.substring(0, currentInputCursor - 1) + '0' +
          // @ts-ignore
          inputValue.substring(currentInputCursor);
          inputCtr.val(_newValue);
          document.getElementById(inputCtr[0].id)
          // @ts-ignore
          .setSelectionRange(currentInputCursor - 1, currentInputCursor - 1);
          event.preventDefault();
          return;
        }
      }
    });
    inputCtr.on('focusin', function (event) {
      $(this).data('val', $(this).val());
    });
    inputCtr.on('input', function (event) {
      handleNewValueEntered($(this), skipCalculatingBudget);
    });
    inputCtr.on('keypress', function (event) {
      var pressedKeyCode = event.which; // pressed key on the keyboard.

      if (pressedKeyCode >= 48 && pressedKeyCode <= 57 ||
      // key 0's code: 48 |Key 1's code: 49 | key 9's code: 57
      pressedKeyCode === 45 && allowNegatives // negative value is allowed
      ) {
        var inputValue = inputCtr.val();

        // @ts-ignore
        var isNegative = inputValue.includes('-');
        var currentInputCursor = document.getElementById(inputCtr[0].id
        // @ts-ignore
        ).selectionStart;
        if (pressedKeyCode >= 49 && pressedKeyCode <= 57 && inputValue === '0.00' && currentInputCursor === 0) {
          var newVal = inputValue.split('');
          newVal[0] = String.fromCharCode(pressedKeyCode);
          // @ts-ignore
          newVal = newVal.join('');
          inputCtr.val(newVal);
          document.getElementById(inputCtr[0].id)
          // @ts-ignore
          .setSelectionRange(currentInputCursor + 1, currentInputCursor + 1);
          event.preventDefault();
          return;
        }
        if (
        // @ts-ignore
        (inputValue.length > 0 && !isNegative ||
        // @ts-ignore
        inputValue.length > 1 && isNegative) &&
        // @ts-ignore
        inputValue.length === currentInputCursor) {
          event.preventDefault();
          return;
        }
        if (pressedKeyCode === 45 && allowNegatives) {
          // @ts-ignore
          if (currentInputCursor !== 0 || inputValue.includes('-')) {
            event.preventDefault();
            return;
          }
          if (currentInputCursor === 0) {
            // @ts-ignore
            var value = parseFloat(inputValue.replace(/,/g, ''));
            if (value && value != 0) {
              inputCtr.val("-".concat(value.toFixed(2)));
              // @ts-ignore
              document.getElementById(inputCtr[0].id).setSelectionRange(0, 0);
              handleNewValueEntered(inputCtr, skipCalculatingBudget);
              event.preventDefault();
            } else if (inputValue == '' || inputValue === '0.00') {
              inputCtr.val('-');
            }
          }
          event.preventDefault();
          return;
        }
        if (limitInputValue) {
          // @ts-ignore
          var _value = parseFloat(inputValue.replace(/,/g, ''));
          var limitValue = parseFloat(limitInputValue.replace(/,/g, ''));
          if (isNaN(_value)) _value = 0.0;
          if (_value > limitValue) {
            inputCtr.val(limitInputValue);
          }
        }
        var totalMaxDigits = maxDigits;
        // @ts-ignore
        inputValue.length;
        if (isNegative) {
          totalMaxDigits += 1;
        }
        if (currentInputCursor > 0 &&
        // @ts-ignore
        inputValue.length - 2 > 0 &&
        // @ts-ignore
        currentInputCursor >= inputValue.length - 2 // || adding number after decimal place
        /*             inputValue.length <= totalMaxDigits */) {
          // @ts-ignore
          var _newVal = inputValue.split('');
          _newVal[currentInputCursor] = String.fromCharCode(pressedKeyCode);
          _newVal = _newVal.join('');
          inputCtr.val(_newVal);
          document.getElementById(inputCtr[0].id)
          // @ts-ignore
          .setSelectionRange(currentInputCursor + 1, currentInputCursor + 1);
          // if (inputValue == "0.00") {
          //   inputCtr.val(""); // Solve issue when entering the 1st number before '0.00'
          // }
          event.preventDefault();
          return;
        } // Only allow max 9,999,999.99

        // @ts-ignore
        if (inputValue.length <= totalMaxDigits) {
          return;
        }

        /*           if (inputValue == "-0.00") {
                    inputCtr.val("0.00");
                  } */
      }
      event.preventDefault();
    });

    // if (emptyInitialValue && inputCtr.val() === "0.00") {
    //   inputCtr.val("");
    // }
  }
  function handleNewValueEntered(inputCtr) {
    var skipCalculatingBudget = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var newAmount = inputCtr.val();
    var isNegative = newAmount.includes('-');
    var cleanDecimalValue = newAmount.replace(/,/g, '').replace('$', '').replaceAll('-', '');
    if (isNaN(cleanDecimalValue)) cleanDecimalValue = 0.0;
    var newAmountWithCurrencyFormat = CURRENCY_FORMAT.format(cleanDecimalValue);
    if (newAmountWithCurrencyFormat) {
      logger$a.info({
        fn: handleNewValueEntered,
        message: "newAmountWithCurrencyFormat: ".concat(newAmountWithCurrencyFormat)
      });
      var currentInputCursor = document.getElementById(inputCtr[0].id
      // @ts-ignore
      ).selectionStart;
      var newValue = newAmountWithCurrencyFormat.replace('CA$', '');
      inputCtr.val("".concat(isNegative ? '-' : '').concat(newValue));
      if (!skipCalculatingBudget) {
        calculateEstimatedActivityBudget();
      }
      var isAddition = false;
      if (newAmount.length > inputCtr.data('val').length) {
        isAddition = true;
      }
      var prevNumberOfCommas = (inputCtr.data('val').match(/,/g) || []).length;
      var newNumberOfCommas = (inputCtr.val().match(/,/g) || []).length;
      if (newNumberOfCommas !== prevNumberOfCommas) {
        if (isAddition) {
          currentInputCursor++; // fixed issue when the current input cursor jump back
        } else {
          if (currentInputCursor - 1 >= 0) {
            currentInputCursor--;
          } else {
            currentInputCursor = 0;
          }
        }
      }
      document.getElementById(inputCtr[0].id)
      // @ts-ignore
      .setSelectionRange(currentInputCursor, currentInputCursor);
    }
    inputCtr.data('val', inputCtr.val());
  }

  var logger$9 = Logger('common/masking');

  // supported masking types
  var FieldMaskType = {
    CRA: 'CRA',
    PostalCode: 'PostalCode',
    PhoneNumber: 'PhoneNumber',
    Number: 'Number',
    Email: 'Email'
  };

  // map mask type to jquery mask format
  var MaskTypeFormat = {
    CRA: '000000000',
    PostalCode: 'S0S 0S0',
    PhoneNumber: '(000) 000-0000'
  };
  function maskInput(fieldName, type) {
    logger$9.info({
      fn: maskInput,
      message: "applying mask input to fieldName: ".concat(fieldName, " of type: ").concat(type)
    });
    if (!Object.keys(FieldMaskType).includes(type)) {
      logger$9.error({
        fn: maskInput,
        message: "unsupported mask, cannot mask input for fieldName: ".concat(fieldName, " and type: ").concat(type)
      });
      return;
    }
    useScript(Scripts.jquerymask, function () {
      var _$, _$2, _$3;
      switch (type) {
        case FieldMaskType.CRA:
        case FieldMaskType.PostalCode:
        case FieldMaskType.PhoneNumber:
          // @ts-ignore
          (_$ = $("#".concat(fieldName))) === null || _$ === void 0 || _$.mask(MaskTypeFormat[type]);
          break;
        case FieldMaskType.Email:
          // @ts-ignore
          (_$2 = $("#".concat(fieldName))) === null || _$2 === void 0 || _$2.mask('A', {
            translation: {
              A: {
                pattern: /[\w@\-.+]/,
                recursive: true
              }
            }
          });
          break;
        case FieldMaskType.Number:
          // @ts-ignore
          (_$3 = $("#".concat(fieldName))) === null || _$3 === void 0 || _$3.mask('Z#', {
            translation: {
              Z: {
                pattern: /[1-9]/
              }
            }
          });
          break;
        default:
          logger$9.error({
            fn: maskInput,
            message: "did NOT apply masking to fieldName: ".concat(fieldName, " of type: ").concat(type)
          });
          return;
      }
      logger$9.info({
        fn: maskInput,
        message: "successfully applied mask input to fieldName: ".concat(fieldName, " of type: ").concat(type)
      });
    });
  }

  function setupTooltip(field) {
    var name = field.name,
      tooltipText = field.tooltipText,
      tooltipTargetElementId = field.tooltipTargetElementId;
    if (tooltipText) {
      var tooltipTargetElement = $("#".concat(tooltipTargetElementId !== null && tooltipTargetElementId !== void 0 ? tooltipTargetElementId : name));
      tooltipTargetElement.attr('data-content', tooltipText);
      tooltipTargetElement.attr('data-placement', 'bottom');
      tooltipTargetElement.attr('data-html', 'true');
      tooltipTargetElement.attr('data-trigger', 'hover');
      tooltipTargetElement.attr('data-original-title', '');
      tooltipTargetElement
      // @ts-ignore
      .popover({
        trigger: 'manual',
        html: true,
        animation: false
      }).on('mouseenter', function () {
        var _this = this;
        // @ts-ignore
        $(this).popover('show');
        $('.popover').on('mouseleave', function () {
          // @ts-ignore
          $(_this).popover('hide');
        });
      }).on('mouseleave', function () {
        var _this = this;
        setTimeout(function () {
          if (!$('.popover:hover').length) {
            // @ts-ignore
            $(_this).popover('hide');
          }
        }, 300);
      });
    }
  }

  var logger$8 = Logger('common/setRequired');
  function setStepRequiredFields(stepName) {
    // TODO: Remove this old func usage
    var fields;
    if (getOptions().form === Form.Application) {
      // fields = getFieldsBySectionOld(stepName);
      fields = getFieldsBySectionNew(stepName);
    } else {
      fields = getFieldsBySection(stepName);
    }
    if (!fields) return;
    for (var i = 0; i < fields.length; i++) {
      var _fields$i = fields[i],
        name = _fields$i.name,
        elementType = _fields$i.elementType,
        required = _fields$i.required,
        validation = _fields$i.validation,
        hidden = _fields$i.hidden,
        format = _fields$i.format,
        allowNegatives = _fields$i.allowNegatives,
        maxDigits = _fields$i.maxDigits,
        emptyInitialValue = _fields$i.emptyInitialValue,
        maxLength = _fields$i.maxLength,
        label = _fields$i.label,
        type = _fields$i.type,
        tooltipText = _fields$i.tooltipText,
        tooltipTargetElementId = _fields$i.tooltipTargetElementId,
        _fields$i$skipCalcula = _fields$i.skipCalculatingBudget,
        skipCalculatingBudget = _fields$i$skipCalcula === void 0 ? undefined : _fields$i$skipCalcula,
        hideLabel = _fields$i.hideLabel,
        readOnly = _fields$i.readOnly,
        _fields$i$doNotBlank = _fields$i.doNotBlank,
        doNotBlank = _fields$i$doNotBlank === void 0 ? false : _fields$i$doNotBlank,
        fileTypes = _fields$i.fileTypes;
      logger$8.info({
        fn: setStepRequiredFields,
        message: "setting field definition for ".concat(name)
      });
      if (hasUpperCase(name)) {
        logger$8.warn({
          fn: setStepRequiredFields,
          message: "Warning! Field name: ".concat(name, " contains an uppercase letter, please confirm if it was intentional or not.")
        });
      }
      if (type === 'SectionTitle' && hidden) {
        var sectionElement = $("fieldset[aria-label=\"".concat(name, "\"]"));
        if (sectionElement) {
          sectionElement === null || sectionElement === void 0 || sectionElement.css('display', 'none');
        }
        // continuing for type SectionTitle because nothing else is supported for this field type
        continue;
      }
      setupTooltip({
        name: name,
        tooltipText: tooltipText,
        tooltipTargetElementId: tooltipTargetElementId
      });
      if (label) {
        var _$, _obj$html;
        var obj = (_$ = $("#".concat(name, "_label"))) === null || _$ === void 0 ? void 0 : _$.text(label);
        obj === null || obj === void 0 || obj.html(obj === null || obj === void 0 || (_obj$html = obj.html()) === null || _obj$html === void 0 ? void 0 : _obj$html.replace(/\n/g, '<br/>'));
      }
      if (hideLabel) {
        var _$2;
        (_$2 = $("#".concat(name, "_label"))) === null || _$2 === void 0 || _$2.css('display', 'none');
      }
      if (required) {
        if (elementType) {
          setRequiredField(name, elementType);
        } else {
          setRequiredField(name);
        }
      }
      if (validation) {
        addValidationCheck(name, validation);
      }
      if (hidden) {
        hideFieldByFieldName(name, validateStepFields(stepName), doNotBlank);
      }
      // max characters
      if (maxLength) {
        setInputMaxLength(name, maxLength);
      }
      if (readOnly) {
        setFieldReadOnly(name);
      }
      if (format === 'email') {
        maskInput(name, FieldMaskType.Email);
        validateEmailAddressField(name);
      } else if (format === 'currency') {
        customizeCurrencyInput(_objectSpread2(_objectSpread2(_objectSpread2(_objectSpread2({
          inputId: name
        }, skipCalculatingBudget !== undefined ? {
          skipCalculatingBudget: skipCalculatingBudget
        } : {
          skipCalculatingBudget: true
        }), maxDigits ? {
          maxDigits: maxDigits
        } : {
          maxDigits: 13
        }), emptyInitialValue && {
          emptyInitialValue: emptyInitialValue
        }), allowNegatives && {
          allowNegatives: allowNegatives
        }));
      } else if (format === 'percentage') {
        customizeCurrencyInput({
          inputId: name,
          skipCalculatingBudget: true,
          maxDigits: 5,
          limitInputValue: '100.00',
          hideDollarSign: true
        });
      } else if (format === 'number') {
        $("#".concat(name)).attr('type', 'number');
      } else if (format === 'cra') {
        maskInput(name, FieldMaskType.CRA);
      } else if (format === 'phoneNumber') {
        maskInput(name, FieldMaskType.PhoneNumber);
      } else if (format === 'postalCode') {
        maskInput(name, FieldMaskType.PostalCode);
      }
      if (elementType === HtmlElementType.FileInput) {
        var _$3;
        var defaultFileTypes = '.csv,.doc,.docx,.odt,.pdf,.xls,.xlsx,.ods,.gif,.jpeg,.jpg,.png,.svg,.tif';
        (_$3 = $("#".concat(name, "_AttachFile"))) === null || _$3 === void 0 || _$3.attr('accept', fileTypes !== null && fileTypes !== void 0 ? fileTypes : defaultFileTypes);
      }
    }
    setDynamicallyRequiredFields(stepName);
  }
  function setRequiredField(fieldName) {
    var elemType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : HtmlElementType.Input;
    var validationErrorMessage = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'Required field';
    $("#".concat(fieldName, "_label")).parent().addClass('required');
    // @ts-ignore
    $("#".concat(fieldName)).attr('required', true);
    var div = document.createElement('div');
    div.id = "".concat(fieldName, "_error_message");
    div.className = 'error_message';
    // @ts-ignore
    div.style = 'display:none;';
    div.innerHTML = "<span'>".concat(validationErrorMessage, "</span>");
    $("#".concat(fieldName)).parent().append(div);
    switch (elemType) {
      case HtmlElementType.FileInput:
        observeChanges($("input[id=".concat(fieldName, "_AttachFile]"))[0]);
        $("#".concat(fieldName, "_AttachFile")).on('blur input', function () {
          validateRequiredFields();
        });
        break;
      case HtmlElementType.DatePicker:
        observeChanges($("input[id=".concat(fieldName, "_datepicker_description]")).parent()[0]);
        $("#".concat(fieldName, "_datepicker_description")).on('blur input', function () {
          validateRequiredFields();
        });
        break;
      case HtmlElementType.SingleOptionSet:
      case HtmlElementType.MultiOptionSet:
        $("input[id*='".concat(fieldName, "']")).on('change', function () {
          validateRequiredFields();
          logger$8.info({
            fn: setRequiredField,
            message: 'Q3 updated... validateRequiredFields...'
          });
        });
        break;
      case HtmlElementType.DropdownSelect:
        $("select[id*='".concat(fieldName, "']")).on('change', function () {
          validateRequiredFields();
        });
        break;
      default:
        // HtmlElementTypeEnum.Input
        $("#".concat(fieldName)).on('change keyup', function (event) {
          validateRequiredFields();
        });
        break;
    }
  }
  function setDynamicallyRequiredFields(stepName) {
    // check which fields we are dynamically being required
    // TODO: Remove this old func usage
    var fields;
    if (getOptions().form === Form.Application) {
      // fields = getFieldsBySectionOld(stepName);
      fields = getFieldsBySectionNew(stepName);
    } else {
      fields = getFieldsBySection(stepName);
    }
    if (!fields) return;
    Object.keys(localStorage).filter(function (x) {
      return x.startsWith('shouldRequire_');
    }).forEach(function (x) {
      var fieldId = x.replace('shouldRequire_', '');
      var fieldDefinition = fields.find(function (field) {
        return field.name === fieldId;
      });
      if (fieldDefinition && fieldDefinition.elementType) {
        setRequiredField(fieldId, fieldDefinition.elementType);
      } else {
        setRequiredField(fieldId);
      }
    });
  }

  function initOnChange_DependentRequiredField(_ref) {
    var dependentOnValue = _ref.dependentOnValue,
      dependentOnValueArray = _ref.dependentOnValueArray,
      dependentOnElementTag = _ref.dependentOnElementTag,
      requiredFieldTag = _ref.requiredFieldTag,
      _ref$overrideTruthyCl = _ref.overrideTruthyClause,
      overrideTruthyClause = _ref$overrideTruthyCl === void 0 ? undefined : _ref$overrideTruthyCl,
      validationFunc = _ref.validationFunc,
      setRequiredFieldsFunc = _ref.setRequiredFieldsFunc,
      _ref$disableRequiredP = _ref.disableRequiredProp,
      disableRequiredProp = _ref$disableRequiredP === void 0 ? false : _ref$disableRequiredP,
      customFunc = _ref.customFunc;
    var dependentOnElement = document.querySelector("#".concat(dependentOnElementTag));
    if (!dependentOnElement) return;

    // INITIAL LOAD/SETUP:
    setupDependentRequiredField({
      dependentOnValue: dependentOnValue,
      dependentOnValueArray: dependentOnValueArray,
      dependentOnElementTag: dependentOnElementTag,
      requiredFieldTag: requiredFieldTag,
      overrideTruthyClause: overrideTruthyClause,
      validationFunc: validationFunc,
      setRequiredFieldsFunc: setRequiredFieldsFunc,
      disableRequiredProp: disableRequiredProp,
      customFunc: customFunc
    });

    // ON CHANGE:
    $(dependentOnElement).on('change', function () {
      setupDependentRequiredField({
        dependentOnValue: dependentOnValue,
        dependentOnValueArray: dependentOnValueArray,
        dependentOnElementTag: dependentOnElementTag,
        requiredFieldTag: requiredFieldTag,
        overrideTruthyClause: overrideTruthyClause,
        validationFunc: validationFunc,
        setRequiredFieldsFunc: setRequiredFieldsFunc,
        disableRequiredProp: disableRequiredProp,
        customFunc: customFunc
      });
    });
  }
  function setupDependentRequiredField(_ref2) {
    var dependentOnValue = _ref2.dependentOnValue,
      _ref2$dependentOnValu = _ref2.dependentOnValueArray,
      dependentOnValueArray = _ref2$dependentOnValu === void 0 ? [] : _ref2$dependentOnValu,
      dependentOnElementTag = _ref2.dependentOnElementTag,
      requiredFieldTag = _ref2.requiredFieldTag,
      _ref2$overrideTruthyC = _ref2.overrideTruthyClause,
      overrideTruthyClause = _ref2$overrideTruthyC === void 0 ? undefined : _ref2$overrideTruthyC,
      validationFunc = _ref2.validationFunc,
      setRequiredFieldsFunc = _ref2.setRequiredFieldsFunc,
      _ref2$disableRequired = _ref2.disableRequiredProp,
      disableRequiredProp = _ref2$disableRequired === void 0 ? false : _ref2$disableRequired,
      customFunc = _ref2.customFunc;
    var dependentOnElement = document.querySelector("#".concat(dependentOnElementTag));
    if (!dependentOnElement) return;
    // @ts-ignore
    var input = dependentOnElement.value;
    if (overrideTruthyClause != undefined) {
      if (overrideTruthyClause === true) {
        shouldRequireDependentField({
          shouldBeRequired: true,
          requiredFieldTag: requiredFieldTag,
          validationFunc: validationFunc,
          setRequiredFieldsFunc: setRequiredFieldsFunc,
          disableRequiredProp: disableRequiredProp,
          customFunc: customFunc
        });
      } else {
        shouldRequireDependentField({
          shouldBeRequired: false,
          requiredFieldTag: requiredFieldTag,
          validationFunc: validationFunc,
          setRequiredFieldsFunc: setRequiredFieldsFunc,
          disableRequiredProp: disableRequiredProp,
          customFunc: customFunc
        });
      }
    } else {
      if (input === dependentOnValue || dependentOnValueArray.includes(input)) {
        shouldRequireDependentField({
          shouldBeRequired: true,
          requiredFieldTag: requiredFieldTag,
          validationFunc: validationFunc,
          setRequiredFieldsFunc: setRequiredFieldsFunc,
          disableRequiredProp: disableRequiredProp,
          customFunc: customFunc
        });
      } else {
        shouldRequireDependentField({
          shouldBeRequired: false,
          requiredFieldTag: requiredFieldTag,
          validationFunc: validationFunc,
          setRequiredFieldsFunc: setRequiredFieldsFunc,
          disableRequiredProp: disableRequiredProp,
          customFunc: customFunc
        });
      }
    }
  }
  function shouldRequireDependentField(_ref3) {
    var shouldBeRequired = _ref3.shouldBeRequired,
      requiredFieldTag = _ref3.requiredFieldTag,
      _ref3$validationFunc = _ref3.validationFunc,
      validationFunc = _ref3$validationFunc === void 0 ? validateStepFields : _ref3$validationFunc,
      _ref3$setRequiredFiel = _ref3.setRequiredFieldsFunc,
      setRequiredFieldsFunc = _ref3$setRequiredFiel === void 0 ? setDynamicallyRequiredFields : _ref3$setRequiredFiel,
      disableRequiredProp = _ref3.disableRequiredProp,
      customFunc = _ref3.customFunc;
    var requiredFieldLabelElement = document.querySelector("#".concat(requiredFieldTag, "_label"));
    var requiredFieldRow = requiredFieldLabelElement.closest('tr');
    var requiredFieldInputElement = document.querySelector("#".concat(requiredFieldTag));
    if (!requiredFieldLabelElement || !requiredFieldRow || !requiredFieldInputElement) return;
    if (shouldBeRequired) {
      $(requiredFieldRow).css({
        display: ''
      });
      if (!disableRequiredProp) {
        // @ts-ignore
        localStorage.setItem("shouldRequire_".concat(requiredFieldTag), true);
        if (setRequiredFieldsFunc) {
          setRequiredFieldsFunc(getCurrentStep());
        }
        if (validationFunc) {
          validationFunc(getCurrentStep());
          // re-validate every time user modifies additional info input
          $(requiredFieldInputElement).change(function () {
            validationFunc(getCurrentStep());
          });
        }
      }
    } else {
      var _$;
      $(requiredFieldRow).css({
        display: 'none'
      });
      if (!disableRequiredProp) {
        $("#".concat(requiredFieldTag, "_label")).parent().removeClass('required');
        localStorage.removeItem("shouldRequire_".concat(requiredFieldTag));
        if (setRequiredFieldsFunc) {
          setRequiredFieldsFunc(getCurrentStep());
        }
        if (validationFunc) {
          validationFunc(getCurrentStep());
        }
        $(requiredFieldInputElement).off('change');
      }
      (_$ = $("#".concat(requiredFieldTag, "_name"))) === null || _$ === void 0 || _$.val(''); // needed for lookup search/modal input elements
      $(requiredFieldInputElement).val('');
    }
    if (customFunc) {
      customFunc();
    }
  }

  var logger$7 = Logger('application/steps/applicantInfo');
  function customizeApplicantInfoStep(programData) {
    setupApplicantInfoStepFields();
    initOnChange_PreviouslyReceivedKttpFunding();
    initOnChange_OrganizationReceivedFundingFromBC();
    initOnChange_IsCollaboratingWithOtherOrganizationQuestion();
    initOnChange_ActivityOverMultipleDays();
    initOnChange_AdaptedEventForAdultLearning();
    handleApplicantWithAndWithoutCRA_GST();
    initOrgNameAutocomplete();
    customizeTypesOfBusinessOrganization(programData);
    if (getProgramAbbreviation().includes('ABPP')) {
      customizeApplicantInfoStepForABPP();
    }
    if (getProgramAbbreviation() === 'NEFBA') {
      customizeApplicantInfoStepForNEFBA();
    }
  }
  function initOnChange_PreviouslyReceivedKttpFunding() {
    var selectOptionControl = $('#quartech_hasthisorganizationreceivedkttpfundingin');
    var selectedValue = selectOptionControl.val();
    hideShow_for_PreviouslyReceivedKttpFunding(selectedValue);
    logger$7.info({
      fn: initOnChange_PreviouslyReceivedKttpFunding,
      message: 'initOnChange_PreviouslyReceivedKttpFunding called.'
    });
    selectOptionControl.on('change', function () {
      var selectedValue = $(this).val();
      logger$7.info({
        fn: initOnChange_PreviouslyReceivedKttpFunding,
        message: "Selected Value: ".concat(selectedValue)
      });
      hideShow_for_PreviouslyReceivedKttpFunding(selectedValue);
    });
  }
  function hideShow_for_PreviouslyReceivedKttpFunding(selectedValue) {
    var cssDisplay = 'none';
    if (selectedValue === YES_VALUE) {
      cssDisplay = 'table-row';
    }
    var explainForPreviouslyReceivedKttpFunding_TrContainer = $('#quartech_ifyespleaseexplainwhenandforwhichactivity').parent().parent().parent();
    explainForPreviouslyReceivedKttpFunding_TrContainer.css('display', cssDisplay);
  }
  function initOnChange_OrganizationReceivedFundingFromBC() {
    var organizationReceivedFundingFromBC_SelectCtr = $('#quartech_hasthisorganizationreceivedfundingfrmother');
    var selectedValue = organizationReceivedFundingFromBC_SelectCtr.val();
    hideShow_for_OrganizationReceivedFundingFromBC(selectedValue);
    logger$7.info({
      fn: initOnChange_OrganizationReceivedFundingFromBC,
      message: 'initOnChange_OrganizationReceivedFundingFromBC called.'
    });
    organizationReceivedFundingFromBC_SelectCtr.on('change', function () {
      var selectedValue = $(this).val();
      logger$7.info({
        fn: initOnChange_OrganizationReceivedFundingFromBC,
        message: "Selected Value: ".concat(selectedValue)
      });
      hideShow_for_OrganizationReceivedFundingFromBC(selectedValue);
    });
  }
  function hideShow_for_OrganizationReceivedFundingFromBC(selectedValue) {
    var cssDisplay = 'none';
    if (selectedValue === YES_VALUE) {
      cssDisplay = 'table-row';
    }
    var collaboratingOrganizationName_TrContainer = $('#quartech_ifyespleaseexplainwhenandfromwhichprogram').parent().parent().parent();
    collaboratingOrganizationName_TrContainer.css('display', cssDisplay);
  }
  function initOnChange_IsCollaboratingWithOtherOrganizationQuestion() {
    var collaboratingWithOtherOrgsControl = $('#quartech_areyoucollaboratingwithanyotherorg');
    var selectedValue = collaboratingWithOtherOrgsControl.val();
    hideShow_for_CollaboratingWithOtherOrgsControl(selectedValue);
    logger$7.info({
      fn: initOnChange_IsCollaboratingWithOtherOrganizationQuestion,
      message: 'initOnChange_IsCollaboratingWithOtherOrganizationQuestion called.'
    });
    collaboratingWithOtherOrgsControl.on('change', function () {
      var selectedValue = $(this).val();
      logger$7.info({
        fn: initOnChange_IsCollaboratingWithOtherOrganizationQuestion,
        message: "Selected Value: ".concat(selectedValue)
      });
      hideShow_for_CollaboratingWithOtherOrgsControl(selectedValue);
    });
  }
  function hideShow_for_CollaboratingWithOtherOrgsControl(selectedValue) {
    var cssDisplay = 'none';
    if (selectedValue === YES_VALUE) {
      cssDisplay = 'table-row';
    }
    var collaboratingOrganizationName_TrContainer = $('#quartech_ifyespleaseprovidelegalbusinessorganization').parent().parent().parent();
    collaboratingOrganizationName_TrContainer.css('display', cssDisplay);
    var collaboratingOrganizationContactName_TrContainer = $('#quartech_ifyespleaseprovideacontactname').parent().parent().parent();
    collaboratingOrganizationContactName_TrContainer.css('display', cssDisplay);
    var collaboratingOrganizationBackground_TrContainer = $('#quartech_ifyespleaseprovideabriefbackgroundoutlinin').parent().parent().parent();
    collaboratingOrganizationBackground_TrContainer.css('display', cssDisplay);
  }
  function initOnChange_ActivityOverMultipleDays() {
    var selectOptionControl = $('#quartech_doestheactivitytakeplaceovermultipleday');
    var selectedValue = selectOptionControl.val();
    hideShow_for_ActivityOverMultipleDays(selectedValue);
    logger$7.info({
      fn: initOnChange_ActivityOverMultipleDays,
      message: 'initOnChange_ActivityOverMultipleDays called.'
    });
    selectOptionControl.on('change', function () {
      var selectedValue = $(this).val();
      logger$7.info({
        fn: initOnChange_ActivityOverMultipleDays,
        message: "Selected Value: ".concat(selectedValue)
      });
      hideShow_for_ActivityOverMultipleDays(selectedValue);
    });
  }
  function hideShow_for_ActivityOverMultipleDays(selectedValue) {
    var cssDisplay = 'none';
    if (selectedValue === YES_VALUE) {
      cssDisplay = 'table-row';
    } else {
      $('#quartech_ifyespleaseprovidetheadditionaldates').val('');
    }
    var additionalDates_TrContainer = $('#quartech_ifyespleaseprovidetheadditionaldates').parent().parent().parent();
    additionalDates_TrContainer.css('display', cssDisplay);
  }
  function initOnChange_AdaptedEventForAdultLearning() {
    var selectOptionControl = $('#quartech_theprocessoflearningandprocessingknowledge');
    var selectedValue = selectOptionControl.val();
    hideShow_for_AdaptedEventForAdultLearning(selectedValue);
    logger$7.info({
      fn: initOnChange_AdaptedEventForAdultLearning,
      message: 'initOnChange_AdaptedEventForAdultLearning called.'
    });
    selectOptionControl.on('change', function () {
      var selectedValue = $(this).val();
      logger$7.info({
        fn: initOnChange_AdaptedEventForAdultLearning,
        message: "Selected Value: ".concat(selectedValue)
      });
      hideShow_for_AdaptedEventForAdultLearning(selectedValue);
    });
  }
  function hideShow_for_AdaptedEventForAdultLearning(selectedValue) {
    var cssDisplay = 'none';
    if (selectedValue === YES_VALUE) {
      cssDisplay = 'table-row';
    } else {
      $('#quartech_ifyespleasedescribehowtheproposedactivitie').val('');
    }
    var describeProposedActivitiesForAdultLearning_TrContainer = $('#quartech_ifyespleasedescribehowtheproposedactivitie').parent().parent().parent();
    describeProposedActivitiesForAdultLearning_TrContainer.css('display', cssDisplay);
  }
  function handleApplicantWithAndWithoutCRA_GST() {
    var isApplicantWithoutCraOrGstNumber = $('#quartech_nocragstnumber').prop('checked');
    showHideForApplicantWithAndWithoutCRA_GST(isApplicantWithoutCraOrGstNumber);
    $('#quartech_nocragstnumber').on('change', function () {
      var isApplicantWithoutCraOrGstNumber = $(this).prop('checked');
      showHideForApplicantWithAndWithoutCRA_GST(isApplicantWithoutCraOrGstNumber);
    });
  }
  function showHideForApplicantWithAndWithoutCRA_GST(isApplicantWithoutCraOrGstNumber) {
    var craGstNumberInputCtr = $('#quartech_businessregistrationnumber');
    var craGstNumberInputCtrTrRow = craGstNumberInputCtr.parent().parent().parent();
    var reasonWithoutCraOrGstTextAreaCtr = $('#quartech_reasonwhynocraorgstnumber');
    var reasonWithoutCraOrGstTextAreaCtrTrRow = reasonWithoutCraOrGstTextAreaCtr.parent().parent().parent();
    if (isApplicantWithoutCraOrGstNumber) {
      craGstNumberInputCtr.val(''); // clear CRA or GST number field
      craGstNumberInputCtrTrRow.css('display', 'none');
      reasonWithoutCraOrGstTextAreaCtrTrRow.css('display', 'table-row');
    } else {
      reasonWithoutCraOrGstTextAreaCtr.val(''); // clear Reason WHY without CRA or GST number field
      reasonWithoutCraOrGstTextAreaCtrTrRow.css('display', 'none');
      craGstNumberInputCtrTrRow.css('display', 'table-row');
    }
    validateStepFields('ApplicantInfoStep');
  }
  function initOrgNameAutocomplete() {
    var legalBusinessOrgNameElement = document.querySelector('#quartech_legalbusinessororganizationname');
    if (!legalBusinessOrgNameElement) return;
    // @ts-ignore
    $(legalBusinessOrgNameElement).autocomplete({
      source: function source(request, response) {
        getOrgbookAutocompleteData({
          searchStr: request.term,
          onSuccess: function onSuccess(data) {
            var results = data.total ? data.results : [];
            response(results);
          }
        });
      },
      minLength: 2,
      select: function select(event, ui) {
        var isApplicantWithoutCraOrGstNumber = $('#quartech_nocragstnumber').prop('checked');
        if (!isApplicantWithoutCraOrGstNumber) getTopic(ui.item);
      }
    });
  }
  function getTopic(selected) {
    $.ajax({
      url: 'https://orgbook.gov.bc.ca/api/v4/search/topic',
      data: {
        q: selected.topic_source_id
      }
    }).done(function (response) {
      var topic = response.total && response.results.find(function (_topic) {
        return _topic.source_id === selected.topic_source_id;
      });
      getTopicCredentials(topic || null);
    }).fail(function (e) {
      logger$7.error({
        fn: getTopic,
        message: 'Unable to get topic',
        data: e
      });
    });
  }
  function getTopicCredentials(topic) {
    if (!(topic && topic.id)) return;
    $.ajax({
      url: 'https://orgbook.gov.bc.ca/api/v4/topic/' + topic.id + '/credential-set'
    }).done(function (response) {
      var latestValidCredentials = response && response.length && response.reduce(function (_latest, _set) {
        return _latest.concat(_set.credentials.filter(function (credential) {
          return credential.id === _set.latest_credential_id;
        }));
      }, []).filter(function (credential) {
        return !credential.revoked;
      });
      updateBusinessNumberField(topic, latestValidCredentials);
    }).fail(function (e) {
      logger$7.error({
        fn: getTopicCredentials,
        message: 'Unable to get topic credentials',
        data: e
      });
    });
  }
  function updateBusinessNumberField(topic, credentials) {
    var bnCred = credentials.find(function (credential) {
      return credential.credential_type.description === 'business_number.registries.ca';
    });
    var orgBNInput = document.querySelector('#quartech_businessregistrationnumber');
    if (!orgBNInput || !bnCred) return;
    var bnAttr = bnCred.attributes.find(function (attribute) {
      return attribute.type === 'business_number';
    });
    // @ts-ignore
    orgBNInput.value = bnAttr && bnAttr.value || '';
    $(orgBNInput).trigger('change');
  }
  function setupApplicantInfoStepFields() {
    setStepRequiredFields('ApplicantInfoStep');
    var programAbbreviation = getProgramAbbreviation();
    if (programAbbreviation && programAbbreviation === 'NEFBA') {
      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnValue: '255550001',
        dependentOnElementTag: 'quartech_fillingfarmingincomeontaxreturn',
        requiredFieldTag: 'quartech_firstyearclaimedfarmingincome',
        validationFunc: validateStepFields
      });
      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnValue: '255550000',
        dependentOnElementTag: 'quartech_fillingfarmingincomeontaxreturn',
        requiredFieldTag: 'quartech_firstyearfarmoperationgeneratingrevenue',
        validationFunc: validateStepFields
      });
    }
    if (programAbbreviation && programAbbreviation.includes('ABPP')) {
      if (!document.querySelector('#tipReportNotice')) {
        var htmlContentToAddBelowTipReport = "<div id=\"tipReportNotice\" style=\"padding-top: 50px;\">\n      The TIP report is a free, simplified cash-basis farm financial analysis, which provides you with a cost of production (COP) report to compare your own farm\u2019s current year (income and expenses) to your previous 5-year average and to benchmarks with other farms of similar type and income range: <a style=\"color:blue\" href=\"https://www2.gov.bc.ca/gov/content/industry/agriculture-seafood/business-market-development/agrifood-business-management/running-a-farm-business/towards-increased-profits-report\">Towards Increased Profits (TIP) report - Province of British Columbia (gov.bc.ca)\u200B</a>.\n      </div>";
        addTextBelowField('quartech_tipreportenrolled', htmlContentToAddBelowTipReport);
      }

      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnValue: '255550001',
        dependentOnElementTag: 'quartech_agriprogramsubscriber',
        requiredFieldTag: 'quartech_tipreportenrolled',
        customFunc: setShowOrHideTipNotice
      });
      setShowOrHideTipNotice();
    }
    if (programAbbreviation && (programAbbreviation.includes('ABPP') || programAbbreviation === 'NEFBA')) {
      addTextAboveField('quartech_indigenousapplicant', '<div>The Province is committed to supporting the success of Indigenous businesses in the agriculture and food sector. We understand that Indigenous businesses may have distinct characteristics reflecting regulatory, operational, cultural, and other factors. We aim for flexibility in our program delivery to reduce barriers and ensure the accessibility of our programs. If you are interested in applying to the Program but have questions about the application process or eligibility criteria, please contact Program staff at Agribusiness@gov.bc.ca<br /><br /></div>');
      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnValue: '255550001',
        dependentOnElementTag: 'quartech_recipienttype',
        requiredFieldTag: 'quartech_commodity',
        validationFunc: validateStepFields
      });
      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnValue: '255550001',
        dependentOnElementTag: 'quartech_recipienttype',
        requiredFieldTag: 'quartech_othercommoditiesproducedharvested',
        disableRequiredProp: true,
        validationFunc: validateStepFields
      });
      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnValue: '255550002',
        dependentOnElementTag: 'quartech_recipienttype',
        requiredFieldTag: 'quartech_primarilyprocess',
        validationFunc: validateStepFields
      });
      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnValue: '255550002',
        dependentOnElementTag: 'quartech_recipienttype',
        requiredFieldTag: 'quartech_otherproductsprocessed',
        disableRequiredProp: true,
        validationFunc: validateStepFields
      });
    }

    // Reset "What is your primary production?" value when "Type of Business / Organization" is changed
    $('#quartech_recipienttype').on('change', function () {
      $('#quartech_commodity_name').val('');
      $('#quartech_primarilyprocess_name').val('');
      $('#quartech_othercommoditiesproducedharvested_i .msos-selecteditems-container ul li').remove();
      $('#quartech_otherproductsprocessed_i .msos-selecteditems-container ul li').remove();
    });
  }
  function setShowOrHideTipNotice() {
    showOrHideTipNotice();
    $('#quartech_tipreportenrolled').on('change', function () {
      showOrHideTipNotice();
    });
    $('#quartech_agriprogramsubscriber').on('change', function () {
      showOrHideTipNotice();
    });
  }
  function showOrHideTipNotice() {
    var agriProgramSubscriptionValue = document.querySelector('#quartech_agriprogramsubscriber'
    // @ts-ignore
    ).value;
    var tipReportEnrolledValue = document.querySelector('#quartech_tipreportenrolled'
    // @ts-ignore
    ).value;
    var tipReportNoticeElement = document.querySelector('#tipReportNotice');
    if (!tipReportNoticeElement) return;
    if (agriProgramSubscriptionValue === '255550001' && (tipReportEnrolledValue === '255550002' || tipReportEnrolledValue === '255550000')) {
      $(tipReportNoticeElement).css({
        display: ''
      });
    } else {
      $(tipReportNoticeElement).css({
        display: 'none'
      });
    }
  }
  function customizeTypesOfBusinessOrganization(programData) {
    var _programData$quartech;
    hideTypesOfBusinessOrganization(programData.quartech_typesofbusinesstodisplay);
    addTooltipsToTypesOfBusinessOrganization(programData === null || programData === void 0 || (_programData$quartech = programData.quartech_ApplicantPortalConfig) === null || _programData$quartech === void 0 ? void 0 : _programData$quartech.quartech_configdata);
  }
  function hideTypesOfBusinessOrganization(typesOfBusinessToDisplay) {
    if (!typesOfBusinessToDisplay) return;
    var typesOfBusinessToDisplayDictionary = JSON.parse(typesOfBusinessToDisplay);
    if (!typesOfBusinessToDisplayDictionary) return;

    // @ts-ignore
    $('#quartech_recipienttype option').each(function () {
      // @ts-ignore
      var typeOfBusinessValue = this.value;
      if (typeOfBusinessValue != '') {
        // Hide/Show option
        var isOptionToBeHidden = typesOfBusinessToDisplayDictionary[typeOfBusinessValue] == undefined;
        if (isOptionToBeHidden) {
          this.hidden = true;
        }
      }
    });
  }
  function addTooltipsToTypesOfBusinessOrganization(configDataJSON) {
    if (!configDataJSON) return;
    var podsConfigData = JSON.parse(configDataJSON);
    var typeOfBusiness_ToolTips = podsConfigData === null || podsConfigData === void 0 ? void 0 : podsConfigData.TypeOfBusiness_ToolTips;
    if (!typeOfBusiness_ToolTips) return;

    // @ts-ignore
    $('#quartech_recipienttype option').each(function () {
      // @ts-ignore
      var typeOfBusiness_SelectControl_OptionValue = this.value;
      var configuredOption = typeOfBusiness_ToolTips[typeOfBusiness_SelectControl_OptionValue];
      if (configuredOption) {
        this.title = configuredOption.Tooltip;
      }
    });
  }
  function customizeApplicantInfoStepForABPP(programData) {
    var htmlContentToAddAboveBusinessDesc = "<div style=\"padding-bottom: 15px;\">\n    <div>Please provide a brief description of your business e.g.,</div>\n    <ul>\n      <li>For Primary Producer - farm size in production in units such as acres, metres squared, and number and type of animals, marketing channels (farm gate, wholesale, retail/use of social media)</li>\n      <li>OR For Processor - size of processing area in units such as square feet or metres, number and type of B.C. products used and/or produced, marketing channels (direct, wholesale, retail/use of social media)</li>\n    </ul>\n  </div>";
    addTextAboveField('quartech_businessdescription', htmlContentToAddAboveBusinessDesc);
  }
  function customizeApplicantInfoStepForNEFBA() {
    var businessOverviewFieldSetElement = $('fieldset[aria-label="Business Overview"]');
    if (businessOverviewFieldSetElement) businessOverviewFieldSetElement.css('display', 'none');
  }

  POWERPOD.locations = {
      processLocationData,
  };
  function processLocationData(json) {
      const dataArray = json === null || json === void 0 ? void 0 : json.value;
      const res = dataArray.reduce((acc, municipal) => {
          const { quartech_name: municipalName, quartech_RegionalDistrict } = municipal;
          const { quartech_name: regionalDistrictName } = quartech_RegionalDistrict !== null && quartech_RegionalDistrict !== void 0 ? quartech_RegionalDistrict : { quartech_name: 'Other' };
          if (!acc[regionalDistrictName]) {
              acc[regionalDistrictName] = [municipalName];
          }
          else {
              acc[regionalDistrictName].push(municipalName);
          }
          return acc;
      }, {});
      return res;
  }

  var logger$6 = Logger('application/steps/project');
  function customizeProjectStep(programData) {
    setProjectStepRequiredFields();
    setProjectStepDependentRequiredFields();
    displayLabelsForProjectStep(programData);
    customizeActivityTypesDropDownList(programData);
    initOnChange_ActiviyOpenToPublic();

    // initInputMasking();

    initAdditionalLocationsMultiSelect();
  }
  function displayLabelsForProjectStep(programData) {
    var fieldsLabelsMap = JSON.parse(programData.quartech_portalappfieldsdisplaynamesmapping);
    if (!fieldsLabelsMap) return;
    for (var _i = 0, _Object$entries = Object.entries(fieldsLabelsMap); _i < _Object$entries.length; _i++) {
      var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
        fieldName = _Object$entries$_i[0],
        label = _Object$entries$_i[1];
      var elem = $("#".concat(fieldName, "_label"));
      if (elem) {
        elem.text(label);
      }
    }
  }
  function customizeActivityTypesDropDownList(programData) {
    hideActivityTypes(programData.quartech_activitiestypestodisplay);
  }
  function hideActivityTypes(activityTypesToDisplay) {
    if (!activityTypesToDisplay) return;
    var activityTypesToDisplayDictionary = JSON.parse(activityTypesToDisplay);
    if (!activityTypesToDisplayDictionary) return;
    $('#quartech_pleaseselectthemostapplicableactivitytype option').each(
    // @ts-ignore
    function () {
      // @ts-ignore
      var activityTypeValue = this.value;
      if (activityTypeValue != '') {
        // Hide/Show option
        var isOptionToBeHidden = activityTypesToDisplayDictionary[activityTypeValue] == undefined;
        if (isOptionToBeHidden) {
          this.hidden = true;
        }
      }
    });
  }
  function initOnChange_ActiviyOpenToPublic() {
    var q2Control = $('#quartech_willthisactivitybeopentotheentirepublic');
    var selectedValue = q2Control.val();
    hideShow_WhyActiviyNotOpenToPublic(selectedValue);
    logger$6.info({
      fn: initOnChange_ActiviyOpenToPublic,
      message: 'initOnChange_ActiviyOpenToPublic called.'
    });
    q2Control.on('change', function () {
      var selectedValue = $(this).val();
      logger$6.info({
        fn: initOnChange_ActiviyOpenToPublic,
        message: "Selected Value: ".concat(selectedValue)
      });
      hideShow_WhyActiviyNotOpenToPublic(selectedValue);
    });
  }
  function hideShow_WhyActiviyNotOpenToPublic(selectedValue) {
    if (selectedValue === YES_VALUE) {
      $('#quartech_allactivitiesmustbeopentothepublicplease').parent().parent().css('display', 'none');
      $('#quartech_allactivitiesmustbeopentothepublicplease').val(''); // clear value
    } else {
      $('#quartech_allactivitiesmustbeopentothepublicplease').parent().parent().css('display', 'grid');
    }
  }
  function setProjectStepRequiredFields() {
    setStepRequiredFields('ProjectStep');
    var programAbbreviation = getProgramAbbreviation();

    // START KTTP PROJECT STEP CUSTOMIZATION
    if (programAbbreviation && programAbbreviation.includes('KTTP')) {
      var _document$querySelect;
      // START Organization Information
      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnValue: YES_VALUE,
        dependentOnElementTag: 'quartech_hasthisorganizationreceivedkttpfundingin',
        requiredFieldTag: 'quartech_ifyespleaseexplainwhenandforwhichactivity'
      });
      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnValue: YES_VALUE,
        dependentOnElementTag: 'quartech_hasthisorganizationreceivedfundingfrmother',
        requiredFieldTag: 'quartech_ifyespleaseexplainwhenandfromwhichprogram'
      });
      // END Organization Information

      // START Collaborating Organization Information
      initOnChange_DependentRequiredField({
        dependentOnValue: YES_VALUE,
        dependentOnElementTag: 'quartech_areyoucollaboratingwithanyotherorg',
        requiredFieldTag: 'quartech_ifyespleaseprovidelegalbusinessorganization',
        // @ts-ignore
        shouldBeRequired: false
      });
      initOnChange_DependentRequiredField({
        dependentOnValue: YES_VALUE,
        dependentOnElementTag: 'quartech_areyoucollaboratingwithanyotherorg',
        requiredFieldTag: 'quartech_ifyespleaseprovideacontactname',
        // @ts-ignore
        shouldBeRequired: false
      });
      initOnChange_DependentRequiredField({
        dependentOnValue: YES_VALUE,
        dependentOnElementTag: 'quartech_areyoucollaboratingwithanyotherorg',
        requiredFieldTag: 'quartech_ifyespleaseprovideabriefbackgroundoutlinin',
        // @ts-ignore
        shouldBeRequired: false
      });
      // END Collaborating Organization Information

      // START Activity Information
      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnValue: YES_VALUE,
        dependentOnElementTag: 'quartech_areyouapplyingforatraceabilityknowledget',
        requiredFieldTag: 'quartech_ifyespleaseexplainthetraceabilityactivityt'
      });
      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnValue: YES_VALUE,
        dependentOnElementTag: 'quartech_doestheactivitytakeplaceovermultipleday',
        requiredFieldTag: 'quartech_ifyespleaseprovidetheadditionaldates'
      });
      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnValue: NO_VALUE,
        dependentOnElementTag: 'quartech_willthisactivitybeopentotheentirepublic',
        requiredFieldTag: 'quartech_allactivitiesmustbeopentothepublicplease'
      });
      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnValue: OTHER_VALUE,
        dependentOnElementTag: 'quartech_pleaseselectthemostapplicableactivitytype',
        requiredFieldTag: 'quartech_ifotherpleasedescribeyouractivitytype'
      });
      // Priority Topic(s). Please select the most applicable topic(s) that your project will focus on.
      // Please select the most applicable purpose that your activity will focus on:
      var priorityTopicElements = document.querySelector('#quartech_prioritytopics_i');
      var containsOtherPriorityTopicOption = (_document$querySelect = document.querySelector('#quartech_prioritytopics_i')) === null || _document$querySelect === void 0 ? void 0 : _document$querySelect.querySelector('li[aria-label="Other for Priority Topic(s)"]');
      // initial load:
      if (containsOtherPriorityTopicOption) {
        // @ts-ignore
        initOnChange_DependentRequiredField({
          dependentOnElementTag: 'quartech_prioritytopics_i',
          requiredFieldTag: 'quartech_otherprioritytopic',
          overrideTruthyClause: true
        });
      } else {
        // @ts-ignore
        initOnChange_DependentRequiredField({
          dependentOnElementTag: 'quartech_prioritytopics_i',
          requiredFieldTag: 'quartech_otherprioritytopic',
          overrideTruthyClause: false
        });
      }

      // setup observer to check each time selected topics changes
      var observer = new MutationObserver(function (mutations) {
        var _document$querySelect2;
        if ((_document$querySelect2 = document.querySelector('#quartech_prioritytopics_i')) !== null && _document$querySelect2 !== void 0 && _document$querySelect2.querySelector('li[aria-label="Other for Priority Topic(s)"]')) {
          var isVisible = $("#quartech_otherprioritytopic_label").is(':visible');
          // Here we should dynamically hide/show the comment field & make it required:
          // Do this by using 'overrideTruthyClause' and force it to show & be required
          if (!isVisible) {
            // @ts-ignore
            initOnChange_DependentRequiredField({
              dependentOnElementTag: 'quartech_prioritytopics_i',
              requiredFieldTag: 'quartech_otherprioritytopic',
              overrideTruthyClause: true
            });
          }
        } else {
          // @ts-ignore
          initOnChange_DependentRequiredField({
            dependentOnElementTag: 'quartech_prioritytopics_i',
            requiredFieldTag: 'quartech_otherprioritytopic',
            overrideTruthyClause: false
          });
        }
      });
      observer.observe(priorityTopicElements, {
        attributes: true,
        childList: true,
        characterData: true
      });

      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnValue: OTHER_VALUE,
        dependentOnElementTag: 'quartech_activitypurpose',
        requiredFieldTag: 'quartech_ifotherpleasedescribetheactivitypurpose'
      });

      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnValue: YES_VALUE,
        dependentOnElementTag: 'quartech_theprocessoflearningandprocessingknowledge',
        requiredFieldTag: 'quartech_adulteducationandknowlegetransferdescript'
      });
      // END Activity Information
    }
    // END KTTP PROJECT STEP CUSTOMIZATION

    // START NEFBA PROJECT STEP CUSTOMIZATION
    if (programAbbreviation && programAbbreviation === 'NEFBA') {
      if (!document.querySelector('#quartech_businessgoals_note')) {
        addTextAboveField('quartech_businessgoals', "<br /><div id='quartech_businessgoals_note'><b>Note: Reimbursement for program costs will not be distributed unless you submit a complete new or updated business plan by March 1, 2024.</b><br /><br /></div>");
      }

      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnValue: '255550000',
        dependentOnElementTag: 'quartech_completingcategory',
        requiredFieldTag: 'quartech_stepstocompletethebusinessplan'
      });

      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnValue: '255550001',
        // Business Plan Coaching from a Business Consultant ($3,000 in funding)
        dependentOnElementTag: 'quartech_completingcategory',
        requiredFieldTag: 'quartech_businessconsultantinformation' // Identify the business consultant chosen by name, contact information and business registration number.
      });
      if (!document.querySelector('#quartech_bciaregisteredconsultant_note')) {
        addTextAboveField('quartech_bciaregisteredconsultant', "<br /><div id='quartech_bciaregisteredconsultant_note'><b>Note: The consultant must be registered with BCIA or as a CPA. Please select another consultant if they are not registered with either. See the Program Guide for more information.</b></div><br />");
      }
      if (!document.querySelector('#quartech_nefba_project_step_note')) {
        var containerDiv = $('#EntityFormView > div.tab.clearfix > div > div');
        containerDiv.append("\n        <div id=\"quartech_nefba_project_step_note\">\n          <label>\n            <b>Review the Program Guide for support on how to complete or update your business plan and requirements for Phase 2 funding.</b>\n          </label>\n          <br />\n          <br />\n          <label>Reminders:\u200B</label>\n          <br />\n          <br />\n          <label>\n            If a consultant is used, an invoice and proof of payment is required for reimbursement up to a maximum amount of $3,000.\n          \u200B</label>\n          <br />\n          <br />\n          <label>\n            Note that participating in Phase 1 prepares applicants for success in the Phase 2 application process, however, does NOT guarantee funding through Phase 2. See Program Guide for full details.\u200B\n          </label>\n          <br />\n          <br />\n          <label>\n            For Phase 2 funding, a Statement of Completion from the Environmental Farm Plan (EFP) Program or commitment to apply for and, to the extent possible, complete an Environmental Farm Plan (EFP) prior to March 1, 2025 is required. Participation in the EFP program is free and confidential and applicants are encouraged to start the EFP process as soon as possible.\n          </label>\n        </div>");
      }
      var programCategoryElement = document.querySelector('#quartech_completingcategory');
      // @ts-ignore
      var programCategoryElementInitialValue = programCategoryElement.value;
      var BUSINESS_PLAN_COACHING_VALUE = '255550001';
      if (programCategoryElementInitialValue === BUSINESS_PLAN_COACHING_VALUE) {
        // @ts-ignore
        shouldRequireDependentField({
          shouldBeRequired: true,
          requiredFieldTag: 'quartech_bciaregisteredconsultant'
          // setRequiredFieldsFunc: setProjectStepRequiredFields,
        });
        setBciaOnChange();
      } else {
        // @ts-ignore
        shouldRequireDependentField({
          shouldBeRequired: false,
          requiredFieldTag: 'quartech_bciaregisteredconsultant'
          // setRequiredFieldsFunc: setProjectStepRequiredFields,
        });
        // @ts-ignore
        shouldRequireDependentField({
          shouldBeRequired: false,
          requiredFieldTag: 'quartech_cpaconsultant'
          // setRequiredFieldsFunc: setProjectStepRequiredFields,
        });
        $('#quartech_bciaregisteredconsultant').off('change');
      }
      $('#quartech_completingcategory').on('change', function () {
        var programCategoryValue = document.querySelector('#quartech_completingcategory'
        // @ts-ignore
        ).value;
        if (programCategoryValue === BUSINESS_PLAN_COACHING_VALUE) {
          // @ts-ignore
          shouldRequireDependentField({
            shouldBeRequired: true,
            requiredFieldTag: 'quartech_bciaregisteredconsultant'
            // setRequiredFieldsFunc: setProjectStepRequiredFields
          });
          setBciaOnChange();
        } else {
          // @ts-ignore
          shouldRequireDependentField({
            shouldBeRequired: false,
            requiredFieldTag: 'quartech_bciaregisteredconsultant'
            // setRequiredFieldsFunc: setProjectStepRequiredFields
          });
          // @ts-ignore
          shouldRequireDependentField({
            shouldBeRequired: false,
            requiredFieldTag: 'quartech_cpaconsultant'
            // setRequiredFieldsFunc: setProjectStepRequiredFields
          });
          $('#quartech_bciaregisteredconsultant').off('change');
        }
      });
    }
    // END NEFBA PROJECT STEP CUSTOMIZATION

    // START ABPP OR NEFBA CUSTOMIZATION
    if (programAbbreviation.includes('ABPP') || programAbbreviation === 'NEFBA') {
      var orgInfoFieldSetElement = $('fieldset[aria-label="Organization Information"]');
      if (orgInfoFieldSetElement) orgInfoFieldSetElement.css('display', 'none');
      var collaboratingOrgFieldSetElement = $('fieldset[aria-label="Collaborating Organization Information"]');
      if (collaboratingOrgFieldSetElement) {
        collaboratingOrgFieldSetElement.css('display', 'none');
      }
      var activityInformationFieldSetElement = $('fieldset[aria-label="Activity Information"]');
      if (activityInformationFieldSetElement) {
        activityInformationFieldSetElement.css('display', 'none');
      }
    }
    // END ABPP OR NEFBA CUSTOMIZATION

    // START ABPP1 AND ABPP2 CUSTOMIZATION
    if (programAbbreviation && programAbbreviation.includes('ABPP')) {
      var dynamicText = programAbbreviation === 'ABPP1' ? 'event/training' : 'project';
      if (!document.querySelector('#activityStartDateNotice')) {
        var htmlContentToAddAboveStartDate = "<div id=\"activityStartDateNotice\" style=\"padding-top: 15px;\">\n        Your ".concat(dynamicText, " may have a delayed start date. However, all ").concat(dynamicText, "s must be submitted 90 days after the start date, unless an extension of the ").concat(dynamicText, " has been granted by the Program Manager. Applications to extend any ").concat(dynamicText, " will be considered on a case-by-case basis.\n      </div>");
        addTextBelowField('quartech_whenistheprojectstartdate', htmlContentToAddAboveStartDate);
      }
      if (programAbbreviation === 'ABPP2') {
        if (!document.querySelector('#activityEndDateNotice')) {
          var htmlContentToAddAboveEndDate = "<div id=\"activityEndDateNotice\" style=\"padding-top: 15px;\">\n        Consultants must submit the ".concat(dynamicText, " report to the Applicant for review and feedback at least two weeks prior to the ").concat(dynamicText, " end date. Revisions requested by the Applicant must be completed by the Consultant and approved by the Applicant prior to the final submission to the program.\n      </div>");
          addTextBelowField('quartech_activityenddate', htmlContentToAddAboveEndDate);
        }
      }
    }
    // END ABPP1 AND ABPP2 CUSTOMIZATION

    // START ONLY ABPP1 CUSTOMIZATION
    if (getProgramAbbreviation() === 'ABBP1') {
      // Program Category
      var _programCategoryElement = $('fieldset[aria-label="Program Category"]');
      _programCategoryElement.css('display', 'none');

      // Consultant Information
      var consultantInformationElement = $('fieldset[aria-label="Consultant Information"]');
      consultantInformationElement.css('display', 'none');
    }
    // END ONLY ABPP1 CUSTOMIZATION

    // START ONLY ABPP2 CUSTOMIZATION
    if (getProgramAbbreviation() === 'ABPP2') {
      if (!document.querySelector('#consultantNotice')) {
        var htmlContentToAddUnderConsultantInfo = "<div id=\"consultantNotice\" style=\"padding-bottom: 15px;\">\n      **Please note that the Ministry reserves the right to refuse projects submitted with consultants who are not considered to be in good standing with the Ministry. Applications with unacceptable consultants listed will be held or waitlisted and the applicants will be given an opportunity to find an acceptable consultant. \n    </div>";
        addTextAboveField('quartech_consultantcompanyname', htmlContentToAddUnderConsultantInfo);
      }
      if (!document.querySelector('#moreThan10PercentNotice')) {
        var htmlContentToAddUnderMoreThan10Percent = "<div id=\"moreThan10PercentNotice\" style=\"padding-top: 15px;\">\n      **Please note that supporting consultants may not complete more than 40% of the proposed project. \n    </div>";
        addTextBelowField('quartech_consultantcompletingoverlimit', htmlContentToAddUnderMoreThan10Percent);
      }
    }
    // END ONLY ABPP2 CUSTOMIZATION
  }
  function setBciaOnChange() {
    $('#quartech_bciaregisteredconsultant').on('change', function () {
      var bciaConsultantValue = document.querySelector('#quartech_bciaregisteredconsultant'
      // @ts-ignore
      ).value;
      var BCIA_NO_VALUE = '255550002';
      if (bciaConsultantValue === BCIA_NO_VALUE) {
        // @ts-ignore
        shouldRequireDependentField({
          shouldBeRequired: true,
          requiredFieldTag: 'quartech_cpaconsultant',
          setRequiredFieldsFunc: setProjectStepRequiredFields
        });
      } else {
        // @ts-ignore
        shouldRequireDependentField({
          shouldBeRequired: false,
          requiredFieldTag: 'quartech_cpaconsultant',
          setRequiredFieldsFunc: setProjectStepRequiredFields
        });
        $('#quartech_cpaconsultant').off('change');
      }
    });
  }
  function setProjectStepDependentRequiredFields() {
    var _document$querySelect3;
    var programAbbreviation = getProgramAbbreviation();
    // START KTTP CUSTOMIZATION
    if (programAbbreviation.includes('KTTP')) {
      // Please explain if you selected Sector-Wide, or if you have additional information to share on the Commodity/Sector:
      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnValue: SECTOR_WIDE_ID_VALUE,
        dependentOnElementTag: 'quartech_naicsindustry',
        requiredFieldTag: 'quartech_ifotherpleasedescribecommodity'
      });
      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnValueArray: ['255550001',
        // "In-Person"
        '255550002' // "hybrid"
        ],
        dependentOnElementTag: 'quartech_eventtype',
        requiredFieldTag: 'quartech_projectlocation'
      });
      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnValue: '255550001',
        dependentOnElementTag: 'quartech_projecttakesplaceinotherplaces',
        requiredFieldTag: 'quartech_venuelocationcitytownetcoronlinesoftwar'
      });
    }
    // END KTTP CUSTOMIZATION

    // START ABBP STREAM 2 CUSTOMIZATION
    if (programAbbreviation === 'ABPP2') {
      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnValue: YES_VALUE,
        dependentOnElementTag: 'quartech_useofsupportingconsultant',
        requiredFieldTag: 'quartech_consultantcompletingoverlimit'
      });

      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnValue: YES_VALUE,
        dependentOnElementTag: 'quartech_useofsupportingconsultant',
        requiredFieldTag: 'quartech_supportingconsultantcompanyname'
      });

      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnValue: YES_VALUE,
        dependentOnElementTag: 'quartech_useofsupportingconsultant',
        requiredFieldTag: 'quartech_supportingconsultantfullname'
      });

      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnValue: YES_VALUE,
        dependentOnElementTag: 'quartech_useofsupportingconsultant',
        requiredFieldTag: 'quartech_supportingconsultantpositiontitle'
      });

      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnValue: YES_VALUE,
        dependentOnElementTag: 'quartech_useofsupportingconsultant',
        requiredFieldTag: 'quartech_supportingconsultantrationale'
      });

      // Please provide the names of the co-applicants to your group application
      // initial load:

      setSingleOrGroupApplicant();
      if (document.querySelector('#quartech_singleorgroupapplication')) {
        setSingleOrGroupApplicantOnChange();
      }
    }
    // END ABPP STREAM 2 CUSTOMIZATION

    // In order to continuously improve communications, we are interested in learning how you heard about this program, please select all options that apply
    var communicationsOptions = document.querySelector('#quartech_inordertocontinuouslyimprovecommunications_i');
    var containsOtherCommunicationOption = (_document$querySelect3 = document.querySelector('#quartech_inordertocontinuouslyimprovecommunications_i')) === null || _document$querySelect3 === void 0 ? void 0 : _document$querySelect3.querySelector('li[aria-label="Other for In order to continuously improve communications"]');
    // initial load:
    if (containsOtherCommunicationOption) {
      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnElementTag: 'quartech_inordertocontinuouslyimprovecommunications_i',
        overrideTruthyClause: true,
        requiredFieldTag: 'quartech_ifotherpleasedescribe'
      });
    } else {
      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnElementTag: 'quartech_inordertocontinuouslyimprovecommunications_i',
        overrideTruthyClause: false,
        requiredFieldTag: 'quartech_ifotherpleasedescribe'
      });
    }

    // setup observer to check each time selected topics changes
    var observer = new MutationObserver(function (mutations) {
      var _document$querySelect4;
      if ((_document$querySelect4 = document.querySelector('#quartech_inordertocontinuouslyimprovecommunications_i')) !== null && _document$querySelect4 !== void 0 && _document$querySelect4.querySelector('li[aria-label="Other for In order to continuously improve communications"]')) {
        // Only need to show the field when it's not visible, otherwise do nothing
        var isVisible = $("#quartech_ifotherpleasedescribe_label").is(':visible');
        // Here we should dynamically hide/show the comment field & make it required:
        // Do this by using 'overrideTruthyClause' and force it to show & be required
        if (!isVisible) {
          // @ts-ignore
          initOnChange_DependentRequiredField({
            dependentOnElementTag: 'quartech_inordertocontinuouslyimprovecommunications_i',
            overrideTruthyClause: true,
            requiredFieldTag: 'quartech_ifotherpleasedescribe'
          });
        }
      } else {
        // @ts-ignore
        initOnChange_DependentRequiredField({
          dependentOnElementTag: 'quartech_inordertocontinuouslyimprovecommunications_i',
          overrideTruthyClause: false,
          requiredFieldTag: 'quartech_ifotherpleasedescribe'
        });
      }
    });
    observer.observe(communicationsOptions, {
      attributes: true,
      childList: true,
      characterData: true
    });
  }
  function setSingleOrGroupApplicant() {
    var htmlContentToAddAboveCoApplicantNames = "<div id=\"groupApplicationNotice\" style=\"padding-bottom: 15px;\">\n  If applying for a group project, please ensure all participants submit their own applications and indicate co-applicants as part of the application process.\n</div>";
    var singleOrGroupApplicationValue = document.querySelector('#quartech_singleorgroupapplication'
    // @ts-ignore
    ).value;
    if (singleOrGroupApplicationValue === GROUP_APPLICATION_VALUE) {
      // Here we should dynamically hide/show the comment field & make it required:
      // Do this by using 'overrideTruthyClause' and force it to show & be required
      // @ts-ignore
      shouldRequireDependentField({
        shouldBeRequired: true,
        requiredFieldTag: 'quartech_coapplicatntsnames',
        setRequiredFieldsFunc: setProjectStepRequiredFields,
        disableRequiredProp: true
      });
      var groupApplicationNoticeElement = document.querySelector('#groupApplicationNotice');
      if (groupApplicationNoticeElement) {
        $(groupApplicationNoticeElement).css({
          display: ''
        });
      } else {
        addTextAboveField('quartech_coapplicatntsnames', htmlContentToAddAboveCoApplicantNames);
      }
    } else {
      // @ts-ignore
      shouldRequireDependentField({
        shouldBeRequired: false,
        requiredFieldTag: 'quartech_coapplicatntsnames',
        setRequiredFieldsFunc: setProjectStepRequiredFields,
        disableRequiredProp: true
      });
      var _groupApplicationNoticeElement = document.querySelector('#groupApplicationNotice');
      if (_groupApplicationNoticeElement) {
        $(_groupApplicationNoticeElement).css({
          display: 'none'
        });
      }
    }
  }
  function setSingleOrGroupApplicantOnChange() {
    $('#quartech_singleorgroupapplication').on('change', function () {
      setSingleOrGroupApplicant();
    });
  }
  function initAdditionalLocationsMultiSelect() {
    getMunicipalData({
      onSuccess: function onSuccess(data) {
        if (data) {
          addLocationMultiSelect(data);
        }
      }
    });
  }
  function addLocationMultiSelect(municipalJson) {
    var _$;
    var additionalLocationsId = 'quartech_venuelocationcitytownetcoronlinesoftwar';
    if (!$("#".concat(additionalLocationsId))) return;
    var municipalsGroupedByRegionalDistrictKey = processLocationData(municipalJson);
    var fieldControlDiv = $("#".concat(additionalLocationsId)).closest('div');
    var selectElement = "\n      <select id=\"additionalLocationControl\" data-placeholder=\"Select locations\" class=\"chosen-select\" multiple tabindex=\"6\">\n        <option value=\"\"></option>\n      </select>\n    ";
    (_$ = $(fieldControlDiv)) === null || _$ === void 0 || _$.append(selectElement);

    // hide dynamics field
    $("#".concat(additionalLocationsId)).css({
      display: 'none'
    });
    Object.keys(municipalsGroupedByRegionalDistrictKey).forEach(function (regionalDistrictName) {
      var group = $('<optgroup label="' + regionalDistrictName + '" />');
      municipalsGroupedByRegionalDistrictKey[regionalDistrictName].forEach(function (municipalName) {
        $("<option value=\"".concat(municipalName, "\"/>")).html(municipalName).appendTo(group);
      });
      group.appendTo($('#additionalLocationControl'));
    });
    useScript('chosen', setupChosen);
  }
  function setupChosen() {
    logger$6.info({
      fn: setupChosen,
      message: 'setting up chosen...'
    });
    // @ts-ignore
    $('.chosen-select').chosen();
    // @ts-ignore
    $('.chosen-select-deselect').chosen({
      allow_single_deselect: true
    });

    // fetch pre-selected options, if any
    var existingAdditionalLocations = $('#quartech_venuelocationcitytownetcoronlinesoftwar').val();
    if (existingAdditionalLocations) {
      // @ts-ignore
      var existingLocationsArray = existingAdditionalLocations.split(', ');
      $('.chosen-select').val(existingLocationsArray);
      $('.chosen-select').trigger('chosen:updated');
    }
    var target = document.getElementById('quartech_venuelocationcitytownetcoronlinesoftwar').closest('tr');
    var observer = new MutationObserver(function (mutations) {
      var _target$style;
      if ((target === null || target === void 0 || (_target$style = target.style) === null || _target$style === void 0 ? void 0 : _target$style.display) === 'none') {
        $('.chosen-select').val([]);
        $('.chosen-select').trigger('chosen:updated');
      }
    });
    observer.observe(target, {
      attributes: true,
      attributeFilter: ['style']
    });

    // update dynamics field value on change of chosen field
    $('.chosen-select').on('change', function () {
      var newSelectedLocations = $('.chosen-select').val();
      // @ts-ignore
      var stringToPassToFieldInput = newSelectedLocations.join(', ');
      setFieldValue('quartech_venuelocationcitytownetcoronlinesoftwar', stringToPassToFieldInput);
    });
    setupTooltip({
      name: 'quartech_venuelocationcitytownetcoronlinesoftwar',
      tooltipText: 'Project locations in addition to what you have provided in the question above',
      tooltipTargetElementId: 'additionalLocationControl_chosen'
    });
    logger$6.info({
      fn: setupChosen,
      message: 'successfully setup chosen...'
    });
  }

  function customizeEligibilityStep(programData) {
    setupEligibilityStepFields();
  }
  function setupEligibilityStepFields() {
    setStepRequiredFields('EligibilityStep');
    var programAbbreviation = getProgramAbbreviation();
    if (programAbbreviation && (programAbbreviation.includes('ABPP') || programAbbreviation === 'NEFBA')) {
      var fieldToAddElgibilityNote = '';
      if (programAbbreviation === 'ABPP1') {
        fieldToAddElgibilityNote = 'quartech_primaryproducer100or51percent';
      } else if (programAbbreviation === 'ABPP2') {
        fieldToAddElgibilityNote = 'quartech_farmbusinesscapacityevaluationriskplan';
      } else if (programAbbreviation === 'NEFBA') {
        fieldToAddElgibilityNote = 'quartech_isaprimaryproducergrowingsellingproducts';
      }
      addTextAboveField(fieldToAddElgibilityNote, '<b>Please answer the following questions to confirm your eligibility for the program.</b><br/> Note that applicants may be audited and must be able to demonstrate the validity of information provided in this application form.<br /><br />');
    }
    if (programAbbreviation && programAbbreviation.includes('ABPP')) {
      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnValue: YES_VALUE,
        dependentOnElementTag: 'quartech_abppsupportoverlimit',
        requiredFieldTag: 'quartech_abppsupportoverlimitdetail'
      });
      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnValue: YES_VALUE,
        dependentOnElementTag: 'quartech_supportreceivedduringscap',
        requiredFieldTag: 'quartech_supportduringscapdetails'
      });
    }
    if (programAbbreviation && programAbbreviation === 'NEFBA') {
      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnValue: '255550001',
        dependentOnElementTag: 'quartech_bcregisteredbusinessentity',
        requiredFieldTag: 'quartech_committedbizregistrationbeforecompletion',
        validationFunc: validateStepFields
      });
    }
  }

  function customizeDeclarationConsentStep$1(programData) {
    hideFieldsAndSections(false);
    addConsent$1(programData === null || programData === void 0 ? void 0 : programData.quartech_applicantportalprogramname);
  }
  function addConsent$1(programName) {
    var programNameTag = '%%ProgramName%%';
    var htmlConsent = "<div style='font-style: italic;'>\n      <span>BY SUBMITTING THIS APPLICATION FORM TO %%ProgramName%% (the \"Program\"), I:</span>\n      <u style='text-decoration:none;'>\n          <li>represent that I am the applicant or the fully authorized signatory of the applicant;</li>\n          <li>\n              declare that I have/the applicant has not knowingly submitted false or misleading information and that the information provided in this application and attachments is true and correct in every respect to the best of my/the applicant's knowledge;</li>\n          <li>acknowledge the information provided on this application form and attachments will be used by the Ministry of Agriculture and Food (the \"Ministry\") to assess the applicant's eligibility for funding from the Program;</li>\n          <li>understand that failing to comply with all application requirements may delay the processing of this application or make the applicant ineligible to receive funding under the Program;</li>\n          <li>represent that I have/the applicant has read and understood the Program Terms and Conditions and agree(s) to be bound by the Program Terms and Conditions;</li>\n          <li>represent that the applicant is in compliance with all Program eligibility requirements as described in the Program Terms and Conditions, and in this document;</li>\n          <li>agree to proactively disclose to the Program all other sources of funding the applicant or any partners within the same organization or the same farming or food processing operation receives with respect to the projects funded by this Program, including financial and/or in-kind contributions from federal, provincial, or municipal government;</li>        \n          <li>acknowledge that the Business Number (GST Number) is collected by the Ministry under the authority of the Income Tax Act for the purpose of reporting income.</li>\n      </u>\n      <br/>\n  </div>";
    htmlConsent = htmlConsent.replace(programNameTag, programName);
    var div = document.createElement('div');
    div.innerHTML = htmlConsent;
    $("[data-name='tab_ApplicationDeclarationandConsent']").parent().prepend(div);
  }

  var logger$5 = Logger('application/steps/demographicInfo');
  function customizeDemographicInfoStep(programData) {
    if (programData !== null && programData !== void 0 && programData.quartech_disabledchefsdemographicinfo) {
      hideChefsIntegration();
      addDemographicDataDescriptionOldVersionForABPP();
      setDemographicInfoRequiredFields();
      addViewExampleTo_Q1a();
      initOnChange_Question1_SoleProprietorshipOrGeneralPartnership();
      initOnChange_Question2_Re_GoverningBoard();
      initOnChange_Question2b_Re_OrganizationType();
      initOnChange_Question4_DoesYourOrganizationTargetAnyGroups();
      addDemographicInfoPercentageColumnTitle();
    } else {
      setDemographicInfoRequiredFields();
      // Enable Demographic Info integration with CHEFS
      showChefsIntegration();
    }
  }
  function hideChefsIntegration() {
    $("[data-name='DemographicInfoChefsSubmissionSection']").parent().css('display', 'none');
  }
  function addDemographicDataDescriptionOldVersionForABPP() {
    var div = document.createElement('div');
    var programEmailAddress = getProgramEmailAddress();
    div.innerHTML = '<p>The Province of British Columbia supports inclusive and increased representation of underrepresented groups. By providing the information below, you are helping to improve the delivery of programming. At this time, the questions focus on three identity groups, and do not cover all potential groups who are underrepresented in the agriculture sector. We plan to expand the focus to other underrepresented groups in future.</p>' + "<p>Your personal information is collected under section 26(c) and 26(e) of the Freedom of Information and Protection of Privacy Act for the purposes of evaluating applications and for the planning and evaluating of the S-CAP Ministry Program. The demographic information you provide is voluntary and will not be used to assess your eligibility for this program. Each individual understands the purposes of the collection, use, and disclosure of their demographic personal information. The information you provide will be shared with the federal government to fulfill the provincial obligations under the Sustainable Canadian Agricultural Partnership (S-CAP) bilateral agreement. It may be combined with other survey or administrative data sources and used for statistical, research and evaluation purposes. If any information is published, your responses will be combined with the responses of others so that you cannot be identified. If you have any questions about the collection of your information, please contact the program manager at <a href = \"mailto: ".concat(programEmailAddress, "\">").concat(programEmailAddress, "</a>.</p>") + '<p><span>Required Field </span><span style="color:red">*</span></p>';
    $("[data-name='DemographicData_Tab1']").parent().prepend(div);
  }
  function setDemographicInfoRequiredFields() {
    setStepRequiredFields('DemographicInfoStep');
  }
  function addViewExampleTo_Q1a() {
    var div = document.createElement('div');
    div.innerHTML = "\n    <div class=\"panel-group\" id=\"accordion\" role=\"tablist\" aria-multiselectable=\"true\">\n      <div class=\"panel panel-default\">\n        <div class=\"panel-heading\" role=\"tab\" id=\"headingOne\">\n          <h4 class=\"panel-title\">\n          <a role=\"button\" class=\"collapsed\" data-toggle=\"collapse\" data-parent=\"#accordion\" href=\"#collapseOne\" aria-expanded=\"false\" aria-controls=\"collapseOne\">\n              View Example\n          </a>\n          </h4>\n        </div>\n        <div id=\"collapseOne\" class=\"panel-collapse collapse\" role=\"tabpanel\" aria-labelledby=\"headingOne\">\n          <div class=\"panel-body\">\n            <i>As an example, a company has 4 owners:\n            <br/> \u270D 1 owner identifies as First Nation and a woman and owns 10% of the business.\n            <br/> \u270D 1 owner identifies as a youth (40 or younger) and as Indigenous but the applicant is not aware of which specific Indigenous group this owner identifies with. This owner owns 50% of the business.\n            <br/> \u270D 2 identify as non-Indigenous men over 40 and each owns 10% of the business.\n            <br/> \u270D In this case, you would enter 10% for 'First Nations', 10% for 'women', 50% for 'youth', 50% for 'Indigenous - not specified', and 20% for 'none of the above groups'. The numbers could add up to more than 100% - that's fine!\n            </i>\n          </div>\n        </div>\n      </div>\n    </div>\n  ";
    $("[data-name='Q1a_Section']").parent().prepend(div);
  }
  function initOnChange_Question1_SoleProprietorshipOrGeneralPartnership() {
    var q1Control = $('#quartech_question1reownerproprietorshiporparnership');
    var selectedValue = q1Control.val();
    hideShow_for_Question1_SoleProprietorshipOrGeneralPartnership(selectedValue);
    logger$5.info({
      fn: initOnChange_Question1_SoleProprietorshipOrGeneralPartnership,
      message: 'initOnChangeQuestion1 called.'
    });
    q1Control.on('change', function () {
      var selectedValue = $(this).val();
      logger$5.info({
        fn: initOnChange_Question1_SoleProprietorshipOrGeneralPartnership,
        message: "Selected Value: ".concat(selectedValue)
      });
      hideShow_for_Question1_SoleProprietorshipOrGeneralPartnership(selectedValue);
    });
  }
  function hideShow_for_Question1_SoleProprietorshipOrGeneralPartnership(selectedValue) {
    var cssDisplayForQ1 = 'none';
    var cssDisplayForQ2 = 'none';
    var cssDisplayForQ3 = 'none';
    if (selectedValue === YES_VALUE) {
      cssDisplayForQ1 = 'block';
      cssDisplayForQ2 = 'none';
      cssDisplayForQ3 = 'none';
      $('#quartech_question2regoverningboard').prop('selectedIndex', 0); // select blank option for the Question 2
      $('#quartech_question2breorganizationtype').prop('selectedIndex', 0); // select blank option for the Question 2b
      $('#quartech_numberofmembersofthegoverningbody').val(''); // clear the Question 2c

      $('#quartech_numberofmembersofthegoverningbody').parent().parent().parent().css('display', 'none'); // Q2c
      $("[data-name='Q2c_Section']").parent().css('display', 'none'); // 2d's questions (previously 2c)

      clearQuestion2dAnswers();
      $('.msos-selecteditems-container ul li').remove(); // Clear selected items from the Question 3
    } else if (selectedValue === NO_VALUE) {
      cssDisplayForQ1 = 'none';
      cssDisplayForQ2 = 'block';
      cssDisplayForQ3 = 'block';
      clearQuestion1abcAnswers();
    } else {
      clearQuestion1abcAnswers();
      $('#quartech_question2regoverningboard').prop('selectedIndex', 0); // select blank option for the Question 2
      $('#quartech_question2breorganizationtype').prop('selectedIndex', 0); // select blank option for the Question 2b
      $('#quartech_numberofmembersofthegoverningbody').val(''); // Clear  the Question 2c
      clearQuestion2dAnswers();
      $('#quartech_numberofmembersofthegoverningbody').parent().parent().parent().css('display', 'none');
      $("[data-name='Q2c_Section']").parent().css('display', 'none');
      $('.msos-selecteditems-container ul li').remove(); // Clear selected items from the Question 3
    }
    $("[data-name='Q1a_Section']").parent().css('display', cssDisplayForQ1);
    $("[data-name='Q1b_Q1c_Section']").parent().css('display', cssDisplayForQ1);
    $('#quartech_question2breorganizationtype').parent().parent().parent().css('display', 'none'); // Q2b
    $('#quartech_numberofmembersofthegoverningbody').parent().parent().parent().css('display', 'none'); // Q2c
    $("[data-name='Q2_Section']").parent().css('display', cssDisplayForQ2);
    $("[data-name='Q3_section']").parent().css('display', cssDisplayForQ3);
    validateDemographicInfoRequiredFields();
  }
  function clearQuestion1abcAnswers() {
    // Clear Answers for the Question 1a
    $('#quartech_firstnationssharepercentage').val('');
    $('#quartech_inukinuitsharepercentage').val('');
    $('#quartech_mtissharepercentage').val('');
    $('#quartech_indigenoussharepercentage').val('');
    $('#quartech_womensharepercentage').val('');
    $('#quartech_youth40orundersharepercentage').val('');
    $('#quartech_nonindiginousnonwomennonyouthshare').val('');
    $('#quartech_unabletoansweridentifysharepercentage').val('');
    $('#quartech_newagricultureentrantssharepercentage').val('');
    $('#quartech_declinetoidentifypercentageshares').prop('checked', false);
    $('#quartech_percentagesharesownedbynewentrants').val('');
    // Clear Answers for the Question 1b
    $('#quartech_commentsondemographicsofbusinessowners').val('');
    // Clear Answers for the Question 1c
  }
  function clearQuestion2dAnswers() {
    $('#quartech_firstnationsgoverningbodymembers').val('');
    $('#quartech_inukinuitgoverningbodymembers').val('');
    $('#quartech_mtisgoverningbodymembers').val('');
    $('#quartech_indigenousnotspecifiedgoverningbodymember').val('');
    $('#quartech_womengoverningbodymembers').val('');
    $('#quartech_youthgoverningbodymembers').val('');
    $('#quartech_nonindiginousnonwomennonyouthgovbodymbrs').val('');
    $('#quartech_question2dgoverningbodymembersunabletoanswer').val('');
    $('#quartech_declinetoidentifygoverningbodymember').prop('checked', false);
  }
  function initOnChange_Question2_Re_GoverningBoard() {
    var q2Control = $('#quartech_question2regoverningboard');
    var selectedValue = q2Control.val();
    hideShow_for_Question2_Re_GoverningBoard(selectedValue);
    logger$5.info({
      fn: initOnChange_Question2_Re_GoverningBoard,
      message: 'initOnChange_Question2_Re_GoverningBoard called.'
    });
    q2Control.on('change', function () {
      var selectedValue = $(this).val();
      logger$5.info({
        fn: initOnChange_Question2_Re_GoverningBoard,
        message: "Selected Value: ".concat(selectedValue)
      });
      hideShow_for_Question2_Re_GoverningBoard(selectedValue);
    });
  }
  function hideShow_for_Question2_Re_GoverningBoard(selectedValue) {
    var cssDisplayForQ2bQ2c = 'none';
    if (selectedValue === YES_VALUE) {
      cssDisplayForQ2bQ2c = 'table-row';
    } else {
      $('#quartech_question2breorganizationtype').prop('selectedIndex', 0); // select blank option for the Question 2b
      $('#quartech_numberofmembersofthegoverningbody').val(''); // clear the Question 2c

      clearQuestion2dAnswers();
    }
    $('#quartech_question2breorganizationtype').parent().parent().parent().css('display', cssDisplayForQ2bQ2c);
    $('#quartech_numberofmembersofthegoverningbody').parent().parent().parent().css('display', 'none');
    $("[data-name='Q2c_Section']").parent().css('display', 'none');
    validateDemographicInfoRequiredFields();
  }
  function initOnChange_Question2b_Re_OrganizationType() {
    var q2bControl = $('#quartech_question2breorganizationtype');
    var selectedValue = q2bControl.val();
    hideShow_for_Question2b_Re_OrganizationType(selectedValue);
    logger$5.info({
      fn: initOnChange_Question2b_Re_OrganizationType,
      message: 'initOnChange_Question2b_Re_OrganizationType called.'
    });
    q2bControl.on('change', function () {
      var selectedValue = $(this).val();
      logger$5.info({
        fn: initOnChange_Question2b_Re_OrganizationType,
        message: "Selected Value: ".concat(selectedValue)
      });
      hideShow_for_Question2b_Re_OrganizationType(selectedValue);
    });
  }
  function hideShow_for_Question2b_Re_OrganizationType(selectedValue) {
    var cssDisplayForQ2c = 'none';
    var cssDisplayForQ2d = 'none';
    if (selectedValue === NO_VALUE) {
      cssDisplayForQ2d = 'block';
      cssDisplayForQ2c = 'table-row';
    } else {
      clearQuestion2dAnswers();
    }
    $('#quartech_numberofmembersofthegoverningbody').parent().parent().parent().css('display', cssDisplayForQ2c);
    $("[data-name='Q2c_Section']").parent().css('display', cssDisplayForQ2d);
    validateDemographicInfoRequiredFields();
  }
  function initOnChange_Question4_DoesYourOrganizationTargetAnyGroups() {
    var _allListItemOptions$f;
    // Scenarios
    // 1: When user selects "None of the above", deselect all other options, only adding "None of the above" option
    // 2: When user selects ANY other option, if "None of the above" is checked, uncheck it
    var fieldName = '#quartech_doesyourorganizationtargetanyofthegroups_Container';
    var allListItemOptions = $(fieldName).find('.msos-option');
    var allCheckboxes = $(fieldName).find('li>>input.msos-checkbox');

    // find "None of the above" list item and add a click handler
    var noneOfTheAboveListItemOption = (_allListItemOptions$f = allListItemOptions.filter(function (item) {
      return allListItemOptions[item].innerText.includes('None');
    })) === null || _allListItemOptions$f === void 0 ? void 0 : _allListItemOptions$f[0];
    $(noneOfTheAboveListItemOption).on('click', function () {
      var checkedItemsThatAreNotNoneOfTheAbove = allCheckboxes.filter(function (item) {
        return (
          // @ts-ignore
          allCheckboxes[item].checked && !allCheckboxes[item].ariaLabel.includes('None')
        );
      });
      if (checkedItemsThatAreNotNoneOfTheAbove.length > 0) {
        checkedItemsThatAreNotNoneOfTheAbove.trigger('change', false);
      }
    });

    // find all other option elements and add a handler to remove "None of the above" if it selected
    var allOtherListItemOptions = allListItemOptions.filter(function (item) {
      return !allListItemOptions[item].innerText.includes('None');
    });
    $(allOtherListItemOptions).on('click', function () {
      var checkedNoneOfTheAbove = allCheckboxes.filter(function (item) {
        return (
          // @ts-ignore
          allCheckboxes[item].checked && allCheckboxes[item].ariaLabel.includes('None')
        );
      });
      if (checkedNoneOfTheAbove.length > 0) {
        checkedNoneOfTheAbove.trigger('change', false);
      }
    });
  }
  function addDemographicInfoPercentageColumnTitle() {
    // Add "Percentage of business shares owned" column title
    $('#EntityFormView > div.tab.clearfix > div > div > fieldset:nth-child(3) > table > tbody').prepend('<tr><td colspan="1" rowspan="1" class="clearfix cell decimal form-control-cell"><div class="info"><label for="quartech_firstnationssharepercentage" id="quartech_firstnationssharepercentage_label" class="field-label"></label><div class="validators"><span id="FloatValidatorquartech_firstnationssharepercentage" style="visibility:hidden;">*</span><span id="RangeValidatorquartech_firstnationssharepercentage" style="visibility:hidden;">*</span></div></div><div class="control" style="width: 25% !important">Percentage of business shares owned</div></td><td class="cell zero-cell"></td></tr>');
  }
  function showChefsIntegration() {
    addDemographicDataDescription();
    hideAllStepSections();
    $("[data-name='DemographicInfoChefsSubmissionSection']").parent().css('display', 'block');
    addDemographicInfoChefsIframe();
  }
  function addDemographicDataDescription() {
    var div = document.createElement('div');
    div.innerHTML = "<h3>Demographic Data Collection</h3>\n    <p>The Province of British Columbia supports inclusive and increased representation of underrepresented groups. By participating in the survey below, you are helping to improve the delivery of programming. At this time, the questions focus on three identity groups (Indigenous, women and youth), and do not cover all potential groups who are underrepresented in the agriculture sector. We plan to expand the focus to other underrepresented groups in future.</p>\n    <p>The survey is conducted independently of the funding program to which you are applying, and your survey responses will not be included in your funding application. If you wish to save a copy of your survey responses, you will have the option of emailing it to yourself upon completion. Please see the top of the survey form for instructions on how to receive a copy by email.</p>";
    $("[data-name='DemographicData_Tab1']").parent().prepend(div);
  }
  function addDemographicInfoChefsIframe() {
    return _addDemographicInfoChefsIframe.apply(this, arguments);
  }
  function _addDemographicInfoChefsIframe() {
    _addDemographicInfoChefsIframe = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
      var _$, _$2;
      var chefsSubmissionId, chefsUrl, _yield$getEnvVars, chefsDemographicDataFormId, div, fieldLabelDivContainer;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            (_$ = $('#quartech_chefssubmissionid')) === null || _$ === void 0 || (_$ = _$.closest('tr')) === null || _$ === void 0 || _$.css({
              display: 'none'
            });
            setFieldReadOnly('quartech_chefsconfirmationid');
            chefsSubmissionId = (_$2 = $('#quartech_chefssubmissionid')) === null || _$2 === void 0 ? void 0 : _$2.val();
            chefsUrl = '';
            if (!chefsSubmissionId) {
              _context.next = 8;
              break;
            }
            chefsUrl = "https://submit.digital.gov.bc.ca/app/form/success?s=".concat(chefsSubmissionId);
            _context.next = 15;
            break;
          case 8:
            _context.next = 10;
            return getEnvVars();
          case 10:
            _yield$getEnvVars = _context.sent;
            chefsDemographicDataFormId = _yield$getEnvVars.quartech_ChefsDemographicDataFormId;
            if (!chefsDemographicDataFormId) {
              alert('Bad config: Applicant Portal Config should contain the ChefsDemographicDataFormId element');
            }
            chefsUrl = "https://submit.digital.gov.bc.ca/app/form/submit?f=".concat(chefsDemographicDataFormId);
            window.addEventListener('message', function (event) {
              if (event.origin != 'https://submit.digital.gov.bc.ca') {
                return;
              }
              var containSubmissionId = event.data.indexOf('submissionId') > -1;
              if (!containSubmissionId) return;
              var submissionPayload = JSON.parse(event.data);
              logger$5.info({
                fn: addDemographicInfoChefsIframe,
                message: 'received submissionId: ' + submissionPayload.submissionId
              });
              $('#quartech_chefssubmissionid').val(submissionPayload.submissionId);
              var confirmationId = submissionPayload.submissionId.substring(0, 8).toUpperCase();
              setFieldValue('quartech_chefsconfirmationid', confirmationId);
            });
          case 15:
            div = document.createElement('div');
            div.innerHTML = "<iframe id='chefsDemographicInfoIframe' src=\"".concat(chefsUrl, "\" height=\"800\" width=\"100%\" title=\"Demographic Info in CHEFS\">\n      </iframe><br/>");
            fieldLabelDivContainer = $("#quartech_chefsconfirmationid_label").parent().parent();
            fieldLabelDivContainer.prepend(div);
          case 19:
          case "end":
            return _context.stop();
        }
      }, _callee);
    }));
    return _addDemographicInfoChefsIframe.apply(this, arguments);
  }

  function customizeDocumentsStep$1() {
    var programAbbreviation = getProgramAbbreviation();
    if (programAbbreviation && programAbbreviation.includes("ABPP")) {
      var documentsHtml = "";
      if (programAbbreviation === "ABPP1") {
        documentsHtml = '<div><div>Please Choose or Drag &amp; Drop files to the grey box below to upload the following documents as attachments (as applicable)</div><ul><li>Event/training budget (if not outlined in Deliverables & Budget tab)​</li><li>Verification of the last year of farming income (T2042, T1273, or Schedule 125 – Farm Revenue) detailing sales by commodity revenue code) or business income if applying as a food processor</li><li>Direct Deposit Application (template available on program webpage)</li></ul><div>Please ensure you have the correct files before clicking “Next” on the application. If you move to the next stage of the application you can no longer delete uploaded files. However, you can always add new files.</div><div>If you have moved to the next stage and then wish to change an uploaded file, simply return to the document submission and upload the replacement file as an additional file. Give the file a name with an indication that it is a replacement (e.g. "Budget NEW.xls").</div></div>';
      } else {
        documentsHtml = '<div><div>Please Choose or Drag &amp; Drop files to the grey box below to upload the following documents as attachments (as applicable)</div><ul><li>Project budget</li><li title="Consultant resume outlining any educational accomplishments and relevant certifications">Consultant resume</li><li>Supporting consultant resume (if applicable)</li><li>Verification of the last year of farming income</li><li>Direct Deposit Application (template available on program webpage)</li></ul><div>Please ensure you have the correct files before clicking “Next” on the application. If you move to the next stage of the application you can no longer delete uploaded files. However, you can always add new files.</div><div>If you have moved to the next stage and then wish to change an uploaded file, simply return to the document submission and upload the replacement file as an additional file. Give the file a name with an indication that it is a replacement (e.g. "Budget NEW.xls").</div></div>';
      }
      var existingDocumentsHtml = document.querySelector("#EntityFormView > div.tr > div > div.control > div");
      $(existingDocumentsHtml).replaceWith(documentsHtml);
    }
  }

  var logger$4 = Logger('application/application');
  function initApplication() {
    hideFieldsAndSections();
    var currentStep = getCurrentStep();
    var isDemographicInfoStep = currentStep === FormStep.DemographicInfo;
    if (isDemographicInfoStep) {
      var demographicInfoStepIframe = document.getElementById('ApplicationDemographicInfoStepQuickViewForm');
      demographicInfoStepIframe.addEventListener('load', function () {
        var _document$querySelect;
        var programid = (_document$querySelect = document.querySelector('#ApplicationDemographicInfoStepQuickViewForm')
        // @ts-ignore
        ) === null || _document$querySelect === void 0 || (_document$querySelect = _document$querySelect.contentWindow) === null || _document$querySelect === void 0 || (_document$querySelect = _document$querySelect.document) === null || _document$querySelect === void 0 || (_document$querySelect = _document$querySelect.querySelector('#quartech_program')) === null || _document$querySelect === void 0 ? void 0 : _document$querySelect.value;
        updatePageForSelectedProgram$1(programid);
      });
    } else {
      updatePageForSelectedProgram$1();
    }
    addNewAppSystemNotice$1();
    customizePageForFirefox();
  }
  function addNewAppSystemNotice$1() {
    var newAppSystemNoticeDiv = document.createElement('div');
    newAppSystemNoticeDiv.id = "new_app_system_notice_div";
    // @ts-ignore
    newAppSystemNoticeDiv.style = 'float: left;';
    newAppSystemNoticeDiv.innerHTML = '<br/><p>This is a new application system. Please bear with us as we work to improve the system. If you have any technical issues with the system or wish to provide feedback to help us to make it as user friendly as possible, please contact: <a href = "mailto: PODS@gov.bc.ca">PODS@gov.bc.ca</a>​</p>';
    var actionsDiv = $("#NextButton").parent().parent().parent();
    actionsDiv.append(newAppSystemNoticeDiv);
  }
  function customizePageForFirefox() {
    // if (!navigator.userAgent.includes("Firefox")) return;

    var codingSection = $("[data-name='applicantInfoTab_CodingSection']");
    if (codingSection.length > 0) {
      codingSection.parent().css('display', 'none');
    }
    codingSection = $("[data-name='eligibilityTab_CodingSection']");
    if (codingSection.length > 0) {
      codingSection.parent().css('display', 'none');
    }
    codingSection = $("[data-name='projectTab_CodingSection']");
    if (codingSection.length > 0) {
      codingSection.parent().css('display', 'none');
    }
    codingSection = $("[data-name='tab_Deliverables_Budget_section_Coding']");
    if (codingSection.length > 0) {
      codingSection.parent().css('display', 'none');
    }
    codingSection = $("[data-name='documentsTab_CodingSection']");
    if (codingSection.length > 0) {
      codingSection.parent().css('display', 'none');
    }
    codingSection = $("[data-name='section_Coding']");
    if (codingSection.length > 0) {
      codingSection.parent().css('display', 'none');
    }
    codingSection = $("[data-name='tab_Declaration_Consent_section_Coding']");
    if (codingSection.length > 0) {
      codingSection.parent().css('display', 'none');
    }
  }
  function updatePageForSelectedProgram$1() {
    var programid = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
    if (!programid) programid = getProgramId();
    logger$4.info({
      fn: updatePageForSelectedProgram$1,
      message: "Retrieving Program data for the selected programid querystring: ".concat(programid)
    });
    getApplicationFormData({
      programId: programid,
      beforeSend: function beforeSend() {
        logger$4.info({
          fn: updatePageForSelectedProgram$1,
          message: 'clear any cached data from previous page loads'
        });
        localStorage.clear();
      },
      onSuccess: function onSuccess(programData, textStatus, xhr) {
        if (programData) {
          logger$4.info({
            fn: updatePageForSelectedProgram$1,
            message: 'Retrieved Program data:',
            data: programData
          });
          localStorage.setItem('programData', JSON.stringify(programData));
          logger$4.info({
            fn: updatePageForSelectedProgram$1,
            message: 'Update application page with the program data.'
          });
          updateFormStepForSelectedProgram(programData);
          hideLoadingAnimation();
          validateRequiredFields();
        }
      }
    });
  }
  function populateProgramLookup(programGuid, programName) {
    $('#quartech_program').val(programGuid);
    $('#quartech_program_name').val(programName);
    $('#quartech_program_entityname').val('msgov_program');
  }
  function populateContentForSelectedProgramStream$1(programData) {
    // Populate the Page Title, Sub-Title and Description
    $('#page-title').text(programData.quartech_portalapplicationpagetitle);
    $('#page-subtitle').text(programData.quartech_portalapplicationpagesubtitle);
    $('#page-description').html(programData.quartech_portalapplicationpagedescription);

    // Populate the Program lookup, hidden at the bottom of the Applicant Information step/tab
    var selectedProgramGuid = $('#quartech_program').val();
    if (!selectedProgramGuid) {
      // auto-select the program lookup, hidden field on the Applicant Info step based on the selected programid
      populateProgramLookup(programData.msgov_programid, programData.msgov_programname);
    }
  }
  function updateFormStepForSelectedProgram(programData) {
    var _programData$quartech;
    populateContentForSelectedProgramStream$1(programData);
    var programAbbreviation = getProgramAbbreviation();
    if (programAbbreviation && programAbbreviation === 'NEFBA') {
      $("div[id*='ProgressIndicator'] li:contains('Deliverables & Budget')").css('display', 'none');
      $("div[id*='ProgressIndicator'] li:contains('Documents')").css('display', 'none');
    } else if (programAbbreviation && programAbbreviation.includes('KTTP')) {
      $("div[id*='ProgressIndicator'] li:contains('Documents')").css('display', 'none');
      $("div[id*='ProgressIndicator'] li:contains('Eligibility')").css('display', 'none');
    }
    var currentStep = getCurrentStep();
    switch (currentStep) {
      case FormStep.ApplicantInfo:
        customizeApplicantInfoStep(programData);
        break;
      case FormStep.Eligibility:
        customizeEligibilityStep();
        break;
      case FormStep.Project:
        customizeProjectStep(programData);
        break;
      case FormStep.DeliverablesBudget:
        customizeDeliverablesBudgetStep();
        // customizeEstimatedActivityBudgetStepForKTTP(programData);
        // initEstimatedActivityBudgetCalculationForKTTP(programData);
        break;
      case FormStep.Documents:
        customizeDocumentsStep$1();
        break;
      case FormStep.DemographicInfo:
        customizeDemographicInfoStep(programData);
        break;
      case FormStep.DeclarationAndConsent:
        customizeDeclarationConsentStep$1(programData);
        break;
    }
    updateFieldsHintTextsByConfigData(programData === null || programData === void 0 || (_programData$quartech = programData.quartech_ApplicantPortalConfig) === null || _programData$quartech === void 0 ? void 0 : _programData$quartech.quartech_configdata);
  }
  function updateFieldsHintTextsByConfigData(configDataJSON) {
    if (!configDataJSON) return;
    var podsConfigData = JSON.parse(configDataJSON);
    var fieldsHintTexts = podsConfigData === null || podsConfigData === void 0 ? void 0 : podsConfigData.FieldsHintTexts;
    if (!fieldsHintTexts) return;
    var currentStep = getCurrentStep();
    switch (currentStep) {
      case FormStep.ApplicantInfo:
        updateFieldsHintTexts(fieldsHintTexts.ForApplicantInfoStep);
        break;
      case FormStep.Project:
        updateFieldsHintTexts(fieldsHintTexts.ForProjectStep);
        break;
      case FormStep.EstimatedActivityBudget:
        updateFieldsHintTexts(fieldsHintTexts.ForEstimatedActivityBudgetStep);
        break;
      case FormStep.DemographicInfo:
        updateFieldsHintTexts(fieldsHintTexts.ForDemographicInfoStep);
        break;
      case FormStep.DeclarationAndConsent:
        updateFieldsHintTexts(fieldsHintTexts.ForDeclarationAndConsentStep);
        break;
    }
  }
  function updateFieldsHintTexts(fieldsHintTextsMap) {
    if (!fieldsHintTextsMap) return;
    fieldsHintTextsMap.forEach(function (fieldData, index) {
      var fieldName = fieldData === null || fieldData === void 0 ? void 0 : fieldData.FieldName;
      var hintText = fieldData === null || fieldData === void 0 ? void 0 : fieldData.HintText;
      if (fieldName && hintText) {
        $("#".concat(fieldName)).attr('placeholder', hintText);
      }
    });
  }

  function customizeSingleOrGroupApplicantQuestions(fieldToHide) {
    var iframe = document.querySelector('fieldset[aria-label="Coding Section (DO NOT REMOVE)"] iframe');
    // @ts-ignore
    var innerDoc = iframe !== null && iframe !== void 0 && iframe.contentDocument ?
    // @ts-ignore
    iframe.contentDocument :
    // @ts-ignore
    iframe.contentWindow.document;
    var singleOrGroupApplicationElement = innerDoc === null || innerDoc === void 0 ? void 0 : innerDoc.getElementById('quartech_singleorgroupapplication');
    if (!!singleOrGroupApplicationElement) {
      if ((singleOrGroupApplicationElement === null || singleOrGroupApplicationElement === void 0 ? void 0 : singleOrGroupApplicationElement.value) !== GROUP_APPLICATION_VALUE) {
        hideQuestion(fieldToHide);
      }
    }
  }

  function customizeClaimInfoStep() {
    setStepRequiredFields('ClaimInfoStep');
    var programAbbreviation = getProgramAbbreviation();

    // START step specific functions
    function addRequestedClaimAmountNote() {
      if (!document.querySelector('#requestedClaimAmountNote')) {
        var requestedClaimAmountNoteHtmlContent = "<div id=\"requestedClaimAmountNote\" style=\"padding-bottom: 20px;\">\n        The Program covers costs up to the maximum amount indicated in your Approval Letter.<br />\n        Any additional fees invoiced will not be covered by the B.C. Ministry of Agriculture and Food\n      </div>";
        $('#quartech_totalfees').closest('tr').before(requestedClaimAmountNoteHtmlContent);
      }
    }
    function addClaimAmountCaveatNote() {
      if ($('#quartech_interimorfinalpayment').val() === '255550000') {
        if (!document.querySelector('#claimAmountCaveatNote')) {
          var claimAmountCaveatNoteHtmlContent = "\n          <div id='claimAmountCaveatNote' style=\"padding-bottom: 20px;\">\n            The requested amount must fall within the range of $500.00 to the authorized amount specified on the Authorization Letter.\n          </div>\n        ";
          $('#requestedClaimAmountNote').after(claimAmountCaveatNoteHtmlContent);
        } else {
          var _$;
          (_$ = $('#claimAmountCaveatNote')) === null || _$ === void 0 || _$.css({
            display: ''
          });
        }
      } else {
        var _$2;
        (_$2 = $('#claimAmountCaveatNote')) === null || _$2 === void 0 || _$2.css({
          display: 'none'
        });
      }
    }
    // END step specific functions

    if (programAbbreviation === 'NEFBA') {
      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnValue: NO_VALUE,
        dependentOnElementTag: 'quartech_applicantinformationconfirmation',
        requiredFieldTag: 'quartech_applicantinformationcorrections'
      });
      addRequestedClaimAmountNote();
      observeIframeChanges(customizeBusinessPlanDependentQuestions, null, 'quartech_completingcategory');
    }
    if (programAbbreviation.includes('ABPP')) {
      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnValue: NO_VALUE,
        dependentOnElementTag: 'quartech_applicantinformationconfirmation',
        requiredFieldTag: 'quartech_applicantinformationcorrections'
      });
      var iframe = document.querySelector('fieldset[aria-label="Coding Section (DO NOT REMOVE)"] iframe');
      // @ts-ignore
      var innerDoc = iframe.contentDocument ?
      // @ts-ignore
      iframe.contentDocument :
      // @ts-ignore
      iframe.contentWindow.document;
      var singleOrGroupApplicationElement = innerDoc.getElementById('quartech_singleorgroupapplication');
      if (!!singleOrGroupApplicationElement) {
        if ((singleOrGroupApplicationElement === null || singleOrGroupApplicationElement === void 0 ? void 0 : singleOrGroupApplicationElement.value) !== GROUP_APPLICATION_VALUE) {
          hideQuestion('quartech_claimcoapplicants');
        }
      }
      addRequestedClaimAmountNote();
      addClaimAmountCaveatNote();
      $('select[id*="quartech_interimorfinalpayment"]').on('change', function () {
        addClaimAmountCaveatNote();
      });
    }
    if (programAbbreviation === 'ABPP1') {
      if (!document.querySelector('#claimInformationNote')) {
        var claimInformationNoteHtmlContent = "<div id=\"claimInformationNote\" style=\"padding-bottom: 20px;\">\n        The Program requires paid invoice(s) from the Learning Provider(s), and proof of payment such as a cancelled cheque(s) or credit card transaction receipt(s).<br />\n        <br />\n        The Reimbursement Amount Requested for specialized training  should be the same as your approved Learning Action Plan  and Authorization Letter.<br />\n        <br />\n        Reimbursement Amount Requested includes registration fees (such as training, courses, registration, tuition) GST and total.</div>";
        $('fieldset[aria-label="Claim Information"] > legend').after(claimInformationNoteHtmlContent);
      }
    } else if (programAbbreviation === 'ABPP2') {
      if (!document.querySelector('#claimInformationNote')) {
        var _claimInformationNoteHtmlContent = "<div id=\"claimInformationNote\" style=\"padding-bottom: 20px;\">\n        The Program requires paid invoice(s) from the Consultant and proof of payment such as a cancelled cheque(s) or credit card transaction receipt(s).<br />\n        <br />\n        The Reimbursement Amount Requested should be the same as your approved Authorization Letter.<br />\n        <br />\n        Reimbursement Amount Requested includes Consultant Fee, GST, and total.</div>";
        $('fieldset[aria-label="Claim Information"] > legend').after(_claimInformationNoteHtmlContent);
      }
      observeChanges($('#quartech_requestedinterimpaymentamount')[0], customizeInterimPaymentAmountField());
      observeIframeChanges(customizeSingleOrGroupApplicantQuestions, 'quartech_claimcoapplicants', 'quartech_singleorgroupapplication');
    }
  }
  function customizeBusinessPlanDependentQuestions() {
    if (document.querySelector('#claimInformationNote')) return;
    var iframe = document.querySelector('fieldset[aria-label="Coding Section (DO NOT REMOVE)"] iframe');
    // @ts-ignore
    var innerDoc = iframe !== null && iframe !== void 0 && iframe.contentDocument ?
    // @ts-ignore
    iframe.contentDocument :
    // @ts-ignore
    iframe.contentWindow.document;
    var completingCategoryElement = innerDoc === null || innerDoc === void 0 ? void 0 : innerDoc.getElementById('quartech_completingcategory');
    if (!!completingCategoryElement) {
      if ((completingCategoryElement === null || completingCategoryElement === void 0 ? void 0 : completingCategoryElement.value) === '255550000') {
        if (!document.querySelector('#claimInformationNote')) {
          var claimInformationNoteHtmlContent = "<div id=\"claimInformationNote\" style=\"padding-bottom: 20px;\">\n        The Reimbursement Amount Requested should be the same as your approved Authorization Letter.</div>";
          $('fieldset[aria-label="Claim Information"] > legend').after(claimInformationNoteHtmlContent);
        }
      } else if ((completingCategoryElement === null || completingCategoryElement === void 0 ? void 0 : completingCategoryElement.value) === '255550001') {
        if (!document.querySelector('#claimInformationNote')) {
          var _claimInformationNoteHtmlContent2 = "<div id=\"claimInformationNote\" style=\"padding-bottom: 20px;\">\n        The Reimbursement Amount Requested should be the same as your approved Authorization Letter.<br />\n        <br />\n        The Program requires paid invoice(s) from the Consultant and proof of payment such as a cancelled cheque(s) or credit card transaction receipt(s).</div>";
          $('fieldset[aria-label="Claim Information"] > legend').after(_claimInformationNoteHtmlContent2);
        }
      }
    }
  }
  function customizeInterimPaymentAmountField() {
    var _$3;
    var iterimPaymentAmount = (_$3 = $('#quartech_requestedinterimpaymentamount')) === null || _$3 === void 0 ? void 0 : _$3.val();
    // @ts-ignore
    var value = parseFloat(iterimPaymentAmount.replace(/,/g, ''));
    if (isNaN(value)) value = 0.0;
    if (value > 0) {
      setFieldReadOnly('quartech_requestedinterimpaymentamount');
      setFieldReadOnly('quartech_interimorfinalpayment');
    } else {
      hideQuestion('quartech_requestedinterimpaymentamount');
    }
  }

  function customizeDeclarationConsentStep(programData) {
    hideFieldsAndSections(false);
    addConsent(programData === null || programData === void 0 ? void 0 : programData.quartech_applicantportalprogramname);
  }
  function addConsent(programName) {
    var programNameTag = '%%ProgramName%%';
    var htmlConsent = "\n    <div style='font-style: italic;'>\n      <span>BY SUBMITTING THIS CLAIM FOR PAYMENT FORM TO %%ProgramName%% (the \"Program\"), I:</span>\n      <u style='text-decoration:none;'>\n          <li>represent that I am the applicant or the fully authorized signatory of the applicant;</li>\n          <li>declare that I have/the applicant has not knowingly submitted false or misleading information and that the information provided in this claim for payment form and attachments is true and correct in every respect to the best of my/the applicant's knowledge;</li>\n          <li>acknowledge the information provided on this claim for payment and attachments will be used by the Ministry of Agriculture and Food (the \"Ministry\") to assess the applicant's eligibility for funding from the Program;</li>\n          <li>understand that failing to comply with all application requirements may delay the processing of the application or make the applicant ineligible to receive funding under the Program;</li>\n          <li>represent that I have/the applicant has read and understood the Program Terms and Conditions and agree(s) to be bound by the Program Terms and Conditions;</li>\n          <li>represent that the applicant is in compliance with all Program eligibility requirements as described in the Program Terms and Conditions, and in this document;</li>\n          <li>agree to proactively disclose to the Program all other sources of funding the applicant or any partners within the same organization or the same farming or food processing operation receives with respect to the projects funded by this Program, including financial and/or in-kind contributions from federal, provincial, or municipal government;</li>\n          <li>understand that the Program covers costs up to the maximum Approved amount. Any additional fees over and above the approved amount are the responsibility of the applicant and will not be covered by the B.C. Ministry of Agriculture and Food.</li>\n          <li>acknowledge that the Business Number (GST Number) is collected by the Ministry under the authority of the Income Tax Act for the purpose of reporting income.</li>\n      </u>\n      <br/>\n  </div>";
    htmlConsent = htmlConsent.replace(programNameTag, programName);
    var consentDiv = document.createElement('div');
    consentDiv.innerHTML = htmlConsent;
    $("[data-name='applicantDeclarationSection']");
    $("[data-name='applicantDeclarationSection']").parent().prepend(consentDiv);
  }

  function customizeDocumentsStep(currentStep) {
    setStepRequiredFields(currentStep);
    var programAbbreviation = getProgramAbbreviation();
    if (programAbbreviation === 'NEFBA') {
      observeIframeChanges(customizeBusinessPlanDocumentsQuestions, null, 'quartech_completingcategory');
    }
    if (programAbbreviation.includes('ABPP') || programAbbreviation === 'NEFBA') {
      if (!document.querySelector('#supportingDocumentationNote')) {
        var supportingDocumentationNoteHtmlContent = "\n      <div id=\"supportingDocumentationNote\" style=\"padding-bottom: 20px;\">\n        Please Choose or Drag & Drop files to the grey box below to upload the following documents as attachments (as applicable)\n      </div>";
        $('fieldset[aria-label="Supporting Documents"] > legend').after(supportingDocumentationNoteHtmlContent);
      }
      if (!document.querySelector('#beforeContinuingNote')) {
        var beforeContinuingNoteHtmlContent = "\n        <div id=\"beforeContinuingNote\" style=\"padding-bottom: 20px;\">\n          Please ensure you have the correct files before clicking \u201CNext\u201D. If you move to the next stage of the Claim for Payment form you can no longer delete uploaded files. However, you can always add new files.<br />\n          <br />\n          If you have moved to the next stage and then wish to change an uploaded file, simply return to the document submission and upload the replacement file as an additional file. Give the file a name with an indication that it is a replacement (e.g. \"Budget NEW.xls\").\n        </div>\n      ";
        $('#EntityFormView').after(beforeContinuingNoteHtmlContent);
      }
    }
  }
  function customizeBusinessPlanDocumentsQuestions() {
    var iframe = document.querySelector('fieldset[aria-label="Coding Section (DO NOT REMOVE)"] iframe');
    // @ts-ignore
    var innerDoc = iframe !== null && iframe !== void 0 && iframe.contentDocument // @ts-ignore
    ? iframe.contentDocument
    // @ts-ignore
    : iframe.contentWindow.document;
    var completingCategoryElement = innerDoc === null || innerDoc === void 0 ? void 0 : innerDoc.getElementById('quartech_completingcategory');
    if (!!completingCategoryElement) {
      if ((completingCategoryElement === null || completingCategoryElement === void 0 ? void 0 : completingCategoryElement.value) === '255550000') {
        hideQuestion('quartech_invoices');
        hideQuestion('quartech_proofofpayment');
      }
    }
  }

  function customizeProjectIndicatorStep(currentStep) {
    // initInputMasking();
    setStepRequiredFields(currentStep);
    var programAbbreviation = getProgramAbbreviation();
    if (programAbbreviation.includes('ABPP') || programAbbreviation === 'NEFBA') {
      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnValue: YES_VALUE,
        dependentOnElementTag: 'quartech_adoptedprojectresults',
        requiredFieldTag: 'quartech_adoptednumber'
      });
      // @ts-ignore
      initOnChange_DependentRequiredField({
        dependentOnValue: YES_VALUE,
        dependentOnElementTag: 'quartech_environmentallybeneficialadoptedresults',
        requiredFieldTag: 'quartech_environmentallybeneficialadoptednumber'
      });
    }
    if (programAbbreviation === 'ABPP2') {
      observeIframeChanges(customizeSingleOrGroupApplicantQuestions, 'quartech_groupprojectsupportingsectorcapacitybuilding', 'quartech_singleorgroupapplication');
    }
  }

  var logger$3 = Logger('claim/claim');
  function initClaim() {
    hideFieldsAndSections();
    updatePageForSelectedProgram();
    addNewAppSystemNotice();
  }
  function updatePageForSelectedProgram() {
    var programid = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
    if (!programid) programid = getProgramId();
    logger$3.info({
      fn: updatePageForSelectedProgram,
      message: "Retrieving Program data for the selected programid querystring: ".concat(programid)
    });
    getClaimFormData({
      programId: programid,
      beforeSend: function beforeSend() {
        logger$3.info({
          fn: updatePageForSelectedProgram,
          message: 'clear any cached data from previous page loads'
        });
        localStorage.clear();
      },
      onSuccess: function onSuccess(programData, textStatus, xhr) {
        if (programData) {
          logger$3.info({
            fn: updatePageForSelectedProgram,
            message: 'Retrieved Program data:',
            data: programData
          });
          localStorage.setItem('programData', JSON.stringify(programData));
          logger$3.info({
            fn: updatePageForSelectedProgram,
            message: 'Update application page with the program data.'
          });
          populateContentForSelectedProgramStream(programData);
          hideLoadingAnimation();
        }
      }
    });
  }
  function populateContentForSelectedProgramStream(programData) {
    var _document$querySelect, _document$querySelect2, _document$querySelect3, _document$querySelect4, _document$querySelect5;
    // cleanup unnecessary divs
    (_document$querySelect = document.querySelector('#page-title-container > p:nth-child(5)')) === null || _document$querySelect === void 0 || _document$querySelect.remove();
    (_document$querySelect2 = document.querySelector('#page-title')) === null || _document$querySelect2 === void 0 || _document$querySelect2.remove();
    (_document$querySelect3 = document.querySelector('#page-subtitle')) === null || _document$querySelect3 === void 0 || _document$querySelect3.remove();
    (_document$querySelect4 = document.querySelector('#page-title-container > p.smallText')) === null || _document$querySelect4 === void 0 || _document$querySelect4.remove();
    (_document$querySelect5 = document.querySelector('#page-description')) === null || _document$querySelect5 === void 0 || _document$querySelect5.remove();

    // Populate the Page Title, Sub-Title and Description
    $('#page-title-container').prepend(programData.quartech_claimformheaderhtmlcontent);
    updateClaimFormStepForSelectedProgram(programData);
  }
  function updateClaimFormStepForSelectedProgram(programData) {
    var currentStep = getCurrentStep();
    switch (currentStep) {
      case FormStep.ClaimInfo:
        customizeClaimInfoStep();
        break;
      case FormStep.ProjectIndicators:
        customizeProjectIndicatorStep(currentStep);
        break;
      case FormStep.Documents:
        customizeDocumentsStep(currentStep);
        break;
      case FormStep.Consent:
        customizeDeclarationConsentStep(programData);
        break;
    }
  }
  function addNewAppSystemNotice() {
    var _getClaimConfigData;
    var newAppSystemNoticeDiv = document.createElement('div');
    newAppSystemNoticeDiv.id = "new_app_system_notice_div";
    // @ts-ignore
    newAppSystemNoticeDiv.style = 'float: left;';
    var systemNotice = (_getClaimConfigData = getClaimConfigData()) === null || _getClaimConfigData === void 0 ? void 0 : _getClaimConfigData.SystemNotice;
    newAppSystemNoticeDiv.innerHTML = systemNotice;
    var actionsDiv = $("#NextButton").parent().parent().parent();
    actionsDiv.append(newAppSystemNoticeDiv);
  }

  var logger$2 = Logger('powerpod');
  function powerpod(options) {
    // try to autodetect the form type if not passed
    if (!(options !== null && options !== void 0 && options.form)) {
      var path = win.location.pathname;
      if (ClaimPaths.some(function (claimPath) {
        return path.includes(claimPath);
      })) {
        logger$2.info({
          message: "auto-detected ".concat(Form.Claim, " form")
        });
        setOption('form', Form.Claim);
      } else if (ApplicationPaths.some(function (appPath) {
        return path.includes(appPath);
      })) {
        logger$2.info({
          message: "auto-detected ".concat(Form.Application, " form")
        });
        setOption('form', Form.Application);
      } else {
        logger$2.error({
          message: "Unable to autodetect form type, path: ".concat(path)
        });
      }
    }

    // combine given options and default options
    setOptions(options);
    logger$2.info({
      message: 'setting up API with options:',
      data: getOptions()
    });
    setAPI();
    switch (getOptions().form) {
      case Form.Application:
        logger$2.info({
          message: "initializing ".concat(Form.Application)
        });
        initApplication();
        break;
      case Form.Claim:
        logger$2.info({
          message: "initializing ".concat(Form.Claim)
        });
        initClaim();
        break;
      default:
        logger$2.error({
          message: 'unable to init, no form type defined in options'
        });
        break;
    }

    // @ts-ignore
    return win.powerpod;
  }
  function setAPI() {
    // @ts-ignore
    POWERPOD.getPowerpodData = function () {
      return {
        options: getOptions()
      };
    };
    // @ts-ignore
    POWERPOD.version = '0.6.2';
    // @ts-ignore
    win.powerpod = POWERPOD;
  }

  var logger$1 = Logger('jquery-adapter');

  /**
   * jQuery adapter for powerpod.js
   */
  function initJQueryAdapter() {
    return _initJQueryAdapter.apply(this, arguments);
  }
  function _initJQueryAdapter() {
    _initJQueryAdapter = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
      var successMsg, errorMsg;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            logger$1.info({
              fn: initJQueryAdapter,
              message: 'initializing jQuery adapter...'
            });
            // @ts-ignore
            if (!win.jQuery) {
              _context.next = 5;
              break;
            }
            (function ($, powerpod) {

              // No jQuery No Go
              if (!$ || !powerpod) {
                var errorMsg = 'jQuery is required to use the jQuery powerpod!';
                logger$1.error({
                  fn: initJQueryAdapter,
                  message: errorMsg
                });
                return Promise.reject(errorMsg);
              }
              $.fn.powerpod = function (options) {
                options = $.extend({}, options, {
                  $: $
                });
                logger$1.info({
                  message: '$.fn.powerpod was called with options:',
                  data: options
                });

                // Initialize
                powerpod(options);
                logger$1.info({
                  message: 'creating the $.fn.powerpod object from POWERPOD:',
                  data: POWERPOD
                });
                Object.keys(POWERPOD).forEach(function (key) {
                  getOptions().$.fn.powerpod[key] = POWERPOD[key];
                });
              };
              successMsg = 'successfully initialized jQuery adapter...';
              logger$1.info({
                fn: initJQueryAdapter,
                message: successMsg
              });
              return;
              // @ts-ignore
            })(win.jQuery, powerpod);
            _context.next = 8;
            break;
          case 5:
            errorMsg = 'jQuery is required to use the jQuery powerpod!';
            logger$1.error({
              fn: initJQueryAdapter,
              message: errorMsg
            });
            return _context.abrupt("return", Promise.reject(errorMsg));
          case 8:
            return _context.abrupt("return", Promise.resolve(successMsg));
          case 9:
          case "end":
            return _context.stop();
        }
      }, _callee);
    }));
    return _initJQueryAdapter.apply(this, arguments);
  }

  var logger = Logger('app');
  function autoinit() {
    logger.info({
      fn: autoinit,
      message: "starting autoinit, href: ".concat(win.location.href)
    });
    var _win$location = win.location,
      host = _win$location.host,
      path = _win$location.pathname;

    // TODO: auto-detect environment based on host URL
    // for now manually configure these options:
    var env = Environment.DEV,
      logging = true;

    // ensure that powerpod is allowed to run in the current env
    if (!getOptions().allowedEnvs.includes(env)) {
      logger.error({
        fn: autoinit,
        message: "current environment is not in list of allowed environments, env: ".concat(env, ", allowedEnvs:"),
        data: getOptions().allowedEnvs
      });
      return;
    }

    // ensure that current host is in the list of allowed hosts in options
    if (!getOptions().allowedHosts.includes(host)) {
      logger.error({
        fn: autoinit,
        message: "current host is not in list of allowed hosts, host: ".concat(host, ", allowedHosts:"),
        data: getOptions().allowedHosts
      });
      return;
    }

    // ensure current path is in the list of allowed paths from options
    if (!getOptions().allowedPaths.some(function (allowedPath) {
      return path.includes(allowedPath);
    })) {
      logger.error({
        fn: autoinit,
        message: "current path is not in list of allowed paths, path: ".concat(path, ", allowedPaths:"),
        data: getOptions().allowedPaths
      });
      return;
    }
    var options = {
      env: env,
      logging: logging
    };
    logger.info({
      fn: autoinit,
      message: 'calling powerpod jQuery handler with options:',
      data: options
    });
    // @ts-ignore
    $.fn.powerpod(options);
  }
  function start() {
    return _start.apply(this, arguments);
  }
  function _start() {
    _start = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
      var successMsg;
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            logger.info({
              fn: start,
              message: 'initializing jQuery adapter...'
            });
            _context.next = 4;
            return initJQueryAdapter();
          case 4:
            successMsg = _context.sent;
            logger.info({
              fn: start,
              message: successMsg
            });
            _context.next = 12;
            break;
          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](0);
            logger.error({
              fn: start,
              message: _context.t0
            });
            throw new Error(_context.t0);
          case 12:
            if (getOptions().autoinit) {
              _context.next = 15;
              break;
            }
            logger.info({
              fn: start,
              message: 'skipping autoinit, not configured in options'
            });
            return _context.abrupt("return");
          case 15:
            autoinit();
          case 16:
          case "end":
            return _context.stop();
        }
      }, _callee, null, [[0, 8]]);
    }));
    return _start.apply(this, arguments);
  }
  (function () {
    logger.info({
      message: 'checking for jQuery...'
    });
    // @ts-ignore
    if (win.jQuery) {
      logger.info({
        message: 'jQuery found, running start...'
      });
      start();
    } else if (doc.readyState === 'complete') {
      logger.info({
        message: 'jQuery not found, but should be present at this point, running start...'
      });
      start();
    } else if (doc.addEventListener) {
      logger.info({
        message: 'jQuery not found, adding listener for document ready state...'
      });
      doc.addEventListener('readystatechange', function () {
        switch (doc.readyState) {
          case 'loading':
            logger.info({
              message: 'document.readyState: ' + doc.readyState + "- The document is still loading."
            });
            break;
          case 'interactive':
            logger.info({
              message: 'document.readyState: ' + doc.readyState + "- The document has finished loading DOM. " + "- \"DOMContentLoaded\" event"
            });
            break;
          case 'complete':
            logger.info({
              message: 'document.readyState: ' + doc.readyState + "- The page DOM with Sub-resources are now fully loaded. " + "- \"load\" event"
            });
            logger.info({
              message: 'document load complete, running start...'
            });
            start();
            break;
        }
      });
    } else if (win) {
      logger.info({
        message: 'jQuery not found AND doc.addEventListener not found, adding listener for window loaded state...'
      });
      win.addEventListener('load', function () {
        start();
      });
    } else {
      logger.error({
        message: 'issue initializing app!'
      });
    }
  })();

  return powerpod;

}));
