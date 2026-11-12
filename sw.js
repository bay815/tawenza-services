/* عامل الخدمة: يجعل المنصة تُفتح كتطبيق ويحفظ واجهتها للفتح السريع. لا يحفظ أي بيانات من قاعدة البيانات. */
const V = "twz-v1";
const SHELL = ["./", "index.html", "logo.gif", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;                 // لا نتدخل في طلبات Supabase ولا المكتبات الخارجية
  if (r.mode === "navigate") {                              // الصفحة: الشبكة أولًا لتصل التحديثات، وعند انقطاعها النسخة المحفوظة
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put("index.html", cp)); return res; })
      .catch(() => caches.match("index.html")));
    return;
  }
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); return res; })));
});
