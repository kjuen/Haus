/* global lil */

// TODO:
// - Innenraum Anbau flexibler machen: Puhh, schwierig!
// - PolygonSuedGiebel fertig bauen

console.log('Hier wird unser Haus gebaut');

// * Konfiguration

const Debug = {
  zeigeAchsen: false
};

let drawEnv2D;
function drawEnv2DGrundstueck() {
  return {
    get canvas() {
      return document.getElementById("canvasGrdstk");
    },
    get ctx2D() {
      const ctx = this.canvas.getContext("2d");
      ctx.lineCap = "round";
      return ctx;
    },
    scale: 15,
    offsetX: 30,
    offsetY: 30,

    setStdTransformState() {
      this.ctx2D.resetTransform();
      this.ctx2D.scale(2.0,2.0);
    }
  };
};

function drawEnv2DSeitenansichten() {
  return {
    get canvas() {
      return document.getElementById("canvasSeitenansichten");
    },
    get ctx2D() {
      const ctx = this.canvas.getContext("2d");
      ctx.lineCap = "round";
      return ctx;
    },
    scale: 35,
    offsetX: 35,
    offsetY: 35,
    setStdTransformState() {
      this.ctx2D.resetTransform();
      this.ctx2D.scale(2.0,2.0);
    }
  };
};

function cfgGrundstueckDefault() {
  return {
    zeigeMasse: true,
    zeigeHaus: true,
    zeigeGitter: true,
    zeigeBaeume: true,

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
        new Point(xcoordFromBGO(6), ycoordFromS(this.GrenzAbstand + 10.0 + 1)),               // 2
        new Point(xcoordFromBGO(0), ycoordFromS(this.GrenzAbstand + 10.0 + 1)),               // 3
        new Point(xcoordFromBGO(0), ycoordFromS(this.GrenzAbstand)),                      // 4
        new Point(xcoordFromW(this.GrenzAbstand), ycoordFromS(this.GrenzAbstand))];       // 5
      }
    },
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
      AbstNwestseite: 1.65,
    },
    Carport: {
      show: false,
      get Polygon() {
        const p1 = new Point(xcoordFromBGO(-12.5), 5);
        const p2 = new Point(xcoordFromBGO(-14.05), 14);
        const p3 = copyPoint(p2, -3, 0);
        const p4 = copyPoint(p1, -3, 0);
        return [p1, p2, p3, p4];
      }
    },
    AltesHaus: {
      show: false,
      get Polygon() {
        return [
          new Point(11.55, ycoordFromS(8.7)),
          new Point(11.55, ycoordFromS(0)),
          new Point(5, ycoordFromS(0)),
          new Point(5, ycoordFromS(6)),
          new Point(0, ycoordFromS(6)),
          new Point(0, ycoordFromS(8.7))];
      },
      get PolygonOhneAnbau() {
        return [
          new Point(11.55, ycoordFromS(8.7)),
          new Point(11.55, ycoordFromS(0)),
          new Point(5, ycoordFromS(0)),
          new Point(5, ycoordFromS(8.7))];
      },
      get PolygonNeuerAnbau() {
        const ol = copyPoint(this.Polygon[4], -2.25, -5.8);
        return [this.Polygon[4],
        copyPoint(this.Polygon[4], -2.25, 0),
          ol,
        new Point(this.Polygon[0].x, ol.y),
        this.Polygon[0],
        new Point(5, this.Polygon[0].y),
        this.Polygon[3]];
      }
    }
  };
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
    OffsetNS: 1,
    OffsetOW: 3,
    AnbauAbstW: 0,
    AnbauAbstS: 4.25,
    AnbauLaengeNS: 5.70,
    DickeAussenwand: 0.4,
    DickeInnenwand: 0.2,
    // Punkt 1 ist doch überflüssig!
    //          3-------4
    //          |       |
    // 0------1-2       |
    // |                |
    // |                |
    // 8------7         |
    //        |         |
    //        6---------5
    get PolygonAussen() {
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
    get PolygonEGInnen() {
      const daw = this.DickeAussenwand;
      const diw = this.DickeInnenwand;
      const polyAussen = this.PolygonAussen;
      const polyHausInnen = [
        copyPoint(polyAussen[1], daw, daw),   // 0
        copyPoint(polyAussen[2], daw, daw),   // 1
        copyPoint(polyAussen[3], daw, daw),
        copyPoint(polyAussen[4], -daw, daw),
        copyPoint(polyAussen[5], -daw, -daw),
        copyPoint(polyAussen[6], daw, -daw),
        copyPoint(polyAussen[7], daw, -daw),  // 6
      ];
      return polyHausInnen;
    },
    get PolygonAnbauInnen() {
      const daw = this.DickeAussenwand;
      const diw = this.DickeInnenwand;
      // const laengOWinnen = 8;
      const polyAussen = this.PolygonAussen;
      const polyHausInnen = this.PolygonEGInnen;
      // const ul = copyPoint(polyAussen[8], daw, -daw);
      // const ur = copyPoint(polyAussen[8], daw+laengOWinnen, -daw);
      // // if(ur.x < polyAussen[2].x + daw) {
      // return [ul, ur,
      //         copyPoint(polyAussen[0], daw+laengOWinnen, daw),
      //         copyPoint(polyAussen[0], daw, daw)];
      // // } else {
      //   alert("????");
      //   return 2;
      // }

      // const polyAnbauInnen =
      const polyAnbauInnen = [
        copyPoint(polyAussen[0], daw, daw),
        copyPoint(polyHausInnen[0], -diw, 0),
        copyPoint(polyHausInnen[6], -diw, 0),
        copyPoint(polyAussen[8], daw, -daw)
      ];
      return polyAnbauInnen;
    },
    get PolygonSuedGiebel() {
      const poly = [
        new Point(0,0),
        new Point(this.HausLaengeOW, 0),
        new Point(this.HausLaengeOW, this.RaumhoeheEG),
        new Point(this.HausLaengeOW, this.RaumhoeheEG + this.DickeEDdecke),
        new Point(this.HausLaengeOW, this.RaumhoeheEG + this.DickeEDdecke+this.Kniestock),
        new Point(this.HausLaengeOW/2, this.RaumhoeheEG + this.DickeEDdecke+this.Kniestock+2),
        new Point(0, this.RaumhoeheEG + this.DickeEDdecke+this.Kniestock)
      ];
      return poly;
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

let cfgGrundstueck, cfgHaus;
function initCfg() {
  cfgGrundstueck = cfgGrundstueckDefault();
  cfgHaus = cfgHausDefault();
}
initCfg();



// setStdTransformState();


// * lil-gui
function guiSetter(cfgObject, fieldName, value) {
  cfgObject[fieldName] = value;
  updateAll();
}

const gui = new lil.GUI({title: "Einstellungen"});

const guiHaus = gui.addFolder("Haus");
guiHaus.open(false);
guiHaus.add(cfgHaus, "zeigeAussenMasse").name("Außenmaße").onChange(v => guiSetter(cfgHaus, "zeigeAussenMasse", v));
guiHaus.add(cfgHaus, "AnbauAbstW", -1, 2, 0.05).name("Anbau Abstand West").onChange(v => guiSetter(cfgHaus, "AnbauAbstW", v));
guiHaus.add(cfgHaus, "AnbauAbstS", -3, 6, 0.05).name("Anbau Abstand Süd").onChange(v => guiSetter(cfgHaus, "AnbauAbstS", v));
guiHaus.add(cfgHaus, "AnbauLaengeNS", 3, 10, 0.05).name("Anbau Länge Nord Süd").onChange(v => guiSetter(cfgHaus, "AnbauLaengeNS", v));

guiHaus.add(cfgHaus, "HausAbstS", 0, 3, 0.05).name("Haus Abstand Süd").onChange(v => guiSetter(cfgHaus, "HausAbstS", v));
guiHaus.add(cfgHaus, "HausLaengeOW", 5, 10, 0.05).name("Haus Länge Ost West").onChange(v => guiSetter(cfgHaus, "HausLaengeOW", v));
guiHaus.add(cfgHaus, "OffsetOW", 0, 6, 0.05).name("Ecke Länge Ost West").onChange(v => guiSetter(cfgHaus, "OffsetOW", v));
guiHaus.add(cfgHaus, "OffsetNS", 0, 3, 0.05).name("Ecke Länge Nord Süd").onChange(v => guiSetter(cfgHaus, "OffsetNS", v));

guiHaus.add(cfgHaus, "Kniestock", 0.5, 2.5, 0.05).name("Kniestock").onChange(v => guiSetter(cfgHaus, "Kniestock", v));
guiHaus.add(cfgHaus, "Dachneigung", 23, 45, 1).name("Dachneigung").onChange(v => guiSetter(cfgHaus, "Dachneigung", v));
guiHaus.add(cfgHaus, "GaubeWestBreite", 0, 5, 0.1).name("Breite Gaube West").onChange(v => guiSetter(cfgHaus, "GaubeWestBreite", v));
guiHaus.add(cfgHaus, "GaubeOstBreite", 0, 5, 0.1).name("Breite Gaube Ost").onChange(v => guiSetter(cfgHaus, "GaubeOstBreite", v));
guiHaus.add(cfgHaus, "zeigeVeranda").name("Veranda").onChange(v => guiSetter(cfgHaus, "zeigeVeranda", v));
// cfgHaus.show ? guiHaus.show() : guiHaus.hide();

const guiGrdstck = gui.addFolder("Grundstück");
guiGrdstck.open(false);
guiGrdstck.add(cfgGrundstueck, "zeigeHaus").name("Haus").onChange(v => guiSetter(cfgGrundstueck, "zeigeHaus", v));
guiGrdstck.add(cfgGrundstueck.Baufenster, "zeigeMasse").name("Maße Baufenster").onChange(v => guiSetter(cfgGrundstueck.Baufenster, "zeigeMasse", v));
guiGrdstck.add(cfgGrundstueck.AltesHaus, "show").name("Altes Haus").onChange(v => guiSetter(cfgGrundstueck.AltesHaus, "show", v));
guiGrdstck.add(cfgGrundstueck.Carport, "show").name("Carport").onChange(v => guiSetter(cfgGrundstueck.Carport, "show", v));
guiGrdstck.add(cfgGrundstueck.WegAlt, "show").name("Alter Weg").onChange(v => guiSetter(cfgGrundstueck.WegAlt, "show", v));
guiGrdstck.add(cfgGrundstueck, "zeigeBaeume").name("Bäume").onChange(v => guiSetter(cfgGrundstueck, "zeigeBaeume", v));
guiGrdstck.add(cfgGrundstueck, "zeigeGitter").name("Gitter").onChange(v => guiSetter(cfgGrundstueck, "zeigeGitter", v));




// * Infrastruktur
// x-Koordinate gemessen von der westlichen Grundstücksgrenze
const xcoordFromW = x => x; //drawEnv2D.offsetX + x * drawEnv2D.scale;
// x-Koordinate gemessen von der Baugrenze im Osten
const xcoordFromBGO = x => cfgGrundstueck.AbstBaugrenzeW - x; // drawEnv2D.offsetX + (cfgGrundstueck.AbstBaugrenzeW - x) * drawEnv2D.scale ;
// y-Koordinate gemessen von der nördlichen Grundstücksgrenze
const ycoordFromN = y => y; // drawEnv2D.offsetY + y * drawEnv2D.scale;
// y-Koordinate gemessen von der südlichen Grundstücksgrenze
// Nur richtig, wenn das Grundstück rechteckig ist
const ycoordFromS = y => cfgGrundstueck.NordSuedLaengeWestseite- y; // drawEnv2D.offsetY + (cfgGrundstueck.NordSuedLaengeWestseite- y) * drawEnv2D.scale;

const xcoordFromBFW = x => cfgGrundstueck.Baufenster.Polygon[0].x + x;
const xcoordFromBFO = x => cfgGrundstueck.Baufenster.Polygon[3].x - x;
const ycoordFromBFN = y => cfgGrundstueck.Baufenster.Polygon[2].y + y;
const ycoordFromBFS = y => cfgGrundstueck.Baufenster.Polygon[4].y - y;

function zeichne2DAchsen() {
  if(Debug.zeigeAchsen) {
    drawPolygon([new Point(0, 0), new Point(2, 0)], "red", 2);
    drawPolygon([new Point(0, 0), new Point(0, 2)], "green", 2);
  }
}


function Point(x, y) {
  this.x = x;
  this.y = y;
  // this.px = drawEnv2D.offsetX + drawEnv2D.scale * x;
  // this.py = drawEnv2D.offsetY + drawEnv2D.scale * y;
}

Object.defineProperty(Point.prototype, "px", {
  get: function ppx() {
    return drawEnv2D.offsetX + drawEnv2D.scale * this.x;
  }
});
Object.defineProperty(Point.prototype, "py", {
  get: function ppx() {
    return drawEnv2D.offsetY + drawEnv2D.scale * this.y;
  }
});
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

  drawEnv2D.ctx2D.lineWidth = width;
  drawEnv2D.ctx2D.fillStyle="black";
  drawEnv2D.ctx2D.strokeStyle="black";
  drawEnv2D.ctx2D.setLineDash([1,1.5]);

  /* Adjust the point */
  x1 -= width * Math.cos(angle);
  y1 -= width * Math.sin(angle);

  drawEnv2D.ctx2D.beginPath();
  drawEnv2D.ctx2D.moveTo(x0, y0);
  drawEnv2D.ctx2D.lineTo(x1, y1);
  drawEnv2D.ctx2D.stroke();

  function drawHead(x,y, dir=1) {

    drawEnv2D.ctx2D.beginPath();
    drawEnv2D.ctx2D.lineTo(x, y);
    drawEnv2D.ctx2D.lineTo(x - dir * head_len * Math.cos(angle - head_angle), y - dir * head_len * Math.sin(angle - head_angle));
    drawEnv2D.ctx2D.lineTo(x - dir * head_len * Math.cos(angle + head_angle), y - dir * head_len * Math.sin(angle + head_angle));
    drawEnv2D.ctx2D.closePath();
    drawEnv2D.ctx2D.stroke();
    drawEnv2D.ctx2D.fill();
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
  return new Point(p1.x + r * (p2.x - p1.x), (p1.y + r * (p2.y - p1.y)));
}

const middlePoint = (p1, p2) => pointInbetween(p1, p2, 0.5);

function bemassung(p1, p2, pos='t', offset=0.3) {
  let px1 = p1.px;
  let py1 = p1.py;
  let px2 = p2.px;
  let py2 = p2.py;

  offset = offset * drawEnv2D.scale;
  const txtHeight = 6;
  drawEnv2D.ctx2D.fillStyle = "black";
  drawEnv2D.ctx2D.font = txtHeight.toString() + "px Arial";
  const dist = distBetweenPoints(p1, p2);
  if(dist < 0.1) {
    return dist;
  }
  const txt = dist.toFixed(2).toString();
  const txtWidth = drawEnv2D.ctx2D.measureText(txt).width;

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
  drawEnv2D.ctx2D.translate(mpx, mpy);
  drawEnv2D.ctx2D.rotate(angle * Math.PI / 180);
  drawEnv2D.ctx2D.fillText(txt,0,0);
  drawEnv2D.setStdTransformState();
  return dist;
}

function drawGrid(xOffset, yOffset, gridSize, lw, col) {

  drawEnv2D.ctx2D.setLineDash([]);
  drawEnv2D.ctx2D.lineWidth = lw;
  drawEnv2D.ctx2D.strokeStyle = col;
  let count = 1;
  let x = 0;
  do {
    x = (xOffset + count * gridSize) * drawEnv2D.scale;
    drawEnv2D.ctx2D.moveTo(x, 0);
    drawEnv2D.ctx2D.lineTo(x, drawEnv2D.canvas.height);
    ++count;
  } while (x < drawEnv2D.canvas.width);
  count = 1;
  let y = 0;
  do {
    y = (yOffset + count * gridSize) * drawEnv2D.scale;
    drawEnv2D.ctx2D.moveTo(0, y);
    drawEnv2D.ctx2D.lineTo(drawEnv2D.canvas.width, y);
    ++count;
  } while (y < drawEnv2D.canvas.height);
  drawEnv2D.ctx2D.stroke();
}

function drawTree(cfgObj, circ) {
  drawEnv2D.ctx2D.fillStyle = "SaddleBrown";
  const center = new Point(cfgObj.AbstW, cfgObj.AbstN);
  drawEnv2D.ctx2D.beginPath();
  drawEnv2D.ctx2D.arc(center.px, center.py, drawEnv2D.scale*cfgObj.Radius, 0, Math.PI * 2, true); // Outer circle
  drawEnv2D.ctx2D.fill();

  drawEnv2D.ctx2D.strokeStyle = "black";
  drawEnv2D.ctx2D.lineWidth = 0.5;
  drawEnv2D.ctx2D.setLineDash([4,5]);
  drawEnv2D.ctx2D.beginPath();
  drawEnv2D.ctx2D.arc(center.px, center.py, drawEnv2D.scale*circ, 0, 2*Math.PI, true);
  drawEnv2D.ctx2D.stroke();
  bemassung(center, new Point(cfgObj.AbstW + circ, cfgObj.AbstN), 't', 0);
}

function drawBezier(vertexArray, col="black", lineWidth=3, dash=[]){
  const [bezStart, bezEnd, bezCp1, bezCp2] = vertexArray;
  drawEnv2D.ctx2D.setLineDash(dash);
  drawEnv2D.ctx2D.strokeStyle = col;
  drawEnv2D.ctx2D.lineWidth = lineWidth;

  drawEnv2D.ctx2D.beginPath();
  drawEnv2D.ctx2D.moveTo(bezStart.px, bezStart.py);
  drawEnv2D.ctx2D.bezierCurveTo(bezCp1.px, bezCp1.py,
                          bezCp2.px, bezCp2.py,
                          bezEnd.px, bezEnd.py);
  drawEnv2D.ctx2D.stroke();
}

function drawPolygon(vertexArray, col="black", lineWidth=3, dash=[], close=true) {
  if(vertexArray.length <= 1) {
    throw 'Vertex Array must have at least two verteices';
  }

  drawEnv2D.ctx2D.setLineDash(dash);
  drawEnv2D.ctx2D.strokeStyle = col;
  drawEnv2D.ctx2D.lineWidth = lineWidth;


  drawEnv2D.ctx2D.beginPath();
  drawEnv2D.ctx2D.moveTo(vertexArray[0].px, vertexArray[0].py);
  for(let k = 1; k<vertexArray.length; ++k) {
    drawEnv2D.ctx2D.lineTo(vertexArray[k].px, vertexArray[k].py);
  }
  if(close) {
    drawEnv2D.ctx2D.lineTo(vertexArray[0].px, vertexArray[0].py);
  }
  drawEnv2D.ctx2D.stroke();
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
  const hausAussenpoly = cfgHaus.PolygonAussen;
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



function datenNeuerWeg() {
  // Ost-Teil
  const ret = {};
  const polyGrdst = cfgGrundstueck.Polygon;
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
  const bezParam1 = 1;
  const bezParam2 = 2.5;
  const ostFaktor = 1.5;
  const bezStartO = copyPoint(WegWestNeuObenRechts, -bezParam1, 0);
  const bezEndO = copyPoint(WegOstNeuObenLinks, ostFaktor * bezParam1, 0);
  const bezCp1O = copyPoint(WegWestNeuObenRechts, bezParam2, 0);
  const bezCp2O = copyPoint(WegOstNeuObenLinks, -ostFaktor * bezParam2, 0);
  ret.bezO = [bezStartO, bezEndO, bezCp1O, bezCp2O];

  // Untere Wegverschwenkung
  const bezStartU = copyPoint(WegWestNeuUntenRechts, -bezParam1, 0);
  const bezEndU = copyPoint(WegOstNeuUntenLinks, ostFaktor * bezParam1, 0);
  const bezCp1U = copyPoint(WegWestNeuUntenRechts, bezParam2, 0);
  const bezCp2U = copyPoint(WegOstNeuUntenLinks, -ostFaktor *bezParam2, 0);
  ret.bezU = [bezStartU, bezEndU, bezCp1U, bezCp2U];

  ret.polyWegOstNeu = [bezEndO, WegOstNeuObenRechts, WegOstNeuUntenRechts, bezEndU];

  ret.polyWegWestNeu = [bezStartU, WegWestNeuUntenLinks, WegWestNeuObenLinks, bezStartO];

  return ret;
}


function datenAlterWeg() {
  const polyGrdst = cfgGrundstueck.Polygon;
  const WegAltObenLinks = new Point(0, cfgGrundstueck.WegAlt.AbstN);
  const WegAltObenGanzRechts = copyPoint(WegAltObenLinks, cfgGrundstueck.OstWestLaengeSuedseite);
  const WegAltObenRechts = berechneSchnittpunkt(WegAltObenLinks, WegAltObenGanzRechts,
                                                polyGrdst[1], polyGrdst[2]);
  const WegAltUntenLinks = copyPoint(WegAltObenLinks, 0, cfgGrundstueck.WegAlt.Breite);
  const WegAltUntenGanzRechts = copyPoint(WegAltUntenLinks, cfgGrundstueck.OstWestLaengeSuedseite);
  const WegAltUntenRechts = berechneSchnittpunkt(WegAltUntenLinks, WegAltUntenGanzRechts,
                                                 polyGrdst[1], polyGrdst[2]);
  const polyWegAlt = [WegAltObenLinks, WegAltObenRechts, WegAltUntenRechts, WegAltUntenLinks];
  return polyWegAlt;
}

// * Tabelle mit Daten

function berechneTabellenDaten() {
  if(detDatenTabelle.open) {
    const polyGrdst = cfgGrundstueck.Polygon;
    document.getElementById("FlaecheGrundStueck").innerText
      = areaPolygon(polyGrdst).toFixed(2).toString() + "m²";

    // Alter Weg
    const polyWegAlt = datenAlterWeg();
    document.getElementById("FlaecheWegAlt").innerText
      = areaPolygon(polyWegAlt).toFixed(2).toString() + "m²";


    // Baufenster
    const polyBF = cfgGrundstueck.Baufenster.Polygon;
    document.getElementById("FlaecheBaufenster").innerText
      = areaPolygon(polyBF).toFixed(2).toString() + "m²";

    // Haus
    const polyAussen = cfgHaus.PolygonAussen;
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

    // Haus Innen
    const polyHausInnen = cfgHaus.PolygonEGInnen;

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
    }

    // Gaube West
    if(cfgHaus.GaubeWestBreite>0.1) {

      const mitteAussen = middlePoint(polyAussen[1], polyAussen[7]);
      const tiefe = berechneSchittAbstand(2.5) + cfgHaus.DickeAussenwand;
      // Wohnflaeche korrigieren:
      const x = berechneSchittAbstand(2.3);
      wflOG += x * cfgHaus.GaubeWestBreite;
    }


    // Wohnflaechen berichten
    const comHausInnen = comPolygon(polyHausInnen);
    drawEnv2D.ctx2D.fillStyle = cfgHaus.col;
    let str = "EG: " + wflEG.toFixed(1).toString() + "m²";
    drawEnv2D.ctx2D.fillText(str, comHausInnen.px, comHausInnen.py);
    str = "OG: " + wflOG.toFixed(1).toString() + "m²";
    drawEnv2D.ctx2D.fillText(str, comHausInnen.px, comHausInnen.py+8);
    document.getElementById("InnenflaecheOG").innerText
      = wflOG.toFixed(2).toString() + "m²";

    // Anbau Innen
    const polyAnbauInnen = cfgHaus.PolygonAnbauInnen;

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

    const budgetHaus = wflGesamt*9000 - 705262.15 - 140000;
    document.getElementById("BudgetHaus").innerText
      = (Math.round(budgetHaus/1000)).toString() + " Tausend €";
  }
}

// * Grundstücksplan

// Grundstueck
function zeichne2DGrundstueck() {
  const polyGrdst = cfgGrundstueck.Polygon;
  drawPolygon(polyGrdst, "black", 1);
  if(cfgGrundstueck.zeigeMasse) {
    bemassung(polyGrdst[0], polyGrdst[1], 't');
    bemassung(polyGrdst[0], polyGrdst[3], 'l');
  }

  if (cfgGrundstueck.zeigeBaeume) {
    drawTree(cfgGrundstueck.Kastanie, 4.25);
    drawTree(cfgGrundstueck.Eiche, 4.25);
  }

  // Alter Weg
  const polyWegAlt = datenAlterWeg();

  if(cfgGrundstueck.WegAlt.show) {
    drawPolygon(polyWegAlt, "LightSalmon", 2.0);
    // drawPolygon([copyPoint(WegObenLinks, 0, cfgGrundstueck.WegAlt.Breite),
    //              copyPoint(WegObenRechts, 0, cfgGrundstueck.WegAlt.Breite)], "LightSalmon", 2.0);
    if(cfgGrundstueck.zeigeMasse) {
      bemassung(polyWegAlt[0], polyWegAlt[3], 'r');
      const mpw = middlePoint(polyWegAlt[0], polyWegAlt[1]);
      bemassung(mpw, copyPoint(mpw, 0, -cfgGrundstueck.WegAlt.AbstN), 'r');
    }
  }

  // Neuer Weg:
  if(cfgGrundstueck.WegNeu.show) {

    const neuerWeg = datenNeuerWeg();

    const wegCol = "blue";
    const wegLs = 1.0;
    drawBezier(neuerWeg.bezO, wegCol, wegLs, [2,3]);
    drawBezier(neuerWeg.bezU, wegCol, wegLs, [2,3]);
    drawPolygon(neuerWeg.polyWegOstNeu, wegCol, wegLs, [2,3], false);
    drawPolygon(neuerWeg.polyWegWestNeu, wegCol, wegLs, [2,3], false);

    if(cfgGrundstueck.zeigeMasse) {
      const WegWestNeuObenLinks = neuerWeg.polyWegWestNeu[2];
      const WegWestNeuUntenLinks = neuerWeg.polyWegWestNeu[1];
      bemassung(WegWestNeuObenLinks, WegWestNeuUntenLinks, 'r');
      const pTemp = copyPoint(WegWestNeuObenLinks, 1, 0);
      bemassung(pTemp, copyPoint(pTemp, 0, -cfgGrundstueck.WegNeu.AbstNwestseite), 'r');
    }
  }


  // Baugrenze Richtung Wittenbergener Weg
  drawPolygon([new Point(cfgGrundstueck.AbstBaugrenzeW, 0),
               new Point(cfgGrundstueck.AbstBaugrenzeW, cfgGrundstueck.NordSuedLaengeWestseite)],
              "blue", 1);

  // Baufenster
  const polyBF = cfgGrundstueck.Baufenster.Polygon;
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
      if(cfgGrundstueck.zeigeBaeume) {
        bemassung(tmpPoint, kastanieSued, 'r', 0);
      }
    }
  }
}


function zeichne2DHaus() {
  // Das Haus
  const polyAussen = cfgHaus.PolygonAussen;
  if(cfgGrundstueck.zeigeHaus) {
    drawPolygon(polyAussen, cfgHaus.col, 1.2);
    // Verlauf des Giebels: aufpassen, wenn die Nordwand eine Ecke hat!
    const giebelUnten = middlePoint(polyAussen[5], polyAussen[6]);
    const giebelOben = new Point(giebelUnten.x, polyAussen[4].y);
    drawPolygon([giebelOben, giebelUnten],
      cfgHaus.col, 0.2);
  }



  const mp67 = middlePoint(polyAussen[6], polyAussen[7]);
  const mp78 = middlePoint(polyAussen[7], polyAussen[8]);


  if(cfgGrundstueck.zeigeHaus && cfgHaus.zeigeAussenMasse) {
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

    bemassung(polyAussen[8], new Point(0, polyAussen[8].y), 't');
    bemassung(mp78, new Point(mp78.x, ycoordFromS(0)), 'r');
    bemassung(mp67, new Point(xcoordFromW(0), mp67.y), 't');
    const mp34 = middlePoint(polyAussen[3], polyAussen[4]);
    bemassung(mp34, new Point(mp34.x, ycoordFromN(0)), 'r');
    if(cfgGrundstueck.zeigeBaeume) {
      const kastanieSued = new Point(xcoordFromW(cfgGrundstueck.Kastanie.AbstW),
                                     ycoordFromN(cfgGrundstueck.Kastanie.AbstN + cfgGrundstueck.Kastanie.Radius));
      const tmpPoint = new Point(kastanieSued.x, polyAussen[0].y);
      bemassung(tmpPoint, kastanieSued, 'r', 0);
    }
  }

  if(cfgGrundstueck.zeigeHaus && cfgHaus.zeigeVeranda) {
    const ol = pointInbetween(polyAussen[4], polyAussen[5], 1/3);
    const or = new Point(ol.x + 1.5, ol.y);
    const ul = pointInbetween(polyAussen[4], polyAussen[5], 2/3);
    const ur = new Point(ul.x + 1.5, ul.y);
    drawPolygon([ol, or, ur, ul], cfgHaus.col, 0.75);
    if(cfgHaus.zeigeAussenMasse) {
      bemassung(ol, or, 't');
      bemassung(or, ur, 'r');
    }
  }

  // Haus Innen
  const daw = cfgHaus.DickeAussenwand;
  const diw = cfgHaus.DickeInnenwand;

  const polyHausInnen = cfgHaus.PolygonEGInnen;


  if (cfgGrundstueck.zeigeHaus) {
    drawPolygon(polyHausInnen, cfgHaus.col, 0.6);
  }
  const wflEG = areaPolygon(polyHausInnen);
  let wflOG = berechneOG();   // wird noch durch die Gauben korrigiert



  // Gaube-Ost
  if(cfgHaus.GaubeOstBreite>0.1) {
    // Tiefe der Gaube berechnen: Da wo die Dachhöhe die OG-Raumhöhe schneidet

    const mitteAussen = middlePoint(polyAussen[4], polyAussen[5]);
    const tiefe = berechneSchittAbstand(2.5) + cfgHaus.DickeAussenwand;
    // Wohnflaeche korrigieren:
    const x = berechneSchittAbstand(2.3);
    wflOG += x * cfgHaus.GaubeOstBreite;

    if (cfgGrundstueck.zeigeHaus) {
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

    if (cfgGrundstueck.zeigeHaus) {
      const polyGaubeAussen = [copyPoint(mitteAussen, 0, cfgHaus.GaubeWestBreite/2),
                               copyPoint(mitteAussen, 0, -cfgHaus.GaubeWestBreite/2),
                               copyPoint(mitteAussen, tiefe, -cfgHaus.GaubeWestBreite/2),
                               copyPoint(mitteAussen, tiefe, cfgHaus.GaubeWestBreite/2)];
      drawPolygon(polyGaubeAussen, cfgHaus.col, 1);
      drawPolygon([middlePoint(polyGaubeAussen[2], polyGaubeAussen[3]), polyGaubeAussen[0]],cfgHaus.col, 0.8);
      drawPolygon([middlePoint(polyGaubeAussen[2], polyGaubeAussen[3]), polyGaubeAussen[1]],cfgHaus.col, 0.8);
    }
  }


  // Wohnflaechen berichten: In die Skizze einzeichnen
  if (cfgGrundstueck.zeigeHaus) {
    const comHausInnen = comPolygon(polyHausInnen);
    drawEnv2D.ctx2D.fillStyle = cfgHaus.col;
    let str = "EG: " + wflEG.toFixed(1).toString() + "m²";
    drawEnv2D.ctx2D.fillText(str, comHausInnen.px, comHausInnen.py);
    str = "OG: " + wflOG.toFixed(1).toString() + "m²";
    drawEnv2D.ctx2D.fillText(str, comHausInnen.px, comHausInnen.py+8);
  }

  // Anbau Innen
  const polyAnbauInnen = cfgHaus.PolygonAnbauInnen;

  if (cfgGrundstueck.zeigeHaus) {
    drawPolygon(polyAnbauInnen, cfgHaus.col, 0.6);
  }

  const wflAnbau =areaPolygon(polyAnbauInnen);
  if (cfgGrundstueck.zeigeHaus) {
    const comAnbauInnen = comPolygon(polyAnbauInnen);

    drawEnv2D.ctx2D.fillStyle = cfgHaus.col;
    let str = wflAnbau.toFixed(1).toString() + "m²";
    drawEnv2D.ctx2D.fillText(str, comAnbauInnen.px, comAnbauInnen.py);
  }
}

function zeichne2DGrid() {
  // Grid
  const lw = 0.2;
  const gridDist = 1;
  if(cfgGrundstueck.zeigeGitter) {
    drawGrid(0, 0, gridDist, lw, "gray");
    drawGrid(gridDist/2, gridDist/2, gridDist, lw/2, "gray");
  }
}

function zeichne2DAltesHaus() {
  if(cfgGrundstueck.AltesHaus.show) {

    drawEnv2D.ctx2D.translate(68, -10); drawEnv2D.ctx2D.rotate(-Math.PI / 180 * 2);
    drawPolygon(cfgGrundstueck.AltesHaus.Polygon, 'gray', 1);
    const polyNeuerAnbau = cfgGrundstueck.AltesHaus.PolygonNeuerAnbau;
    drawPolygon(cfgGrundstueck.AltesHaus.PolygonNeuerAnbau, cfgHaus.col, 1, [2,3]);


    // bemassung ruft setStdTransformState auf. Daher muss man immer wieder translate und rotate setzen
    bemassung(cfgGrundstueck.AltesHaus.Polygon[0], cfgGrundstueck.AltesHaus.Polygon[1], 'r');
    drawEnv2D.ctx2D.translate(68, -10); drawEnv2D.ctx2D.rotate(-Math.PI / 180 * 2);
    bemassung(cfgGrundstueck.AltesHaus.Polygon[1], cfgGrundstueck.AltesHaus.Polygon[2], 'b');
    drawEnv2D.ctx2D.translate(68, -10); drawEnv2D.ctx2D.rotate(-Math.PI / 180 * 2);
    bemassung(cfgGrundstueck.AltesHaus.PolygonNeuerAnbau[1], cfgGrundstueck.AltesHaus.PolygonNeuerAnbau[2], 'l');
    drawEnv2D.ctx2D.translate(68, -10); drawEnv2D.ctx2D.rotate(-Math.PI / 180 * 2);
    bemassung(cfgGrundstueck.AltesHaus.PolygonNeuerAnbau[2], cfgGrundstueck.AltesHaus.PolygonNeuerAnbau[3], 't');
    drawEnv2D.ctx2D.translate(68, -10); drawEnv2D.ctx2D.rotate(-Math.PI / 180 * 2);
    bemassung(cfgGrundstueck.AltesHaus.PolygonNeuerAnbau[3], cfgGrundstueck.AltesHaus.PolygonNeuerAnbau[4], 'r');

    // console.log('Fläche neuer Anbau=', areaPolygon(cfgGrundstueck.AltesHaus.PolygonNeuerAnbau));
    // console.log('Fläche altes Haus ohne Anbau=', areaPolygon(cfgGrundstueck.AltesHaus.PolygonOhneAnbau));
    const polyOhneAnbau = cfgGrundstueck.AltesHaus.PolygonOhneAnbau;
    const flOhneAnbau = areaPolygon(polyOhneAnbau);
    const comOhneAnbau = comPolygon(polyOhneAnbau);
    drawEnv2D.ctx2D.fillStyle = "gray";
    let str = "Ohne Anbau: " + flOhneAnbau.toFixed(1).toString() + "m²";
    drawEnv2D.ctx2D.fillText(str, comOhneAnbau.px + 50, comOhneAnbau.py-10);

    const flNeuerAnbau = areaPolygon(polyNeuerAnbau);
    const comNeuerAnbau = comPolygon(polyNeuerAnbau);
    drawEnv2D.ctx2D.fillStyle = cfgHaus.col;
    str = "Neuer Anbau: " + flNeuerAnbau.toFixed(1).toString() + "m²";
    drawEnv2D.ctx2D.fillText(str, comNeuerAnbau.px + 50, comNeuerAnbau.py-40);


    drawEnv2D.setStdTransformState();

    // Eigene Messung Dez. 2022
    // let x = cfgGrundstueck.AbstBaugrenzeW - 0.24;
    // bemassung(new Point(x, 7.55), new Point(x, ycoordFromN(0)), 'l', 0);
    // bemassung(new Point(x, 7.55), new Point(x, ycoordFromS(0)), 'r', 0.4);
    // const tmpPoint = new Point(x+ 0.3, 14.15);
    // const polyGrdst = cfgGrundstueck.Polygon;
    // const tmpPoint2 = berechneSchnittpunkt(tmpPoint, copyPoint(tmpPoint, 30, 0),
    //                                        polyGrdst[1], polyGrdst[2]);
    // bemassung(tmpPoint, tmpPoint2, 't', 0);
    // x = cfgGrundstueck.Kastanie.AbstW;
    // let y = cfgGrundstueck.Kastanie.AbstN + cfgGrundstueck.Kastanie.Radius;
    // bemassung(new Point(x+0.3, y + 6.41),
    //           new Point(x, ycoordFromN(y)), 'r', 0);


  }
}


function zeichne2DCarport() {

  if(cfgGrundstueck.Carport.show) {
    const [p1, p2, p3, p4] = cfgGrundstueck.Carport.Polygon;
    // const p1 = new Point(xcoordFromBGO(-12.5), 5);
    // const p2 = new Point(xcoordFromBGO(-14.05), 14);
    // const p3 = copyPoint(p2, -3, 0);
    // const p4 = copyPoint(p1, -3, 0);
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
function zeichneGrundstuecksPlan() {
  // berechneOG();
  drawEnv2D = drawEnv2DGrundstueck();
  drawEnv2D.setStdTransformState();
  drawEnv2D.ctx2D.clearRect(0,0, drawEnv2D.canvas.width, drawEnv2D.canvas.height);
  if(detPlanGrundstueck.open) {
    guiGrdstck.show();
    zeichne2DGrundstueck();
    zeichne2DHaus();
    zeichne2DAltesHaus();
    zeichne2DCarport();
    zeichne2DGrid();
    zeichne2DAchsen();
  } else {
    guiGrdstck.hide();
  }
}


// * Seitenansichten

function zeichneSuedGiebel() {
  const offsetY = 7;
  const poly = cfgHaus.PolygonSuedGiebel.map(p=>new Point(p.x, offsetY-p.y));
  drawPolygon(poly);

}

function zeichneSeitenansichten() {
  drawEnv2D = drawEnv2DSeitenansichten();
  drawEnv2D.setStdTransformState();
  drawEnv2D.ctx2D.clearRect(0,0, drawEnv2D.canvas.width, drawEnv2D.canvas.height);
  if(detSeitenansichten.open) {
    zeichneSuedGiebel();
    zeichne2DGrid();
    zeichne2DAchsen();
  }

}

// * 3-D Zeichnung

// if(true) {

// ** Hilfsfunktionen 3D
function polygon2Shape(polygon) {
  const shape = new THREE.Shape();
  shape.moveTo(polygon[0].x, polygon[0].y);
  for(let k = 1; k<polygon.length; ++k) {
    shape.lineTo(polygon[k].x, polygon[k].y);
  }
  // Polygon schließen:
  shape.lineTo(polygon[0].x, polygon[0].y);

  return shape;
}

// ** Initialize webGL


const zFightingOffset = -0.01;


// const canvas3DWidth = 1100;
// const canvas3DHeight = 650;

const canvas3D = document.getElementById("canvas3D");
const renderer = new THREE.WebGLRenderer({canvas:canvas3D, antialias:true});
// renderer.setSize( canvas3DWidth, canvas3DHeight );  // gleiche Groesse wie 2D-Zeichnung
renderer.setClearColor('rgb(225,255,255)');
// document.body.appendChild( renderer.domElement );

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, canvas3D.width / canvas3D.height, 0.1, 200);
camera.position.set(50,10, -10);
camera.lookAt(0, -10, 0);
camera.up.set(0,0,-1);
scene.add(camera);

camera.lookAt(scene.position);

const axHelper = new THREE.AxesHelper(5);
scene.add(axHelper);

// Der Rest der Welt:
const basePlane3D = new THREE.Mesh(new THREE.PlaneGeometry(500, 500),
                                   new THREE.MeshBasicMaterial({color:'#404040',
                                                                side:THREE.DoubleSide}));
basePlane3D.material.transparent = true;
basePlane3D.material.opacity=0.5;
scene.add(basePlane3D);

// Container für Grundstück und Haus
const WW603D = new THREE.Object3D();
scene.add(WW603D);

// ** Grundstück
function zeichne3DGrundstueck() {
  const Grundstueck = new THREE.Object3D();
  const Grundstuecksflaeche = new THREE.Mesh(new THREE.ShapeGeometry(polygon2Shape(cfgGrundstueck.Polygon)),
                                             new THREE.MeshBasicMaterial({color:'#00ff00',
                                                                          side:THREE.DoubleSide}));
  Grundstuecksflaeche.material.transparent = true;
  Grundstuecksflaeche.material.opacity = 0.7;
  Grundstuecksflaeche.position.z = zFightingOffset;
  Grundstueck.add(Grundstuecksflaeche);
  const Baufenster = new THREE.Mesh(new THREE.ShapeGeometry(polygon2Shape(cfgGrundstueck.Baufenster.Polygon)),
                                    new THREE.MeshBasicMaterial({color:'#ff0000',
                                                                 side:THREE.DoubleSide}));
  Baufenster.position.z = 2 * zFightingOffset;
  Baufenster.material.transparent = true;
  Baufenster.material.opacity = 0.2;
  Grundstueck.add(Baufenster);

  const nwDaten = datenNeuerWeg();
  const wegShape = new THREE.Shape();
  wegShape.moveTo(nwDaten.polyWegWestNeu[0].x, nwDaten.polyWegWestNeu[0].y);
  wegShape.lineTo(nwDaten.polyWegWestNeu[1].x, nwDaten.polyWegWestNeu[1].y);
  wegShape.lineTo(nwDaten.polyWegWestNeu[2].x, nwDaten.polyWegWestNeu[2].y);
  wegShape.lineTo(nwDaten.polyWegWestNeu[3].x, nwDaten.polyWegWestNeu[3].y);
  // wegShape.lineTo(nwDaten.polyWegWestNeu[0].x, nwDaten.polyWegWestNeu[0].y);
  wegShape.bezierCurveTo(nwDaten.bezO[2].x, nwDaten.bezO[2].y,
                         nwDaten.bezO[3].x, nwDaten.bezO[3].y,
                         nwDaten.bezO[1].x, nwDaten.bezO[1].y);
  wegShape.lineTo(nwDaten.polyWegOstNeu[1].x, nwDaten.polyWegOstNeu[1].y);
  wegShape.lineTo(nwDaten.polyWegOstNeu[2].x, nwDaten.polyWegOstNeu[2].y);
  wegShape.lineTo(nwDaten.polyWegOstNeu[3].x, nwDaten.polyWegOstNeu[3].y);

  wegShape.bezierCurveTo(nwDaten.bezU[3].x, nwDaten.bezU[3].y,
                         nwDaten.bezU[2].x, nwDaten.bezU[2].y,
                         nwDaten.bezU[0].x, nwDaten.bezU[0].y);
  wegShape.lineTo(nwDaten.polyWegWestNeu[0].x, nwDaten.polyWegWestNeu[0].y);

  const NeuerWeg = new THREE.Mesh(new THREE.ShapeGeometry(wegShape),
                                  new THREE.MeshBasicMaterial({color:'brown',
                                                               side:THREE.DoubleSide}));
  NeuerWeg.material.transparent = true;
  NeuerWeg.material.opacity = 0.7;
  NeuerWeg.position.z = 2*zFightingOffset;
  Grundstueck.add(NeuerWeg);


  // Die Kastanie
  const kastRad = cfgGrundstueck.Kastanie.Radius;
  const kastHeight = 10*kastRad;
  const Kastantie = new THREE.Mesh(new THREE.CylinderGeometry(kastRad, kastRad, kastHeight, 32),
                                   new THREE.MeshBasicMaterial({color:'saddlebrown'}));
  Kastantie.rotation.x=Math.PI/2;
  Kastantie.position.z = -1/2*kastHeight;
  Kastantie.position.x = cfgGrundstueck.Kastanie.AbstW;
  Kastantie.position.y = cfgGrundstueck.Kastanie.AbstN;
  Grundstueck.add(Kastantie);

  const ahGeo = new THREE.ExtrudeGeometry(polygon2Shape(cfgGrundstueck.AltesHaus.Polygon), {
	  steps: 2,
	  depth: -3,
	  bevelEnabled: false});
  const ahMat = new THREE.MeshBasicMaterial({color:'gray', side:THREE.DoubleSide});

  const AltesHaus = new THREE.Mesh(ahGeo, ahMat);
  AltesHaus.name = "AltesHaus";

  // FIXME: Diese Daten sind nur ungefaehr: die muessten mit der 2D - Zeichung synchronisiert werden
  AltesHaus.position.x = 4.9;
  AltesHaus.position.y = -0.8;
  AltesHaus.rotation.z = - Math.PI/180*2;
  Grundstueck.add(AltesHaus);


  const cpGeo = new THREE.ExtrudeGeometry(polygon2Shape(cfgGrundstueck.Carport.Polygon), {
	  steps: 2,
	  depth: -3,
	  bevelEnabled: false});
  const cpMat = new THREE.MeshBasicMaterial({color:'gray',side:THREE.DoubleSide});

  const Carport = new THREE.Mesh(cpGeo, cpMat);
  Carport.name = "Carport";
  Grundstueck.add(Carport);

  return Grundstueck;

}

const Grundstueck3D = zeichne3DGrundstueck();
WW603D.add(Grundstueck3D);


// ** Render loop
const controls = new THREE.TrackballControls(camera, document.getElementById("det3D"));

function render() {
  requestAnimationFrame(render);

  axHelper.visible = Debug.zeigeAchsen;
  Grundstueck3D.children.forEach(c=>c.visible = cfgGrundstueck.show);
  // Baufenster.visible = cfgGrundstueck.show && cfgGrundstueck.Baufenster.show;
  Grundstueck3D.getObjectByName("AltesHaus").visible = cfgGrundstueck.AltesHaus.show;
  Grundstueck3D.getObjectByName("Carport").visible = cfgGrundstueck.Carport.show;

  renderer.render(scene, camera);
  controls.update();
}
render();



// * Main und callbacks, um alles zu zeichnen
function updateAll() {
  berechneTabellenDaten();
  zeichneGrundstuecksPlan();
  zeichneSeitenansichten();
}

window.addEventListener("load", updateAll);

const detDatenTabelle = document.getElementById("detDatenTabelle");
detDatenTabelle.addEventListener("toggle", berechneTabellenDaten);
const detPlanGrundstueck = document.getElementById("detPlanGrundstueck");
detPlanGrundstueck.addEventListener("toggle", zeichneGrundstuecksPlan);
const detSeitenansichten = document.getElementById("detSeitenansichten");
detSeitenansichten.addEventListener("toggle", zeichneSeitenansichten);
