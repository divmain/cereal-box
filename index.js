const { encodeText, decodeText } = require("./text");
const { encodeInt, decodeInt } = require("./int");


// Uint32Arrays must have a byte-offset divisible by 4.
const bump = offset => {
  const modulo = offset % 4;
  return modulo && (4 - modulo);
};

const pack = segments => {
  const segmentsWithLeadIns = segments.reduce((memo, segment) => {
    memo.push(encodeInt(segment.length));
    memo.push(segment);
    return memo;
  }, []);

  const length = segmentsWithLeadIns.reduce(
    (memo, segment) => memo + segment.length + bump(segment.length),
    0
  );
  const u8 = new Uint8Array(length);

  let offset = 0;
  segmentsWithLeadIns.forEach(segment => {
    u8.set(segment, offset);
    offset += segment.length + bump(segment.length);
  });

  return u8;
};

const unpack = u8 => {
  const segments = [];
  let offset = 0;
  const finalOffset = u8.length - 1;
  while (offset < finalOffset) {
    let segmentLength = decodeInt(u8.subarray(offset, offset + 4));
    offset += 4;

    segments.push(u8.subarray(offset, offset + segmentLength));
    offset += segmentLength + bump(segmentLength);
  }
  return segments;
};

const ident = x => x;

const getTypedPacker = types => {
  const transformers = types.map(t => {
    if (t === "int") { return encodeInt; }
    if (t === "string") { return encodeText; }
    if (t === "json") { return obj => encodeText(JSON.stringify(obj)); }
    if (t === "u8") { return ident; }
    if (typeof t === "object") {
      if (Object.getPrototypeOf(t) !== Object.prototype) {
        throw new Error("Cannot serialize objects with prototype methods.");
      }
      return codec(t).encode;
    }
    throw new Error(`Unsupported input type: ${typeof t} ${t}`);
  });
  return sourceSegments =>
    pack(sourceSegments.map((sourceSegment, idx) => transformers[idx](sourceSegment)));
};

const getTypedUnpacker = types => {
  const transformers = types.map(t => {
    if (t === "int") { return decodeInt; }
    if (t === "string") { return decodeText; }
    if (t === "json") { return arr => JSON.parse(decodeText(arr)); }
    if (t === "u8") { return ident; }
    if (typeof t === "object") {
      if (Object.getPrototypeOf(t) !== Object.prototype) {
        throw new Error("Cannot serialize objects with prototype methods.");
      }
      return codec(t).decode;
    }
    throw new Error(`Unsupported input type: ${typeof t}`);
  });

  return u8 => unpack(u8).map((segment, idx) => transformers[idx](segment));
};

const codec = schema => {
  const keys = Object.keys(schema);
  const types = keys.map(key => schema[key]);

  const typedPack = getTypedPacker(types);
  const typedUnpack = getTypedUnpacker(types);

  const encode = obj => typedPack(keys.map(key => obj[key]));
  const decode = u8 => {
    const values = typedUnpack(u8);
    return keys.reduce((memo, key, idx) => {
      memo[key] = values[idx];
      return memo;
    }, {});
  };

  return { encode, decode };
};

module.exports = codec;
