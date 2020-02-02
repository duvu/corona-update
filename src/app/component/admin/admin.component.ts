import {Component, OnInit, ViewChild} from '@angular/core';
import {AuthService} from '../../core/auth.service';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {Item} from '../../models/item';
import {Observable} from 'rxjs';
import {AngularFireDatabase} from '@angular/fire/database';
import {MatPaginator, MatSort} from '@angular/material';
import {map, startWith, switchMap} from 'rxjs/operators';
import * as XLSX from 'xlsx';
import * as _ from 'lodash';
import {WorkBook} from 'xlsx';
import {WorkSheet} from 'xlsx';
import * as moment from 'moment';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  private selItem: Item;
  private itemsCollection: AngularFirestoreCollection<Item>;
  private itemsCollection2: AngularFirestoreCollection<Item>;
  private items: Observable<Item[]>;
  private items2: Observable<Item[]>;
  dataSource: Item[];
  displayColumns: string[] = ['date', 'confirmed', 'recovered', 'deaths', 'actions'];
  constructor(private authService: AuthService, private afs: AngularFirestore) {
    this.itemsCollection = afs.collection<Item>('items');
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


    this.itemsCollection2 = afs.collection('label');
    this.itemsCollection2.snapshotChanges().pipe(map(actions => {
      return actions.map(a => {
        const id = a.payload.doc.id;
        return {id};
      });
    })).subscribe(data => {
      console.log('data', data[0].id);
      if (data && data[0].id) {
        afs.collection('data').doc(data[0].id).collection(data[0].id).valueChanges().subscribe(data1 => console.log(data1.length));
      }
    });
  }


  ngOnInit() {
    this.selItem = {} as Item;
  }


  signOut() {
    this.authService.signOut();
  }

  submit() {
    console.log('selItem: ', this.selItem);
    // this.selItem.timestamp = this.selItem.dateTime.getTime();
    // this.itemsCollection.add(this.selItem);
  }

  deleteItem(element: Item) {
    console.log('Item', element);
    // afs.doc<Item>('items/' + element.ti)
  }

  incoming_file(files: FileList) {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      // @ts-ignore
      const data = new Uint8Array(fileReader.result);
      const arr = [];
      for (let i = 0; i !== data.length; ++i) { arr[i] = String.fromCharCode(data[i]); }
      const bstr = arr.join('');
      const workbook = XLSX.read(bstr, {type: 'binary'});
      const sheetNames = workbook.SheetNames;
      _.forEach(sheetNames, (x) => this.parseASheet(x, workbook.Sheets[x]));
    };
    fileReader.readAsArrayBuffer(files[0]);
  }

  parseASheet(x: string, sheet: WorkSheet) {
    const collections2 = this.afs.collection<Item>('data'); // + this.parse_a_date(x));
    const collections21 = this.afs.collection<string>('label'); // + this.parse_a_date(x));
    const collection3 = collections2.doc(this.parse_a_date(x)).collection(this.parse_a_date(x));
    let sheetData: any[];
    sheetData = XLSX.utils.sheet_to_json(sheet, {raw: true});
    // tslint:disable-next-line:no-shadowed-variable
    _.forEach(sheetData, (xx) => {
      xx['Last Update'] = this.parse_a_date(x);
      collection3.add(xx);
      collections21.doc(this.parse_a_date(x)).set({last_update: this.parse_a_date_timestamp(x)});
    });
  }

  parse_a_date(x: string): string {
    let xx = moment(x, 'MMMDD_hha');
    if (!xx.isValid()) {
      xx = moment(x, 'MMMDD_hmma');
    }
    return xx.isValid() ? xx.format('YYYY-MM-DD hh:mm') : '';
  }

  parse_a_date_timestamp(x: string): number {
    let xx = moment(x, 'MMMDD_hha');
    if (!xx.isValid()) {
      xx = moment(x, 'MMMDD_hmma');
    }
    return xx.isValid() ? xx.unix() : 0;
  }
}
