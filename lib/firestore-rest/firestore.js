// Firestore over its REST API, shaped like the Admin SDK's Firestore so the
// handlers run unchanged on Workers, where the SDK's protobuf layer cannot
// load (it compiles code from strings, which Workers forbid). Covers what the
// backend uses: refs, queries, count, select, batches, transactions,
// FieldValue and Timestamp.
import { getAccessToken, getServiceAccount } from "./google-auth.js";

// ── Values ─────────────────────────────────────────────────────────────────

export class Timestamp {
  constructor(seconds, nanoseconds) {
    this._seconds = seconds;
    this._nanoseconds = nanoseconds;
  }
  static now() { return Timestamp.fromMillis(Date.now()); }
  static fromDate(date) { return Timestamp.fromMillis(date.getTime()); }
  static fromMillis(ms) {
    const seconds = Math.floor(ms / 1000);
    return new Timestamp(seconds, Math.floor((ms - seconds * 1000) * 1e6));
  }
  static fromISO(iso) {
    const m = String(iso).match(/^(.*?)(?:\.(\d+))?Z$/);
    const seconds = Math.floor(Date.parse(`${m ? m[1] : iso}Z`) / 1000);
    const nanos = m && m[2] ? Number(m[2].padEnd(9, "0").slice(0, 9)) : 0;
    return new Timestamp(seconds, nanos);
  }
  get seconds() { return this._seconds; }
  get nanoseconds() { return this._nanoseconds; }
  toDate() { return new Date(this.toMillis()); }
  toMillis() { return this._seconds * 1000 + Math.floor(this._nanoseconds / 1e6); }
  toISO() {
    return `${new Date(this._seconds * 1000).toISOString().slice(0, 19)}.${String(this._nanoseconds).padStart(9, "0")}Z`;
  }
  isEqual(other) { return other instanceof Timestamp && other._seconds === this._seconds && other._nanoseconds === this._nanoseconds; }
  valueOf() {
    return `${String(this._seconds - -62135596800).padStart(12, "0")}.${String(this._nanoseconds).padStart(9, "0")}`;
  }
  toString() { return `Timestamp(seconds=${this._seconds}, nanoseconds=${this._nanoseconds})`; }
}

export class GeoPoint {
  constructor(latitude, longitude) {
    this._latitude = latitude;
    this._longitude = longitude;
  }
  get latitude() { return this._latitude; }
  get longitude() { return this._longitude; }
  isEqual(o) { return o instanceof GeoPoint && o._latitude === this._latitude && o._longitude === this._longitude; }
}

class Sentinel {
  constructor(kind, operand) {
    this.kind = kind;
    this.operand = operand;
  }
  isEqual(o) { return o instanceof Sentinel && o.kind === this.kind; }
}

export const FieldValue = {
  serverTimestamp: () => new Sentinel("serverTimestamp"),
  delete: () => new Sentinel("delete"),
  increment: (n) => new Sentinel("increment", n),
  arrayUnion: (...values) => new Sentinel("arrayUnion", values),
  arrayRemove: (...values) => new Sentinel("arrayRemove", values),
};

export class FieldPath {
  constructor(...segments) { this.segments = segments; }
  static documentId() { return new FieldPath("__name__"); }
}

const SIMPLE = /^[_a-zA-Z][_a-zA-Z0-9]*$/;
const quote = (seg) => (SIMPLE.test(seg) ? seg : "`" + seg.replace(/\\/g, "\\\\").replace(/`/g, "\\`") + "`");
const encodePath = (segments) => segments.map(quote).join(".");
// Strings name nested fields with dots, as in the SDK's update() and where().
const toSegments = (field) => (field instanceof FieldPath ? field.segments : String(field).split("."));

const isPlainObject = (v) =>
  v !== null && typeof v === "object" && !Array.isArray(v) &&
  !(v instanceof Timestamp) && !(v instanceof Date) && !(v instanceof GeoPoint) &&
  !(v instanceof DocumentReference) && !(v instanceof Sentinel) && !(v instanceof Uint8Array);

function toBase64(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function encodeValue(v) {
  if (v === null) return { nullValue: null };
  switch (typeof v) {
    case "boolean": return { booleanValue: v };
    case "bigint": return { integerValue: String(v) };
    case "string": return { stringValue: v };
    case "number":
      if (Number.isSafeInteger(v) && !Object.is(v, -0)) return { integerValue: String(v) };
      return { doubleValue: Number.isFinite(v) ? v : String(v) };
    default: break;
  }
  if (v instanceof Timestamp) return { timestampValue: v.toISO() };
  if (v instanceof Date) {
    if (Number.isNaN(v.getTime())) throw new Error("Cannot encode an invalid Date in Firestore");
    return { timestampValue: Timestamp.fromDate(v).toISO() };
  }
  if (v instanceof DocumentReference) return { referenceValue: v._name };
  if (v instanceof GeoPoint) return { geoPointValue: { latitude: v.latitude, longitude: v.longitude } };
  if (v instanceof Uint8Array) return { bytesValue: toBase64(v) };
  if (v instanceof Sentinel) throw new Error(`FieldValue.${v.kind}() cannot be used inside an array`);
  if (Array.isArray(v)) return { arrayValue: { values: v.filter((x) => x !== undefined).map(encodeValue) } };
  if (typeof v === "object") return { mapValue: { fields: encodeFields(v) } };
  throw new Error(`Cannot encode a ${typeof v} in Firestore`);
}

function encodeFields(obj) {
  const fields = {};
  for (const [k, val] of Object.entries(obj)) {
    if (val === undefined) continue;
    fields[k] = encodeValue(val);
  }
  return fields;
}

function decodeValue(v, db) {
  if ("nullValue" in v) return null;
  if ("booleanValue" in v) return v.booleanValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return Number(v.doubleValue);
  if ("stringValue" in v) return v.stringValue;
  if ("timestampValue" in v) return Timestamp.fromISO(v.timestampValue);
  if ("mapValue" in v) return decodeFields(v.mapValue.fields || {}, db);
  if ("arrayValue" in v) return (v.arrayValue.values || []).map((x) => decodeValue(x, db));
  if ("referenceValue" in v) return db.doc(v.referenceValue.split("/documents/")[1]);
  if ("bytesValue" in v) return Buffer.from(v.bytesValue, "base64");
  if ("geoPointValue" in v) return new GeoPoint(v.geoPointValue.latitude || 0, v.geoPointValue.longitude || 0);
  return null;
}

function decodeFields(fields, db) {
  const out = {};
  for (const [k, v] of Object.entries(fields)) out[k] = decodeValue(v, db);
  return out;
}

// ── Writes ─────────────────────────────────────────────────────────────────

function transformFor(segments, s) {
  const fieldPath = encodePath(segments);
  switch (s.kind) {
    case "serverTimestamp": return { fieldPath, setToServerValue: "REQUEST_TIME" };
    case "increment": return { fieldPath, increment: encodeValue(s.operand) };
    case "arrayUnion": return { fieldPath, appendMissingElements: { values: s.operand.map(encodeValue) } };
    case "arrayRemove": return { fieldPath, removeAllFromArray: { values: s.operand.map(encodeValue) } };
    default: return null;
  }
}

// Pulls every sentinel out of a value tree, leaving plain data behind.
function stripSentinels(value, segments, transforms, deletes) {
  if (value instanceof Sentinel) {
    if (value.kind === "delete") deletes.push(segments);
    else transforms.push(transformFor(segments, value));
    return undefined;
  }
  if (!isPlainObject(value)) return value;
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    if (v === undefined) continue;
    const kept = stripSentinels(v, [...segments, k], transforms, deletes);
    if (kept !== undefined) out[k] = kept;
  }
  return out;
}

// Leaf paths for set(..., { merge: true }): a nested map merges key by key,
// an empty map is written as itself.
function leafPaths(value, segments, out) {
  for (const [k, v] of Object.entries(value)) {
    if (v === undefined) continue;
    const path = [...segments, k];
    if (v instanceof Sentinel) {
      if (v.kind === "delete") out.push(path);
      continue;
    }
    if (isPlainObject(v) && Object.keys(v).length) leafPaths(v, path, out);
    else out.push(path);
  }
  return out;
}

function setIn(tree, segments, value) {
  let node = tree;
  for (let i = 0; i < segments.length - 1; i++) {
    if (!isPlainObject(node[segments[i]])) node[segments[i]] = {};
    node = node[segments[i]];
  }
  node[segments[segments.length - 1]] = value;
}

function buildSetWrite(ref, data, options = {}) {
  const transforms = [];
  const deletes = [];
  const plain = stripSentinels(data || {}, [], transforms, deletes) || {};
  const write = { update: { name: ref._name, fields: encodeFields(plain) } };
  if (options.merge) {
    write.updateMask = { fieldPaths: leafPaths(data || {}, [], []).map(encodePath) };
  } else if (options.mergeFields) {
    write.updateMask = { fieldPaths: options.mergeFields.map((f) => encodePath(toSegments(f))) };
  }
  if (transforms.length) write.updateTransforms = transforms;
  return write;
}

function buildUpdateWrite(ref, args) {
  let entries;
  if (args.length === 1 && args[0] && typeof args[0] === "object" && !(args[0] instanceof FieldPath)) {
    entries = Object.entries(args[0]).map(([k, v]) => [toSegments(k), v]);
  } else {
    entries = [];
    for (let i = 0; i + 1 < args.length; i += 2) entries.push([toSegments(args[i]), args[i + 1]]);
  }
  const tree = {};
  const mask = [];
  const transforms = [];
  for (const [segments, value] of entries) {
    if (value === undefined) continue;
    if (value instanceof Sentinel) {
      if (value.kind === "delete") mask.push(segments);
      else transforms.push(transformFor(segments, value));
      continue;
    }
    const deletes = [];
    const kept = stripSentinels(value, segments, transforms, deletes);
    setIn(tree, segments, kept);
    mask.push(segments);
  }
  const write = {
    update: { name: ref._name, fields: encodeFields(tree) },
    updateMask: { fieldPaths: mask.map(encodePath) },
    currentDocument: { exists: true },
  };
  if (transforms.length) write.updateTransforms = transforms;
  return write;
}

function buildCreateWrite(ref, data) {
  return { ...buildSetWrite(ref, data), currentDocument: { exists: false } };
}

// ── HTTP ───────────────────────────────────────────────────────────────────

const GRPC = {
  CANCELLED: 1, UNKNOWN: 2, INVALID_ARGUMENT: 3, DEADLINE_EXCEEDED: 4, NOT_FOUND: 5, ALREADY_EXISTS: 6,
  PERMISSION_DENIED: 7, RESOURCE_EXHAUSTED: 8, FAILED_PRECONDITION: 9, ABORTED: 10, OUT_OF_RANGE: 11,
  UNIMPLEMENTED: 12, INTERNAL: 13, UNAVAILABLE: 14, DATA_LOSS: 15, UNAUTHENTICATED: 16,
};

function firestoreError(status, body) {
  const e = body?.error || {};
  const name = e.status || "UNKNOWN";
  const err = new Error(`${GRPC[name] ?? 2} ${name}: ${e.message || `HTTP ${status}`}`);
  err.code = GRPC[name] ?? 2;
  err.details = e.message || "";
  err.httpStatus = status;
  return err;
}

const RETRYABLE = new Set([429, 500, 502, 503, 504]);

async function call(method, url, body, { allow404 = false, retry = false } = {}) {
  for (let attempt = 0; ; attempt++) {
    const token = await getAccessToken();
    const res = await fetch(url, {
      method,
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (allow404 && res.status === 404) return null;
    const json = await res.json().catch(() => ({}));
    if (res.ok) return json;
    if (retry && attempt < 3 && RETRYABLE.has(res.status)) {
      await new Promise((r) => setTimeout(r, 150 * 2 ** attempt + Math.random() * 100));
      continue;
    }
    throw firestoreError(res.status, json);
  }
}

const encodeDocPath = (path) => path.split("/").map(encodeURIComponent).join("/");

function autoId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(40));
  let id = "";
  for (let i = 0; i < bytes.length && id.length < 20; i++) {
    if (bytes[i] < 248) id += chars[bytes[i] % 62];
  }
  return id.padEnd(20, "A");
}

// ── Snapshots ──────────────────────────────────────────────────────────────

export class DocumentSnapshot {
  constructor(ref, doc, readTime) {
    this.ref = ref;
    this.id = ref.id;
    this.exists = Boolean(doc);
    this._data = doc ? decodeFields(doc.fields || {}, ref.firestore) : undefined;
    this.createTime = doc?.createTime ? Timestamp.fromISO(doc.createTime) : undefined;
    this.updateTime = doc?.updateTime ? Timestamp.fromISO(doc.updateTime) : undefined;
    this.readTime = readTime ? Timestamp.fromISO(readTime) : undefined;
  }
  data() { return this._data === undefined ? undefined : this._data; }
  get(field) {
    let node = this._data;
    for (const seg of toSegments(field)) {
      if (node == null || typeof node !== "object") return undefined;
      node = node[seg];
    }
    return node;
  }
  isEqual(o) { return o instanceof DocumentSnapshot && o.ref.path === this.ref.path; }
}

export class QuerySnapshot {
  constructor(query, docs, readTime) {
    this.query = query;
    this.docs = docs;
    this.readTime = readTime ? Timestamp.fromISO(readTime) : undefined;
  }
  get size() { return this.docs.length; }
  get empty() { return this.docs.length === 0; }
  forEach(fn, thisArg) { this.docs.forEach(fn, thisArg); }
  docChanges() { return this.docs.map((doc, newIndex) => ({ type: "added", doc, oldIndex: -1, newIndex })); }
}

// ── Queries ────────────────────────────────────────────────────────────────

const OPS = {
  "<": "LESS_THAN", "<=": "LESS_THAN_OR_EQUAL", "==": "EQUAL", "!=": "NOT_EQUAL", ">": "GREATER_THAN",
  ">=": "GREATER_THAN_OR_EQUAL", "array-contains": "ARRAY_CONTAINS", in: "IN", "not-in": "NOT_IN",
  "array-contains-any": "ARRAY_CONTAINS_ANY",
};

export class Query {
  constructor(firestore, parentPath, collectionId, opts = {}) {
    Object.defineProperty(this, "firestore", { value: firestore, enumerable: false });
    this._parentPath = parentPath;
    this._collectionId = collectionId;
    this._q = { filters: [], orders: [], limit: undefined, offset: undefined, select: undefined, startAt: undefined, endAt: undefined, allDescendants: false, ...opts };
  }
  _with(patch) {
    const q = new Query(this.firestore, this._parentPath, this._collectionId, { ...this._q, ...patch });
    return q;
  }
  _refValue(v) {
    if (v instanceof DocumentReference) return v;
    const base = this._parentPath ? `${this._parentPath}/${this._collectionId}` : this._collectionId;
    return this.firestore.doc(String(v).includes("/") ? String(v) : `${base}/${v}`);
  }
  where(field, op, value) {
    const segments = toSegments(field);
    const isName = segments.length === 1 && segments[0] === "__name__";
    const fieldRef = { fieldPath: encodePath(segments) };
    let filter;
    if ((op === "==" || op === "!=") && (value === null || Number.isNaN(value))) {
      const nan = Number.isNaN(value);
      filter = { unaryFilter: { field: fieldRef, op: op === "==" ? (nan ? "IS_NAN" : "IS_NULL") : (nan ? "IS_NOT_NAN" : "IS_NOT_NULL") } };
    } else {
      if (!OPS[op]) throw new Error(`Unsupported where operator ${op}`);
      const enc = (v) => (isName ? { referenceValue: this._refValue(v)._name } : encodeValue(v));
      const encoded = Array.isArray(value) && ["in", "not-in", "array-contains-any"].includes(op)
        ? { arrayValue: { values: value.map(enc) } }
        : enc(value);
      filter = { fieldFilter: { field: fieldRef, op: OPS[op], value: encoded } };
    }
    return this._with({ filters: [...this._q.filters, filter] });
  }
  orderBy(field, direction = "asc") {
    const dir = String(direction).toLowerCase().startsWith("desc") ? "DESCENDING" : "ASCENDING";
    return this._with({ orders: [...this._q.orders, { field: { fieldPath: encodePath(toSegments(field)) }, direction: dir }] });
  }
  limit(n) { return this._with({ limit: n }); }
  offset(n) { return this._with({ offset: n }); }
  select(...fields) {
    const list = fields.length ? fields.map((f) => ({ fieldPath: encodePath(toSegments(f)) })) : [{ fieldPath: "__name__" }];
    return this._with({ select: list });
  }
  _cursor(args, before) {
    let values;
    if (args.length === 1 && args[0] instanceof DocumentSnapshot) {
      const snap = args[0];
      values = this._q.orders.map((o) => encodeValue(snap.get(o.field.fieldPath.replace(/`/g, ""))));
      values.push({ referenceValue: snap.ref._name });
    } else {
      values = args.map(encodeValue);
    }
    return { values, before };
  }
  _needsNameOrder(args) {
    if (args.length === 1 && args[0] instanceof DocumentSnapshot && !this._q.orders.some((o) => o.field.fieldPath === "__name__")) {
      const dir = this._q.orders.length ? this._q.orders[this._q.orders.length - 1].direction : "ASCENDING";
      return [...this._q.orders, { field: { fieldPath: "__name__" }, direction: dir }];
    }
    return this._q.orders;
  }
  startAt(...args) { return this._with({ startAt: this._cursor(args, true), orders: this._needsNameOrder(args) }); }
  startAfter(...args) { return this._with({ startAt: this._cursor(args, false), orders: this._needsNameOrder(args) }); }
  endAt(...args) { return this._with({ endAt: this._cursor(args, false), orders: this._needsNameOrder(args) }); }
  endBefore(...args) { return this._with({ endAt: this._cursor(args, true), orders: this._needsNameOrder(args) }); }

  _structured() {
    const q = this._q;
    const sq = { from: [{ collectionId: this._collectionId, allDescendants: q.allDescendants || undefined }] };
    if (q.filters.length === 1) sq.where = q.filters[0];
    else if (q.filters.length > 1) sq.where = { compositeFilter: { op: "AND", filters: q.filters } };
    if (q.orders.length) sq.orderBy = q.orders;
    if (q.select) sq.select = { fields: q.select };
    if (q.limit !== undefined) sq.limit = q.limit;
    if (q.offset !== undefined) sq.offset = q.offset;
    if (q.startAt) sq.startAt = q.startAt;
    if (q.endAt) sq.endAt = q.endAt;
    return sq;
  }
  _url(suffix) {
    const root = this.firestore._docsUrl;
    return this._parentPath ? `${root}/${encodeDocPath(this._parentPath)}:${suffix}` : `${root}:${suffix}`;
  }
  async _run(transaction) {
    const body = { structuredQuery: this._structured() };
    if (transaction) body.transaction = transaction;
    const rows = await call("POST", this._url("runQuery"), body, { retry: !transaction });
    const list = Array.isArray(rows) ? rows : [rows];
    let readTime;
    const docs = [];
    for (const row of list) {
      if (row.readTime) readTime = row.readTime;
      if (!row.document) continue;
      const ref = this.firestore.doc(row.document.name.split("/documents/")[1]);
      docs.push(new DocumentSnapshot(ref, row.document, row.readTime));
    }
    return new QuerySnapshot(this, docs, readTime);
  }
  get() { return this._run(); }
  count() {
    const query = this;
    return {
      query,
      async get() {
        const body = { structuredAggregationQuery: { structuredQuery: query._structured(), aggregations: [{ alias: "count", count: {} }] } };
        const rows = await call("POST", query._url("runAggregationQuery"), body, { retry: true });
        const row = (Array.isArray(rows) ? rows : [rows]).find((r) => r.result) || {};
        const count = Number(row.result?.aggregateFields?.count?.integerValue || 0);
        return { data: () => ({ count }), readTime: row.readTime ? Timestamp.fromISO(row.readTime) : undefined };
      },
    };
  }
  isEqual(o) { return o instanceof Query && JSON.stringify(o._structured()) === JSON.stringify(this._structured()) && o._parentPath === this._parentPath; }
  onSnapshot() { throw new Error("onSnapshot is not available in the Worker build"); }
  stream() { throw new Error("stream is not available in the Worker build"); }
}

export class CollectionReference extends Query {
  constructor(firestore, path) {
    const parts = path.split("/");
    super(firestore, parts.slice(0, -1).join("/"), parts[parts.length - 1]);
    this.path = path;
    this.id = parts[parts.length - 1];
  }
  get parent() { return this._parentPath ? this.firestore.doc(this._parentPath) : null; }
  doc(id) {
    return this.firestore.doc(`${this.path}/${id === undefined ? autoId() : id}`);
  }
  async add(data) {
    const ref = this.doc();
    await ref.create(data);
    return ref;
  }
  async listDocuments() {
    const refs = [];
    let pageToken = "";
    do {
      const root = this.firestore._docsUrl;
      const url = `${root}/${encodeDocPath(this.path)}?showMissing=true&mask.fieldPaths=__name__&pageSize=300${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""}`;
      const json = await call("GET", url, undefined, { retry: true });
      for (const d of json.documents || []) refs.push(this.firestore.doc(d.name.split("/documents/")[1]));
      pageToken = json.nextPageToken || "";
    } while (pageToken);
    return refs;
  }
}

export class DocumentReference {
  constructor(firestore, path) {
    Object.defineProperty(this, "firestore", { value: firestore, enumerable: false });
    this.path = path;
    const parts = path.split("/");
    this.id = parts[parts.length - 1];
  }
  get _name() { return `${this.firestore._dbName}/documents/${this.path}`; }
  get parent() { return this.firestore.collection(this.path.split("/").slice(0, -1).join("/")); }
  collection(sub) { return this.firestore.collection(`${this.path}/${sub}`); }
  async _read(transaction) {
    const url = `${this.firestore._docsUrl}/${encodeDocPath(this.path)}${transaction ? `?transaction=${encodeURIComponent(transaction)}` : ""}`;
    const doc = await call("GET", url, undefined, { allow404: true, retry: !transaction });
    return new DocumentSnapshot(this, doc, new Date().toISOString());
  }
  get() { return this.firestore._queueGet(this); }
  set(data, options) { return this.firestore._commitOne(buildSetWrite(this, data, options)); }
  update(...args) { return this.firestore._commitOne(buildUpdateWrite(this, args)); }
  create(data) { return this.firestore._commitOne(buildCreateWrite(this, data)); }
  delete(precondition) {
    const write = { delete: this._name };
    if (precondition?.exists !== undefined) write.currentDocument = { exists: precondition.exists };
    return this.firestore._commitOne(write);
  }
  async listCollections() {
    const json = await call("POST", `${this.firestore._docsUrl}/${encodeDocPath(this.path)}:listCollectionIds`, { pageSize: 300 });
    return (json.collectionIds || []).map((id) => this.collection(id));
  }
  isEqual(o) { return o instanceof DocumentReference && o.path === this.path; }
  onSnapshot() { throw new Error("onSnapshot is not available in the Worker build"); }
}

const writeResult = (r, commitTime) => ({ writeTime: Timestamp.fromISO(r?.updateTime || commitTime || new Date().toISOString()) });

export class WriteBatch {
  constructor(firestore) {
    this._db = firestore;
    this._writes = [];
  }
  set(ref, data, options) { this._writes.push(buildSetWrite(ref, data, options)); return this; }
  update(ref, ...args) { this._writes.push(buildUpdateWrite(ref, args)); return this; }
  create(ref, data) { this._writes.push(buildCreateWrite(ref, data)); return this; }
  delete(ref, precondition) {
    const write = { delete: ref._name };
    if (precondition?.exists !== undefined) write.currentDocument = { exists: precondition.exists };
    this._writes.push(write);
    return this;
  }
  async commit() {
    if (!this._writes.length) return [];
    const json = await call("POST", `${this._db._docsUrl}:commit`, { writes: this._writes });
    return (json.writeResults || []).map((r) => writeResult(r, json.commitTime));
  }
}

export class Transaction extends WriteBatch {
  constructor(firestore, id) {
    super(firestore);
    this._id = id;
  }
  async get(refOrQuery) {
    if (refOrQuery instanceof DocumentReference) return refOrQuery._read(this._id);
    if (refOrQuery instanceof Query) return refOrQuery._run(this._id);
    if (refOrQuery && typeof refOrQuery.get === "function") return refOrQuery.get();
    throw new Error("Transaction.get() takes a DocumentReference or Query");
  }
  getAll(...refs) { return this._db._batchGet(refs.filter((r) => r instanceof DocumentReference), this._id); }
}

export class Firestore {
  constructor() {
    this._settings = {};
    this._pendingGets = [];
  }
  // Reads started in the same tick (a Promise.all over doc refs) go out as
  // one batchGet. Workers cap a request at six open connections, so twenty
  // separate GETs would queue behind each other.
  _queueGet(ref) {
    return new Promise((resolve, reject) => {
      this._pendingGets.push({ ref, resolve, reject });
      if (this._pendingGets.length === 1) setTimeout(() => this._flushGets(), 0);
    });
  }
  async _flushGets() {
    const queued = this._pendingGets;
    this._pendingGets = [];
    if (queued.length === 1) {
      const { ref, resolve, reject } = queued[0];
      ref._read().then(resolve, reject);
      return;
    }
    for (let i = 0; i < queued.length; i += 100) {
      const chunk = queued.slice(i, i + 100);
      const unique = [...new Map(chunk.map((q) => [q.ref.path, q.ref])).values()];
      this._batchGet(unique).then(
        (snaps) => {
          const byPath = new Map(snaps.map((s) => [s.ref.path, s]));
          chunk.forEach((q) => q.resolve(byPath.get(q.ref.path)));
        },
        (err) => chunk.forEach((q) => q.reject(err)),
      );
    }
  }
  get projectId() { return getServiceAccount().projectId; }
  get _dbName() { return `projects/${this.projectId}/databases/(default)`; }
  get _docsUrl() { return `https://firestore.googleapis.com/v1/${this._dbName}/documents`; }
  settings(s) { this._settings = { ...this._settings, ...s }; }
  collection(path) { return new CollectionReference(this, String(path).replace(/^\/|\/$/g, "")); }
  doc(path) { return new DocumentReference(this, String(path).replace(/^\/|\/$/g, "")); }
  collectionGroup(id) { return new Query(this, "", id, { allDescendants: true }); }
  batch() { return new WriteBatch(this); }
  bulkWriter() { throw new Error("bulkWriter is not available in the Worker build"); }
  async listCollections() {
    const json = await call("POST", `${this._docsUrl}:listCollectionIds`, { pageSize: 300 });
    return (json.collectionIds || []).map((id) => this.collection(id));
  }
  async _commitOne(write) {
    const json = await call("POST", `${this._docsUrl}:commit`, { writes: [write] });
    return writeResult(json.writeResults?.[0], json.commitTime);
  }
  async _batchGet(refs, transaction) {
    if (!refs.length) return [];
    const body = { documents: refs.map((r) => r._name) };
    if (transaction) body.transaction = transaction;
    const rows = await call("POST", `${this._docsUrl}:batchGet`, body, { retry: !transaction });
    const byName = new Map();
    for (const row of Array.isArray(rows) ? rows : [rows]) {
      if (row.found) byName.set(row.found.name, row.found);
    }
    return refs.map((r) => new DocumentSnapshot(r, byName.get(r._name) || null, new Date().toISOString()));
  }
  getAll(...refs) {
    const list = refs.flat().filter((r) => r instanceof DocumentReference);
    return this._batchGet(list);
  }
  async runTransaction(fn, { maxAttempts = 5 } = {}) {
    let retryFrom;
    for (let attempt = 1; ; attempt++) {
      const begin = await call("POST", `${this._docsUrl}:beginTransaction`, {
        options: { readWrite: retryFrom ? { retryTransaction: retryFrom } : {} },
      });
      const tx = new Transaction(this, begin.transaction);
      let result;
      try {
        result = await fn(tx);
      } catch (err) {
        await call("POST", `${this._docsUrl}:rollback`, { transaction: begin.transaction }).catch(() => {});
        throw err;
      }
      try {
        await call("POST", `${this._docsUrl}:commit`, { writes: tx._writes, transaction: begin.transaction });
        return result;
      } catch (err) {
        if (err.code !== GRPC.ABORTED || attempt >= maxAttempts) throw err;
        retryFrom = begin.transaction;
        await new Promise((r) => setTimeout(r, 100 * 2 ** attempt + Math.random() * 100));
      }
    }
  }
}
