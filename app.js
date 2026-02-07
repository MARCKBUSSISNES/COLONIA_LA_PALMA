// ===== CONFIG =====
var PRICE = 3;

// acceso interno
var EDIT_CODE = "363534";

// activación (cámbialo en GitHub cuando quieras)
var ACTIVATION_CODE = "2278";

// inicio
var START_CODE = "12345";

var ACT_KEY = "agua_app_activated_v1";
var DEV_KEY = "agua_app_device_id_v1";
var START_OK_KEY = "agua_start_ok_v1";

var DB_NAME = "agua_residencial_db_v1";
var DB_VER = 1;
var db = null;

// ===== Helpers DOM =====
function $(id){ return document.getElementById(id); }
function money(n){ return "Q" + Number(n||0).toFixed(2); }
function fmtDate(ts){
  var d = new Date(ts);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, function(m){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]);
  });
}
function uid(prefix){
  return prefix + "-" + Date.now().toString(16) + "-" + Math.random().toString(16).slice(2,8);
}

// ===== Recargar / Cerrar sesión =====
window.doReload = function(){ try{ window.location.reload(); }catch(e){} };

window.logout = function(){
  try{ sessionStorage.removeItem(START_OK_KEY); }catch(e){}
  // vuelve a acceso sin borrar datos ni activación
  hideActivation();
  showStart();
  // limpia campo
  try{ if($("startCode")) $("startCode").value = ""; }catch(e){}
  // por si quedó en otra pantalla
  try{
    var screens = document.querySelectorAll(".screen");
    for(var i=0;i<screens.length;i++) screens[i].classList.remove("active");
    if($("dash")) $("dash").classList.add("active");
  }catch(e){}
};


// ===== Soporte (Modal) =====
window.openSupport = function(){
  try{
    var existing = document.getElementById("supportOverlayMB");
    if(existing){
      existing.style.display = "flex";
      return;
    }

    var ov = document.createElement("div");
    ov.id = "supportOverlayMB";
    ov.style.position = "fixed";
    ov.style.inset = "0";
    ov.style.zIndex = "99999";
    ov.style.display = "flex";
    ov.style.alignItems = "center";
    ov.style.justifyContent = "center";
    ov.style.padding = "16px";
    ov.style.background = "rgba(0,0,0,.55)";

    var box = document.createElement("div");
    box.style.width = "min(560px, 100%)";
    box.style.background = "#0f1b2f";
    box.style.border = "1px solid rgba(255,255,255,.14)";
    box.style.borderRadius = "22px";
    box.style.boxShadow = "0 24px 70px rgba(0,0,0,.60)";
    box.style.padding = "14px";
    box.style.position = "relative";
    box.style.color = "#eaf1ff";
    box.style.fontFamily = "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif";

    var head = document.createElement("div");
    head.style.display = "flex";
    head.style.alignItems = "center";
    head.style.gap = "12px";
    head.style.marginBottom = "10px";

    var logo = document.createElement("img");
    logo.src = "./LOGO2.png?v=1";
    logo.alt = "LOGO2";
    logo.style.width = "56px";
    logo.style.height = "56px";
    logo.style.objectFit = "contain";
    logo.style.borderRadius = "16px";
    logo.style.background = "rgba(255,255,255,.08)";
    logo.style.border = "1px solid rgba(255,255,255,.14)";
    logo.style.padding = "6px";

    var titleWrap = document.createElement("div");
    var t = document.createElement("div");
    t.textContent = "Soporte";
    t.style.fontWeight = "1000";
    t.style.fontSize = "16px";
    var st = document.createElement("div");
    st.textContent = "Información de cobro de soporte mensual";
    st.style.opacity = ".85";
    st.style.fontWeight = "800";
    st.style.fontSize = "12px";
    titleWrap.appendChild(t);
    titleWrap.appendChild(st);

    var close = document.createElement("button");
    close.type = "button";
    close.textContent = "✕";
    close.style.marginLeft = "auto";
    close.style.border = "0";
    close.style.cursor = "pointer";
    close.style.background = "rgba(255,255,255,.10)";
    close.style.color = "#fff";
    close.style.borderRadius = "12px";
    close.style.padding = "8px 10px";
    close.style.fontWeight = "1000";

    close.addEventListener("click", function(){
      ov.style.display = "none";
    });
    ov.addEventListener("click", function(e){
      if(e.target === ov) ov.style.display = "none";
    });

    head.appendChild(logo);
    head.appendChild(titleWrap);
    head.appendChild(close);

    var img = document.createElement("img");
    img.src = "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22900%22%20height%3D%22260%22%20viewBox%3D%220%200%20900%20260%22%3E%0A%20%20%3Cdefs%3E%0A%20%20%20%20%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%220%22%20stop-color%3D%22%23ffe066%22/%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23ffd000%22/%3E%0A%20%20%20%20%3C/linearGradient%3E%0A%20%20%3C/defs%3E%0A%20%20%3Crect%20x%3D%2210%22%20y%3D%2210%22%20width%3D%22880%22%20height%3D%22240%22%20rx%3D%2228%22%20fill%3D%22url%28%23g%29%22%20stroke%3D%22%23111%22%20stroke-width%3D%226%22/%3E%0A%20%20%3Ctext%20x%3D%22450%22%20y%3D%2295%22%20text-anchor%3D%22middle%22%20font-family%3D%22Arial%2C%20Helvetica%2C%20sans-serif%22%20font-size%3D%2244%22%20font-weight%3D%22800%22%20fill%3D%22%23111%22%3E%0A%20%20%20%20COSTO%20POR%20SOPORTE%20MENSUAL%0A%20%20%3C/text%3E%0A%20%20%3Ctext%20x%3D%22450%22%20y%3D%22150%22%20text-anchor%3D%22middle%22%20font-family%3D%22Arial%2C%20Helvetica%2C%20sans-serif%22%20font-size%3D%2256%22%20font-weight%3D%22900%22%20fill%3D%22%23111%22%3E%0A%20%20%20%20Q200%0A%20%20%3C/text%3E%0A%20%20%3Ctext%20x%3D%22450%22%20y%3D%22205%22%20text-anchor%3D%22middle%22%20font-family%3D%22Arial%2C%20Helvetica%2C%20sans-serif%22%20font-size%3D%2228%22%20font-weight%3D%22800%22%20fill%3D%22%23111%22%3E%0A%20%20%20%20CTA%3A%2006280077091%20%20-%20%20GYT%20CONTINENTAL%20AHORRO%0A%20%20%3C/text%3E%0A%3C/svg%3E";
    img.alt = "Costo por soporte mensual";
    img.style.width = "100%";
    img.style.borderRadius = "18px";
    img.style.border = "2px solid rgba(255,255,255,.10)";
    img.style.background = "#fff";
    img.style.display = "block";

    var txt = document.createElement("div");
    txt.style.marginTop = "10px";
    txt.style.background = "rgba(255,255,255,.06)";
    txt.style.border = "1px solid rgba(255,255,255,.12)";
    txt.style.borderRadius = "16px";
    txt.style.padding = "10px 12px";
    txt.style.fontWeight = "950";
    txt.style.lineHeight = "1.25";
    txt.innerHTML = 'Costo por soporte mensual: <b>Q200</b><br>CTA: <b>06280077091</b> — <b>GYT CONTINENTAL</b> (Ahorro)';

    var copy = document.createElement("button");
    copy.type = "button";
    copy.textContent = "Copiar datos";
    copy.style.marginTop = "10px";
    copy.style.width = "100%";
    copy.style.border = "0";
    copy.style.cursor = "pointer";
    copy.style.padding = "12px";
    copy.style.borderRadius = "14px";
    copy.style.fontWeight = "1000";
    copy.style.color = "#111";
    copy.style.background = "linear-gradient(90deg,#ffd400,#ffea70)";
    copy.addEventListener("click", function(){
      var s = "COSTO POR SOPORTE MENSUAL Q200 | CTA: 06280077091 - GYT CONTINENTAL AHORRO";
      try{
        if(navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(s).then(function(){ alert("Copiado"); }).catch(function(){ prompt("Copia:", s); });
        }else{
          prompt("Copia:", s);
        }
      }catch(e){
        try{ prompt("Copia:", s); }catch(_){}
      }
    });

    box.appendChild(head);
    box.appendChild(img);
    box.appendChild(txt);
    box.appendChild(copy);

    ov.appendChild(box);
    document.body.appendChild(ov);
  }catch(e){
    alert("Costo por soporte mensual Q200. CTA: 06280077091 - GYT CONTINENTAL AHORRO.");
  }
};

// ===== Pantalla de inicio =====
window.enterApp = function(){
  var input = $("startCode");
  var val = (input ? (input.value||"") : "").trim();
  if(val !== START_CODE){
    alert("Acceso denegado");
    return;
  }
  try{
    sessionStorage.setItem(START_OK_KEY, "1");
  }catch(e){}
  hideStart();
  boot(); // continúa flujo normal
};

function startIsOk(){
  try{ return sessionStorage.getItem(START_OK_KEY) === "1"; }
  catch(e){ return false; }
}
function showStart(){
  var ov = $("startOverlay");
  if(ov) ov.classList.add("show");
}
function hideStart(){
  var ov = $("startOverlay");
  if(ov) ov.classList.remove("show");
}

// ===== Activación =====
function getDeviceId(){
  var id = localStorage.getItem(DEV_KEY);
  if(!id){
    id = "DEV-" + Math.random().toString(16).slice(2,10) + "-" + Date.now().toString(16);
    localStorage.setItem(DEV_KEY, id);
  }
  return id;
}
function isActivated(){ return localStorage.getItem(ACT_KEY) === "1"; }

function showActivation(){
  if($("deviceIdTxt")) $("deviceIdTxt").textContent = getDeviceId();
  if($("activationOverlay")) $("activationOverlay").classList.add("show");
  if($("appRoot")) $("appRoot").classList.add("lockedUi");
  if($("actStatus")) $("actStatus").textContent = "NO ACTIVO";
}
function hideActivation(){
  if($("activationOverlay")) $("activationOverlay").classList.remove("show");
  if($("appRoot")) $("appRoot").classList.remove("lockedUi");
}
window.activate = function(){
  var entered = ($("actCode") ? ($("actCode").value||"") : "").trim();
  if(entered !== ACTIVATION_CODE){ alert("Acceso denegado"); return; }
  localStorage.setItem(ACT_KEY, "1");
  hideActivation();
  bootAfterActivation();
};
window.hardLock = function(){ alert("Acceso denegado"); };

// ===== Menú =====
window.toggleNav = function(){
  var n = $("nav");
  if(n) n.classList.toggle("open");
};
window.go = function(id){
  if(!isActivated()){ showActivation(); return; }
  var screens = document.querySelectorAll(".screen");
  for(var i=0;i<screens.length;i++) screens[i].classList.remove("active");
  var el = $(id);
  if(el) el.classList.add("active");
  var n = $("nav");
  if(n) n.classList.remove("open");
  if(id==="clientes") renderClients();
  if(id==="lecturas" || id==="pagos" || id==="historial") refreshSelectors();
  renderDash();
};

// ===== IndexedDB =====
function idbOpen(){
  return new Promise(function(resolve,reject){
    var req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = function(){
      var d = req.result;
      if(!d.objectStoreNames.contains("clients")){
        var s = d.createObjectStore("clients",{keyPath:"id"});
        s.createIndex("byName","name",{unique:false});
      }
      if(!d.objectStoreNames.contains("readings")){
        var r = d.createObjectStore("readings",{keyPath:"id"});
        r.createIndex("byClient","clientId",{unique:false});
        r.createIndex("byTs","ts",{unique:false});
      }
      if(!d.objectStoreNames.contains("payments")){
        var p = d.createObjectStore("payments",{keyPath:"id"});
        p.createIndex("byClient","clientId",{unique:false});
        p.createIndex("byTs","ts",{unique:false});
      }
    };
    req.onsuccess = function(){ db = req.result; resolve(db); };
    req.onerror = function(){ reject(req.error); };
  });
}
function tx(store, mode){ return db.transaction(store, mode || "readonly").objectStore(store); }
function idbPut(store, val){
  return new Promise(function(resolve,reject){
    var r = tx(store,"readwrite").put(val);
    r.onsuccess=function(){ resolve(val); };
    r.onerror=function(){ reject(r.error); };
  });
}
function idbGet(store, key){
  return new Promise(function(resolve,reject){
    var r = tx(store).get(key);
    r.onsuccess=function(){ resolve(r.result||null); };
    r.onerror=function(){ reject(r.error); };
  });
}
function idbAll(store){
  return new Promise(function(resolve,reject){
    var r = tx(store).getAll();
    r.onsuccess=function(){ resolve(r.result||[]); };
    r.onerror=function(){ reject(r.error); };
  });
}
function idbByIndex(store, idxName, value){
  return new Promise(function(resolve,reject){
    var s = tx(store);
    var idx = s.index(idxName);
    var range = IDBKeyRange.only(value);
    var r = idx.getAll(range);
    r.onsuccess=function(){ resolve(r.result||[]); };
    r.onerror=function(){ reject(r.error); };
  });
}

// ===== Clientes =====
window.saveClient = async function(){
  if(!isActivated()){ showActivation(); return; }
  var casa = ($("cCasa") ? ($("cCasa").value||"") : "").trim();
  var meter = ($("cContador") ? ($("cContador").value||"") : "").trim();
  var name = ($("cNombre") ? ($("cNombre").value||"") : "").trim();
  if(!casa || !meter || !name){ alert("Completa Casa, Contador y Nombre"); return; }

  var id = "C|" + casa.toUpperCase() + "|" + meter;
  var existing = await idbGet("clients", id);

  var client = {
    id:id, casa:casa, meter:meter, name:name,
    balance: existing ? Number(existing.balance||0) : 0,
    lastReadingValue: existing ? (existing.lastReadingValue != null ? existing.lastReadingValue : null) : null,
    createdAt: existing ? existing.createdAt : Date.now(),
    updatedAt: Date.now()
  };
  await idbPut("clients", client);
  window.clearClientForm();
  await renderClients();
  await refreshSelectors();
  alert("Guardado");
};
window.clearClientForm = function(){
  if($("cCasa")) $("cCasa").value="";
  if($("cContador")) $("cContador").value="";
  if($("cNombre")) $("cNombre").value="";
};

async function renderClients(){
  var box = $("clientsList");
  if(!box) return;

  var list = await idbAll("clients");
  list.sort(function(a,b){ return (a.casa||"").localeCompare(b.casa||""); });
  if(!list.length){ box.innerHTML = "No hay clientes."; return; }

  var html = "";
  for(var i=0;i<list.length;i++){
    var c = list[i];
    html += "<div style='padding:10px;border-radius:14px;background:#0b1133;margin:8px 0'>";
    html += "<b>"+escapeHtml(c.casa)+" · "+escapeHtml(c.name)+"</b><br>";
    html += "<span style='color:#9ca3af;font-size:12px'>Contador: "+escapeHtml(c.meter)+" · Saldo: <b>"+money(c.balance)+"</b></span>";
    html += "</div>";
  }
  box.innerHTML = html;
}

// ===== Selectores =====
async function refreshSelectors(){
  var clients = await idbAll("clients");
  clients.sort(function(a,b){ return (a.casa||"").localeCompare(b.casa||""); });

  var opt = "";
  for(var i=0;i<clients.length;i++){
    var c = clients[i];
    opt += "<option value='"+c.id+"'>"+escapeHtml(c.casa)+" · "+escapeHtml(c.name)+" ("+escapeHtml(c.meter)+")</option>";
  }
  if(!opt) opt = "<option value=''>No hay clientes</option>";

  if($("selClient")) $("selClient").innerHTML = opt;
  if($("selPayClient")) $("selPayClient").innerHTML = opt;
  if($("selHistClient")) $("selHistClient").innerHTML = opt;

  if($("selClient")){
    $("selClient").onchange = async function(){
      var id = $("selClient").value;
      var c = await idbGet("clients", id);

      var prevVal = (c && c.lastReadingValue!=null) ? c.lastReadingValue : 0;
      if($("prev")){
        $("prev").value = prevVal;
        $("prev").readOnly = true;
      }

      if($("act")) $("act").value = "";
      if($("consumoTxt")) $("consumoTxt").textContent = "-";
      if($("totalTxt")) $("totalTxt").textContent = "-";
    };
  }

  if($("selPayClient")) $("selPayClient").onchange = updatePending;

  // inicial
  if($("selClient") && $("selClient").value){
    var c0 = await idbGet("clients", $("selClient").value);
    var prev0 = (c0 && c0.lastReadingValue!=null) ? c0.lastReadingValue : 0;
    if($("prev")){
      $("prev").value = prev0;
      $("prev").readOnly = true;
    }
  }

  await updatePending();
}

async function updatePending(){
  var id = $("selPayClient") ? $("selPayClient").value : "";
  var val = money(0);
  if(id){
    var c = await idbGet("clients", id);
    val = money(c ? c.balance : 0);
  }
  if($("pendingTxt")) $("pendingTxt").textContent = val;
  if($("pendingView")) $("pendingView").value = val;
}

// ===== Lecturas =====
window.calcReading = async function(){
  if(!isActivated()){ showActivation(); return; }
  var clientId = $("selClient") ? $("selClient").value : "";
  if(!clientId){ alert("Selecciona cliente"); return; }

  var c = await idbGet("clients", clientId);
  if(!c){ alert("Cliente no encontrado"); return; }

  // lectura anterior siempre desde cliente
  var p = Number(c.lastReadingValue!=null ? c.lastReadingValue : 0);
  if($("prev")){
    $("prev").value = p;
    $("prev").readOnly = true;
  }

  var a = Number($("act") ? $("act").value : NaN);
  if(!Number.isFinite(a)){ alert("Lectura inválida"); return; }
  if(a < p){ alert("La lectura actual no puede ser menor"); return; }

  var consumo = a - p;
  var total = consumo * PRICE;

  if($("consumoTxt")) $("consumoTxt").textContent = consumo + " m³";
  if($("totalTxt")) $("totalTxt").textContent = money(total);

  var reading = {
    id: uid("R"), clientId: clientId,
    casa: c.casa, cliente: c.name, contador: c.meter,
    prev: p, curr: a, consumo: consumo, total: total,
    price: PRICE, ts: Date.now(),
    printed:false, locked:false
  };
  await idbPut("readings", reading);

  c.balance = Number(c.balance||0) + total;
  c.lastReadingValue = a;
  c.updatedAt = Date.now();
  await idbPut("clients", c);

  await updatePending();
  await renderDash();
  alert("Guardado");
};

async function getLastReading(clientId){
  var list = await idbByIndex("readings","byClient",clientId);
  list.sort(function(a,b){ return b.ts-a.ts; });
  return list[0] || null;
}

// ===== IMPRESIÓN 55mm (robusta en móvil) =====
window.printLastReading = async function(){
  if(!isActivated()){ showActivation(); return; }
  var clientId = $("selClient") ? $("selClient").value : "";
  if(!clientId){ alert("Selecciona cliente"); return; }

  var last = await getLastReading(clientId);
  if(!last){ alert("No hay lecturas"); return; }
  if(last.locked){ alert("No disponible"); return; }

  last.printed = true;
  last.locked = true;
  await idbPut("readings", last);

  var fecha = new Date(last.ts).toLocaleDateString();

  var w = window.open("", "_blank");
  if(!w){ alert("Permite ventanas emergentes para imprimir."); return; }

  var logoUrl = "";
  try{
    logoUrl = new URL("LOGO3.png", window.location.href).toString();
  }catch(e){
    logoUrl = "LOGO3.png";
  }

  var css =
    "<style>" +
    "@page{ size:55mm auto; margin:2mm; }" +
    "html,body{ width:55mm; margin:0; padding:0; }" +
    "body{ font-family:monospace; font-size:10px; line-height:1.15; color:#000; }" +
    ".wrap{ width:55mm; padding:2mm; box-sizing:border-box; }" +
    ".center{ text-align:center; }" +
    ".logo{ max-width:48mm; height:auto; margin:0 auto 6px auto; display:block; }" +
    ".sep{ border-top:1px dashed #000; margin:6px 0; }" +
    ".row{ display:flex; justify-content:space-between; gap:6px; }" +
    ".muted{ opacity:.9; }" +
    "@media print{ body{ -webkit-print-color-adjust:exact; print-color-adjust:exact; } }" +
    "</style>";

  var html =
    "<!doctype html><html><head><meta charset='utf-8'>" +
    "<meta name='viewport' content='width=device-width,initial-scale=1'>" +
    "<title>Recibo</title>" + css +
    "</head><body><div class='wrap'>" +

    "<img id='lg' class='logo' src='"+logoUrl+"' alt='logo'>" +

    "<div class='center'><b>COLONIA LAS PALMAS</b></div>" +
    "<div class='center muted'>LECTURA DE AGUA</div>" +
    "<div class='sep'></div>" +

    "<div><b>Casa:</b> " + escapeHtml(last.casa) + "</div>" +
    "<div><b>Cliente:</b> " + escapeHtml(last.cliente) + "</div>" +
    "<div><b>Contador:</b> " + escapeHtml(last.contador) + "</div>" +
    "<div><b>Fecha:</b> " + fecha + "</div>" +

    "<div class='sep'></div>" +

    "<div class='row'><span>Lectura anterior</span><span><b>" + last.prev + "</b></span></div>" +
    "<div class='row'><span>Lectura actual</span><span><b>" + last.curr + "</b></span></div>" +
    "<div class='row'><span>Consumo (m³)</span><span><b>" + last.consumo + "</b></span></div>" +
    "<div class='row'><span>Precio x m³</span><span><b>Q" + Number(last.price).toFixed(2) + "</b></span></div>" +

    "<div class='sep'></div>" +
    "<div class='row'><span><b>TOTAL</b></span><span><b>Q" + Number(last.total).toFixed(2) + "</b></span></div>" +

    "<div class='sep'></div>" +
    "<div><b>Pago:</b> BANRURAL - Ahorro</div>" +
    "<div><b>Cuenta:</b> 4503027719</div>" +

    "<div class='sep'></div>" +
    "<div class='muted'>Pago del 1 al 5 de cada mes.</div>" +
    "<div class='muted'>Mora 5% a partir del segundo mes.</div>" +
    "<div class='muted'>Corte de agua a los 3 meses de no pagar.</div>" +

    "<div class='sep'></div>" +
    "<div class='center muted'>Marck Business © 2026</div>" +
    "<div class='center muted'>Todos los derechos reservados</div>" +

    "</div>" +
    "<script>" +
    "function goPrint(){ try{ window.focus(); window.print(); }catch(e){} }" +
    "var img=document.getElementById('lg');" +
    "if(img){ img.onload=function(){ setTimeout(goPrint, 150); }; img.onerror=function(){ setTimeout(goPrint, 350); }; }" +
    "setTimeout(goPrint, 900);" +
    "<\/script>" +
    "</body></html>";

  w.document.open();
  w.document.write(html);
  w.document.close();

  alert("Listo");
};

// ===== TICKET DE PAGO (55mm, móvil) =====
window.printPaymentTicket = function(pay, client, prevBalance){
  try{
    var ts = pay && pay.ts ? pay.ts : Date.now();
    var fecha = fmtDate(ts);
    var metodo = (pay && pay.method) ? pay.method : "—";
    var monto = (pay && pay.amount!=null) ? pay.amount : 0;
    var casa = client && client.casa ? client.casa : (pay && pay.casa ? pay.casa : "");
    var nombre = client && client.name ? client.name : (pay && pay.cliente ? pay.cliente : "");
    var contador = client && client.meter ? client.meter : (pay && pay.contador ? pay.contador : "");
    var antes = Number(prevBalance!=null ? prevBalance : (client ? client.balance : 0) || 0);
    var despues = 0;

    var logoUrl = "";
    try{ logoUrl = new URL("LOGO3.png", window.location.href).toString(); }catch(e){ logoUrl = "LOGO3.png"; }

    var css =
      "<style>" +
      "@page{ size:55mm auto; margin:2mm; }" +
      "html,body{ width:55mm; margin:0; padding:0; }" +
      "body{ font-family:monospace; font-size:10px; line-height:1.15; color:#000; }" +
      ".wrap{ width:55mm; padding:2mm; box-sizing:border-box; }" +
      ".center{ text-align:center; }" +
      ".logo{ max-width:48mm; height:auto; margin:0 auto 6px auto; display:block; }" +
      ".sep{ border-top:1px dashed #000; margin:6px 0; }" +
      ".row{ display:flex; justify-content:space-between; gap:6px; }" +
      ".muted{ opacity:.9; }" +
      ".big{ font-size:12px; font-weight:bold; }" +
      "@media print{ body{ -webkit-print-color-adjust:exact; print-color-adjust:exact; } }" +
      "</style>";

    var html =
      "<!doctype html><html><head><meta charset='utf-8'>" +
      "<meta name='viewport' content='width=device-width,initial-scale=1'>" +
      "<title>Pago</title>" + css +
      "</head><body><div class='wrap'>" +

      "<img id='lg' class='logo' src='"+logoUrl+"' alt='logo'>" +
      "<div class='center'><b>COLONIA LAS PALMAS</b></div>" +
      "<div class='center muted'>RECIBO DE PAGO</div>" +
      "<div class='sep'></div>" +

      "<div><b>Casa:</b> " + escapeHtml(casa) + "</div>" +
      "<div><b>Cliente:</b> " + escapeHtml(nombre) + "</div>" +
      "<div><b>Contador:</b> " + escapeHtml(contador) + "</div>" +
      "<div><b>Fecha:</b> " + escapeHtml(fecha) + "</div>" +

      "<div class='sep'></div>" +

      "<div class='row'><span>Método</span><span><b>" + escapeHtml(metodo) + "</b></span></div>" +
      "<div class='row big'><span>PAGO</span><span>" + money(monto) + "</span></div>" +
      "<div class='row'><span>Saldo anterior</span><span><b>" + money(antes) + "</b></span></div>" +
      "<div class='row'><span>Saldo nuevo</span><span><b>" + money(despues) + "</b></span></div>" +

      "<div class='sep'></div>" +
      "<div class='muted'>Gracias por su pago.</div>" +
      "<div class='sep'></div>" +
      "<div class='center muted'>Marck Business © 2026</div>" +
      "<div class='center muted'>Todos los derechos reservados</div>" +

      "</div>" +
      "<script>" +
      "function goPrint(){ try{ window.focus(); window.print(); }catch(e){} }" +
      "var img=document.getElementById('lg');" +
      "if(img){ img.onload=function(){ setTimeout(goPrint, 150); }; img.onerror=function(){ setTimeout(goPrint, 350); }; }" +
      "setTimeout(goPrint, 900);" +
      "<\/script>" +
      "</body></html>";

    var w = window.open("", "_blank");
    if(!w){
      alert("Permite ventanas emergentes para imprimir el pago.");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  }catch(e){
    try{ console.error(e); }catch(_) {}
  }
};

window.unlockLastPrinted = async function(){
  if(!isActivated()){ showActivation(); return; }
  var clientId = $("selClient") ? $("selClient").value : "";
  if(!clientId){ alert("Selecciona cliente"); return; }

  var last = await getLastReading(clientId);
  if(!last){ alert("No disponible"); return; }
  if(!last.locked){ alert("No disponible"); return; }

  var c = prompt("");
  if(c !== EDIT_CODE){ alert("Acceso denegado"); return; }

  last.locked = false;
  await idbPut("readings", last);
  alert("Listo");
};

// ===== Pagos =====
window.registerPayment = async function(){
  if(!isActivated()){ showActivation(); return; }
  var clientId = $("selPayClient") ? $("selPayClient").value : "";
  if(!clientId){ alert("Selecciona cliente"); return; }

  var c = await idbGet("clients", clientId);
  if(!c){ alert("Cliente no encontrado"); return; }

  var prevBal = Number(c.balance||0);
  var amount = prevBal;
  if(amount <= 0){ alert("No hay saldo"); return; }

  var method = $("payMethod") ? ($("payMethod").value || "EFECTIVO") : "EFECTIVO";

  var pay = {
    id: uid("P"),
    clientId: clientId,
    amount: amount,
    ts: Date.now(),
    method: method,
    note: "Pago registrado"
  };
  await idbPut("payments", pay);

  // deja saldo en 0
  c.balance = 0;
  c.updatedAt = Date.now();
  await idbPut("clients", c);

  await updatePending();
  await renderDash();

  // imprime ticket de pago (móvil)
  try{ window.printPaymentTicket(pay, c, prevBal); }catch(e){}

  alert("Pago registrado");
};

window.clearDebtWithCode = async function(){
  var code = prompt("");
  if(code !== EDIT_CODE){ alert("Acceso denegado"); return; }

  var clientId = $("selPayClient") ? $("selPayClient").value : "";
  if(!clientId){ alert("Selecciona cliente"); return; }

  var c = await idbGet("clients", clientId);
  if(!c) return;

  c.balance = 0;
  c.updatedAt = Date.now();
  await idbPut("clients", c);

  await updatePending();
  await renderDash();
  alert("Listo");
};

// ===== Historial =====
window.renderHistory = async function(){
  var clientId = $("selHistClient") ? $("selHistClient").value : "";
  if(!clientId){ if($("historyBox")) $("historyBox").innerHTML = "—"; return; }

  var reads = await idbByIndex("readings","byClient",clientId);
  var pays  = await idbByIndex("payments","byClient",clientId);

  reads.sort(function(a,b){ return b.ts-a.ts; });
  pays.sort(function(a,b){ return b.ts-a.ts; });

  var html = "<b>LECTURAS</b><br>";
  if(!reads.length){ html += "Sin lecturas.<br>"; }
  for(var i=0;i<reads.length;i++){
    var r = reads[i];
    html += "- "+fmtDate(r.ts)+" · Consumo "+r.consumo+" m³ · "+money(r.total)+" · "+(r.locked?"BLOQUEADO":"") +"<br>";
  }

  html += "<br><b>PAGOS</b><br>";
  if(!pays.length){ html += "Sin pagos.<br>"; }
  for(var j=0;j<pays.length;j++){
    var p = pays[j];
    html += "- "+fmtDate(p.ts)+" · "+money(p.amount)+" · "+escapeHtml(p.method||"-")+"<br>";
  }

  if($("historyBox")) $("historyBox").innerHTML = html;
};

// ===== Dashboard =====
async function renderDash(){
  var box = $("dashInfo");
  if(!box) return;

  var clients = await idbAll("clients");
  var totalClients = clients.length;
  var totalDebt = 0;
  var debtors = 0;
  for(var i=0;i<clients.length;i++){
    var b = Number(clients[i].balance||0);
    totalDebt += b;
    if(b>0) debtors++;
  }
  box.innerHTML =
    "Clientes: <b>"+totalClients+"</b><br>"+
    "Con saldo: <b>"+debtors+"</b><br>"+
    "Total pendiente: <b>"+money(totalDebt)+"</b><br>"+
    "Precio m³: <b>"+money(PRICE)+"</b>";
}

// ===== Boot =====
async function bootAfterActivation(){
  await idbOpen();
  await renderDash();
  await refreshSelectors();
  await renderClients();
}

function boot(){
  // si no pasó inicio, no seguir
  if(!startIsOk()){
    showStart();
    return;
  }else{
    hideStart();
  }

  // si no activado, mostrar activación (pero el resumen no se queda colgado por errores)
  if(!isActivated()){
    showActivation();
    // igual abrimos DB y dashboard básico para que no quede "Cargando..."
    idbOpen().then(function(){
      renderDash();
      refreshSelectors();
      renderClients();
    }).catch(function(){});
    return;
  }

  hideActivation();
  bootAfterActivation();
}

// Captura errores para no quedarse "cargando" sin razón
window.onerror = function(msg, src, line, col){
  try{
    var box = $("dashInfo");
    if(box && box.innerHTML.indexOf("Cargando") !== -1){
      box.innerHTML = "Error: " + escapeHtml(msg) + "<br><span class='small'>Revisa que app.js esté cargando y que LOGO3.png exista.</span>";
    }
  }catch(e){}
};


document.addEventListener("DOMContentLoaded", function(){
  // coloca ID
  try{ if($("deviceIdTxt")) $("deviceIdTxt").textContent = getDeviceId(); }catch(e){}

  // decide acceso sin parpadeo
  if(startIsOk()){
    hideStart();
  }else{
    showStart();
  }

  // si ya pasó acceso, arranca flujo completo
  if(startIsOk()){
    boot();
  }else{
    // asegura que no quede activación encima del acceso
    hideActivation();
  }

  // hint si el logo no carga
  try{
    var imgs = document.querySelectorAll('img');
    for(var i=0;i<imgs.length;i++){
      imgs[i].addEventListener('error', function(){
        // no alert; solo consola
        try{ console.warn("No se encontró imagen:", this.getAttribute("src")); }catch(e){}
      });
    }
  }catch(e){}
});
