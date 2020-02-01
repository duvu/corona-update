import {Component, OnInit, ViewChild} from '@angular/core';
import {AuthService} from '../../core/auth.service';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {Item} from '../../models/item';
import {Observable} from 'rxjs';
import {AngularFireDatabase} from '@angular/fire/database';
import {MatPaginator, MatSort} from '@angular/material';
import {map, startWith, switchMap} from 'rxjs/operators';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(private authService: AuthService, private db: AngularFirestore, adb: AngularFireDatabase) {
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
  }

  private selItem: Item;
  private itemsCollection: AngularFirestoreCollection<Item>;
  private items: Observable<Item[]>;
  dataSource: Item[];
  displayColumns: string[] = ['date', 'confirmed', 'recovered', 'deaths', 'actions'];
  ngOnInit() {
    this.selItem = {} as Item;
  }


  signOut() {
    this.authService.signOut();
  }

  submit() {
    console.log('selItem: ', this.selItem);
    this.selItem.timestamp = this.selItem.dateTime.getTime();
    this.itemsCollection.add(this.selItem);
  }

  deleteItem(element: Item) {
    console.log('Item', element);
    //db.doc<Item>('items/' + element.ti)
  }
}
