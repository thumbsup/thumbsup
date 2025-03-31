var m = Object.defineProperty;
var v = (e, t, r) => t in e ? m(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var x = (e, t, r) => (v(e, typeof t != "symbol" ? t + "" : t, r), r);
var s;
((e) => {
  class t extends Error {
    constructor(a) {
      super(a);
    }
  }
  e.MetadataError = t;
  class r extends Error {
    constructor(a) {
      super(a);
    }
  }
  e.DownloadError = r;
  class l extends Error {
    constructor(a) {
      super(a);
    }
  }
  e.FileExistError = l;
  class u extends Error {
    constructor(a) {
      super(a);
    }
  }
  e.InternalError = u;
  class c extends Error {
    constructor(n, d) {
      super(n);
      x(this, "innerException");
      this.innerException = d;
    }
  }
  e.GeneralError = c;
})(s || (s = {}));
function b(e) {
  return new URL(e, window.location.href).pathname.split("/").pop();
}
async function D(e, t, r) {
  try {
    return (await (await e.getFileHandle(t)).getFile()).size === r;
  } catch {
    return !1;
  }
}
var y = /* @__PURE__ */ ((e) => (e[e.SKIPPED_EXIST = 1] = "SKIPPED_EXIST", e[e.DOWNLOADED = 2] = "DOWNLOADED", e))(y || {});
async function S(e, t, r = {}) {
  const l = t.fileName === void 0 ? b(t.url) : t.fileName;
  if (l === void 0)
    throw new s.MetadataError("Could not determine filename.");
  if (t.size !== void 0 && await D(e, l, t.size))
    return 1;
  if (r.overrideExistingFile !== !0)
    try {
      throw await e.getFileHandle(l, { create: !1 }), new s.FileExistError(`File: ${l} does already exist.`);
    } catch (a) {
      const n = a;
      if (a instanceof s.FileExistError)
        throw a;
      if (n.name === void 0 || n.name !== "NotFoundError")
        throw new s.FileExistError(`File: ${l} does already exist. Exeption: ${n.message}`);
    }
  const u = new AbortController(), c = await fetch(t.url, { signal: u.signal });
  if (!c.ok)
    throw new s.DownloadError(`Error while downloading: ${c.status} - ${c.statusText}`);
  if (c.body === null)
    throw new s.DownloadError("No data");
  let o = c.body;
  if (r.progress !== void 0) {
    let a = 0;
    const n = c.headers.get("content-length"), d = Number.parseInt(n ?? "") || void 0, f = new TransformStream(
      {
        transform(w, E) {
          a += w.length;
          let i = d !== void 0 ? a / d * 100 : void 0;
          if (r.progress !== void 0) {
            try {
              r.progress(a, d, i);
            } catch (g) {
              console.log(g);
            }
            E.enqueue(w);
          }
        }
      }
    );
    o = o.pipeThrough(f);
  }
  try {
    const n = await (await e.getFileHandle(l, { create: !0 })).createWritable();
    await o.pipeTo(n);
  } catch (a) {
    throw u.abort(), new s.GeneralError(`Download of file ${l} failed due to an exception: ${a == null ? void 0 : a.message}`, a);
  }
  return 2;
}
var T = /* @__PURE__ */ ((e) => (e[e.STARTED = 0] = "STARTED", e[e.COMPLETED_DOWNLOAD = 1] = "COMPLETED_DOWNLOAD", e[e.SKIPPED_EXIST = 2] = "SKIPPED_EXIST", e[e.ERROR = 3] = "ERROR", e))(T || {});
async function I(e, t, r) {
  var c, o, a, n;
  r === void 0 && (r = {});
  const l = new AbortController(), u = r.abortSignal === void 0 ? l.signal : r.abortSignal;
  for (const d of t) {
    if (u.aborted)
      break;
    const f = r.onStateUpdate === void 0 ? void 0 : (E, i, g) => {
      var h;
      (h = r == null ? void 0 : r.onStateUpdate) == null || h.call(r, d.url, {
        progress: {
          bytes: E,
          totalBytes: i,
          percent: g
        }
      });
    }, w = {
      overrideExistingFile: r.overrideExistingFile,
      progress: f
    };
    (c = r == null ? void 0 : r.onStateUpdate) == null || c.call(r, d.url, {
      state: 0
      /* STARTED */
    });
    try {
      const E = await S(e, d, w);
      switch (E) {
        case 2:
          (o = r == null ? void 0 : r.onStateUpdate) == null || o.call(r, d.url, {
            state: 1
            /* COMPLETED_DOWNLOAD */
          });
          break;
        case 1:
          (a = r == null ? void 0 : r.onStateUpdate) == null || a.call(r, d.url, {
            state: 2
            /* SKIPPED_EXIST */
          });
          break;
        default:
          throw new s.InternalError(`Unknown return value from download function: ${E} `);
      }
    } catch (E) {
      const i = E;
      (n = r == null ? void 0 : r.onStateUpdate) == null || n.call(r, d.url, {
        state: 3,
        error: i
      });
    }
  }
}
export {
  S as DownloadFile,
  y as DownloadFileRet,
  I as DownloadFiles,
  s as Exceptions,
  T as FileState,
  D as VerifyFileSize
};
