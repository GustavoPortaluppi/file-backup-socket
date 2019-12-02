import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import io from 'socket.io-client';

import { AppService } from '../app.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  userId;
  socket;

  files = [];

  constructor(private activatedRoute: ActivatedRoute,
              private appService: AppService) {
    this.userId = this.activatedRoute.snapshot.queryParams.userId || '1';

    this.socket = io(environment.BASE_URL_SOCKET, { query: { userId: this.userId } });

    this.socket.on('CHANGE', (data) => {
      this.initFilesList();
    });

    /* Simulação de ambiente de monitoramento */
    this.socket.on('disconnect', () => {
      this.notifyAdmin();
    });
  }

  ngOnInit() {
    this.initFilesList();
  }

  initFilesList() {
    this.appService.getFileList(this.userId).subscribe((res: any) => {
      this.files = res.files;
    })
  }

  unlinkFile(path: string) {
    this.socket.emit('UNLINK', path);
  }

  notifyAdmin() {
    this.appService.notifyAdmin().subscribe((res: any) => {
      console.log(res);
    });
  }

}
