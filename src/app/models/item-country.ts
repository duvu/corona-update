import {ItemProvince} from './item-province';

export interface ItemCountry {
  dateTime: Date;
  country: string;
  provinces: ItemProvince[];
  confirmed: number;
  deaths: number;
  recovered: number;
}
