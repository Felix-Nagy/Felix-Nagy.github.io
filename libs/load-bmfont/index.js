define([""], function() {
  //var xhr = require("xhr");
  "use strict";
  var loadBmFont = {};

  loadBmFont.getFont = function(opt, cb) {
    cb = typeof cb === "function" ? cb : noop;

    if (typeof opt === "string") opt = { uri: opt };
    else if (!opt) opt = {};

    var expectBinary = opt.binary;
    if (expectBinary) opt = getBinaryOpts(opt);

    createXHR(opt, function(err, res, body) {
      if (err) return cb(err);
      if (!/^2/.test(res.statusCode))
        return cb(new Error("http status code: " + res.statusCode));
      if (!body) return cb(new Error("no body result"));

      var binary = false;

      //if the response type is an array buffer,
      //we need to convert it into a regular Buffer object
      if (isArrayBuffer(body)) {
        var array = new Uint8Array(body);
        body = new Buffer(array, "binary");
      }

      //now check the string/Buffer response
      //and see if it has a binary BMF header
      if (isBinaryFormat(body)) {
        binary = true;
        //if we have a string, turn it into a Buffer
        if (typeof body === "string") body = new Buffer(body, "binary");
      }

      //we are not parsing a binary format, just ASCII/XML/etc
      if (!binary) {
        //might still be a buffer if responseType is 'arraybuffer'
        if (Buffer.isBuffer(body)) body = body.toString(opt.encoding);
        body = body.trim();
      }

      var result;
      try {
        var type = res.headers["content-type"];
        if (binary) result = readBinary(body);
        else if (/json/.test(type) || body.charAt(0) === "{")
          result = JSON.parse(body);
        else if (/xml/.test(type) || body.charAt(0) === "<")
          result = parseXML(body);
        else result = parseASCII(body);
      } catch (e) {
        cb(new Error("error parsing font " + e.message));
        cb = noop;
      }
      cb(null, result);
    });
  };
  return loadBmFont;
  //
  // global win
  //
  var win;

  if (typeof window !== "undefined") {
    win = window;
  } else if (typeof global !== "undefined") {
    win = global;
  } else if (typeof self !== "undefined") {
    win = self;
  } else {
    win = {};
  }

  //
  // isFunction
  //
  var toString = Object.prototype.toString;
  function isFunction(fn) {
    var string = toString.call(fn);
    return (
      string === "[object Function]" ||
      (typeof fn === "function" && string !== "[object RegExp]") ||
      (typeof window !== "undefined" &&
        // IE8 and below
        (fn === window.setTimeout ||
          fn === window.alert ||
          fn === window.confirm ||
          fn === window.prompt))
    );
  }

  var trim = function(string) {
      return string.replace(/^\s+|\s+$/g, "");
    },
    isArray = function(arg) {
      return Object.prototype.toString.call(arg) === "[object Array]";
    };

  //
  // parseHeaders
  //

  function parseHeaders(headers) {
    if (!headers) return {};

    var result = {};

    var headersArr = trim(headers).split("\n");

    for (var i = 0; i < headersArr.length; i++) {
      var row = headersArr[i];
      var index = row.indexOf(":"),
        key = trim(row.slice(0, index)).toLowerCase(),
        value = trim(row.slice(index + 1));

      if (typeof result[key] === "undefined") {
        result[key] = value;
      } else if (isArray(result[key])) {
        result[key].push(value);
      } else {
        result[key] = [result[key], value];
      }
    }

    return result;
  }

  //var createXHR;
  // Allow use of default import syntax in TypeScript

  createXHR.XMLHttpRequest = window.XMLHttpRequest || noop;
  createXHR.XDomainRequest =
    "withCredentials" in new createXHR.XMLHttpRequest()
      ? createXHR.XMLHttpRequest
      : window.XDomainRequest;

  forEachArray(["get", "put", "post", "patch", "head", "delete"], function(
    method
  ) {
    createXHR[method === "delete" ? "del" : method] = function(
      uri,
      options,
      callback
    ) {
      options = initParams(uri, options, callback);
      options.method = method.toUpperCase();
      return _createXHR(options);
    };
  });

  function forEachArray(array, iterator) {
    for (var i = 0; i < array.length; i++) {
      iterator(array[i]);
    }
  }

  function isEmpty(obj) {
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) return false;
    }
    return true;
  }

  function initParams(uri, options, callback) {
    var params = uri;

    if (isFunction(options)) {
      callback = options;
      if (typeof uri === "string") {
        params = { uri: uri };
      }
    } else {
      params = xtend(options, { uri: uri });
    }

    params.callback = callback;
    return params;
  }

  function createXHR(uri, options, callback) {
    options = initParams(uri, options, callback);
    return _createXHR(options);
  }

  function _createXHR(options) {
    if (typeof options.callback === "undefined") {
      throw new Error("callback argument missing");
    }

    var called = false;
    var callback = function cbOnce(err, response, body) {
      if (!called) {
        called = true;
        options.callback(err, response, body);
      }
    };

    function readystatechange() {
      if (xhr.readyState === 4) {
        setTimeout(loadFunc, 0);
      }
    }

    function getBody() {
      // Chrome with requestType=blob throws errors arround when even testing access to responseText
      var body = undefined;

      if (xhr.response) {
        body = xhr.response;
      } else {
        body = xhr.responseText || getXml(xhr);
      }

      if (isJson) {
        try {
          body = JSON.parse(body);
        } catch (e) {}
      }

      return body;
    }

    function errorFunc(evt) {
      clearTimeout(timeoutTimer);
      if (!(evt instanceof Error)) {
        evt = new Error("" + (evt || "Unknown XMLHttpRequest Error"));
      }
      evt.statusCode = 0;
      return callback(evt, failureResponse);
    }

    // will load the data & process the response in a special response object
    function loadFunc() {
      if (aborted) return;
      var status;
      clearTimeout(timeoutTimer);
      if (options.useXDR && xhr.status === undefined) {
        //IE8 CORS GET successful response doesn't have a status field, but body is fine
        status = 200;
      } else {
        status = xhr.status === 1223 ? 204 : xhr.status;
      }
      var response = failureResponse;
      var err = null;

      if (status !== 0) {
        response = {
          body: getBody(),
          statusCode: status,
          method: method,
          headers: {},
          url: uri,
          rawRequest: xhr
        };
        if (xhr.getAllResponseHeaders) {
          //remember xhr can in fact be XDR for CORS in IE
          response.headers = parseHeaders(xhr.getAllResponseHeaders());
        }
      } else {
        err = new Error("Internal XMLHttpRequest Error");
      }
      return callback(err, response, response.body);
    }

    var xhr = options.xhr || null;

    if (!xhr) {
      if (options.cors || options.useXDR) {
        xhr = new createXHR.XDomainRequest();
      } else {
        xhr = new createXHR.XMLHttpRequest();
      }
    }

    var key;
    var aborted;
    var uri = (xhr.url = options.uri || options.url);
    var method = (xhr.method = options.method || "GET");
    var body = options.body || options.data;
    var headers = (xhr.headers = options.headers || {});
    var sync = !!options.sync;
    var isJson = false;
    var timeoutTimer;
    var failureResponse = {
      body: undefined,
      headers: {},
      statusCode: 0,
      method: method,
      url: uri,
      rawRequest: xhr
    };

    if ("json" in options && options.json !== false) {
      isJson = true;
      headers["accept"] ||
        headers["Accept"] ||
        (headers["Accept"] = "application/json"); //Don't override existing accept header declared by user
      if (method !== "GET" && method !== "HEAD") {
        headers["content-type"] ||
          headers["Content-Type"] ||
          (headers["Content-Type"] = "application/json"); //Don't override existing accept header declared by user
        body = JSON.stringify(options.json === true ? body : options.json);
      }
    }

    xhr.onreadystatechange = readystatechange;
    xhr.onload = loadFunc;
    xhr.onerror = errorFunc;
    // IE9 must have onprogress be set to a unique function.
    xhr.onprogress = function() {
      // IE must die
    };
    xhr.onabort = function() {
      aborted = true;
    };
    xhr.ontimeout = errorFunc;
    xhr.open(method, uri, !sync, options.username, options.password);
    //has to be after open
    if (!sync) {
      xhr.withCredentials = !!options.withCredentials;
    }
    // Cannot set timeout with sync request
    // not setting timeout on the xhr object, because of old webkits etc. not handling that correctly
    // both npm's request and jquery 1.x use this kind of timeout, so this is being consistent
    if (!sync && options.timeout > 0) {
      timeoutTimer = setTimeout(function() {
        if (aborted) return;
        aborted = true; //IE9 may still call readystatechange
        xhr.abort("timeout");
        var e = new Error("XMLHttpRequest timeout");
        e.code = "ETIMEDOUT";
        errorFunc(e);
      }, options.timeout);
    }

    if (xhr.setRequestHeader) {
      for (key in headers) {
        if (headers.hasOwnProperty(key)) {
          xhr.setRequestHeader(key, headers[key]);
        }
      }
    } else if (options.headers && !isEmpty(options.headers)) {
      throw new Error("Headers cannot be set on an XDomainRequest object");
    }

    if ("responseType" in options) {
      xhr.responseType = options.responseType;
    }

    if ("beforeSend" in options && typeof options.beforeSend === "function") {
      options.beforeSend(xhr);
    }

    // Microsoft Edge browser sends "undefined" when send is called with undefined value.
    // XMLHttpRequest spec says to pass null as body to indicate no body
    // See https://github.com/naugtur/xhr/issues/100.
    xhr.send(body || null);

    return xhr;
  }

  function getXml(xhr) {
    // xhr.responseXML will throw Exception "InvalidStateError" or "DOMException"
    // See https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseXML.
    try {
      if (xhr.responseType === "document") {
        return xhr.responseXML;
      }
      var firefoxBugTakenEffect =
        xhr.responseXML &&
        xhr.responseXML.documentElement.nodeName === "parsererror";
      if (xhr.responseType === "" && !firefoxBugTakenEffect) {
        return xhr.responseXML;
      }
    } catch (e) {}

    return null;
  }

  var noop = function() {};
  //var parseXML = require("parse-bmfont-xml");

  //
  // parseASCII
  //

  function parseASCII(data) {
    if (!data) throw new Error("no data provided");
    data = data.toString().trim();

    var output = {
      pages: [],
      chars: [],
      kernings: []
    };

    var lines = data.split(/\r\n?|\n/g);

    if (lines.length === 0) throw new Error("no data in BMFont file");

    for (var i = 0; i < lines.length; i++) {
      var lineData = splitLine(lines[i], i);
      if (!lineData)
        //skip empty lines
        continue;

      if (lineData.key === "page") {
        if (typeof lineData.data.id !== "number")
          throw new Error(
            "malformed file at line " + i + " -- needs page id=N"
          );
        if (typeof lineData.data.file !== "string")
          throw new Error(
            "malformed file at line " + i + ' -- needs page file="path"'
          );
        output.pages[lineData.data.id] = lineData.data.file;
      } else if (lineData.key === "chars" || lineData.key === "kernings") {
        //... do nothing for these two ...
      } else if (lineData.key === "char") {
        output.chars.push(lineData.data);
      } else if (lineData.key === "kerning") {
        output.kernings.push(lineData.data);
      } else {
        output[lineData.key] = lineData.data;
      }
    }

    return output;
  }

  function splitLine(line, idx) {
    line = line.replace(/\t+/g, " ").trim();
    if (!line) return null;

    var space = line.indexOf(" ");
    if (space === -1) throw new Error("no named row at line " + idx);

    var key = line.substring(0, space);

    line = line.substring(space + 1);
    //clear "letter" field as it is non-standard and
    //requires additional complexity to parse " / = symbols
    line = line.replace(/letter=[\'\"]\S+[\'\"]/gi, "");
    line = line.split("=");
    line = line.map(function(str) {
      return str.trim().match(/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g);
    });

    var data = [];
    for (var i = 0; i < line.length; i++) {
      var dt = line[i];
      if (i === 0) {
        data.push({
          key: dt[0],
          data: ""
        });
      } else if (i === line.length - 1) {
        data[data.length - 1].data = parseData(dt[0]);
      } else {
        data[data.length - 1].data = parseData(dt[0]);
        data.push({
          key: dt[1],
          data: ""
        });
      }
    }

    var out = {
      key: key,
      data: {}
    };

    data.forEach(function(v) {
      out.data[v.key] = v.data;
    });

    return out;
  }

  function parseData(data) {
    if (!data || data.length === 0) return "";

    if (data.indexOf('"') === 0 || data.indexOf("'") === 0)
      return data.substring(1, data.length - 1);
    if (data.indexOf(",") !== -1) return parseIntList(data);
    return parseInt(data, 10);
  }

  function parseIntList(data) {
    return data.split(",").map(function(val) {
      return parseInt(val, 10);
    });
  }

  //
  // readBinary
  //
  var HEADER = [66, 77, 70];

  function readBinary(buf) {
    if (buf.length < 6) throw new Error("invalid buffer length for BMFont");

    var header = HEADER.every(function(byte, i) {
      return buf.readUInt8(i) === byte;
    });

    if (!header) throw new Error("BMFont missing BMF byte header");

    var i = 3;
    var vers = buf.readUInt8(i++);
    if (vers > 3)
      throw new Error("Only supports BMFont Binary v3 (BMFont App v1.10)");

    var target = { kernings: [], chars: [] };
    for (var b = 0; b < 5; b++) i += readBlock(target, buf, i);
    return target;
  }

  function readBlock(target, buf, i) {
    if (i > buf.length - 1) return 0;

    var blockID = buf.readUInt8(i++);
    var blockSize = buf.readInt32LE(i);
    i += 4;

    switch (blockID) {
      case 1:
        target.info = readInfo(buf, i);
        break;
      case 2:
        target.common = readCommon(buf, i);
        break;
      case 3:
        target.pages = readPages(buf, i, blockSize);
        break;
      case 4:
        target.chars = readChars(buf, i, blockSize);
        break;
      case 5:
        target.kernings = readKernings(buf, i, blockSize);
        break;
    }
    return 5 + blockSize;
  }

  function readInfo(buf, i) {
    var info = {};
    info.size = buf.readInt16LE(i);

    var bitField = buf.readUInt8(i + 2);
    info.smooth = (bitField >> 7) & 1;
    info.unicode = (bitField >> 6) & 1;
    info.italic = (bitField >> 5) & 1;
    info.bold = (bitField >> 4) & 1;

    //fixedHeight is only mentioned in binary spec
    if ((bitField >> 3) & 1) info.fixedHeight = 1;

    info.charset = buf.readUInt8(i + 3) || "";
    info.stretchH = buf.readUInt16LE(i + 4);
    info.aa = buf.readUInt8(i + 6);
    info.padding = [
      buf.readInt8(i + 7),
      buf.readInt8(i + 8),
      buf.readInt8(i + 9),
      buf.readInt8(i + 10)
    ];
    info.spacing = [buf.readInt8(i + 11), buf.readInt8(i + 12)];
    info.outline = buf.readUInt8(i + 13);
    info.face = readStringNT(buf, i + 14);
    return info;
  }

  function readCommon(buf, i) {
    var common = {};
    common.lineHeight = buf.readUInt16LE(i);
    common.base = buf.readUInt16LE(i + 2);
    common.scaleW = buf.readUInt16LE(i + 4);
    common.scaleH = buf.readUInt16LE(i + 6);
    common.pages = buf.readUInt16LE(i + 8);
    var bitField = buf.readUInt8(i + 10);
    common.packed = 0;
    common.alphaChnl = buf.readUInt8(i + 11);
    common.redChnl = buf.readUInt8(i + 12);
    common.greenChnl = buf.readUInt8(i + 13);
    common.blueChnl = buf.readUInt8(i + 14);
    return common;
  }

  function readPages(buf, i, size) {
    var pages = [];
    var text = readNameNT(buf, i);
    var len = text.length + 1;
    var count = size / len;
    for (var c = 0; c < count; c++) {
      pages[c] = buf.slice(i, i + text.length).toString("utf8");
      i += len;
    }
    return pages;
  }

  function readChars(buf, i, blockSize) {
    var chars = [];

    var count = blockSize / 20;
    for (var c = 0; c < count; c++) {
      var char = {};
      var off = c * 20;
      char.id = buf.readUInt32LE(i + 0 + off);
      char.x = buf.readUInt16LE(i + 4 + off);
      char.y = buf.readUInt16LE(i + 6 + off);
      char.width = buf.readUInt16LE(i + 8 + off);
      char.height = buf.readUInt16LE(i + 10 + off);
      char.xoffset = buf.readInt16LE(i + 12 + off);
      char.yoffset = buf.readInt16LE(i + 14 + off);
      char.xadvance = buf.readInt16LE(i + 16 + off);
      char.page = buf.readUInt8(i + 18 + off);
      char.chnl = buf.readUInt8(i + 19 + off);
      chars[c] = char;
    }
    return chars;
  }

  function readKernings(buf, i, blockSize) {
    var kernings = [];
    var count = blockSize / 10;
    for (var c = 0; c < count; c++) {
      var kern = {};
      var off = c * 10;
      kern.first = buf.readUInt32LE(i + 0 + off);
      kern.second = buf.readUInt32LE(i + 4 + off);
      kern.amount = buf.readInt16LE(i + 8 + off);
      kernings[c] = kern;
    }
    return kernings;
  }

  function readNameNT(buf, offset) {
    var pos = offset;
    for (; pos < buf.length; pos++) {
      if (buf[pos] === 0x00) break;
    }
    return buf.slice(offset, pos);
  }

  function readStringNT(buf, offset) {
    return readNameNT(buf, offset).toString("utf8");
  }

  var isBinaryFormat = require("./lib/is-binary");

  //
  // xtend
  //
  var hasOwnProperty = Object.prototype.hasOwnProperty;

  function xtend() {
    var target = {};

    for (var i = 0; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  }

  var xml2 = (function hasXML2() {
    return self.XMLHttpRequest && "withCredentials" in new XMLHttpRequest();
  })();

  function isArrayBuffer(arr) {
    var str = Object.prototype.toString;
    return str.call(arr) === "[object ArrayBuffer]";
  }

  function getBinaryOpts(opt) {
    //IE10+ and other modern browsers support array buffers
    if (xml2) return xtend(opt, { responseType: "arraybuffer" });

    if (typeof self.XMLHttpRequest === "undefined")
      throw new Error("your browser does not support XHR loading");

    //IE9 and XML1 browsers could still use an override
    var req = new self.XMLHttpRequest();
    req.overrideMimeType("text/plain; charset=x-user-defined");
    return xtend(
      {
        createXHR: req
      },
      opt
    );
  }
});
