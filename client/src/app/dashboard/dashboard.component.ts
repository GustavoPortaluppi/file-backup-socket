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

  constructor(private activatedRoute: ActivatedRoute,
              private appService: AppService) {
    console.log(activatedRoute);
    this.userId = this.activatedRoute.snapshot.queryParams.userId || '1';

    this.socket = io(environment.BASE_URL_SOCKET, { query: JSON.stringify({ userId: this.userId }) });

    this.socket.on('CHANGE', (data) => {
      console.log(data);
      console.log('> deve buscar na api e atualizar listagem');
    });

    /* Simulação de ambiente de monitoramento */
    this.socket.on('disconnect', () => {
      console.log('> deve chamar método na api que envia e-mail notificando indisponibilidade');
    });
  }

  ngOnInit() {
    this.initFilesList();
  }

  initFilesList() {
    this.appService.getFileList(this.userId).subscribe((res: any) => {
      console.log(res);
    })
  }

  unlinkFile(path: string) {
    this.socket.emit('UNLINK', path);
  }

}
