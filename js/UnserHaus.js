/* global lil */

// FIXME:
// wenn man den Haustyp ändert, werden die lil-gui-Slider nicht auf den passenden Wert gestellt!!

// TODO:
// - Anteil Fläche OG über 2.20 (oder 2.30) ausrechnen (darf nicht mehr als Fläche EG sein, aber ist das bebaute Fläche oder Wohnfläche?)
// - Hausgrößen vorkonfigurieren
// - GUI fuer Seitenansicht verbessern
// - 3D-Haus zeichnen
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
    ctxScale: 2.0,    // wenn das höher gesetzt wird, wird alles unscharf!
    scale: 30,   // Anzahl Pixel fuer 1 m Laenge
    // Der Koordinaten-Ursprung soll in der Mitte unten sein für die Seitenansichten
    get offsetX() {
      const n = Math.floor(this.canvas.width / (2 * this.ctxScale*this.scale));
      return n * this.scale;
    },
    get offsetY() {
      const n = Math.floor(this.canvas.height / (this.ctxScale*this.scale)) -1;
      return n * this.scale;
    },
    setStdTransformState() {
      this.ctx2D.resetTransform();
      this.ctx2D.scale(this.ctxScale,this.ctxScale);
    }
  };
};




function cfgGrundstueckDefault() {
  return {
    zeigeMasse: false,
    zeigeHaus: true,
    zeigeGitter: true,
    zeigeBaeume: true,

    NordSuedLaengeWestseite: 17.21,   // 17.20 hat Herr Knibbe am 21.12.22 als Länge angegeben
    NordSuedLaengeOstseite: 17.615,
    OstWestLaengeNordseite: 30.23,
    OstWestLaengeSuedseite: 33.21,
    get Polygon() {
      return [new Point(0, 0),
              new Point(this.OstWestLaengeNordseite, 0),
              new Point(this.OstWestLaengeSuedseite, this.NordSuedLaengeOstseite),
              new Point(0, this.NordSuedLaengeWestseite)];
    },
    Baufenster: {
      // Die Punkte der Baugrenze habe ich so berechnet:
      // const suedPunkt = pointInbetween(polyGrdst[3], polyGrdst[2],
      //                                  cfgGrundstueck.Baufenster.AbstBaugrenzeWSued / cfgGrundstueck.OstWestLaengeSuedseite);
      // const nordPunkt = pointInbetween(polyGrdst[0], polyGrdst[1],
      //                                  cfgGrundstueck.Baufenster.AbstBaugrenzeWNord / cfgGrundstueck.OstWestLaengeNordseite);

      Baugrenze: [new Point(16.22, 0), new Point(16.8, 17.4149)],
      AbstBaugrenzeWSued: 16.80,
      AbstBaugrenzeWNord: 16.22,
      GrenzAbstand: 2.5,
      col: "red",
      show: false,
      zeigeMasse: false,
      //        2--------3
      //        |        |
      // 0------1        |
      // |               |
      // |               |
      // 5---------------4
      get Polygon() {
        const abst0N = 5;
        const abst05 = 10;
        const abst12 = 1;
        const abst23 = 7.03;
        const p0 = new Point(xcoordFromW(this.GrenzAbstand), abst0N);
        const p1x =  xcoordFromBGO(abst23, abst0N);
        const p1 = new Point(p1x, abst0N);
        const p2 = copyPoint(p1, 0, -abst12);
        const p3 = new Point(xcoordFromBGO(0, p2.y), p2.y);
        const p4y = ycoordFromS(this.GrenzAbstand, this.AbstBaugrenzeWSued);
        const p4 = new Point(xcoordFromBGO(0, p4y), p4y);
        const p5x = xcoordFromW(this.GrenzAbstand);
        const p5y = ycoordFromS(this.GrenzAbstand, p5x);
        const p5 = new Point(p5x, p5y);
        return [p0, p1, p2, p3, p4, p5];
      }
    },
    Kastanie: {
      Radius: 0.60,
      AbstN: 0.91,    // laut Vermesser 0.6 + 0.31,
      AbstW: 4.95     // selber aus der Zeichnung vom Vermesser rausgelesen
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



function setHaustyp(cfgObj, haustypObj) {
  for(let f in haustypObj) {
    cfgObj[f] = haustypObj[f];
  }
}


const Haustypen = new Map();
Haustypen.set("Kein Typ", {});
Haustypen.set("Talis 80D", {
  HausLaengeOW: 8.00,
  HausLaengeNS: 10.00,
});
Haustypen.set("Akost Arne 100", {
  HausLaengeOW: 7.62,
  HausLaengeNS: 9.18,
});
Haustypen.set("Noah Vermont", {
  HausLaengeOW: 8.58,
  HausLaengeNS: 10,
});
Haustypen.set("Dammann Imke", {
  HausLaengeOW: 10.4,
  HausLaengeNS: 8.5,
  HausAbstS: 1.8
});



function cfgHausDefault() {
  return {
    // show: false,
    zeigeVeranda: false,
    zeigeAussenMasse: true,
    zeigeInnenMasse: false,
    zeigeOG: false,
    colEG: "Green",
    colOG: "LightGreen",
    HausTyp: "Kein Typ",
    HausDrehWinkel: -1.91,  // in Grad

    HausLaengeOW: 8.00,
    get HausLaengeInnenOW() {
      return this.HausLaengeOW - 2 * this.DickeAussenwand;
    },
    HausAbstO: 0.0,
    HausAbstS: 0.75,
    HausLaengeNS: 9.5,
    OffsetNS: 0.0,
    OffsetOW: 0,
    AnbauLaengeOW: 0,
    // AnbauAbstW: 0,
    // AnbauAbstS: 4.25,
    AnbauLaengeNS: 3.50,
    DickeAussenwand: 0.4,
    DickeInnenwand: 0.2,
    DickeInnenwand: 0.2,
    AbstAnbauEcke: -0.4,  // 2.6
    AnbauInnenflaeche: false,
    // Punkt 1 ist doch überflüssig!
    //          3-------4
    //          |       |
    // 0------1-2       |
    // |                |
    // |                |
    // 8------7         |
    //        |         |
    //        6---------5
    getPolygonAussen(rot=true) {
      const p5 = new Point(xcoordFromBFO(this.HausAbstO),  // 5
                           ycoordFromBFS(this.HausAbstS));
      const p4 = copyPoint(p5, 0, -this.HausLaengeNS);
      const p3 = copyPoint(p4, -this.HausLaengeOW + this.OffsetOW);
      const p2 = copyPoint(p3, 0, this.OffsetNS);
      const p6 = copyPoint(p5, -this.HausLaengeOW, 0);
      const p1 = new Point(p5.x - this.HausLaengeOW, p2.y);
      // const p1 = new Point(xcoordFromBFO(this.HausLaengeOW),  // 1
      //                      ycoordFromBFS(this.AnbauAbstS + this.AnbauLaengeNS));
      const p0 = copyPoint(p1, -this.AnbauLaengeOW, 0);
      const p7 = copyPoint(p1, 0, this.AnbauLaengeNS);
      const p8 = copyPoint(p0, 0, this.AnbauLaengeNS);
      const poly = [p0, p1, p2, p3, p4, p5, p6, p7, p8];
      if(rot) {
        const pivot = poly[4];
        return poly.map(p=>rotatePointPivot(p, this.HausDrehWinkel, pivot));
      } else {
        return poly;
      }
    },
    getPolygonEGInnen(rot=true) {
      const daw = this.DickeAussenwand;
      const diw = this.DickeInnenwand;
      const polyAussen = this.getPolygonAussen(false);
      const polyAnbauInnen = this.getPolygonAnbauInnen(false);

      // FIXME: Hier muss stimmt die Reihenfolge der Punkte nicht, wenn die Anbau-Innenfläche
      // zu weit nach innen rein ragt!
      const pkt5 = copyPoint(polyAussen[7], daw, -daw);
      const pkt6 = copyPoint(polyAnbauInnen[2], diw, 0);
      const pkt7 = copyPoint(polyAnbauInnen[1], diw, 0);
      if(pkt5.x>=pkt6.x) {
      } else {
        pkt5.y += diw;
        pkt6.y += diw;
      }


      const polyHausInnen = [
        copyPoint(polyAussen[2], daw, daw),   // 0
        copyPoint(polyAussen[3], daw, daw),
        copyPoint(polyAussen[4], -daw, daw),
        copyPoint(polyAussen[5], -daw, -daw),
        copyPoint(polyAussen[6], daw, -daw)];  // 4
      if(this.AnbauInnenflaeche) {
        polyHausInnen.push(pkt5);
        polyHausInnen.push(pkt6);
        polyHausInnen.push(pkt7);
      } else {
        polyHausInnen.push(copyPoint(polyAussen[1], daw, daw));
      }
      if(rot) {
        return polyHausInnen.map(p=>rotatePointPivot(p, this.HausDrehWinkel, polyAussen[4]));
      } else {
        return polyHausInnen;
      }
    },
    getPolygonOGInnen(rot=true) {
      const daw = this.DickeAussenwand;
      const diw = this.DickeInnenwand;
      const polyAussen = this.getPolygonAussen(false);
      const polyHausOGInnen = [
        copyPoint(polyAussen[1], daw, daw),   // 0
        copyPoint(polyAussen[2], daw, daw),   // 1
        copyPoint(polyAussen[3], daw, daw),
        copyPoint(polyAussen[4], -daw, daw),
        copyPoint(polyAussen[5], -daw, -daw),
        copyPoint(polyAussen[6], daw, -daw),
        copyPoint(polyAussen[7], daw, -daw),  // 6
      ];
      if(rot) {
        return polyHausOGInnen.map(p=>rotatePointPivot(p, this.HausDrehWinkel, polyAussen[4]));
      } else {
        return polyHausOGInnen;
      }
    },
    getPolygonAnbauInnen(rot=true) {
      const daw = this.DickeAussenwand;
      const diw = this.DickeInnenwand;
      const polyAussen = this.getPolygonAussen(false);

      const ol = copyPoint(polyAussen[0], daw, daw);    // oben links
      const or = copyPoint(polyAussen[2], -this.AbstAnbauEcke-diw, daw);  // oben rechts
      const ur = new Point(or.x, polyAussen[7].y - daw);  // unten rechts
      const ul = copyPoint(polyAussen[8], daw, -daw);   // unten links
      const polyAnbauInnen = [ol, or, ur, ul];
      if(rot) {
        return polyAnbauInnen.map(p=>rotatePointPivot(p, this.HausDrehWinkel, polyAussen[4]));;
      } else {
        return polyAnbauInnen;
      }
    },
    get PolygonSuedGiebel() {
      const distOGGiebelspitze = this.HausLaengeOW/2 * Math.tan(this.Dachneigung * Math.PI/180);

      const poly = [
        new Point(0,0),
        new Point(this.HausLaengeOW, 0),
        new Point(this.HausLaengeOW, this.RaumhoeheEG),
        new Point(this.HausLaengeOW, this.RaumhoeheEG + this.DickeEDdecke),
        new Point(this.HausLaengeOW, this.RaumhoeheEG + this.DickeEDdecke+this.Kniestock),
        new Point(this.HausLaengeOW/2, this.RaumhoeheEG + this.DickeEDdecke+this.Kniestock+distOGGiebelspitze),
        new Point(0, this.RaumhoeheEG + this.DickeEDdecke+this.Kniestock),
        new Point(0, this.RaumhoeheEG + this.DickeEDdecke),
        new Point(0, this.RaumhoeheEG)
      ];
      return poly;
    },

    // wird fuer die Berechnung der Wfl im OG gebrauch
    DickeDach: 0.35,
    DickeEGdecke: 0.35,
    DickeOGdecke: 0.35,
    RaumhoeheEG: 2.4,
    RaumhoeheOG: 2.4,
    Kniestock: 1.5,
    Dachneigung: 38, // Grad
    Dachueberstand: 0.5,
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






// * lil-gui
function guiSetter(cfgObject, fieldName, value) {
  cfgObject[fieldName] = value;
  updateAll();
}

const gui = new lil.GUI({title: "Einstellungen"});

const guiHaus = gui.addFolder("Haus");
guiHaus.open(false);
guiHaus.add(cfgHaus, "zeigeAussenMasse").name("Außenmaße").onChange(v => guiSetter(cfgHaus, "zeigeAussenMasse", v));
guiHaus.add(cfgHaus, "zeigeInnenMasse").name("Innenmaße").onChange(v => guiSetter(cfgHaus, "zeigeInnenMasse", v));
guiHaus.add(cfgHaus, "zeigeOG").name("OG").onChange(v => guiSetter(cfgHaus, "zeigeOG", v));
guiHaus.add(cfgHaus, "zeigeVeranda").name("Veranda").onChange(v => guiSetter(cfgHaus, "zeigeVeranda", v));
guiHaus.add(cfgHaus, "HausTyp", Array.from(Haustypen.keys())).name("Haus Typ").onChange(v=>{
  setHaustyp(cfgHaus, Haustypen.get(v));
  updateAll();
});

guiHaus.add(cfgHaus, "HausAbstS", 0, 4, 0.05).name("Haus Abstand Süd").onChange(v => guiSetter(cfgHaus, "HausAbstS", v));
guiHaus.add(cfgHaus, "HausAbstO", -1, 2, 0.05).name("Haus Abstand Ost").onChange(v => guiSetter(cfgHaus, "HausAbstO", v));
guiHaus.add(cfgHaus, "HausLaengeNS", 5, 12, 0.05).name("Haus Länge Nord Süd").onChange(v => guiSetter(cfgHaus, "HausLaengeNS", v));
guiHaus.add(cfgHaus, "HausLaengeOW", 5, 14, 0.05).name("Haus Länge Ost West").onChange(v => guiSetter(cfgHaus, "HausLaengeOW", v));
guiHaus.add(cfgHaus, "HausDrehWinkel", -4, 1, 0.05).name("Haus Drehwinkel").onChange(v => guiSetter(cfgHaus, "HausDrehWinkel", v));
guiHaus.add(cfgHaus, "OffsetOW", 0, 6, 0.05).name("Ecke Länge Ost West").onChange(v => guiSetter(cfgHaus, "OffsetOW", v));
const guiAnbau = guiHaus.addFolder("Anbau");
guiAnbau.open(false);
guiAnbau.add(cfgHaus, "OffsetNS", 0, 3, 0.05).name("Einschub Anbau").onChange(v => guiSetter(cfgHaus, "OffsetNS", v));
guiAnbau.add(cfgHaus, "AnbauLaengeOW", 0, 8, 0.05).name("Anbau Länge Ost West").onChange(v => guiSetter(cfgHaus, "AnbauLaengeOW", v));
// guiAnbau.add(cfgHaus, "AnbauAbstS", -3, 6, 0.05).name("Anbau Abstand Süd").onChange(v => guiSetter(cfgHaus, "AnbauAbstS", v));
guiAnbau.add(cfgHaus, "AnbauLaengeNS", 3, 10, 0.05).name("Anbau Länge Nord Süd").onChange(v => guiSetter(cfgHaus, "AnbauLaengeNS", v));
guiAnbau.add(cfgHaus, "AbstAnbauEcke", -3, 6, 0.05).name("Abstand Ecke Anbau").onChange(v => guiSetter(cfgHaus, "AbstAnbauEcke", v));
guiAnbau.add(cfgHaus, "AnbauInnenflaeche").name("Innenfläche").onChange(v => guiSetter(cfgHaus, "AnbauInnenflaeche", v));



const guiDach = guiHaus.addFolder("OG und Dach");
guiDach.close();
guiDach.add(cfgHaus, "Kniestock", 0.5, 2.5, 0.05).name("Kniestock").onChange(v => guiSetter(cfgHaus, "Kniestock", v));
guiDach.add(cfgHaus, "Dachneigung", 23, 45, 1).name("Dachneigung").onChange(v => guiSetter(cfgHaus, "Dachneigung", v));
guiDach.add(cfgHaus, "GaubeWestBreite", 0, 5, 0.1).name("Breite Gaube West").onChange(v => guiSetter(cfgHaus, "GaubeWestBreite", v));
guiDach.add(cfgHaus, "GaubeOstBreite", 0, 5, 0.1).name("Breite Gaube Ost").onChange(v => guiSetter(cfgHaus, "GaubeOstBreite", v));
// cfgHaus.show ? guiHaus.show() : guiHaus.hide();

const guiGrdstck = gui.addFolder("Grundstück");
guiGrdstck.open(false);
guiGrdstck.add(cfgGrundstueck, "zeigeHaus").name("Haus").onChange(v => guiSetter(cfgGrundstueck, "zeigeHaus", v));
guiGrdstck.add(cfgGrundstueck.Baufenster, "show").name("Umriss Baufenster").onChange(v => guiSetter(cfgGrundstueck.Baufenster, "show", v));
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
function xcoordFromBGO(x, y=-1) {
  let ret = 0;
  if (y<0) {
    ret = cfgGrundstueck.Baufenster.AbstBaugrenzeWSued - x; // drawEnv2D.offsetX + (cfgGrundstueck.AbstBaugrenzeWSued - x) * drawEnv2D.scale ;
  } else {
    const p = berechneSchnittpunkt(new Point(-10, y), new Point(cfgGrundstueck.OstWestLaengeSuedseite, y),
                                   cfgGrundstueck.Baufenster.Baugrenze[0], cfgGrundstueck.Baufenster.Baugrenze[1]);
    ret = p.x - x;
  }
  return ret;
}
// y-Koordinate gemessen von der nördlichen Grundstücksgrenze
const ycoordFromN = y => y; // drawEnv2D.offsetY + y * drawEnv2D.scale;
// y-Koordinate gemessen von der südlichen Grundstücksgrenze
// Nur richtig, wenn das Grundstück rechteckig ist
function ycoordFromS(y, x=-1)  {

  let ret = 0 ;
  if(x < 0) {
    ret =  cfgGrundstueck.NordSuedLaengeWestseite- y; // drawEnv2D.offsetY + (cfgGrundstueck.NordSuedLaengeWestseite- y) * drawEnv2D.scale;
  } else {
    const p = pointInbetween(cfgGrundstueck.Polygon[3], cfgGrundstueck.Polygon[2],
                             x/cfgGrundstueck.OstWestLaengeSuedseite);
    // console.log('x/cfgGrundstueck.OstWestLaengeSuedseite=', x/cfgGrundstueck.OstWestLaengeSuedseite);

    return p.y - y;
  }
  return ret;
}

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


function berechneWinkelGrad(v1, v2) {
  // v1, v2: Arrays der Länge 2 mit Point-Objekten
  const x1 = v1[0].x - v1[1].x;
  const y1 = v1[0].y - v1[1].y;

  const x2 = v2[0].x - v2[1].x;
  const y2 = v2[0].y - v2[1].y;


  const len1 = Math.sqrt(x1*x1+y1*y1);
  const len2 = Math.sqrt(x2*x2+y2*y2);
  const dotProd = x1*x2 + y1*y2;

  const rad = Math.acos(dotProd/(len1*len2));
  return rad / Math.PI * 180;
}
// const v1 = [new Point(0,0), new Point(1,0)];
// const v2 = [new Point(0,0), new Point(1,1)];
// console.log('berechneWinkelGrad(v1, v2)=', berechneWinkelGrad(v1,v2));



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

function rotatePointPivot(p, phiDeg, pivot) {
  const phiRad = phiDeg/180*Math.PI;
  const c = Math.cos(phiRad);
  const s = Math.sin(phiRad);
  return new Point(c*p.x - s*p.y + (1-c)*pivot.x + s*pivot.y,
                   s*p.x + c*p.y - s*pivot.x + (1-c)*pivot.y);
}
function rotatePoint(p, phiDeg=cfgHaus.HausDrehWinkel) {
  return rotatePointPivot(p, phiDeg, cfgHaus.getPolygonAussen()[4]);
}


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
    if(dist>0.5) {
      angle = -90;
      mpy += txtWidth/2;
    } else {
      mpy += txtHeight/2;
      angle = 0;
    }
  } else if(pos==='r') {
    px1 += offset;
    px2 += offset;
    mpx += 1.5*offset;
    if(dist>0.5) {
      angle = 90;
      mpy -= txtWidth/2;
    } else {
      mpy += txtHeight/2;
      angle = 0;
    }
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
  const hausAussenpoly = cfgHaus.getPolygonAussen();
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
  return cfgHaus.RaumhoeheEG + cfgHaus.DickeEGdecke + cfgHaus.Kniestock + H + G;
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


function polyDachQuerschnitt(dicke, dachneigung,
                             halbeBreite) {
  const alpha = dachneigung * Math.PI/180;

  const l = dicke / Math.sin(alpha);
  const h1 = (halbeBreite -  l) * Math.tan(alpha);
  const h2 = halbeBreite  * Math.tan(alpha);

  const poly = [new Point(halbeBreite, 0),
                new Point(0, h2),
                new Point(-halbeBreite, 0),
                new Point(-halbeBreite + l, 0),
                new Point(0, h1),
                new Point(halbeBreite-l, 0)];

  return poly;
}

function rechterWandQuerschnitt(b, k, alpha, l, hEG, d) {
  l = l<0 ? 0 : l;
  l = l>b ? b : l;

  const k1 = b * Math.tan(alpha * Math.PI/180);
  const k2 = l * Math.tan(alpha * Math.PI/180);

  return [new Point(b, 0),
          new Point(b, hEG),
          new Point(b, hEG+d),
          new Point(b, hEG+d+k-k1+k2),
          new Point(b-l, hEG+d+k-k1+k2),
          new Point(0, hEG+d+k),
          new Point(0, hEG+d),
          new Point(0, hEG),
          new Point(0, 0)];
}

// * Tabelle mit Daten

function berechneTabellenDaten() {
  if(detDatenTabelle.open) {
    const polyGrdst = cfgGrundstueck.Polygon;
    const flGrdst = areaPolygon(polyGrdst);
    document.getElementById("FlaecheGrundStueck").innerText
      = flGrdst.toFixed(2).toString() + "m²";

    // Alter Weg
    const polyWegAlt = datenAlterWeg();
    document.getElementById("FlaecheWegAlt").innerText
      = areaPolygon(polyWegAlt).toFixed(2).toString() + "m²";


    // Baufenster
    const polyBF = cfgGrundstueck.Baufenster.Polygon;
    const flBF = areaPolygon(polyBF);
    document.getElementById("FlaecheBaufenster").innerText
      = flBF.toFixed(2).toString() + "m² (" + (flBF / flGrdst * 100).toFixed(2).toString() + "% Grdst)";

    // Haus
    const polyAussen = cfgHaus.getPolygonAussen();
    let flAussen = 0;
    if(cfgHaus.AnbauInnenflaeche) {
      flAussen = areaPolygon(polyAussen);
    } else {
      // In diesem Fall zaehlt der Anbau nicht mit: Punkte 0 und 8 rausschmeissen
      flAussen = areaPolygon(polyAussen.filter((p,i)=>i>0&&i<8));
    }
    document.getElementById("Grundflaeche").innerText
      = flAussen.toFixed(2).toString() + "m²";
    document.getElementById("Grundflaeche66").innerText
      = (flAussen/100 * 66).toFixed(2).toString() + "m²";
    const flDachterasse = areaPolygon([polyAussen[0], polyAussen[1], polyAussen[7], polyAussen[8]]);
    document.getElementById("FlaecheDachterasse").innerText
      = flDachterasse.toFixed(2).toString() + "m²";
    const p = middlePoint(polyAussen[5], polyAussen[6])
    const maxGiebelHoehe = distBetweenPoints(p, new Point(p.x, ycoordFromS(0, p.x))) / 0.4;
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
    const polyHausInnenEG = cfgHaus.getPolygonEGInnen();

    const wflEG = areaPolygon(polyHausInnenEG);
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
    const comHausInnen = comPolygon(polyHausInnenEG);
    drawEnv2D.ctx2D.fillStyle = cfgHaus.colEG;
    let str = "EG: " + wflEG.toFixed(1).toString() + "m²";
    drawEnv2D.ctx2D.fillText(str, comHausInnen.px, comHausInnen.py);
    str = "OG: " + wflOG.toFixed(1).toString() + "m²";
    drawEnv2D.ctx2D.fillText(str, comHausInnen.px, comHausInnen.py+8);
    document.getElementById("InnenflaecheOG").innerText
      = wflOG.toFixed(2).toString() + "m²";

    // Anbau Innen
    const polyAnbauInnen = cfgHaus.getPolygonAnbauInnen();

    // Berechnung diverser Kenngroessen
    const giebelHoehe = berechneGiebelhoehe();
    document.getElementById("GiebelHoehe").innerText
      = giebelHoehe.toFixed(2).toString() + "m";

    let wflAnbau = 0;
    if(cfgHaus.AnbauInnenflaeche) {
      wflAnbau =areaPolygon(polyAnbauInnen);
      document.getElementById("InnenflaecheAnbau").innerText
        = wflAnbau.toFixed(2).toString() + "m²";
    } else {
      document.getElementById("InnenflaecheAnbau").innerText = "";
    }
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
  // Winkel-Berechnung
  const WinkelBaugrenzeNord = 90 + berechneWinkelGrad(cfgGrundstueck.Baufenster.Baugrenze, [new Point(0,0), new Point(0,1)]);
  console.log('WinkelBaugrenze Nord', WinkelBaugrenzeNord);
  const WinkelBaugrenzeSued = 360 - (90 + WinkelBaugrenzeNord + 90.71);   // 90.71 stammt vom Vermesser
  console.log('WinkelBaugrenze Süd=', WinkelBaugrenzeSued);

  const polyGrdst = cfgGrundstueck.Polygon;
  drawPolygon(polyGrdst, "black", 1);
  if(cfgGrundstueck.zeigeMasse) {
    bemassung(polyGrdst[0], polyGrdst[1], 't');
    bemassung(polyGrdst[0], polyGrdst[3], 'l');
    bemassung(polyGrdst[2], polyGrdst[3], 'b');
    bemassung(polyGrdst[1], polyGrdst[2], 'r');
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

    const wegCol = "LightSalmon";
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
  drawPolygon(cfgGrundstueck.Baufenster.Baugrenze, "blue", 1, [2,3]);
  // bemassung(nordPunkt, suedPunkt, 'r');  // check, dass das mit dem Vermesser passt

  // drawPolygon([new Point(cfgGrundstueck.AbstBaugrenzeWSued, 0),
  //              new Point(cfgGrundstueck.AbstBaugrenzeWSued, cfgGrundstueck.NordSuedLaengeWestseite)],
  //             "blue", 1);

  // Baufenster
  const polyBF = cfgGrundstueck.Baufenster.Polygon;
  if(cfgGrundstueck.Baufenster.show) {
    drawPolygon(polyBF, cfgGrundstueck.Baufenster.col, 1.2, [1,2]);
    if(cfgGrundstueck.Baufenster.zeigeMasse) {

      bemassung(polyBF[0], polyBF[5], 'l');

      // const suedPunkt = pointInbetween(polyGrdst[3], polyGrdst[2],
      //                                  cfgGrundstueck.Baufenster.AbstBaugrenzeWSued / cfgGrundstueck.OstWestLaengeSuedseite);
      // const nordPunkt = pointInbetween(polyGrdst[0], polyGrdst[1],
      //                                  cfgGrundstueck.Baufenster.AbstBaugrenzeWNord / cfgGrundstueck.OstWestLaengeNordseite);
      const sp = berechneSchnittpunkt(polyBF[0], copyPoint(polyBF[0], cfgGrundstueck.OstWestLaengeNordseite),
                                      cfgGrundstueck.Baufenster.Baugrenze[0],cfgGrundstueck.Baufenster.Baugrenze[1]);
      // nordPunkt, suedPunkt);

      bemassung(polyBF[0], sp, 'b');
      bemassung(polyBF[4], polyBF[5], 'b');
      bemassung(polyBF[0], polyBF[1], 't');
      bemassung(polyBF[1], polyBF[2], 'r');
      bemassung(polyBF[2], polyBF[3], 't');
      bemassung(polyBF[3], polyBF[4], 'l');
      bemassung(polyBF[4], new Point(polyBF[4].x, ycoordFromS(0, polyBF[4].x)), 'r', 0.1);
      bemassung(polyBF[5], new Point(polyBF[5].x, ycoordFromS(0, polyBF[5].x)), 'r', 0);
      bemassung(polyBF[5], new Point(xcoordFromW(0), polyBF[5].y), 't', 0);
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
  const polyAussen = cfgHaus.getPolygonAussen();
  if(cfgGrundstueck.zeigeHaus) {
    drawPolygon(polyAussen, cfgHaus.colEG, 1.2);
    // Verlauf des Giebels: aufpassen, wenn die Nordwand eine Ecke hat!
    // const giebelUnten = middlePoint(polyAussen[5], polyAussen[6]);
    // const giebelOben = new Point(giebelUnten.x, polyAussen[4].y);
    // drawPolygon([giebelOben, giebelUnten],
    //   cfgHaus.colEG, 0.2);
  }

  const mp67 = middlePoint(polyAussen[6], polyAussen[7]);
  const mp78 = middlePoint(polyAussen[7], polyAussen[8]);

  if(cfgGrundstueck.zeigeHaus && cfgHaus.zeigeAussenMasse) {
    // Die hier brauchen wir auf jeden Fall
    bemassung(polyAussen[5], polyAussen[6], 'b');
    bemassung(polyAussen[4], polyAussen[5], 'r');
    // Nur bei Anbau
    if(cfgHaus.AnbauLaengeOW > 0) {
      bemassung(polyAussen[0], polyAussen[8], 'l');
      bemassung(polyAussen[6], polyAussen[7], 'l');
      bemassung(polyAussen[7], polyAussen[8], 'b');
      if(Math.abs(cfgHaus.OffsetNS)<0.01 && cfgHaus.AnbauLaengeOW > 0) {
        // Anbau ohne Ecke
        bemassung(polyAussen[0], polyAussen[4], 't');
        // const yy = Math.min(polyAussen[0].y, polyAussen[4].y);
        // bemassung(new Point(polyAussen[0].x, yy), new Point(polyAussen[4].x, yy), 't');
      }
    }
    // Mit Ecke
    if(Math.abs(cfgHaus.OffsetNS)>0.01) {
      bemassung(polyAussen[3], polyAussen[4], 't');
      bemassung(polyAussen[2], polyAussen[3], 'r');
    }

    // Abstände zur Südgrenze des Grundstücks
    // Bemassung an der Mitte der Südkante des Hauses
    const mp = middlePoint(polyAussen[5], polyAussen[6]);
    let sp = berechneSchnittpunkt(cfgGrundstueck.Polygon[2], cfgGrundstueck.Polygon[3],
                                  mp, copyPoint(mp, 0, cfgGrundstueck.NordSuedLaengeWestseite));
    bemassung(sp, mp, 'r', 0);

    // Bemassung an den Südecken des Hauses
    // let sp = berechneSchnittpunkt(cfgGrundstueck.Polygon[2], cfgGrundstueck.Polygon[3],
    //                               polyAussen[6], copyPoint(polyAussen[6], 0, cfgGrundstueck.NordSuedLaengeWestseite));
    // bemassung(sp, polyAussen[6], 'r', 0);
    // sp = berechneSchnittpunkt(cfgGrundstueck.Polygon[2], cfgGrundstueck.Polygon[3],
    //                           polyAussen[5], copyPoint(polyAussen[5], 0, cfgGrundstueck.NordSuedLaengeWestseite));
    // bemassung(sp, polyAussen[5], 'l', 0);




    // Abstand zur Westgrenze
    bemassung(polyAussen[6], new Point(0, polyAussen[6].y), 't', 0);
    if(Math.abs(cfgHaus.HausDrehWinkel)>0.001) {
      bemassung(polyAussen[0], new Point(0, polyAussen[0].y), 't', 0);
    }
    if(cfgHaus.AnbauLaengeOW > 0) {
      bemassung(polyAussen[8], new Point(0, polyAussen[8].y), 't', 0);
      // bemassung(mp67, new Point(xcoordFromW(0), mp67.y), 't');
      bemassung(mp78, new Point(mp78.x, ycoordFromS(0)), 'r');
    }
    const mp34 = middlePoint(polyAussen[3], polyAussen[4]);
    bemassung(mp34, new Point(mp34.x, ycoordFromN(0)), 'r');
    if(cfgGrundstueck.zeigeBaeume) {
      const kastanieSued = new Point(xcoordFromW(cfgGrundstueck.Kastanie.AbstW),
                                     ycoordFromN(cfgGrundstueck.Kastanie.AbstN + cfgGrundstueck.Kastanie.Radius));
      const tmpPoint = new Point(kastanieSued.x, polyAussen[0].y);
      // bemassung(tmpPoint, kastanieSued, 'r', 0);
      // Abstand zur Hausecke
      // if(Math.abs(cfgHaus.OffsetNS)>0.01) {
      bemassung(polyAussen[3], kastanieSued, 't', 0);
      // }
    }
  }

  if(cfgGrundstueck.zeigeHaus && cfgHaus.zeigeVeranda) {
    const polyAussenNoRot = cfgHaus.getPolygonAussen(false);

    const ol = pointInbetween(polyAussenNoRot[4], polyAussenNoRot[5], 1/3);
    const or = new Point(ol.x + 1.5, ol.y);
    const ul = pointInbetween(polyAussenNoRot[4], polyAussenNoRot[5], 2/3);
    const ur = new Point(ul.x + 1.5, ul.y);
    const polyVeranda = [ol, or, ur, ul].map(p=>rotatePointPivot(p, cfgHaus.HausDrehWinkel, polyAussenNoRot[4]));

    drawPolygon(polyVeranda, cfgHaus.colEG, 0.75);
    if(cfgHaus.zeigeAussenMasse) {
      bemassung(polyVeranda[0], polyVeranda[1], 't');
      bemassung(polyVeranda[1], polyVeranda[2], 'r');
    }
  }

  // Haus Innen
  const daw = cfgHaus.DickeAussenwand;
  const diw = cfgHaus.DickeInnenwand;

  const polyHausInnenEG = cfgHaus.getPolygonEGInnen();
  const polyHausInnenOG = cfgHaus.getPolygonOGInnen();


  if (cfgGrundstueck.zeigeHaus) {
    drawPolygon(polyHausInnenEG, cfgHaus.colEG, 0.6);
    if(cfgHaus.zeigeOG) {
      drawPolygon(polyHausInnenOG, cfgHaus.colOG, 0.6);
    }
    if(cfgHaus.zeigeInnenMasse) {
      bemassung(polyHausInnenEG[3], polyHausInnenEG[4], 't');
      bemassung(polyHausInnenEG[2], polyHausInnenEG[3], 'l');
      if(cfgHaus.AnbauInnenflaeche) {
        bemassung(polyHausInnenEG[0], polyHausInnenEG[7], 'b');
        bemassung(polyHausInnenEG[6], new Point(polyHausInnenEG[3].x, polyHausInnenEG[6].y), 't');
      }
    }
  }
  const wflEG = areaPolygon(polyHausInnenEG);
  let wflOG = berechneOG();   // wird noch durch die Gauben korrigiert

  // Gaube-Ost
  // Der Code hier doch doppelt!
  // Tiefe der Gaube berechnen: Da wo die Dachhöhe die OG-Raumhöhe schneidet

  // Zuerst zurück rotieren, um dann das ganze Gaubepolygon zu rotieren
  let mitteAussen = middlePoint(rotatePoint(polyAussen[4], -cfgHaus.HausDrehWinkel),
                                rotatePoint(polyAussen[5], -cfgHaus.HausDrehWinkel));
  // let mitteAussen = middlePoint(polyAussen[4], polyAussen[5]);
  let tiefe = berechneSchittAbstand(2.5) + cfgHaus.DickeAussenwand;
  // Wohnflaeche korrigieren:
  let x = berechneSchittAbstand(2.3);
  wflOG += x * cfgHaus.GaubeOstBreite;

  if (cfgGrundstueck.zeigeHaus && cfgHaus.zeigeOG && cfgHaus.GaubeOstBreite>0.1) {
    const polyGaubeAussen = [copyPoint(mitteAussen, 0, cfgHaus.GaubeOstBreite/2),
                             copyPoint(mitteAussen, 0, -cfgHaus.GaubeOstBreite/2),
                             copyPoint(mitteAussen, -tiefe, -cfgHaus.GaubeOstBreite/2),
                             copyPoint(mitteAussen, -tiefe, cfgHaus.GaubeOstBreite/2)].map(p=>rotatePoint(p));
    drawPolygon(polyGaubeAussen, cfgHaus.colOG, 1);
    drawPolygon([middlePoint(polyGaubeAussen[2], polyGaubeAussen[3]), polyGaubeAussen[0]],cfgHaus.colOG, 0.8);
    drawPolygon([middlePoint(polyGaubeAussen[2], polyGaubeAussen[3]), polyGaubeAussen[1]],cfgHaus.colOG, 0.8);
  }


  // Gaube West

  mitteAussen = middlePoint(rotatePoint(polyAussen[1], -cfgHaus.HausDrehWinkel),
                            rotatePoint(polyAussen[7], -cfgHaus.HausDrehWinkel));

  // middlePoint(polyAussen[1], polyAussen[7]);
  tiefe = berechneSchittAbstand(2.5) + cfgHaus.DickeAussenwand;
  // Wohnflaeche korrigieren:
  x = berechneSchittAbstand(2.3);
  wflOG += x * cfgHaus.GaubeWestBreite;

  if (cfgGrundstueck.zeigeHaus && cfgHaus.zeigeOG && cfgHaus.GaubeWestBreite>0.1) {
    const polyGaubeAussen = [copyPoint(mitteAussen, 0, cfgHaus.GaubeWestBreite/2),
                             copyPoint(mitteAussen, 0, -cfgHaus.GaubeWestBreite/2),
                             copyPoint(mitteAussen, tiefe, -cfgHaus.GaubeWestBreite/2),
                             copyPoint(mitteAussen, tiefe, cfgHaus.GaubeWestBreite/2)].map(p=>rotatePoint(p));
    drawPolygon(polyGaubeAussen, cfgHaus.colOG, 1);
    drawPolygon([middlePoint(polyGaubeAussen[2], polyGaubeAussen[3]), polyGaubeAussen[0]],cfgHaus.colOG, 0.8);
    drawPolygon([middlePoint(polyGaubeAussen[2], polyGaubeAussen[3]), polyGaubeAussen[1]],cfgHaus.colOG, 0.8);
  }



  // Wohnflaechen berichten: In die Skizze einzeichnen
  if (cfgGrundstueck.zeigeHaus) {
    const comHausInnen = comPolygon(polyHausInnenEG);
    drawEnv2D.ctx2D.fillStyle = cfgHaus.colEG;
    let str = cfgHaus.HausTyp;
    drawEnv2D.ctx2D.fillText(str, comHausInnen.px, comHausInnen.py);
    str = "EG: " + wflEG.toFixed(1).toString() + "m²";
    drawEnv2D.ctx2D.fillText(str, comHausInnen.px, comHausInnen.py+8);
    str = "OG: " + wflOG.toFixed(1).toString() + "m²";
    drawEnv2D.ctx2D.fillText(str, comHausInnen.px, comHausInnen.py+16);
  }

  // Anbau Innen
  const polyAnbauInnen = cfgHaus.getPolygonAnbauInnen();

  if (cfgGrundstueck.zeigeHaus) {
    if(cfgHaus.AnbauInnenflaeche) {
      drawPolygon(polyAnbauInnen, cfgHaus.colEG, 0.6);
      if(cfgHaus.zeigeInnenMasse) {
        bemassung(polyAnbauInnen[0], polyAnbauInnen[1], 'b');
        bemassung(polyAnbauInnen[0], polyAnbauInnen[3], 'r');
      }
    } else {
      drawPolygon([polyAussen[1], polyAussen[7]], cfgHaus.colEG, 1.2);
    }
  }

  const wflAnbau =areaPolygon(polyAnbauInnen);
  if (cfgGrundstueck.zeigeHaus) {
    if(cfgHaus.AnbauInnenflaeche) {
      const comAnbauInnen = comPolygon(polyAnbauInnen);

      drawEnv2D.ctx2D.fillStyle = cfgHaus.colEG;
      let str = wflAnbau.toFixed(1).toString() + "m²";
      drawEnv2D.ctx2D.fillText(str, comAnbauInnen.px, comAnbauInnen.py);
    } else {
      if(cfgHaus.AnbauLaengeOW) {
        // Anbau ohne Innenflaeche = Balkon
        const polyBalkon = [polyAussen[0], polyAussen[1], polyAussen[7], polyAussen[8]];
        const comBalkon = comPolygon(polyBalkon);
        const flBalkon = areaPolygon(polyBalkon);
        drawEnv2D.ctx2D.fillStyle = cfgHaus.colEG;
        let str = flBalkon.toFixed(1).toString() + "m²";
        drawEnv2D.ctx2D.fillText(str, comBalkon.px, comBalkon.py);
      }
    }
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

    const bemassungAltesHaus = false;
    if(bemassungAltesHaus) {
      // bemassung ruft setStdTransformState auf. Daher muss man immer wieder translate und rotate setzen
      bemassung(cfgGrundstueck.AltesHaus.Polygon[0], cfgGrundstueck.AltesHaus.Polygon[1], 'r');
      drawEnv2D.ctx2D.translate(68, -10); drawEnv2D.ctx2D.rotate(-Math.PI / 180 * 2);
      bemassung(cfgGrundstueck.AltesHaus.Polygon[1], cfgGrundstueck.AltesHaus.Polygon[2], 'b');
      drawEnv2D.ctx2D.translate(68, -10); drawEnv2D.ctx2D.rotate(-Math.PI / 180 * 2);
    }
    const altesHausNeuerAnbau = false;

    const polyOhneAnbau = cfgGrundstueck.AltesHaus.PolygonOhneAnbau;
    const flOhneAnbau = areaPolygon(polyOhneAnbau);
    const comOhneAnbau = comPolygon(polyOhneAnbau);
    drawEnv2D.ctx2D.fillStyle = "gray";
    // let str = "Ohne Anbau: " + flOhneAnbau.toFixed(1).toString() + "m²";
    // drawEnv2D.ctx2D.fillText(str, comOhneAnbau.px + 50, comOhneAnbau.py-10);
    if(altesHausNeuerAnbau) {
      const polyNeuerAnbau = cfgGrundstueck.AltesHaus.PolygonNeuerAnbau;
      drawPolygon(cfgGrundstueck.AltesHaus.PolygonNeuerAnbau, cfgHaus.colEG, 1, [2,3]);
      bemassung(cfgGrundstueck.AltesHaus.PolygonNeuerAnbau[1], cfgGrundstueck.AltesHaus.PolygonNeuerAnbau[2], 'l');
      drawEnv2D.ctx2D.translate(68, -10); drawEnv2D.ctx2D.rotate(-Math.PI / 180 * 2);
      bemassung(cfgGrundstueck.AltesHaus.PolygonNeuerAnbau[2], cfgGrundstueck.AltesHaus.PolygonNeuerAnbau[3], 't');
      drawEnv2D.ctx2D.translate(68, -10); drawEnv2D.ctx2D.rotate(-Math.PI / 180 * 2);
      bemassung(cfgGrundstueck.AltesHaus.PolygonNeuerAnbau[3], cfgGrundstueck.AltesHaus.PolygonNeuerAnbau[4], 'r');
      console.log('Fläche neuer Anbau=', areaPolygon(cfgGrundstueck.AltesHaus.PolygonNeuerAnbau));
      console.log('Fläche altes Haus ohne Anbau=', areaPolygon(cfgGrundstueck.AltesHaus.PolygonOhneAnbau));
      const flNeuerAnbau = areaPolygon(polyNeuerAnbau);
      const comNeuerAnbau = comPolygon(polyNeuerAnbau);
      drawEnv2D.ctx2D.fillStyle = cfgHaus.colEG;
      str = "Neuer Anbau: " + flNeuerAnbau.toFixed(1).toString() + "m²";
      drawEnv2D.ctx2D.fillText(str, comNeuerAnbau.px + 50, comNeuerAnbau.py-40);
    }
    drawEnv2D.setStdTransformState();

    // Eigene Messung Dez. 2022
    // let x = cfgGrundstueck.AbstBaugrenzeWSued - 0.24;
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

  // const offsetX = Math.ceil(cfgHaus.HausLaengeOW/2) +1;
  const yMirror =  p=>new Point(p.x, -p.y);
  // const poly = cfgHaus.PolygonSuedGiebel.map(yMirror);
  const polyDach = polyDachQuerschnitt(cfgHaus.DickeDach, cfgHaus.Dachneigung,
                                       cfgHaus.HausLaengeOW/2 + cfgHaus.Dachueberstand)
        .map(p=>new Point(p.x, -p.y));
  const l = polyDach[0].x - polyDach[5].x - cfgHaus.Dachueberstand;
  const polyRechteSeite = rechterWandQuerschnitt(cfgHaus.DickeAussenwand,
                                                 cfgHaus.Kniestock,
                                                 cfgHaus.Dachneigung,
                                                 l,
                                                 cfgHaus.RaumhoeheEG,
                                                 cfgHaus.DickeEGdecke)
        .map(yMirror).map(p=>copyPoint(p, cfgHaus.HausLaengeInnenOW/2,0));
  const polyLinkeSeite = polyRechteSeite.map(p=>new Point(-p.x, p.y));

  drawPolygon(polyRechteSeite, "black", 1.5);
  drawPolygon(polyLinkeSeite, "black", 1.5);
  drawPolygon([polyLinkeSeite[8], polyRechteSeite[8]], "black", 1.5);
  bemassung(polyLinkeSeite[8], polyRechteSeite[8], "b",0.1);
  // Decke EG:
  drawPolygon([polyLinkeSeite[7], polyRechteSeite[7]], "black", 0.2);
  drawPolygon([polyLinkeSeite[6], polyRechteSeite[6]], "black", 0.2);
  bemassung(new Point(1, polyLinkeSeite[8].y),  new Point(1, polyLinkeSeite[7].y), 'r', 0.1);
  bemassung(new Point(1, polyLinkeSeite[7].y), new Point(1, polyLinkeSeite[6].y), 'r', 0.1);
  bemassung(polyLinkeSeite[6], polyLinkeSeite[5], "r", 0.1);

  // Positionierung des Dachs
  let dachOffsetY = 0;
  if(l>0) {
    // In diesem Fall liegt das Dach mit der Unterseite auf einem Teil der Mauer
    dachOffsetY = polyLinkeSeite[3].y;
  } else {
    dachOffsetY = polyLinkeSeite[5].y + (cfgHaus.DickeAussenwand - l) * Math.tan(Math.PI/180*cfgHaus.Dachneigung);
  }
  polyDach.forEach(p=>p.y += dachOffsetY);

  drawPolygon(polyDach, "black", 1.5);
  // Decke OG
  const tmpPoint1 = new Point(-2*cfgHaus.HausLaengeOW,
                              -(cfgHaus.RaumhoeheEG + cfgHaus.DickeEGdecke + cfgHaus.RaumhoeheOG));
  const tmpPoint2 = copyPoint(tmpPoint1, 4*cfgHaus.HausLaengeOW, 0);
  let sp1 = berechneSchnittpunkt(tmpPoint1, tmpPoint2, polyDach[4], polyDach[3]);
  let sp2 = berechneSchnittpunkt(tmpPoint1, tmpPoint2, polyDach[4], polyDach[5]);
  drawPolygon([sp1, sp2], "black", 0.2);
  bemassung(sp1, sp2, 'b', 0.1);

  bemassung(new Point(1, -(cfgHaus.RaumhoeheEG + cfgHaus.DickeEGdecke)),
            new Point(1, -(cfgHaus.RaumhoeheEG + cfgHaus.DickeEGdecke + cfgHaus.RaumhoeheOG)), 'r', 0.1);
  tmpPoint1.y -= cfgHaus.DickeOGdecke;
  tmpPoint2.y -= cfgHaus.DickeOGdecke;
  sp1 = berechneSchnittpunkt(tmpPoint1, tmpPoint2, polyDach[4], polyDach[3]);
  sp2 = berechneSchnittpunkt(tmpPoint1, tmpPoint2, polyDach[4], polyDach[5]);
  drawPolygon([sp1, sp2], "black", 0.2);
  bemassung(new Point(1, -(cfgHaus.RaumhoeheEG + cfgHaus.DickeEGdecke + cfgHaus.RaumhoeheOG)),
            new Point(1, -(cfgHaus.RaumhoeheEG + cfgHaus.DickeEGdecke + cfgHaus.RaumhoeheOG + cfgHaus.DickeOGdecke)), 'r', 0.1);
  bemassung(polyDach[4],
            new Point(0, -(cfgHaus.RaumhoeheEG + cfgHaus.DickeEGdecke + cfgHaus.RaumhoeheOG + cfgHaus.DickeOGdecke)), 'r', 0);
  // Bemassung von ganz oben nach unten
  bemassung(new Point(cfgHaus.HausLaengeOW/2+1, 0),
            new Point(cfgHaus.HausLaengeOW/2+1, polyDach[1].y),
            'r', 0.1);

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
