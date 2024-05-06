import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket!: Socket;
  private taskUpdateSubject = new BehaviorSubject<any>(null);
  taskUpdate$ = this.taskUpdateSubject.asObservable();

  constructor() {
    this.socket = io('http://localhost:3000');
    this.listenForTaskUpdates();
  }


  listenForTaskUpdates(): void {
    this.socket.on('taskUpdate', (updatedTask: any) => {
      this.taskUpdateSubject.next(updatedTask);
    });
  }

  sendTaskUpdate(taskId: string): void {
    this.socket.emit('taskUpdate', { taskId: taskId });
  }

  getUpdatedTaskId() {
    return new Observable<any>(observer => {
      this.socket.on("taskUpdateFront", (data) => {
        observer.next(data);
      });

    return () => {
      this.socket.disconnect();
    }
    })
  }

  disconnectFromServer(): void {
    this.socket.disconnect();
  }
}
