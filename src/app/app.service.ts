import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {MatSnackBar, MatSnackBarRef} from '@angular/material/snack-bar';
@Injectable({
  providedIn: 'root'
})
export class AppService {

  urlApi: string = 'http://localhost:3000/reconocer-texto'
  constructor(private _Http: HttpClient,private _snackBar: MatSnackBar) { }

  post(pFile: File){
    const formData = new FormData();
    formData.append('files', pFile);

    return this._Http.post<any>(`${this.urlApi}`,formData)
  }


  snackBar(pMensaje: string, pButton : string = 'Ok'){
    this._snackBar.open(pMensaje, pButton, {duration: 1000});
  }

}
