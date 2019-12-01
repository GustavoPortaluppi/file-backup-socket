import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor() {
  }

  // sendMessage(msg: string) {
  //   this.socket.emit('EVENT_01', 'abccc');
  // }
  //
  // getMessage() {
  //   // this.socket.fromEvent('MSG_01').subscribe((res: any) => {
  //   //   console.log(res);
  //   // });
  //
  //
  //   this.socket.fromEvent('CHANGE').subscribe((res: any) => {
  //     console.log(res);
  //     console.log('> deve buscar na api e atualizar listagem')
  //   })
  //
  //
  // }

}
