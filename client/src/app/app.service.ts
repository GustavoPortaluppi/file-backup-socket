import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../environments/environment';

@Injectable()
export class AppService {

  constructor(private http: HttpClient) {
  }

  getFileList(userId: string) {
    return this.http.get(`${environment.BASE_URL_API}/${userId}`);
  }
}
