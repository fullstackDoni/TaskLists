import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Emitters } from '../emitters/emitters';
import { Router } from '@angular/router';
import { WebSocketService } from '../web-socket.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  tasks: any;
  filteredTasks: any;
  statusFilter: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.http.get('http://localhost:3000/tasks').subscribe((tasks: any) => {
      this.tasks = tasks;
      this.filteredTasks = tasks;
      Emitters.authEmitter.emit(true);
    },
    () => {
      Emitters.authEmitter.emit(false);
    });
  }

  delete(id: string): void {
    this.http.delete(`http://localhost:3000/tasks/${id}`)
      .subscribe(
        () => {
          this.tasks = this.tasks.filter((task: { id: string; }) => task.id !== id);
          this.filteredTasks = this.filteredTasks.filter((task: { id: string; }) => task.id !== id); // Обновляем отфильтрованный массив
        },
        (error) => {
          console.log(error);
        }
      );
  }

  filterByStatus(status: string): void {
    this.statusFilter = status;
    if (status === '') {
      this.filteredTasks = this.tasks;
    } else {
      this.filteredTasks = this.tasks.filter((task: { status: string; }) => task.status === status);
    }
  }
}