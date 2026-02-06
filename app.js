// CONFIG
var PRICE = 3;
var EDIT_CODE = "363534";

// ACTIVACIÓN (cambia aquí en GitHub para invalidar)
var ACTIVATION_CODE = "2278";

var ACT_KEY = "agua_app_activated_v1";
var DEV_KEY = "agua_app_device_id_v1";

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
  $("deviceIdTxt").textContent = getDeviceId();
  $("activationOverlay").classList.add("show");
  $("appRoot").classList.add("lockedUi");
  $("actStatus").textContent = "NO ACTIVADO";
}
function hideActivation(){
  $("activationOverlay").classList.remove("show");
  $("appRoot").classList.remove("lockedUi");
}
window.activate = function(){
  var entered = ($("actCode").value || "").trim();
  if(entered !== ACTIVATION_CODE){ alert("Código incorrecto"); return; }
  localStorage.setItem(ACT_KEY, "1");
  hideActivation();
  bootAfterActivation();
};
window.hardLock = function(){ alert("Sistema no activado."); };

// ===== Menú =====
window.toggleNav = function(){ $("nav").classList.toggle("open"); };
window.go = function(id){
  if(!isActivated()){ showActivation(); return; }
  var screens = document.querySelectorAll(".screen");
  for(var i=0;i<screens.length;i++) screens[i].classList.remove("active");
  $(id).classList.add("active");
  $("nav").classList.remove("open");
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
  var casa = ($("cCasa").value||"").trim();
  var meter = ($("cContador").value||"").trim();
  var name = ($("cNombre").value||"").trim();
  if(!casa || !meter || !name){ alert("Completa Casa, Contador y Nombre"); return; }

  var id = "C|" + casa.toUpperCase() + "|" + meter;
  var existing = await idbGet("clients", id);

  var client = {
    id:id, casa:casa, meter:meter, name:name,
    balance: existing ? Number(existing.balance||0) : 0,
    lastReadingValue: existing ? (existing.lastReadingValue ?? null) : null,
    createdAt: existing ? existing.createdAt : Date.now(),
    updatedAt: Date.now()
  };
  await idbPut("clients", client);
  window.clearClientForm();
  await renderClients();
  await refreshSelectors();
  alert("Cliente guardado");
};
window.clearClientForm = function(){
  $("cCasa").value=""; $("cContador").value=""; $("cNombre").value="";
};

async function renderClients(){
  var list = await idbAll("clients");
  list.sort(function(a,b){ return (a.casa||"").localeCompare(b.casa||""); });
  if(!list.length){ $("clientsList").innerHTML = "No hay clientes."; return; }

  var html = "";
  for(var i=0;i<list.length;i++){
    var c = list[i];
    html += "<div style='padding:10px;border-radius:14px;background:#0b1133;margin:8px 0'>";
    html += "<b>"+escapeHtml(c.casa)+" · "+escapeHtml(c.name)+"</b><br>";
    html += "<span style='color:#9ca3af;font-size:12px'>Contador: "+escapeHtml(c.meter)+" · Saldo: <b>"+money(c.balance)+"</b></span>";
    html += "</div>";
  }
  $("clientsList").innerHTML = html;
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

  $("selClient").innerHTML = opt;
  $("selPayClient").innerHTML = opt;
  $("selHistClient").innerHTML = opt;

  $("selClient").onchange = async function(){
    var id = $("selClient").value;
    var c = await idbGet("clients", id);
    $("prev").value = (c && c.lastReadingValue!=null) ? c.lastReadingValue : "";
    $("act").value = "";
    $("consumoTxt").textContent = "-";
    $("totalTxt").textContent = "-";
  };

  $("selPayClient").onchange = updatePending;

  if($("selClient").value){
    var c0 = await idbGet("clients", $("selClient").value);
    $("prev").value = (c0 && c0.lastReadingValue!=null) ? c0.lastReadingValue : "";
  }
  await updatePending();
}

async function updatePending(){
  var id = $("selPayClient").value;
  if(!id){ $("pendingTxt").textContent = money(0); return; }
  var c = await idbGet("clients", id);
  $("pendingTxt").textContent = money(c ? c.balance : 0);
}

// ===== Lecturas =====
window.calcReading = async function(){
  if(!isActivated()){ showActivation(); return; }
  var clientId = $("selClient").value;
  if(!clientId){ alert("Selecciona cliente"); return; }

  var c = await idbGet("clients", clientId);
  if(!c){ alert("Cliente no encontrado"); return; }

  var p = Number($("prev").value);
  var a = Number($("act").value);
  if(!Number.isFinite(p) || !Number.isFinite(a)){ alert("Lecturas inválidas"); return; }
  if(a < p){ alert("Lectura actual no puede ser menor"); return; }

  var consumo = a - p;
  var total = consumo * PRICE;

  $("consumoTxt").textContent = consumo + " m³";
  $("totalTxt").textContent = money(total);

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
  alert("Lectura guardada");
};

async function getLastReading(clientId){
  var list = await idbByIndex("readings","byClient",clientId);
  list.sort(function(a,b){ return b.ts-a.ts; });
  return list[0] || null;
}

window.printLastReading = async function(){
  if(!isActivated()){ showActivation(); return; }
  var clientId = $("selClient").value;
  if(!clientId){ alert("Selecciona cliente"); return; }

  var last = await getLastReading(clientId);
  if(!last){ alert("No hay lecturas"); return; }
  if(last.locked){ alert("Ya fue impresa y está bloqueada"); return; }

  last.printed = true;
  last.locked = true;
  await idbPut("readings", last);

  var fecha = new Date(last.ts).toLocaleDateString();

  // NO meto <script> dentro del string (evita problemas de parseo)
  var w = window.open("", "_blank");
  w.document.open();
  w.document.write("<html><head><meta charset='utf-8'><title>Recibo</title></head><body>");
  w.document.write("<div style='font-family:monospace;white-space:pre-line'>");
  w.document.write("<img src='LOGO3.png' style='max-width:180px;display:block;margin:0 auto 10px auto'>");
  w.document.write("\nLECTURA DE AGUA - RESIDENCIAL");
  w.document.write("\nCasa: "+escapeHtml(last.casa));
  w.document.write("\nCliente: "+escapeHtml(last.cliente));
  w.document.write("\nContador: "+escapeHtml(last.contador));
  w.document.write("\nFecha: "+fecha);
  w.document.write("\n\nLectura anterior: "+last.prev);
  w.document.write("\nLectura actual:   "+last.curr);
  w.document.write("\nConsumo:          "+last.consumo+" m³");
  w.document.write("\nPrecio x m³:      Q"+Number(last.price).toFixed(2));
  w.document.write("\n---------------------------");
  w.document.write("\nTOTAL A PAGAR:    Q"+Number(last.total).toFixed(2));
  w.document.write("\n\nFORMA DE PAGO:");
  w.document.write("\nBanco Industrial - Ahorro");
  w.document.write("\nCuenta: 4503027719");
  w.document.write("\n\nCONDICIONES:");
  w.document.write("\nPago del 1 al 5 de cada mes.");
  w.document.write("\nMora 5% a partir del segundo mes.");
  w.document.write("\nCorte de agua a los 3 meses de no pagar.");
  w.document.write("</div></body></html>");
  w.document.close();
  w.focus();
  w.print();

  alert("Impresión enviada. Lectura bloqueada.");
};

window.unlockLastPrinted = async function(){
  if(!isActivated()){ showActivation(); return; }
  var clientId = $("selClient").value;
  if(!clientId){ alert("Selecciona cliente"); return; }

  var last = await getLastReading(clientId);
  if(!last){ alert("Sin lecturas"); return; }
  if(!last.locked){ alert("La última lectura no está bloqueada"); return; }

  var c = prompt("Código (363534):");
  if(c !== EDIT_CODE){ alert("Código incorrecto"); return; }

  last.locked = false;
  await idbPut("readings", last);
  alert("Desbloqueado");
};

// ===== Pagos =====
window.registerPayment = async function(){
  if(!isActivated()){ showActivation(); return; }
  var clientId = $("selPayClient").value;
  if(!clientId){ alert("Selecciona cliente"); return; }

  var c = await idbGet("clients", clientId);
  if(!c){ alert("Cliente no encontrado"); return; }

  var amount = Number(c.balance||0);
  if(amount <= 0){ alert("No hay saldo"); return; }

  await idbPut("payments", {
    id: uid("P"), clientId: clientId,
    amount: amount, ts: Date.now(),
    method: "DEP/TRANSF", note:"Pago registrado"
  });

  c.balance = 0;
  c.updatedAt = Date.now();
  await idbPut("clients", c);

  await updatePending();
  await renderDash();
  alert("Pago registrado. Saldo Q0.");
};

window.clearDebtWithCode = async function(){
  var code = prompt("Código (363534):");
  if(code !== EDIT_CODE){ alert("Código incorrecto"); return; }

  var clientId = $("selPayClient").value;
  if(!clientId){ alert("Selecciona cliente"); return; }

  var c = await idbGet("clients", clientId);
  if(!c) return;

  c.balance = 0;
  c.updatedAt = Date.now();
  await idbPut("clients", c);

  await updatePending();
  await renderDash();
  alert("Deuda reiniciada.");
};

// ===== Historial =====
window.renderHistory = async function(){
  var clientId = $("selHistClient").value;
  if(!clientId){ $("historyBox").innerHTML = "—"; return; }

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

  $("historyBox").innerHTML = html;
};

// ===== Dashboard =====
async function renderDash(){
  var clients = await idbAll("clients");
  var totalClients = clients.length;
  var totalDebt = 0;
  var debtors = 0;
  for(var i=0;i<clients.length;i++){
    var b = Number(clients[i].balance||0);
    totalDebt += b;
    if(b>0) debtors++;
  }
  $("dashInfo").innerHTML =
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

(function boot(){
  $("deviceIdTxt").textContent = getDeviceId();
  if(!isActivated()) showActivation();
  else{
    hideActivation();
    bootAfterActivation();
  }
})();
