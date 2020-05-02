define(["./three.min.js"],function(THREE) {
  //const THREE = require("./three.min.js");
//
// wordWrap
//https://github.com/mattdesl/word-wrapper
  var threeBmFontText = {};
  threeBmFontText.createTextGeometry = function (opt) {
    return new TextGeometry(opt);
  };

  var newline = /\n/
  var newlineChar = '\n'
  var whitespace = /\s/

  function wrap(text, opt) {
    var lines = wordwrap(text, opt)
    return lines.map(function (line) {
      return text.substring(line.start, line.end)
    }).join('\n')
  }

  function wordwrap(text, opt) {
    opt = opt || {}

    //zero width results in nothing visible
    if (opt.width === 0 && opt.mode !== 'nowrap')
      return []

    text = text || ''
    var width = typeof opt.width === 'number' ? opt.width : Number.MAX_VALUE
    var start = Math.max(0, opt.start || 0)
    var end = typeof opt.end === 'number' ? opt.end : text.length
    var mode = opt.mode

    var measure = opt.measure || monospace
    if (mode === 'pre')
      return pre(measure, text, start, end, width)
    else
      return greedy(measure, text, start, end, width, mode)
  }

  function idxOf(text, chr, start, end) {
    var idx = text.indexOf(chr, start)
    if (idx === -1 || idx > end)
      return end
    return idx
  }

  function isWhitespace(chr) {
    return whitespace.test(chr)
  }

  function pre(measure, text, start, end, width) {
    var lines = []
    var lineStart = start
    for (var i = start; i < end && i < text.length; i++) {
      var chr = text.charAt(i)
      var isNewline = newline.test(chr)

      //If we've reached a newline, then step down a line
      //Or if we've reached the EOF
      if (isNewline || i === end - 1) {
        var lineEnd = isNewline ? i : i + 1
        var measured = measure(text, lineStart, lineEnd, width)
        lines.push(measured)

        lineStart = i + 1
      }
    }
    return lines
  }

  function greedy(measure, text, start, end, width, mode) {
    //A greedy word wrapper based on LibGDX algorithm
    //https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/BitmapFontCache.java
    var lines = []

    var testWidth = width
    //if 'nowrap' is specified, we only wrap on newline chars
    if (mode === 'nowrap')
      testWidth = Number.MAX_VALUE

    while (start < end && start < text.length) {
      //get next newline position
      var newLine = idxOf(text, newlineChar, start, end)

      //eat whitespace at start of line
      while (start < newLine) {
        if (!isWhitespace(text.charAt(start)))
          break
        start++
      }

      //determine visible # of glyphs for the available width
      var measured = measure(text, start, newLine, testWidth)

      var lineEnd = start + (measured.end - measured.start)
      var nextStart = lineEnd + newlineChar.length

      //if we had to cut the line before the next newline...
      if (lineEnd < newLine) {
        //find char to break on
        while (lineEnd > start) {
          if (isWhitespace(text.charAt(lineEnd)))
            break
          lineEnd--
        }
        if (lineEnd === start) {
          if (nextStart > start + newlineChar.length) nextStart--
          lineEnd = nextStart // If no characters to break, show all.
        } else {
          nextStart = lineEnd
          //eat whitespace at end of line
          while (lineEnd > start) {
            if (!isWhitespace(text.charAt(lineEnd - newlineChar.length)))
              break
            lineEnd--
          }
        }
      }
      if (lineEnd >= start) {
        var result = measure(text, start, lineEnd, testWidth)
        lines.push(result)
      }
      start = nextStart
    }
    return lines
  }

//determines the visible number of glyphs within a given width
  function monospace(text, start, end, width) {
    var glyphs = Math.min(width, end - start)
    return {
      start: start,
      end: start + glyphs
    }
  }

//
//xtend
//https://github.com/Raynos/xtend
  var hasOwnProperty = Object.prototype.hasOwnProperty;

  function xtend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
      var source = arguments[i]

      for (var key in source) {
        if (hasOwnProperty.call(source, key)) {
          target[key] = source[key]
        }
      }
    }

    return target
  }

//
// asnumber
//https://github.com/mattdesl/as-number
  function as_number(num, def) {
    return typeof num === 'number'
        ? num
        : (typeof def === 'number' ? def : 0)
  }

  var X_HEIGHTS = ['x', 'e', 'a', 'o', 'n', 's', 'r', 'c', 'u', 'm', 'v', 'w', 'z']
  var M_WIDTHS = ['m', 'w']
  var CAP_HEIGHTS = ['H', 'I', 'N', 'E', 'F', 'K', 'L', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']


  var TAB_ID = '\t'.charCodeAt(0)
  var SPACE_ID = ' '.charCodeAt(0)
  var ALIGN_LEFT = 0,
      ALIGN_CENTER = 1,
      ALIGN_RIGHT = 2

//
// createLayout
//https://github.com/Jam3/layout-bmfont-text

  function createLayout(opt) {
    return new TextLayout(opt)
  }

  function TextLayout(opt) {
    this.glyphs = []
    this._measure = this.computeMetrics.bind(this)
    this.update(opt)
  }

  TextLayout.prototype.update = function (opt) {
    opt = xtend({
      measure: this._measure
    }, opt)
    this._opt = opt
    this._opt.tabSize = as_number(this._opt.tabSize, 4)

    if (!opt.font)
      throw new Error('must provide a valid bitmap font')

    var glyphs = this.glyphs
    var text = opt.text || ''
    var font = opt.font
    this._setupSpaceGlyphs(font)

    var lines = wordwrap(text, opt)
    var minWidth = opt.width || 0

    //clear glyphs
    glyphs.length = 0

    //get max line width
    var maxLineWidth = lines.reduce(function (prev, line) {
      return Math.max(prev, line.width, minWidth)
    }, 0)

    //the pen position
    var x = 0
    var y = 0
    var lineHeight = as_number(opt.lineHeight, font.common.lineHeight)
    var baseline = font.common.base
    var descender = lineHeight - baseline
    var letterSpacing = opt.letterSpacing || 0
    var height = lineHeight * lines.length - descender
    var align = getAlignType(this._opt.align)

    //draw text along baseline
    y -= height

    //the metrics for this text layout
    this._width = maxLineWidth
    this._height = height
    this._descender = lineHeight - baseline
    this._baseline = baseline
    this._xHeight = getXHeight(font)
    this._capHeight = getCapHeight(font)
    this._lineHeight = lineHeight
    this._ascender = lineHeight - descender - this._xHeight

    //layout each glyph
    var self = this
    lines.forEach(function (line, lineIndex) {
      var start = line.start
      var end = line.end
      var lineWidth = line.width
      var lastGlyph

      //for each glyph in that line...
      for (var i = start; i < end; i++) {
        var id = text.charCodeAt(i)
        var glyph = self.getGlyph(font, id)
        if (glyph) {
          if (lastGlyph)
            x += getKerning(font, lastGlyph.id, glyph.id)

          var tx = x
          if (align === ALIGN_CENTER)
            tx += (maxLineWidth - lineWidth) / 2
          else if (align === ALIGN_RIGHT)
            tx += (maxLineWidth - lineWidth)

          glyphs.push({
            position: [tx, y],
            data: glyph,
            index: i,
            line: lineIndex
          })

          //move pen forward
          x += glyph.xadvance + letterSpacing
          lastGlyph = glyph
        }
      }

      //next line down
      y += lineHeight
      x = 0
    })
    this._linesTotal = lines.length;
  }

  TextLayout.prototype._setupSpaceGlyphs = function (font) {
    //These are fallbacks, when the font doesn't include
    //' ' or '\t' glyphs
    this._fallbackSpaceGlyph = null
    this._fallbackTabGlyph = null

    if (!font.chars || font.chars.length === 0)
      return

    //try to get space glyph
    //then fall back to the 'm' or 'w' glyphs
    //then fall back to the first glyph available
    var space = getGlyphById(font, SPACE_ID)
        || getMGlyph(font)
        || font.chars[0]

    //and create a fallback for tab
    var tabWidth = this._opt.tabSize * space.xadvance
    this._fallbackSpaceGlyph = space
    this._fallbackTabGlyph = xtend(space, {
      x: 0, y: 0, xadvance: tabWidth, id: TAB_ID,
      xoffset: 0, yoffset: 0, width: 0, height: 0
    })
  }

  TextLayout.prototype.getGlyph = function (font, id) {
    var glyph = getGlyphById(font, id)
    if (glyph)
      return glyph
    else if (id === TAB_ID)
      return this._fallbackTabGlyph
    else if (id === SPACE_ID)
      return this._fallbackSpaceGlyph
    return null
  }

  TextLayout.prototype.computeMetrics = function (text, start, end, width) {
    var letterSpacing = this._opt.letterSpacing || 0
    var font = this._opt.font
    var curPen = 0
    var curWidth = 0
    var count = 0
    var glyph
    var lastGlyph

    if (!font.chars || font.chars.length === 0) {
      return {
        start: start,
        end: start,
        width: 0
      }
    }

    end = Math.min(text.length, end)
    for (var i = start; i < end; i++) {
      var id = text.charCodeAt(i)
      var glyph = this.getGlyph(font, id)

      if (glyph) {
        //move pen forward
        var xoff = glyph.xoffset
        var kern = lastGlyph ? getKerning(font, lastGlyph.id, glyph.id) : 0
        curPen += kern

        var nextPen = curPen + glyph.xadvance + letterSpacing
        var nextWidth = curPen + glyph.width

        //we've hit our limit; we can't move onto the next glyph
        if (nextWidth >= width || nextPen >= width)
          break

        //otherwise continue along our line
        curPen = nextPen
        curWidth = nextWidth
        lastGlyph = glyph
      }
      count++
    }

    //make sure rightmost edge lines up with rendered glyphs
    if (lastGlyph)
      curWidth += lastGlyph.xoffset

    return {
      start: start,
      end: start + count,
      width: curWidth
    }
  }

//getters for the private vars
  ;['width', 'height',
    'descender', 'ascender',
    'xHeight', 'baseline',
    'capHeight',
    'lineHeight'].forEach(addGetter)

  function addGetter(name) {
    Object.defineProperty(TextLayout.prototype, name, {
      get: wrapper(name),
      configurable: true
    })
  }

//create lookups for private vars
  function wrapper(name) {
    return (new Function([
      'return function ' + name + '() {',
      '  return this._' + name,
      '}'
    ].join('\n')))()
  }

  function getGlyphById(font, id) {
    if (!font.chars || font.chars.length === 0)
      return null

    var glyphIdx = findChar(font.chars, id)
    if (glyphIdx >= 0)
      return font.chars[glyphIdx]
    return null
  }

  function getXHeight(font) {
    for (var i = 0; i < X_HEIGHTS.length; i++) {
      var id = X_HEIGHTS[i].charCodeAt(0)
      var idx = findChar(font.chars, id)
      if (idx >= 0)
        return font.chars[idx].height
    }
    return 0
  }

  function getMGlyph(font) {
    for (var i = 0; i < M_WIDTHS.length; i++) {
      var id = M_WIDTHS[i].charCodeAt(0)
      var idx = findChar(font.chars, id)
      if (idx >= 0)
        return font.chars[idx]
    }
    return 0
  }

  function getCapHeight(font) {
    for (var i = 0; i < CAP_HEIGHTS.length; i++) {
      var id = CAP_HEIGHTS[i].charCodeAt(0)
      var idx = findChar(font.chars, id)
      if (idx >= 0)
        return font.chars[idx].height
    }
    return 0
  }

  function getKerning(font, left, right) {
    if (!font.kernings || font.kernings.length === 0)
      return 0

    var table = font.kernings
    for (var i = 0; i < table.length; i++) {
      var kern = table[i]
      if (kern.first === left && kern.second === right)
        return kern.amount
    }
    return 0
  }

  function getAlignType(align) {
    if (align === 'center')
      return ALIGN_CENTER
    else if (align === 'right')
      return ALIGN_RIGHT
    return ALIGN_LEFT
  }

  function findChar(array, value, start) {
    start = start || 0
    for (var i = start; i < array.length; i++) {
      if (array[i].id === value) {
        return i
      }
    }
    return -1
  }


//
// anArray
//https://github.com/hughsk/an-array
  function anArray(arr) {
    return (
        arr.BYTES_PER_ELEMENT
        && str.call(arr.buffer) === '[object ArrayBuffer]'
        || Array.isArray(arr)
    )
  }

//
// isBuffer
//https://github.com/feross/is-buffer

  function isBuffer(obj) {
    return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
  }

// For Node v0.10 support. Remove this eventually.
  function isSlowBuffer(obj) {
    return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
  }


  var CW = [0, 2, 3]
  var CCW = [2, 1, 3]

  function createIndices(array, opt) {
    //if user didn't specify an output array
    if (!array || !(anArray(array) || isBuffer(array))) {
      opt = array || {}
      array = null
    }

    if (typeof opt === 'number') //backwards-compatible
      opt = {count: opt}
    else
      opt = opt || {}

    var type = typeof opt.type === 'string' ? opt.type : 'uint16'
    var count = typeof opt.count === 'number' ? opt.count : 1
    var start = (opt.start || 0)

    var dir = opt.clockwise !== false ? CW : CCW,
        a = dir[0],
        b = dir[1],
        c = dir[2]

    var numIndices = count * 6

    var indices = array || new (dtype(type))(numIndices)
    for (var i = 0, j = 0; i < numIndices; i += 6, j += 4) {
      var x = i + start
      indices[x + 0] = j + 0
      indices[x + 1] = j + 1
      indices[x + 2] = j + 2
      indices[x + 3] = j + a
      indices[x + 4] = j + b
      indices[x + 5] = j + c
    }
    return indices
  }


//
//  inherits
//https://github.com/isaacs/inherits
  function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };

//
//  DTYPE
//
  function dtype(dtype) {
    switch (dtype) {
      case 'int8':
        return Int8Array
      case 'int16':
        return Int16Array
      case 'int32':
        return Int32Array
      case 'uint8':
        return Uint8Array
      case 'uint16':
        return Uint16Array
      case 'uint32':
        return Uint32Array
      case 'float32':
        return Float32Array
      case 'float64':
        return Float64Array
      case 'array':
        return Array
      case 'uint8_clamped':
        return Uint8ClampedArray
    }
  }

//
// flattenVertexData
//https://github.com/glo-js/flatten-vertex-data

  function flattenVertexData(data, output, offset) {
    if (!data) throw new TypeError('must specify data as first parameter')
    offset = +(offset || 0) | 0

    if (Array.isArray(data) && (data[0] && typeof data[0][0] === 'number')) {
      var dim = data[0].length
      var length = data.length * dim
      var i, j, k, l

      // no output specified, create a new typed array
      if (!output || typeof output === 'string') {
        output = new (dtype(output || 'float32'))(length + offset)
      }

      var dstLength = output.length - offset
      if (length !== dstLength) {
        throw new Error('source length ' + length + ' (' + dim + 'x' + data.length + ')' +
            ' does not match destination length ' + dstLength)
      }

      for (i = 0, k = offset; i < data.length; i++) {
        for (j = 0; j < dim; j++) {
          output[k++] = data[i][j] === null ? NaN : data[i][j]
        }
      }
    } else {
      if (!output || typeof output === 'string') {
        // no output, create a new one
        var Ctor = dtype(output || 'float32')

        // handle arrays separately due to possible nulls
        if (Array.isArray(data) || output === 'array') {
          output = new Ctor(data.length + offset)
          for (i = 0, k = offset, l = output.length; k < l; k++, i++) {
            output[k] = data[i] === null ? NaN : data[i]
          }
        } else {
          if (offset === 0) {
            output = new Ctor(data)
          } else {
            output = new Ctor(data.length + offset)

            output.set(data, offset)
          }
        }
      } else {
        // store output in existing array
        output.set(data, offset)
      }
    }

    return output
  }

  var warned = false;

//
// Buffer setIndex setAttribute
//https://github.com/feross/is-buffer

  function setIndex(geometry, data, itemSize, dtype) {
    if (typeof itemSize !== 'number') itemSize = 1
    if (typeof dtype !== 'string') dtype = 'uint16'

    var isR69 = !geometry.index && typeof geometry.setIndex !== 'function'
    var attrib = isR69 ? geometry.getAttribute('index') : geometry.index
    var newAttrib = updateAttribute(attrib, data, itemSize, dtype)
    if (newAttrib) {
      if (isR69) geometry.setAttribute('index', newAttrib)
      else geometry.index = newAttrib
    }
  }

  function setAttribute(geometry, key, data, itemSize, dtype) {
    if (typeof itemSize !== 'number') itemSize = 3
    if (typeof dtype !== 'string') dtype = 'float32'
    if (Array.isArray(data) &&
        Array.isArray(data[0]) &&
        data[0].length !== itemSize) {
      throw new Error('Nested vertex array has unexpected size; expected ' +
          itemSize + ' but found ' + data[0].length)
    }

    var attrib = geometry.getAttribute(key)
    var newAttrib = updateAttribute(attrib, data, itemSize, dtype)
    if (newAttrib) {
      geometry.setAttribute(key, newAttrib)
    }
  }

  function updateAttribute(attrib, data, itemSize, dtype) {
    data = data || []
    if (!attrib || rebuildAttribute(attrib, data, itemSize)) {
      // create a new array with desired type
      data = flattenVertexData(data, dtype)

      var needsNewBuffer = attrib && typeof attrib.setAttribute !== 'function'
      if (!attrib || needsNewBuffer) {
        // We are on an old version of ThreeJS which can't
        // support growing / shrinking buffers, so we need
        // to build a new buffer
        if (needsNewBuffer && !warned) {
          warned = true
          console.warn([
            'A WebGL buffer is being updated with a new size or itemSize, ',
            'however this version of ThreeJS only supports fixed-size buffers.',
            '\nThe old buffer may still be kept in memory.\n',
            'To avoid memory leaks, it is recommended that you dispose ',
            'your geometries and create new ones, or update to ThreeJS r82 or newer.\n',
            'See here for discussion:\n',
            'https://github.com/mrdoob/three.js/pull/9631'
          ].join(''))
        }

        // Build a new attribute
        attrib = new THREE.BufferAttribute(data, itemSize);
      }

      attrib.itemSize = itemSize
      attrib.needsUpdate = true

      // New versions of ThreeJS suggest using setArray
      // to change the data. It will use bufferData internally,
      // so you can change the array size without any issues
      if (typeof attrib.setAttribute === 'function') {
        attrib.setAttribute(data)
      }

      return attrib
    } else {
      // copy data into the existing array
      flattenVertexData(data, attrib.array)
      attrib.needsUpdate = true
      return null
    }
  }

// Test whether the attribute needs to be re-created,
// returns false if we can re-use it as-is.
  function rebuildAttribute(attrib, data, itemSize) {
    if (attrib.itemSize !== itemSize) return true
    if (!attrib.array) return true
    var attribLength = attrib.array.length
    if (Array.isArray(data) && Array.isArray(data[0])) {
      // [ [ x, y, z ] ]
      return attribLength !== data.length * itemSize
    } else {
      // [ x, y, z ]
      return attribLength !== data.length
    }
    return false
  }


  function pages(glyphs) {
    var pages = new Float32Array(glyphs.length * 4 * 1)
    var i = 0
    glyphs.forEach(function (glyph) {
      var id = glyph.data.page || 0
      pages[i++] = id
      pages[i++] = id
      pages[i++] = id
      pages[i++] = id
    })
    return pages
  }

  function vertices_uvs(glyphs, texWidth, texHeight, flipY) {
    var uvs = new Float32Array(glyphs.length * 4 * 2)
    var i = 0
    glyphs.forEach(function (glyph) {
      var bitmap = glyph.data
      var bw = (bitmap.x + bitmap.width)
      var bh = (bitmap.y + bitmap.height)

      // top left position
      var u0 = bitmap.x / texWidth
      var v1 = bitmap.y / texHeight
      var u1 = bw / texWidth
      var v0 = bh / texHeight

      if (flipY) {
        v1 = (texHeight - bitmap.y) / texHeight
        v0 = (texHeight - bh) / texHeight
      }

      // BL
      uvs[i++] = u0
      uvs[i++] = v1
      // TL
      uvs[i++] = u0
      uvs[i++] = v0
      // TR
      uvs[i++] = u1
      uvs[i++] = v0
      // BR
      uvs[i++] = u1
      uvs[i++] = v1
    })
    return uvs
  }

  function vertices_positions(glyphs) {
    var positions = new Float32Array(glyphs.length * 4 * 2)
    var i = 0
    glyphs.forEach(function (glyph) {
      var bitmap = glyph.data

      // bottom left position
      var x = glyph.position[0] + bitmap.xoffset
      var y = glyph.position[1] + bitmap.yoffset

      // quad size
      var w = bitmap.width
      var h = bitmap.height

      // BL
      positions[i++] = x
      positions[i++] = y
      // TL
      positions[i++] = x
      positions[i++] = y + h
      // TR
      positions[i++] = x + w
      positions[i++] = y + h
      // BR
      positions[i++] = x + w
      positions[i++] = y
    })
    return positions
  }


//
// three-bmfont-text utils
//
  var itemSize = 2
  var box = {min: [0, 0], max: [0, 0]}

  function bounds(positions) {
    var count = positions.length / itemSize
    box.min[0] = positions[0]
    box.min[1] = positions[1]
    box.max[0] = positions[0]
    box.max[1] = positions[1]

    for (var i = 0; i < count; i++) {
      var x = positions[i * itemSize + 0]
      var y = positions[i * itemSize + 1]
      box.min[0] = Math.min(x, box.min[0])
      box.min[1] = Math.min(y, box.min[1])
      box.max[0] = Math.max(x, box.max[0])
      box.max[1] = Math.max(y, box.max[1])
    }
  }

  function computeBox(positions, output) {
    bounds(positions)
    output.min.set(box.min[0], box.min[1], 0)
    output.max.set(box.max[0], box.max[1], 0)
  }

  function computeSphere(positions, output) {
    bounds(positions)
    var minX = box.min[0]
    var minY = box.min[1]
    var maxX = box.max[0]
    var maxY = box.max[1]
    var width = maxX - minX
    var height = maxY - minY
    var length = Math.sqrt(width * width + height * height)
    output.center.set(minX + width / 2, minY + height / 2, 0)
    output.radius = length / 2
  }


  var Base = THREE.BufferGeometry

  function TextGeometry(opt) {
    Base.call(this)

    if (typeof opt === 'string') {
      opt = {text: opt}
    }

    // use these as default values for any subsequent
    // calls to update()
    this._opt = Object.assign({}, opt)

    // also do an initial setup...
    if (opt) this.update(opt)
  }

  inherits(TextGeometry, Base)

  TextGeometry.prototype.update = function (opt) {
    if (typeof opt === 'string') {
      opt = {text: opt}
    }

    // use constructor defaults
    opt = Object.assign({}, this._opt, opt)

    if (!opt.font) {
      throw new TypeError('must specify a { font } in options')
    }

    this.layout = createLayout(opt)

    // get vec2 texcoords
    var flipY = opt.flipY !== false

    // the desired BMFont data
    var font = opt.font

    // determine texture size from font file
    var texWidth = font.common.scaleW
    var texHeight = font.common.scaleH

    // get visible glyphs
    var glyphs = this.layout.glyphs.filter(function (glyph) {
      var bitmap = glyph.data
      return bitmap.width * bitmap.height > 0
    })

    // provide visible glyphs for convenience
    this.visibleGlyphs = glyphs

    // get common vertex data
    var positions = vertices_positions(glyphs)
    var uvs = vertices_uvs(glyphs, texWidth, texHeight, flipY)
    var indices = createIndices({
      clockwise: true,
      type: 'uint16',
      count: glyphs.length
    })

    // update vertex data
    setIndex(this, indices, 1, 'uint16')
    setAttribute(this, 'position', positions, 2)
    setAttribute(this, 'uv', uvs, 2)

    // update multipage data
    if (!opt.multipage && 'page' in this.attributes) {
      // disable multipage rendering
      this.removeAttribute('page')
    } else if (opt.multipage) {
      var pages = pages(glyphs)
      // enable multipage rendering
      buffer.attr(this, 'page', pages, 1)
    }
  }

  TextGeometry.prototype.computeBoundingSphere = function () {
    if (this.boundingSphere === null) {
      this.boundingSphere = new THREE.Sphere()
    }

    var positions = this.attributes.position.array
    var itemSize = this.attributes.position.itemSize
    if (!positions || !itemSize || positions.length < 2) {
      this.boundingSphere.radius = 0
      this.boundingSphere.center.set(0, 0, 0)
      return
    }
    computeSphere(positions, this.boundingSphere)
    if (isNaN(this.boundingSphere.radius)) {
      console.error('THREE.BufferGeometry.computeBoundingSphere(): ' +
          'Computed radius is NaN. The ' +
          '"position" attribute is likely to have NaN values.')
    }
  }

  TextGeometry.prototype.computeBoundingBox = function () {
    if (this.boundingBox === null) {
      this.boundingBox = new THREE.Box3()
    }

    var bbox = this.boundingBox
    var positions = this.attributes.position.array
    var itemSize = this.attributes.position.itemSize
    if (!positions || !itemSize || positions.length < 2) {
      bbox.makeEmpty()
      return
    }
    computeBox(positions, bbox)
  }
  return threeBmFontText;
});
