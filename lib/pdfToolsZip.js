// A minimal ZIP writer, store only (no compression). Split PDF and PDF to
// images both need to hand back many files at once, and a browser that blocks
// the second of ten downloads makes a zip the only reliable answer.
//
// Compression is deliberately skipped. PDF page streams and PNG/JPG data are
// already compressed, so deflating them again costs CPU and saves almost
// nothing. Store-only also keeps this file small enough to audit, instead of
// pulling in a zip library for one feature.

// Standard CRC-32 (IEEE 802.3), built once and reused.
let crcTable = null;
function getCrcTable() {
  if (crcTable) return crcTable;
  crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c >>> 0;
  }
  return crcTable;
}

export function crc32(bytes) {
  const table = getCrcTable();
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    c = table[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// ZIP stores the modification time in MS-DOS format: a packed date and a packed
// time, each two bytes, with seconds at two second resolution.
function dosDateTime(date) {
  const year = Math.max(1980, date.getFullYear());
  return {
    time:
      (date.getHours() << 11) |
      (date.getMinutes() << 5) |
      Math.floor(date.getSeconds() / 2),
    date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  };
}

// Anything larger needs ZIP64 headers, which this writer does not emit. The
// callers check this and offer one download per file instead.
export const ZIP_MAX_BYTES = 4 * 1024 * 1024 * 1024 - 1;

/**
 * Builds a Blob containing a zip of the given entries.
 * @param {{name: string, data: Uint8Array}[]} entries
 * @returns {Blob}
 */
export function createZip(entries) {
  const encoder = new TextEncoder();
  const stamp = dosDateTime(new Date());
  const parts = [];
  const central = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const data =
      entry.data instanceof Uint8Array ? entry.data : new Uint8Array(entry.data);
    const sum = crc32(data);

    const local = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true); // local file header signature
    lv.setUint16(4, 20, true); // version needed to extract (2.0)
    lv.setUint16(6, 0x0800, true); // general purpose flag: bit 11 marks UTF-8 names
    lv.setUint16(8, 0, true); // compression method: 0 is store
    lv.setUint16(10, stamp.time, true);
    lv.setUint16(12, stamp.date, true);
    lv.setUint32(14, sum, true);
    lv.setUint32(18, data.length, true); // compressed size
    lv.setUint32(22, data.length, true); // uncompressed size
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true); // extra field length
    local.set(nameBytes, 30);

    parts.push(local, data);

    const dir = new Uint8Array(46 + nameBytes.length);
    const dv = new DataView(dir.buffer);
    dv.setUint32(0, 0x02014b50, true); // central directory header signature
    dv.setUint16(4, 20, true); // version made by
    dv.setUint16(6, 20, true); // version needed to extract
    dv.setUint16(8, 0x0800, true);
    dv.setUint16(10, 0, true);
    dv.setUint16(12, stamp.time, true);
    dv.setUint16(14, stamp.date, true);
    dv.setUint32(16, sum, true);
    dv.setUint32(20, data.length, true);
    dv.setUint32(24, data.length, true);
    dv.setUint16(28, nameBytes.length, true);
    dv.setUint16(30, 0, true); // extra field length
    dv.setUint16(32, 0, true); // file comment length
    dv.setUint16(34, 0, true); // disk number start
    dv.setUint16(36, 0, true); // internal file attributes
    dv.setUint32(38, 0, true); // external file attributes
    dv.setUint32(42, offset, true); // offset of local header
    dir.set(nameBytes, 46);
    central.push(dir);

    offset += local.length + data.length;
  }

  const centralSize = central.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true); // end of central directory signature
  ev.setUint16(4, 0, true); // this disk number
  ev.setUint16(6, 0, true); // disk with the central directory
  ev.setUint16(8, central.length, true);
  ev.setUint16(10, central.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true); // central directory offset
  ev.setUint16(20, 0, true); // comment length

  return new Blob([...parts, ...central, end], { type: "application/zip" });
}

// Sums the entry payloads so a caller can check the 4GB ceiling before it
// spends time building something no unzip tool will open.
export function zipPayloadBytes(entries) {
  return entries.reduce((sum, entry) => sum + entry.data.length, 0);
}
