import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  urlApi: string = 'http://localhost:3000/reconocer-texto'
  constructor(private _Http: HttpClient) { }

  post(pFile: File){
    const formData = new FormData();
    formData.append('files', pFile);

    return this._Http.post<any>(`${this.urlApi}`,formData)
  }

}
