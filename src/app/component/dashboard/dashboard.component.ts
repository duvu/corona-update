import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';

import * as _ from 'lodash';
import * as L from 'leaflet';
import * as c3 from 'c3';
import {Chart, ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {Color, Label} from 'ng2-charts';
import {Observable} from 'rxjs';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {AngularFireDatabase} from '@angular/fire/database';
import {Item} from '../../models/item';
import {map, startWith} from 'rxjs/operators';

// tslint:disable-next-line:max-line-length
const TILE_MAPBOX = 'https://api.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiaG9haXZ1YmsiLCJhIjoiY2oya3YzbHFuMDAwMTJxazN6Y3k0Y2syNyJ9.4avYQphrtbrrniI_CT0XSA';
const TILE_OSM = 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  map: L.Map;

  public lineChartData: ChartDataSets[] = [];
  public lineChartLabels: any[] = [];
  public lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      display: true,
      position: 'bottom'
    },
    scales: {
      xAxes: [{
        type: 'time',
        distribution: 'linear',
        ticks: {
          source: 'labels'
        }
      }]
    }
  };
  public lineChartColors: Color[] = [
    {
      borderColor: 'black',
      backgroundColor: 'rgba(255,0,0,0.3)',
    },
  ];
  public lineChartType: ChartType = 'line';
  public lineChartPlugins = [];

  private itemsCollection: AngularFirestoreCollection<Item>;
  private items: Observable<Item[]>;
  totalConfirmed: number;
  totalRecovered: number;
  totalDeaths: number;
  constructor(db: AngularFirestore, adb: AngularFireDatabase) {
    this.itemsCollection = db.collection<Item>('items');
    this.items = this.itemsCollection.valueChanges()
      .pipe(
        startWith([]),
        map((value) => {
          value.sort((a, b) => {
            return a.timestamp > b.timestamp ? 1 : -1;
          });
          return value;
        })
      );

    this.items.subscribe(
      data => {
        this.lineChartLabels = _.map(data, x => x.timestamp);
        this.lineChartData = [
          {
            data: _.map(data, x => {
              return x.confirmed;
            }), label: 'Confirmed'
          },
          {
            data: _.map(data, x => {
              return x.recovered;
            }), label: 'Recovered'
          },
          {
            data: _.map(data, x => {
              return x.deaths;
            }), label: 'Deaths'
          }
        ];

        this.totalConfirmed = (data && data[data.length - 1]) ?  data[data.length - 1].confirmed : 0;
        this.totalDeaths = (data && data[data.length - 1]) ?  data[data.length - 1].deaths : 0;
        this.totalRecovered = (data && data[data.length - 1]) ?  data[data.length - 1].recovered : 0;
      }
    );
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.map = L.map('map-id', {
      zoomControl: false,
      center: L.latLng(21.731253, 105.996139),
      zoom: 12,
      minZoom: 1,
      maxZoom: 18,

      layers: [
        L.tileLayer(TILE_MAPBOX, {
          // tslint:disable-next-line:max-line-length
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>',
          // id: 'mapbox.streets',
          // accessToken: 'pk.eyJ1IjoiaG9haXZ1YmsiLCJhIjoiY2oya3YzbHFuMDAwMTJxazN6Y3k0Y2syNyJ9.4avYQphrtbrrniI_CT0XSA'
        })]
    });
  }

  ngOnDestroy(): void {
  }
}
