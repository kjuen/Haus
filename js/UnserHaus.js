/* global lil */


console.log('Hier wird unser Haus gebaut');

const canvas2D = document.getElementById("canvas2D");
const ctx2D = canvas2D.getContext("2d");
ctx2D.lineCap = "round";

function setStdTransformState() {
  ctx2D.resetTransform();
  ctx2D.scale(2.0,2.0);
}
setStdTransformState();

// * Konfiguration
function cfgDefault() {
  return {
    scale: 15,
    offsetX: 30,
    offsetY: 30,
    showMinorGrid: true,
    gridLinewidth: 0.2,
    gridDist: 1,
    zeigeCarport: false
  };
};

function cfgGrundstueckDefault() {
  return {
    show: true,
    zeigeMasse: true,
    zeigeAltesHaus: false,
    NordSuedLaengeWestseite: 17.20,   // 17.20 hat Herr Knibbe am 21.12.22 als Länge angegeben
    NordSuedLaengeOstseite: 17.20,
    OstWestLaengeNordseite: 30.00,
    OstWestLaengeSuedseite: 33.00,
    get Polygon() {
      return [new Point(0, 0),
              new Point(this.OstWestLaengeNordseite, 0),
              new Point(this.OstWestLaengeSuedseite, this.NordSuedLaengeWestseite),
              new Point(0, this.NordSuedLaengeOstseite)];
    },
    // AbstBaugrenzeW: 16.86,   // sagt Herr Knibbe
    AbstBaugrenzeW: 17.00,     // 17.02 hat Herr Knibbe am 21.12.22 als Länge angegeben
    Baufenster: {
      GrenzAbstand: 2.5,
      col: "red",
      show: true,
      zeigeMasse: false,
      //        2--------3
      //        |        |
      // 0------1        |
      // |               |
      // |               |
      // 5---------------4
      get Polygon() {
        return [new Point(xcoordFromW(this.GrenzAbstand), ycoordFromS(this.GrenzAbstand + 10.0)),  // 0
                new Point(xcoordFromBGO(6), ycoordFromS(this.GrenzAbstand + 10.0)),                // 1
                new Point(xcoordFromBGO(6), ycoordFromS(this.GrenzAbstand + 10.0+1)),               // 2
                new Point(xcoordFromBGO(0), ycoordFromS(this.GrenzAbstand + 10.0+1)),               // 3
                new Point(xcoordFromBGO(0), ycoordFromS(this.GrenzAbstand)),                      // 4
                new Point(xcoordFromW(this.GrenzAbstand), ycoordFromS(this.GrenzAbstand))];       // 5
      }
    },
    showBaeume: true,
    Kastanie: {
      Radius: 0.59,
      AbstN: 0.59 + 0.4,
      AbstW: 4.6
    },
    Eiche: {
      Radius: 0.6,
      AbstN: 17.4 + 1.5,
      AbstW: 18
    },
    WegAlt: {
      show: false,
      Breite: 2.6,
      AbstN: 1.65
    },
    WegNeu: {
      show: true,
      Breite: 2.6,
      AbstNostseite: 0.3,
      AbstNwestseite: 1.65
    }
  }
};


function cfgHausDefault() {
  return {
    show: false,
    zeigeVeranda: true,
    zeigeAussenMasse: true,
    zeigeInnenMasseHaus: true,
    zeigeInnenMasseAnbau: true,
    col: "green",
    HausLaengeOW: 8.25,
    get HausLaengeInnenOW() {
      return this.HausLaengeOW - 2 * this.DickeAussenwand;
    },
    HausAbstO: 0,
    HausAbstS: 0.5,
    OffsetNS: 0,
    OffsetOW: 0,
    AnbauAbstW: 0,
    AnbauAbstS: 4.25,
    AnbauLaengeNS: 5.70,
    DickeAussenwand: 0.4,
    DickeInnenwand: 0.2,
    //          3-------4
    //          |       |
    // 0------1-2       |
    // |                |
    // |                |
    // 8------7         |
    //        |         |
    //        6---------5
    PolygonAussen() {
      return [new Point(xcoordFromBFW(this.AnbauAbstW),      // 0
                        ycoordFromBFS(this.AnbauAbstS + this.AnbauLaengeNS)),
              new Point(xcoordFromBFO(this.HausLaengeOW),  // 1
                        ycoordFromBFS(this.AnbauAbstS + this.AnbauLaengeNS)),
              new Point(xcoordFromBFO(this.HausLaengeOW - this.OffsetOW),  // 2
                        ycoordFromBFS(this.AnbauAbstS + this.AnbauLaengeNS)),
              new Point(xcoordFromBFO(this.HausAbstO + this.HausLaengeOW - this.OffsetOW),   // 3
                        ycoordFromBFS(this.AnbauAbstS + this.AnbauLaengeNS + this.OffsetNS)),
              new Point(xcoordFromBFO(this.HausAbstO),  // 4
                        ycoordFromBFS(this.AnbauAbstS + this.AnbauLaengeNS + this.OffsetNS)),
              new Point(xcoordFromBFO(this.HausAbstO),  // 5
                        ycoordFromBFS(this.HausAbstS)),
              new Point(xcoordFromBFO(this.HausAbstO + this.HausLaengeOW),   // 6
                        ycoordFromBFS(this.HausAbstS)),
              new Point(xcoordFromBFO(this.HausAbstO + this.HausLaengeOW),   // 7
                        ycoordFromBFS(this.AnbauAbstS)),
              new Point(xcoordFromBFW(this.AnbauAbstW),   // 8
                        ycoordFromBFS(this.AnbauAbstS))];
    },

    // wird fuer die Berechnung der Wfl im OG gebrauch
    DickeDach: 0.35,
    DickeEDdecke: 0.35,
    RaumhoeheEG: 2.4,
    RaumhoeheOG: 2.4,
    Kniestock: 1.5,
    Dachneigung: 38, // Grad
    GaubeOstBreite: 3.3,   // etwa die Verandabreite
    GaubeWestBreite: 3.3   // etwa die Verandabreite
  };
};

let cfg, cfgGrundstueck, cfgHaus;
function initCfg() {
  cfg = cfgDefault();
  cfgGrundstueck = cfgGrundstueckDefault();
  cfgHaus = cfgHausDefault();
}
initCfg();

// * lil-gui
function guiSetter(cfgObject, fieldName, value) {
  cfgObject[fieldName] = value;
  zeichneAlles();
}

const gui = new lil.GUI({title: "Einstellungen"});

gui.add({reset() {
  initCfg();
  zeichneAlles();
}}, "reset");
gui.add(cfgGrundstueck, "show").name("Grundstück").onChange(v => {
  cfgGrundstueck.show=v;
  cfgGrundstueck.show ? guiGrdstck.show() : guiGrdstck.hide();
  zeichneAlles();

});

gui.add(cfgHaus, "show").name("Haus").onChange(v => {
  cfgHaus.show=v;
  cfgHaus.show ? guiHaus.show() : guiHaus.hide();
  zeichneAlles();

});

const guiGrdstck = gui.addFolder("Grundstück");
guiGrdstck.open(false);
guiGrdstck.add(cfgGrundstueck.Baufenster, "zeigeMasse").name("Maße Baugrenze").onChange(v => guiSetter(cfgGrundstueck.Baufenster, "zeigeMasse", v));
guiGrdstck.add(cfgGrundstueck, "zeigeAltesHaus").name("Altes Haus").onChange(v => guiSetter(cfgGrundstueck, "zeigeAltesHaus", v));
guiGrdstck.add(cfg, "zeigeCarport").name("Carport").onChange(v => guiSetter(cfg, "zeigeCarport", v));
guiGrdstck.add(cfgGrundstueck.WegAlt, "show").name("Alter Weg").onChange(v => guiSetter(cfgGrundstueck.WegAlt, "show", v));

const guiHaus = gui.addFolder("Haus");
guiHaus.open(false);
guiHaus.add(cfgHaus, "zeigeAussenMasse").name("Außenmaße").onChange(v => guiSetter(cfgHaus, "zeigeAussenMasse", v));
guiHaus.add(cfgHaus, "AnbauAbstW", -1, 2, 0.05).name("Anbau Abstand West").onChange(v => guiSetter(cfgHaus, "AnbauAbstW", v));
guiHaus.add(cfgHaus, "AnbauAbstS", -3, 6, 0.05).name("Anbau Abstand Süd").onChange(v => guiSetter(cfgHaus, "AnbauAbstS", v));
guiHaus.add(cfgHaus, "AnbauLaengeNS", 3, 10, 0.05).name("Anbau Länge Nord Süd").onChange(v => guiSetter(cfgHaus, "AnbauLaengeNS", v));

guiHaus.add(cfgHaus, "HausAbstS", 0, 3, 0.05).name("Haus Abstand Süd").onChange(v => guiSetter(cfgHaus, "HausAbstS", v));
guiHaus.add(cfgHaus, "HausLaengeOW", 5, 10, 0.05).name("Haus Länge Ost West").onChange(v => guiSetter(cfgHaus, "HausLaengeOW", v));
guiHaus.add(cfgHaus, "OffsetOW", 0, 4, 0.05).name("Ecke Länge Ost West").onChange(v => guiSetter(cfgHaus, "OffsetOW", v));
guiHaus.add(cfgHaus, "OffsetNS", 0, 3, 0.05).name("Ecke Länge Nord Süd").onChange(v => guiSetter(cfgHaus, "OffsetNS", v));

guiHaus.add(cfgHaus, "Kniestock", 0.5, 2.5, 0.05).name("Kniestock").onChange(v => guiSetter(cfgHaus, "Kniestock", v));
guiHaus.add(cfgHaus, "Dachneigung", 23, 45, 1).name("Dachneigung").onChange(v => guiSetter(cfgHaus, "Dachneigung", v));
guiHaus.add(cfgHaus, "GaubeWestBreite", 0, 5, 0.1).name("Breite Gaube West").onChange(v => guiSetter(cfgHaus, "GaubeWestBreite", v));
guiHaus.add(cfgHaus, "GaubeOstBreite", 0, 5, 0.1).name("Breite Gaube Ost").onChange(v => guiSetter(cfgHaus, "GaubeOstBreite", v));
guiHaus.add(cfgHaus, "zeigeVeranda").name("Veranda").onChange(v => guiSetter(cfgHaus, "zeigeVeranda", v));
cfgHaus.show ? guiHaus.show() : guiHaus.hide();


const guiGitter = gui.addFolder("Gitter");
guiGitter.open(false);
guiGitter.add(cfg, "gridDist", 0, 3, cfg.gridLinewidth).name("Gitter-Abstand").onChange(
  value => {
    cfg.gridDist = value;
    zeichneAlles();
  });
guiGitter.add(cfg, "showMinorGrid").name("Zwischenlinien").onChange(
  value => {
    cfg.showMinorGrid = value;
    zeichneAlles();
  });;


// * Infrastruktur
// x-Koordinate gemessen von der westlichen Grundstücksgrenze
const xcoordFromW = x => x; //cfg.offsetX + x * cfg.scale;
// x-Koordinate gemessen von der Baugrenze im Osten
const xcoordFromBGO = x => cfgGrundstueck.AbstBaugrenzeW - x; // cfg.offsetX + (cfgGrundstueck.AbstBaugrenzeW - x) * cfg.scale ;
// y-Koordinate gemessen von der nördlichen Grundstücksgrenze
const ycoordFromN = y => y; // cfg.offsetY + y * cfg.scale;
// y-Koordinate gemessen von der südlichen Grundstücksgrenze
// Nur richtig, wenn das Grundstück rechteckig ist
const ycoordFromS = y => cfgGrundstueck.NordSuedLaengeWestseite- y; // cfg.offsetY + (cfgGrundstueck.NordSuedLaengeWestseite- y) * cfg.scale;

const xcoordFromBFW = x => cfgGrundstueck.Baufenster.Polygon[0].x + x;
const xcoordFromBFO = x => cfgGrundstueck.Baufenster.Polygon[3].x - x;
const ycoordFromBFN = y => cfgGrundstueck.Baufenster.Polygon[2].y + y;
const ycoordFromBFS = y => cfgGrundstueck.Baufenster.Polygon[4].y - y;



function Point(x, y) {
  this.x = x;
  this.y = y;
  this.px = cfg.offsetX + cfg.scale * x;
  this.py = cfg.offsetY + cfg.scale * y;
}
function copyPoint(p, xOffset=0, yOffset=0) {
  return new Point(p.x+xOffset, p.y+yOffset);
}


// Berechne Schnittpunkt der beiden Geraden p1->p2 und p3->p4
function berechneSchnittpunkt(p1, p2, p3, p4) {
  const TOL = 0.0001;
  let m12, m34, b12, b34;

  if( Math.abs(p1.x - p2.x) > TOL) {
    m12 = (p1.y - p2.y) / (p1.x - p2.x);
    b12 = p1.y - m12 * p1.x;
  }
  if( Math.abs(p3.x - p4.x) > TOL) {
    m34 = (p3.y - p4.y) / (p3.x - p4.x);
    b34 = p3.y - m34 * p3.x;
  }
  if(m12 == undefined) {
    if(m34 == undefined) {
      throw "Beide Geraden senkrecht, kein eindeutiger Schnittpunkt";
    }
    // p1->p2 verläuft senkrecht
    return new Point(p1.x, m34*p1.x+b34);
  } else if(m34==undefined) {
    // p3->p4 verläuft senkrecht
    return new Point(p3.x, m12*p3.x+b12);
  } else {
    // keine der Gerade verläuft senkrecht
    if(Math.abs(m12 - m34) < TOL) {
      throw "Geraden parallel, kein eindeutiger Schnittpunkt";
    }
    const x = (b34-b12) / (m12 - m34);
    return new Point(x, m12*x + b12);
  }
}

// Test cases
// const A = areaPolygon([new Point(0,0), new Point(1,0), new Point(2,0), new Point(2,2), new Point(0,2)]);
// https://www.mathopenref.com/coordpolygonarea.html
// const A = areaPolygon([new Point(2,2), new Point(4,10), new Point(9,7), new Point(11,2), new Point(0,2)]);
// muss 45.5 ergeben
function areaPolygon(vertexArray) {

  // https://fddm.uni-paderborn.de/fileadmin/mathematik/Didaktik_der_Mathematik/Bender_Peter/Veroeffentlichungen/2010FlaecheninhaltPolygone.pdf
  // A = 1/2 * sum_{i=1}^n y_i * (x_{i-1} * x_{i+1})

  const len = vertexArray.length;
  let area = 1/2 * vertexArray[0].y * (vertexArray[len-1].x - vertexArray[1].x);
  if(len > 2) {
    for(let i = 1; i<len-1; ++i) {
      area += 1/2 * vertexArray[i].y * (vertexArray[i-1].x - vertexArray[i+1].x);
    }
    area += 1/2 * vertexArray[len-1].y * (vertexArray[len-2].x - vertexArray[0].x);
  }
  return Math.abs(area);
}

// Center of mass eines Polygons
function comPolygon(vertexArray) {
  let comx = 0;
  let comy = 0;
  const L = vertexArray.length;
  vertexArray.forEach(p=>{
    comx += p.x;
    comy += p.y;
  });
  return new Point(comx/L, comy/L);
}





// https://stackoverflow.com/questions/808826/draw-arrow-on-canvas-tag (ganz unten)
function drawArrow(x0, y0, x1, y1, width=0.5) {

  // x0, y0, x1, y1, width=0.5) {
  // const width = 0.8;
  const head_len = 7 * width; // 1.6;
  const head_angle = Math.PI / 10;
  const angle = Math.atan2(y1 - y0, x1 - x0);

  ctx2D.lineWidth = width;
  ctx2D.fillStyle="black";
  ctx2D.strokeStyle="black";
  ctx2D.setLineDash([1,1.5]);

  /* Adjust the point */
  x1 -= width * Math.cos(angle);
  y1 -= width * Math.sin(angle);

  ctx2D.beginPath();
  ctx2D.moveTo(x0, y0);
  ctx2D.lineTo(x1, y1);
  ctx2D.stroke();

  function drawHead(x,y, dir=1) {

    ctx2D.beginPath();
    ctx2D.lineTo(x, y);
    ctx2D.lineTo(x - dir * head_len * Math.cos(angle - head_angle), y - dir * head_len * Math.sin(angle - head_angle));
    ctx2D.lineTo(x - dir * head_len * Math.cos(angle + head_angle), y - dir * head_len * Math.sin(angle + head_angle));
    ctx2D.closePath();
    ctx2D.stroke();
    ctx2D.fill();
  }
  drawHead(x1, y1);
  /* Adjust the point */
  x0 -= width * Math.cos(angle);
  y0 -= width * Math.sin(angle);
  drawHead(x0, y0, -1);
}

function distBetweenPoints(p1, p2) {
  return Math.sqrt( (p1.x  - p2.x)**2 + (p1.y - p2.y)**2);
}

function pointInbetween(p1, p2, r) {
  return new Point( p1.x + r * (p2.x - p1.x), (p1.y + r * (p2.y - p1.y)))
}

const middlePoint = (p1, p2) => pointInbetween(p1, p2, 0.5);

function bemassung(p1, p2, pos='t', offset=0.3) {
  let px1 = p1.px;
  let py1 = p1.py;
  let px2 = p2.px;
  let py2 = p2.py;

  offset = offset * cfg.scale;
  const txtHeight = 6;
  ctx2D.fillStyle = "black";
  ctx2D.font = txtHeight.toString() + "px Arial";
  const dist = distBetweenPoints(p1, p2);
  if(dist < 0.1) {
    return dist;
  }
  const txt = dist.toFixed(2).toString();
  const txtWidth = ctx2D.measureText(txt).width;

  const mp = middlePoint(p1, p2); // new Point( (p1.x + p2.x)/2, (p1.y + p2.y) / 2);
  let mpx = mp.px;
  let mpy = mp.py;
  let angle = 0;

  if(pos==='t') {
    py1 -= offset;
    py2 -= offset;
    mpy -= 1.5*offset;
    mpx -= txtWidth/2;
  } else if(pos==='b') {
    py1 += offset;
    py2 += offset;
    mpx -= txtWidth/2;
    mpy += 1.5*offset + txtHeight;
  } else if(pos==='l') {
    px1 -= offset;
    px2 -= offset;
    mpx -= 1.5*offset;
    mpy += txtWidth/2;
    angle = -90;
  } else if(pos==='r') {
    px1 += offset;
    px2 += offset;
    mpx += 1.5*offset;
    mpy -= txtWidth/2;
    angle = 90;
  } else {
    throw "pos must be t, b, l, r";
  }

  drawArrow(px1, py1, px2, py2);
  ctx2D.translate(mpx, mpy);
  ctx2D.rotate(angle * Math.PI / 180);
  ctx2D.fillText(txt,0,0);
  setStdTransformState();
  return dist;
}

function drawGrid(xOffset, yOffset, gridSize, lw, col) {
  ctx2D.setLineDash([]);
  ctx2D.lineWidth = lw;
  ctx2D.strokeStyle = col;
  let count = 1;
  let x = 0;
  do {
    x = (xOffset + count * cfg.gridDist) * cfg.scale;
    ctx2D.moveTo(x, 0);
    ctx2D.lineTo(x, canvas2D.height);
    ++count;
  } while (x < canvas2D.width);
  count = 1;
  let y = 0;
  do {
    y = (yOffset + count * cfg.gridDist) * cfg.scale;
    ctx2D.moveTo(0, y);
    ctx2D.lineTo(canvas2D.width, y);
    ++count;
  } while (y < canvas2D.height);
  ctx2D.stroke();
}

function drawTree(cfgObj, circ) {
  ctx2D.fillStyle = "SaddleBrown";
  const center = new Point(cfgObj.AbstW, cfgObj.AbstN);
  ctx2D.beginPath();
  ctx2D.arc(center.px, center.py, cfg.scale*cfgObj.Radius, 0, Math.PI * 2, true); // Outer circle
  ctx2D.fill();

  ctx2D.strokeStyle = "black";
  ctx2D.lineWidth = 0.5;
  ctx2D.setLineDash([4,5]);
  ctx2D.beginPath();
  ctx2D.arc(center.px, center.py, cfg.scale*circ, 0, 2*Math.PI, true);
  ctx2D.stroke();
  bemassung(center, new Point(cfgObj.AbstW + circ, cfgObj.AbstN), 't', 0);
}

function drawBezier(bezStart, bezEnd, bezCp1, bezCp2,
                    col="black", lineWidth=3, dash=[]){
  ctx2D.setLineDash(dash);
  ctx2D.strokeStyle = col;
  ctx2D.lineWidth = lineWidth;

  ctx2D.beginPath();
  ctx2D.moveTo(bezStart.px, bezStart.py);
  ctx2D.bezierCurveTo(bezCp1.px, bezCp1.py,
                      bezCp2.px, bezCp2.py,
                      bezEnd.px, bezEnd.py);
  ctx2D.stroke();
}

function drawPolygon(vertexArray, col="black", lineWidth=3, dash=[], close=true) {
  if(vertexArray.length <= 1) {
    throw 'Vertex Array must have at least two verteices';
  }

  ctx2D.setLineDash(dash);
  ctx2D.strokeStyle = col;
  ctx2D.lineWidth = lineWidth;


  ctx2D.beginPath();
  ctx2D.moveTo(vertexArray[0].px, vertexArray[0].py);
  for(let k = 1; k<vertexArray.length; ++k) {
    ctx2D.lineTo(vertexArray[k].px, vertexArray[k].py);
  }
  if(close) {
    ctx2D.lineTo(vertexArray[0].px, vertexArray[0].py);
  }
  ctx2D.stroke();
}

// Fuers Obergeschoss: Berechne Abstand Innenwand zum Punkt mit Hoehe h
function berechneSchittAbstand(h) {

  const B = cfgHaus.HausLaengeInnenOW; // OW - 2 * cfgHaus.DickeAussenwand;
  const L = B / (2 * Math.cos(Math.PI/180*cfgHaus.Dachneigung));
  const H = L * Math.sin(Math.PI/180*cfgHaus.Dachneigung);
  const y = h - cfgHaus.Kniestock;
  const x = Math.max(0, y * B / (2 * H));
  return x;
}

function berechneOG() {
  const B = cfgHaus.HausLaengeInnenOW; //  - 2 * cfgHaus.DickeAussenwand;
  const L = B / (2 * Math.cos(Math.PI/180*cfgHaus.Dachneigung));
  const H = L * Math.sin(Math.PI/180*cfgHaus.Dachneigung);
  const x = berechneSchittAbstand(2.3); // Math.max(0, y * B / (2 * H));
  const hausAussenpoly = cfgHaus.PolygonAussen();
  const laengeHausNS = distBetweenPoints(hausAussenpoly[4], hausAussenpoly[5]) - 2 * cfgHaus.DickeAussenwand;
  const wflOG = laengeHausNS * (B - 2 * x);
  // Obere Ecke: wie koennte man das testen?
  const flEcke = cfgHaus.OffsetNS * Math.max(0, cfgHaus.OffsetOW - x);
  return wflOG - flEcke; //  + wflOG2;
}

function berechneGiebelhoehe() {
  const B = cfgHaus.HausLaengeOW - 2 * cfgHaus.DickeAussenwand;
  const H = B / 2 * Math.tan(Math.PI / 180 * cfgHaus.Dachneigung);
  const G = cfgHaus.DickeDach / Math.cos(Math.PI / 180 * cfgHaus.Dachneigung);
  return cfgHaus.RaumhoeheEG + cfgHaus.DickeEDdecke + cfgHaus.Kniestock + H + G;
}

// * 2-D Zeichnung

// Grundstueck
function zeichneGrundstueck() {
  if (cfgGrundstueck.show) {
    // Grundstück-Aussengrenze und Bäume
    const polyGrdst = cfgGrundstueck.Polygon;
    drawPolygon(polyGrdst, "black", 1);
    if(cfgGrundstueck.zeigeMasse) {
      bemassung(polyGrdst[0], polyGrdst[1], 't');
      bemassung(polyGrdst[0], polyGrdst[3], 'l');
    }
    document.getElementById("FlaecheGrundStueck").innerText
      = areaPolygon(polyGrdst).toFixed(2).toString() + "m²";

    if (cfgGrundstueck.showBaeume) {
      drawTree(cfgGrundstueck.Kastanie, 4.25);
      drawTree(cfgGrundstueck.Eiche, 4.25);
    }

    // Weg
    const WegAltObenLinks = new Point(0, cfgGrundstueck.WegAlt.AbstN);
    const WegAltObenGanzRechts = copyPoint(WegAltObenLinks, cfgGrundstueck.OstWestLaengeSuedseite);
    const WegAltObenRechts = berechneSchnittpunkt(WegAltObenLinks, WegAltObenGanzRechts,
                                                  polyGrdst[1], polyGrdst[2]);
    const WegAltUntenLinks = copyPoint(WegAltObenLinks, 0, cfgGrundstueck.WegAlt.Breite);
    const WegAltUntenGanzRechts = copyPoint(WegAltUntenLinks, cfgGrundstueck.OstWestLaengeSuedseite);
    const WegAltUntenRechts = berechneSchnittpunkt(WegAltUntenLinks, WegAltUntenGanzRechts,
                                                   polyGrdst[1], polyGrdst[2]);
    const polyWegAlt = [WegAltObenLinks, WegAltObenRechts, WegAltUntenRechts, WegAltUntenLinks];
    document.getElementById("FlaecheWegAlt").innerText
      = areaPolygon(polyWegAlt).toFixed(2).toString() + "m²";

    if(cfgGrundstueck.WegAlt.show) {
      drawPolygon(polyWegAlt, "LightSalmon", 2.0);
      // drawPolygon([copyPoint(WegObenLinks, 0, cfgGrundstueck.WegAlt.Breite),
      //              copyPoint(WegObenRechts, 0, cfgGrundstueck.WegAlt.Breite)], "LightSalmon", 2.0);
      if(cfgGrundstueck.zeigeMasse) {
        bemassung(WegAltObenLinks, WegAltUntenLinks, 'r');
        const mpw = middlePoint(WegAltObenLinks, WegAltObenRechts);
        bemassung(mpw, copyPoint(mpw, 0, -cfgGrundstueck.WegAlt.AbstN), 'r');
      }
    }



    // Neuer Weg:
    if(cfgGrundstueck.WegNeu.show) {

      // Ost-Teil
      const AbstOstteilW = 12;   // Abstand gerade Ostteil von Westgrenze
      const WegOstNeuObenLinks = new Point(AbstOstteilW, cfgGrundstueck.WegNeu.AbstNostseite);
      const WegOstNeuObenGanzRechts = copyPoint(WegOstNeuObenLinks, cfgGrundstueck.OstWestLaengeSuedseite);
      const WegOstNeuObenRechts = berechneSchnittpunkt(WegOstNeuObenLinks, WegOstNeuObenGanzRechts,
                                                       polyGrdst[1], polyGrdst[2]);
      const WegOstNeuUntenLinks = copyPoint(WegOstNeuObenLinks, 0, cfgGrundstueck.WegNeu.Breite);
      const WegOstNeuUntenGanzRechts = copyPoint(WegOstNeuUntenLinks, cfgGrundstueck.OstWestLaengeSuedseite);
      const WegOstNeuUntenRechts = berechneSchnittpunkt(WegOstNeuUntenLinks, WegOstNeuUntenGanzRechts,
                                                        polyGrdst[1], polyGrdst[2]);

      // West-Teil
      const AbstWestteilW = cfgGrundstueck.Kastanie.AbstW + 3;   // Abstand gerader Westteil von Westgrenze
      const WegWestNeuObenLinks = new Point(0, cfgGrundstueck.WegNeu.AbstNwestseite);
      const WegWestNeuObenRechts = new Point(AbstWestteilW, cfgGrundstueck.WegNeu.AbstNwestseite);
      const WegWestNeuUntenLinks = copyPoint(WegWestNeuObenLinks, 0, cfgGrundstueck.WegNeu.Breite);
      const WegWestNeuUntenRechts = copyPoint(WegWestNeuObenRechts, 0, cfgGrundstueck.WegNeu.Breite);

      // Obere Wegverschwenkung
      // Obere Wegverschwenkung
      const bezParam1 = 1;
      const bezParam2 = 2.5;
      const ostFaktor = 1.5;
      const bezStartO = copyPoint(WegWestNeuObenRechts, -bezParam1, 0);
      const bezEndO = copyPoint(WegOstNeuObenLinks, ostFaktor * bezParam1, 0);
      const bezCp1O = copyPoint(WegWestNeuObenRechts, bezParam2, 0);
      const bezCp2O = copyPoint(WegOstNeuObenLinks, -ostFaktor * bezParam2, 0);
      drawBezier(bezStartO, bezEndO, bezCp1O, bezCp2O, "LightSalmon", 2.0, [2,3]);


      // Untere Wegverschwenkung
      const bezStartU = copyPoint(WegWestNeuUntenRechts, -bezParam1, 0);
      const bezEndU = copyPoint(WegOstNeuUntenLinks, ostFaktor * bezParam1, 0);
      const bezCp1U = copyPoint(WegWestNeuUntenRechts, bezParam2, 0);
      const bezCp2U = copyPoint(WegOstNeuUntenLinks, -ostFaktor *bezParam2, 0);
      drawBezier(bezStartU, bezEndU, bezCp1U, bezCp2U, "LightSalmon", 2.0, [2,3]);

      const polyWegOstNeu = [bezEndO, WegOstNeuObenRechts, WegOstNeuUntenRechts, bezEndU];
      drawPolygon(polyWegOstNeu, "LightSalmon", 2.0, [2,3], false);
      const polyWegWestNeu = [bezStartU, WegWestNeuUntenLinks, WegWestNeuObenLinks, bezStartO];
      drawPolygon(polyWegWestNeu, "LightSalmon", 2.0, [2,3], false);
      // Einfache Variante: geknickter Weg

      // drawPolygon([WegWestNeuObenRechts, WegOstNeuObenLinks], "LightSalmon", 2.0, [2,3], false);


      // drawPolygon([WegWestNeuUntenRechts, WegOstNeuUntenLinks], "LightSalmon", 2.0, [2,3], false);


      if(cfgGrundstueck.zeigeMasse) {
        bemassung(WegWestNeuObenLinks, WegWestNeuUntenLinks, 'r');
        const pTemp = copyPoint(WegWestNeuObenLinks, 1, 0);
        bemassung(pTemp, copyPoint(pTemp, 0, -cfgGrundstueck.WegNeu.AbstNwestseite), 'r');
      }
    }


    // Baugrenze Richtung Wittenbergener Weg
    drawPolygon([new Point(cfgGrundstueck.AbstBaugrenzeW, 0),
                 new Point(cfgGrundstueck.AbstBaugrenzeW, cfgGrundstueck.NordSuedLaengeWestseite)],
                "blue", 2);

    // Baufenster
    const polyBF = cfgGrundstueck.Baufenster.Polygon;
    document.getElementById("FlaecheBaufenster").innerText
      = areaPolygon(polyBF).toFixed(2).toString() + "m²";
    if(cfgGrundstueck.Baufenster.show) {
      drawPolygon(polyBF, cfgGrundstueck.Baufenster.col, 1.2, [1,2]);
      if(cfgGrundstueck.Baufenster.zeigeMasse) {
        bemassung(polyBF[0], polyBF[5], 'l');
        bemassung(polyBF[4], polyBF[5], 'b');
        bemassung(polyBF[0], polyBF[1], 't');
        bemassung(polyBF[1], polyBF[2], 'r');
        bemassung(polyBF[2], polyBF[3], 't');
        bemassung(polyBF[3], new Point(polyBF[3].x, ycoordFromN(0)), 'r');
       // bemassung(polyBF[3], polyBF[4], 'r');
        // Mass von der Kastanie zum Baufenster
        const kastanieSued = new Point(xcoordFromW(cfgGrundstueck.Kastanie.AbstW),
                                      ycoordFromN(cfgGrundstueck.Kastanie.AbstN + cfgGrundstueck.Kastanie.Radius));
        const tmpPoint = new Point(kastanieSued.x, polyBF[0].y);
        bemassung(tmpPoint, kastanieSued, 'r', 0);
      }
    }
  }
}

function zeichneHaus() {
  // Das Haus
  const polyAussen = cfgHaus.PolygonAussen();
  if(cfgHaus.show) {
    drawPolygon(polyAussen, cfgHaus.col, 1.2);
    // Verlauf des Giebels: aufpassen, wenn die Nordwand eine Ecke hat!
    const giebelUnten = middlePoint(polyAussen[5], polyAussen[6]);
    const giebelOben = new Point(giebelUnten.x, polyAussen[4].y);
    drawPolygon([giebelOben, giebelUnten],
                cfgHaus.col, 0.2)
  }
  const flAussen = areaPolygon(polyAussen);
  document.getElementById("Grundflaeche").innerText
    = flAussen.toFixed(2).toString() + "m²";
  document.getElementById("Grundflaeche66").innerText
    = (flAussen/100 * 66).toFixed(2).toString() + "m²";
  const flDachterasse = areaPolygon([polyAussen[0], polyAussen[1], polyAussen[7], polyAussen[8]]);
  document.getElementById("FlaecheDachterasse").innerText
    = flDachterasse.toFixed(2).toString() + "m²";
  const p = polyAussen[5];
  const maxGiebelHoehe = distBetweenPoints(p, new Point(p.x, ycoordFromS(0))) / 0.4;
  document.getElementById("MaxGiebelHoehe").innerText
    = maxGiebelHoehe.toFixed(2).toString() + "m";
  const verandaBreite = 1/3 * distBetweenPoints(polyAussen[4], polyAussen[5]);
  document.getElementById("VerandaBreite").innerText
    = (verandaBreite).toFixed(2).toString() + "m";



  const mp67 = middlePoint(polyAussen[6], polyAussen[7]);
  const mp78 = middlePoint(polyAussen[7], polyAussen[8]);
  const flHinterGarten = distBetweenPoints(mp78,  new Point(mp78.x, ycoordFromS(0)))
        * distBetweenPoints(mp67,  new Point(xcoordFromW(0), mp67.y));
  document.getElementById("FlaecheHintergarten").innerText
    = flHinterGarten.toFixed(2).toString() + "m²";

  if(cfgHaus.show && cfgHaus.zeigeAussenMasse) {
    bemassung(polyAussen[0], polyAussen[8], 'l');
    if(cfgHaus.OffsetNS>0.05) {
      bemassung(polyAussen[0], polyAussen[2], 't');
      bemassung(polyAussen[2], polyAussen[3], 'r');
      bemassung(polyAussen[3], polyAussen[4], 't');
    } else {
      bemassung(polyAussen[0], polyAussen[4], 't');
    }
    bemassung(polyAussen[4], polyAussen[5], 'r');
    bemassung(polyAussen[5], polyAussen[6], 't');
    bemassung(polyAussen[6], polyAussen[7], 'l');
    if(cfgGrundstueck.show) {
      bemassung(polyAussen[8], new Point(0, polyAussen[8].y), 't');
      bemassung(mp78, new Point(mp78.x, ycoordFromS(0)), 'r');
      bemassung(mp67, new Point(xcoordFromW(0), mp67.y), 't');
      const mp34 = middlePoint(polyAussen[3], polyAussen[4]);
      bemassung(mp34, new Point(mp34.x, ycoordFromN(0)), 'r');
      const kastanieSued = new Point(xcoordFromW(cfgGrundstueck.Kastanie.AbstW),
                                     ycoordFromN(cfgGrundstueck.Kastanie.AbstN + cfgGrundstueck.Kastanie.Radius));
      const tmpPoint = new Point(kastanieSued.x, polyAussen[0].y);
      bemassung(tmpPoint, kastanieSued, 'r', 0);
    }
  }

  if(cfgHaus.show && cfgHaus.zeigeVeranda) {
    const ol = pointInbetween(polyAussen[4], polyAussen[5], 1/3);
    const or = new Point(ol.x+1.5, ol.y)
    const ul = pointInbetween(polyAussen[4], polyAussen[5], 2/3);
    const ur = new Point(ul.x+1.5, ul.y)
    drawPolygon([ol, or, ur, ul], cfgHaus.col, 0.75);
    if(cfgHaus.zeigeAussenMasse) {
      bemassung(ol, or, 't');
      bemassung(or, ur, 'r');
    }
  }

  // Haus Innen
  const daw = cfgHaus.DickeAussenwand;
  const diw = cfgHaus.DickeInnenwand;

  const polyHausInnen = [
    copyPoint(polyAussen[1], daw, daw),   // 0
    copyPoint(polyAussen[2], daw, daw),   // 1
    copyPoint(polyAussen[3], daw, daw),
    copyPoint(polyAussen[4], -daw, daw),
    copyPoint(polyAussen[5], -daw, -daw),
    copyPoint(polyAussen[6], daw, -daw),
    copyPoint(polyAussen[7], daw, -daw),  // 6
  ];
  if (cfgHaus.show) {
    drawPolygon(polyHausInnen, cfgHaus.col, 0.6);
  }
  const wflEG = areaPolygon(polyHausInnen);
  document.getElementById("InnenflaecheEG").innerText
    = wflEG.toFixed(2).toString() + "m²";
  let wflOG = berechneOG();   // wird noch durch die Gauben korrigiert



  // Gaube-Ost
  if(cfgHaus.GaubeOstBreite>0.1) {
    // Tiefe der Gaube berechnen: Da wo die Dachhöhe die OG-Raumhöhe schneidet

    const mitteAussen = middlePoint(polyAussen[4], polyAussen[5]);
    const tiefe = berechneSchittAbstand(2.5) + cfgHaus.DickeAussenwand;
    // Wohnflaeche korrigieren:
    const x = berechneSchittAbstand(2.3);
    wflOG += x * cfgHaus.GaubeOstBreite;

    if (cfgHaus.show) {
    const polyGaubeAussen = [copyPoint(mitteAussen, 0, cfgHaus.GaubeOstBreite/2),
                             copyPoint(mitteAussen, 0, -cfgHaus.GaubeOstBreite/2),
                             copyPoint(mitteAussen, -tiefe, -cfgHaus.GaubeOstBreite/2),
                             copyPoint(mitteAussen, -tiefe, cfgHaus.GaubeOstBreite/2)];
      drawPolygon(polyGaubeAussen, cfgHaus.col, 1);
      drawPolygon([middlePoint(polyGaubeAussen[2], polyGaubeAussen[3]), polyGaubeAussen[0]],cfgHaus.col, 0.8);
      drawPolygon([middlePoint(polyGaubeAussen[2], polyGaubeAussen[3]), polyGaubeAussen[1]],cfgHaus.col, 0.8);
    }
  }

  if(cfgHaus.GaubeWestBreite>0.1) {

    const mitteAussen = middlePoint(polyAussen[1], polyAussen[7]);
    const tiefe = berechneSchittAbstand(2.5) + cfgHaus.DickeAussenwand;
    // Wohnflaeche korrigieren:
    const x = berechneSchittAbstand(2.3);
    wflOG += x * cfgHaus.GaubeWestBreite;

    if (cfgHaus.show) {
    const polyGaubeAussen = [copyPoint(mitteAussen, 0, cfgHaus.GaubeWestBreite/2),
                             copyPoint(mitteAussen, 0, -cfgHaus.GaubeWestBreite/2),
                             copyPoint(mitteAussen, tiefe, -cfgHaus.GaubeWestBreite/2),
                             copyPoint(mitteAussen, tiefe, cfgHaus.GaubeWestBreite/2)];
      drawPolygon(polyGaubeAussen, cfgHaus.col, 1);
      drawPolygon([middlePoint(polyGaubeAussen[2], polyGaubeAussen[3]), polyGaubeAussen[0]],cfgHaus.col, 0.8);
      drawPolygon([middlePoint(polyGaubeAussen[2], polyGaubeAussen[3]), polyGaubeAussen[1]],cfgHaus.col, 0.8);
    }
  }


  // Wohnflaechen berichten
  if (cfgHaus.show) {
    const comHausInnen = comPolygon(polyHausInnen);
    ctx2D.fillStyle = cfgHaus.col;
    let str = "EG: " + wflEG.toFixed(1).toString() + "m²";
    ctx2D.fillText(str, comHausInnen.px, comHausInnen.py);
    str = "OG: " + wflOG.toFixed(1).toString() + "m²";
    ctx2D.fillText(str, comHausInnen.px, comHausInnen.py+8);
  }
  document.getElementById("InnenflaecheOG").innerText
    = wflOG.toFixed(2).toString() + "m²";

  // Anbau Innen
  const polyAnbauInnen = [
    copyPoint(polyAussen[0], daw, daw),
    copyPoint(polyHausInnen[0], -diw, 0),
    copyPoint(polyHausInnen[6], -diw, 0),
    copyPoint(polyAussen[8], daw, -daw)
  ];
  if (cfgHaus.show) {
    drawPolygon(polyAnbauInnen, cfgHaus.col, 0.6);
  }
  // Berechnung diverser Kenngroessen
  const giebelHoehe = berechneGiebelhoehe();
  document.getElementById("GiebelHoehe").innerText
    = giebelHoehe.toFixed(2).toString() + "m";
  const wflAnbau =areaPolygon(polyAnbauInnen);
  document.getElementById("InnenflaecheAnbau").innerText
    = wflAnbau.toFixed(2).toString() + "m²";
  const wflGesamt = wflOG + wflEG + wflAnbau;
  document.getElementById("InnenflaecheGesamt").innerText
    = wflGesamt.toFixed(2).toString() + "m²";
  if (cfgHaus.show) {
    const comAnbauInnen = comPolygon(polyAnbauInnen);

    ctx2D.fillStyle = cfgHaus.col;
    let str = wflAnbau.toFixed(1).toString() + "m²";
    ctx2D.fillText(str, comAnbauInnen.px, comAnbauInnen.py);
  }
  const budgetHaus = wflGesamt*9000 - 705262.15 - 140000;
  document.getElementById("BudgetHaus").innerText
    = (Math.round(budgetHaus/1000)).toString() + " Tausend €";
}

function zeichneGrid() {
  // Grid
  if(cfg.gridDist >= cfg.gridLinewidth) {
    drawGrid(0, 0, cfg.gridDist, cfg.gridLinewidth, "gray");
    if(cfg.showMinorGrid) {
      drawGrid(cfg.gridDist/2, cfg.gridDist/2, cfg.gridDist, cfg.gridLinewidth/2, "gray");
    }
  }
}

function zeichneAltesHaus() {
  if(cfgGrundstueck.show && cfgGrundstueck.zeigeAltesHaus) {
    const polyAltesHaus = [
      new Point(11.55, ycoordFromS(8.7)),
      new Point(11.55, ycoordFromS(0)),
      new Point(5, ycoordFromS(0)),
      new Point(5, ycoordFromS(6)),
      new Point(0, ycoordFromS(6)),
      new Point(0, ycoordFromS(8.7))
    ];
    ctx2D.translate(68, -10);
    ctx2D.rotate(-Math.PI / 180 * 2);
    drawPolygon(polyAltesHaus, 'gray', 1);
    setStdTransformState();
    let x = cfgGrundstueck.AbstBaugrenzeW - 0.24;

    bemassung(new Point(x, 7.55), new Point(x, ycoordFromN(0)), 'l', 0);
    bemassung(new Point(x, 7.55), new Point(x, ycoordFromS(0)), 'r', 0.4);
    const tmpPoint = new Point(x+ 0.3, 14.15);
    const polyGrdst = cfgGrundstueck.Polygon;
    const tmpPoint2 = berechneSchnittpunkt(tmpPoint, copyPoint(tmpPoint, 30, 0),
                                           polyGrdst[1], polyGrdst[2]);
    bemassung(tmpPoint, tmpPoint2, 't', 0);
    x = cfgGrundstueck.Kastanie.AbstW;
    let y = cfgGrundstueck.Kastanie.AbstN + cfgGrundstueck.Kastanie.Radius;
    bemassung(new Point(x+0.3, y + 6.41),
              new Point(x, ycoordFromN(y)), 'r', 0);

  }
}


function zeichneCarport() {

  if(cfg.zeigeCarport) {
    const p1 = new Point(xcoordFromBGO(-12.5), 5);
    const p2 = new Point(xcoordFromBGO(-14.05), 14);
    const p3 = copyPoint(p2, -3, 0);
    const p4 = copyPoint(p1, -3, 0);
    drawPolygon([p1, p2, p3, p4], "black", 1);
    // Bemassung nach rechts:
    const polyGrdst = cfgGrundstueck.Polygon;
    bemassung(p1, berechneSchnittpunkt(p1, copyPoint(p1, 10, 0),
                                       polyGrdst[1], polyGrdst[2]), 't', 0);
    bemassung(p2, berechneSchnittpunkt(p2, copyPoint(p2, 10, 0),
                                       polyGrdst[1], polyGrdst[2]), 't', 0);
    // Bemassung nach links zur Baugrenze
    bemassung(p4, new Point(xcoordFromBGO(0), p4.y), 't', 0);
    bemassung(p3, new Point(xcoordFromBGO(0), p3.y), 't', 0);
  }




}


// Main
function zeichneAlles() {
  berechneOG();
  ctx2D.clearRect(0,0, canvas2D.width, canvas2D.height);
  zeichneGrundstueck();
  zeichneHaus();
  zeichneAltesHaus();
  zeichneCarport();
  zeichneGrid();
}
zeichneAlles();
