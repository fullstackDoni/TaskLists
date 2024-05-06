import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WebSocketService } from '../web-socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-task',
  templateUrl: './edit-task.component.html',
  styleUrls: ['./edit-task.component.css']
})
export class EditTaskComponent implements OnInit, OnDestroy {

  form!: FormGroup;
  taskId!: string;
  taskData: any;
  taskUpdateSubscription!: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private webSocketService: WebSocketService
  ) { }

  ngOnInit(): void {
    this.taskId = this.route.snapshot.paramMap.get('id')!;

    this.form = this.formBuilder.group({
      title: '',
      description: '',
      status: ''
    });

    this.fetchTaskDetails();
    this.webSocketService.listenForTaskUpdates();

    this.taskUpdateSubscription = this.webSocketService.taskUpdate$.subscribe((updatedTask: any) => {
      if (updatedTask.taskId === this.taskId) {
        this.fetchTaskDetails();
      }
    });
  }

  ngOnDestroy(): void {
    this.taskUpdateSubscription.unsubscribe();
  }

  fetchTaskDetails(): void {
    this.http.get<any>(`http://localhost:3000/tasks/${this.taskId}`)
      .subscribe((task) => {
        this.taskData = task;
        this.populateForm();
      });
  }

  populateForm(): void {
    this.form.patchValue({
      title: this.taskData.title,
      description: this.taskData.description,
      status: this.taskData.status
    });
  }

  submit(): void {
    this.http.put(`http://localhost:3000/tasks/${this.taskId}`, this.form.getRawValue())
      .subscribe((res) => {
        console.log(res);
        this.webSocketService.sendTaskUpdate(this.taskId);
        this.router.navigate(['/']);
      });
  }
}
