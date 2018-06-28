import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable()
export class ExcelService {

  constructor() { }

  public exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    let currentDate = new Date();
    let fullDateTime = (currentDate.getFullYear() < 10 ? "0":"") + currentDate.getFullYear()+
                        (currentDate.getMonth() < 9? "0" : "") + (currentDate.getMonth() + 1) +
                        (currentDate.getDate() < 10 ? "0" : "") + currentDate.getDate() +
                        (currentDate.getHours() < 10 ? "0" : "") + currentDate.getHours() +
                        (currentDate.getMinutes() < 10 ? "0" : "") + currentDate.getMinutes() +
                        (currentDate.getSeconds() < 10 ? "0" : "") + currentDate.getSeconds();

    FileSaver.saveAs(data, fileName + "_" + fullDateTime + EXCEL_EXTENSION);
  }

}