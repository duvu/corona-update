import {ItemCountry} from './item-country';

export interface Item {
  dateTime: Date;
  timestamp: number;
  confirmed: number;
  deaths: number;
  recovered: number;
}
