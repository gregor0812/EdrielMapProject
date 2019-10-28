import { Component, OnInit } from '@angular/core';
import OlImageLayer from 'ol/layer/Image';
import OlStatic from 'ol/source/ImageStatic';
import {Fill, Stroke, Style, Text} from 'ol/style';
import OlMap from 'ol/Map';
import OlView from 'ol/View';
import OlVectorLayer from 'ol/layer/Vector';
import OlVectorSource from 'ol/source/Vector';
import OlGeoJSON from 'ol/format/GeoJSON';
import {map} from 'rxjs/operators';
import {getWidth} from 'ol/extent';
import {AngularFireDatabase} from '@angular/fire/database';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  private afs: AngularFireDatabase;
  selected: any;
  edrielMap: OlMap;
  private provinceVectorLayer: OlVectorLayer;
  private provinceData: any[];
  showSpinner = true;
  private sovereigntyData: any[];
  private subfactionData: any[];
  private religionData: any[];
  private tradegoodData: any[];
  private cultureData: any[];

  private sovereigntyStyles: Style[] = [];
  private subfactionStyles: Style[] = [];
  private religionStyles: Style[] = [];
  private tradegoodStyles: Style[] = [];
  private cultureStyles: Style[] = [];

  constructor(afs: AngularFireDatabase) {
    this.afs = afs;
  }

  ngOnInit() {
    this.initializeMap();
    this.loadProvinceData().then(() => {
      this.setProvinceData(this.provinceData);
      this.createColours(this.sovereigntyData, this.sovereigntyStyles);
      this.createColours(this.subfactionData, this.subfactionStyles);
      this.createColours(this.religionData, this.religionStyles);
      this.createColours(this.tradegoodData, this.tradegoodStyles);
      this.createColours(this.cultureData, this.cultureStyles);
      this.showSpinner = false; }).then(() => {
        this.setStyle(this.sovereigntyData, this.sovereigntyStyles, Mapmodes.sovereignties);
    });
  }
  loadProvinceData() {
    return new Promise((resolve) => {
      let counter = 0;
      this.afs.list('provinces')
        .valueChanges().pipe(map(res => res.map(eachLabel => eachLabel))).subscribe(res => {
        this.provinceData = res;
        counter++;
        if (counter === 6) {resolve(); }
      });
      this.afs.list('sovereignties')
        .valueChanges().pipe(map(res => res.map(eachLabel => eachLabel))).subscribe(res => {
        this.sovereigntyData = res;
        counter++;
        if (counter === 6) {resolve(); }
      });
      this.afs.list('subfactions')
        .valueChanges().pipe(map(res => res.map(eachLabel => eachLabel))).subscribe(res => {
        this.subfactionData = res;
        counter++;
        if (counter === 6) {resolve(); }
      });
      this.afs.list('religions')
        .valueChanges().pipe(map(res => res.map(eachLabel => eachLabel))).subscribe(res => {
        this.religionData = res;
        counter++;
        if (counter === 6) {resolve(); }
      });
      this.afs.list('goods')
        .valueChanges().pipe(map(res => res.map(eachLabel => eachLabel))).subscribe(res => {
        this.tradegoodData = res;
        counter++;
        if (counter === 6) {resolve(); }
      });
      this.afs.list('cultures')
        .valueChanges().pipe(map(res => res.map(eachLabel => eachLabel))).subscribe(res => {
        this.cultureData = res;
        counter++;
        if (counter === 6) {resolve(); }
      });

    });
  }
  setProvinceData(provinces) {
    const layer = this.provinceVectorLayer.getSource();
    if (layer.getState() === 'ready') {
      layer.forEachFeature(function(event) {
        event.set('name', provinces[event.get('id')].name, true);
        event.set('owner', provinces[event.get('id')].owner, true);
        event.set('religion', provinces[event.get('id')].religion, true);
        event.set('culture', provinces[event.get('id')].culture, true);
        event.set('goods', provinces[event.get('id')].goods, true);
        event.set('subfaction', provinces[event.get('id')].subfaction, true);
      });
      layer.refresh();
    }
  }
  createColours(data, styles) {
    data.forEach((e) => {
      const colour = new Style({


        fill: new Fill({
          color: e.colour
        }),
        stroke: new Stroke({
          color: '#000333',
          width: 1

        }),
        fillOpacity: '0.1',
        text: new Text({
          font: '12px calibri, sans-serif',
          overflow: true,
          fill: new Fill({
            color: '#333',
            width: 3
          }),
          stroke: new Stroke({
            color: '#fff',
            width: 3
          })
        })
      });
      styles.push(colour);
    });


  }
  setStyle(data, styles, mapmode) {
    const layer = this.provinceVectorLayer.getSource();
    if (layer.getState() === 'ready') {
      layer.forEachFeature((event) => {
        const labelStyle = new Style({
          text: new Text({
            font: '12px Calibri,sans-serif',
            overflow: true,
            fill: new Fill({
              color: '#000'
            }),
            stroke: new Stroke({
              color: '#fff',
              width: 3
            })
          })
        });

        switch (mapmode) {
          case Mapmodes.sovereignties: {
            event.set('ownerName', data[event.get('owner')].name, true);
            labelStyle.getText().setText(event.get('ownerName'));
            const provinceStyle = [styles[event.get('owner')], labelStyle];
            event.setStyle(provinceStyle);

            break;
          }
          case Mapmodes.borderless: {
            const blankStyle = new Style({
              fill: new Fill({
                color: 'rgba(0, 0, 0, 0)'
              }),
            });
            event.setStyle(blankStyle);
            break;
          }
          case Mapmodes.provinces: {
            labelStyle.getText().setText(event.get('name') + ':' + event.get('id'));
            const provinceStyle = [styles[event.get('owner')], labelStyle];
            event.setStyle(provinceStyle);
            break;
          }
          case Mapmodes.religions: {
            event.set('religionName', data[event.get('religion')].name, true);
            labelStyle.getText().setText(event.get('religionName'));
            const provinceStyle = [styles[event.get('religion')], labelStyle];
            event.setStyle(provinceStyle);
            break;
          }
          case Mapmodes.subfactions: {
            event.set('subfactionName', data[event.get('subfaction')].name, true);
            labelStyle.getText().setText(event.get('subfactionName'));
            const provinceStyle = [styles[event.get('subfaction')], labelStyle];
            event.setStyle(provinceStyle);
            break;
          }
          case Mapmodes.tradegoods: {
            event.set('tradegoodName', data[event.get('goods')].name, true);
            labelStyle.getText().setText(event.get('tradegoodName'));
            const provinceStyle = [styles[event.get('goods')], labelStyle];
            event.setStyle(provinceStyle);
            break;
          }
          case Mapmodes.cultures: {
            event.set('cultureName', data[event.get('culture')].name, true);
            labelStyle.getText().setText(event.get('cultureName'));
            const provinceStyle = [styles[event.get('culture')], labelStyle];
            event.setStyle(provinceStyle);
            break;
          }
        }



      });

      layer.refresh();
    }
  }
  initializeMap() {
    const extent = [-20, 12, 116, 80];
    const canvas = new OlImageLayer({
      source: new OlStatic({
        url: 'assets/images/Edriel.jpg',
        imageExtent: extent
      })

    });
    this.provinceVectorLayer = new OlVectorLayer({
      source: new OlVectorSource({
        url: 'assets/files/edriel.geojson',
        format: new OlGeoJSON()
      }),
      declutter: true
    });

    this.edrielMap = new OlMap({
      target: 'map',
      layers: [canvas, this.provinceVectorLayer],
      view: new OlView({
        projection: 'EPSG:4326',
        center: [50, 42],
        zoom: 4,
        minZoom: 1,
        maxZoom: 6,
        resolution: 0.06,
        maxResolution: 0.19,
        extent: extent
      })
    });
    this.edrielMap.on('click', (e) => {
      this.edrielMap.forEachFeatureAtPixel(e.pixel, function() {
      });
    });
  }

  switchMapMode(value) {

    switch (value) {
      case 'sovereignties': {
        this.setStyle(this.sovereigntyData, this.sovereigntyStyles, Mapmodes.sovereignties);
        break;
      }
      case 'borderless': {
        this.setStyle(this.sovereigntyData, this.sovereigntyStyles, Mapmodes.borderless);
        break;
      }
      case 'provinces': {
        this.setStyle(this.sovereigntyData, this.sovereigntyStyles, Mapmodes.provinces);
        break;
      }
      case 'religions': {
        this.setStyle(this.religionData, this.religionStyles, Mapmodes.religions);
        break;
      }
      case 'subfactions': {
        this.setStyle(this.subfactionData, this.subfactionStyles, Mapmodes.subfactions);
        break;
      }
      case 'tradegoods': {
        this.setStyle(this.tradegoodData, this.tradegoodStyles, Mapmodes.tradegoods);
        break;
      }
      case 'cultures': {
        this.setStyle(this.cultureData, this.cultureStyles, Mapmodes.cultures);
        break;
      }
    }
  }
}

export enum Mapmodes {
  'borderless', 'sovereignties', 'religions' , 'subfactions', 'tradegoods', 'provinces', 'cultures'
}
