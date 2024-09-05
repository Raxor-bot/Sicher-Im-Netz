import { Component, OnInit } from '@angular/core';
import {Firestore, collectionData, addDoc, deleteDoc, doc, getDocs} from '@angular/fire/firestore';
import { collection, DocumentReference } from 'firebase/firestore';
import { Observable } from 'rxjs';
import {CookieService} from "../Services/cookie.service";
import {FormsModule} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";
import {RouterLink} from "@angular/router";
import crypto from 'crypto-js';
import {HomeButtonComponent} from "../home-button/home-button.component";

interface User {
  id?: string;
  username: string;
  password: string;
  plainPassword?: string;
  isTeacher: boolean;
  courseId: string;
}
interface Course {
  id?: string;
  name: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    RouterLink,
    HomeButtonComponent
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  newUser: User = { username: '', password: '', isTeacher: false, courseId: '' };
  newCourse: Course = { name: ''};
  selectedCourseId: string | undefined = '';
  users$: Observable<User[]>;
  users: User[] = [];
  courses$: Observable<Course[]>;
  courses: Course[] = [];
  showAddUserForm = false;
  showAddCourseForm = false;
  filteredUsers: User[] = [];
  showCourseManagement: boolean = true;

  constructor(private firestore: Firestore, private cookieService: CookieService) {
    const usersCollection = collection(this.firestore, 'user');
    this.users$ = collectionData(usersCollection, { idField: 'id' }) as Observable<User[]>;

    const coursesCollection = collection(this.firestore, 'courses');
    this.courses$ = collectionData(coursesCollection, { idField: 'id' }) as Observable<Course[]>;
  }

  ngOnInit() {
    this.users$.subscribe(users => {
      this.users = users.filter(user => !user.isTeacher);
    });

    this.courses$.subscribe(courses => {
      this.courses = courses;
    });
  }

  filterUsersByCourse() {
    this.filteredUsers = this.users.filter(u => u.courseId === this.selectedCourseId);
  }


  async addUser() {
    const plainPassword = this.newUser.username + Math.floor(Math.random() * 10000);
    const hashedPassword = crypto.SHA256(plainPassword).toString();
    const newUser = { ...this.newUser, password: hashedPassword, plainPassword: plainPassword, courseId: this.selectedCourseId };
    await addDoc(collection(this.firestore, 'user'), newUser);
    this.newUser.username = '';
    this.newUser.password = '';
    this.showAddUserForm = false;
    this.filterUsersByCourse();
  }

  async removeUser(user: User) {
    if (user.id) {
      const userDocRef = doc(this.firestore, 'user', user.id) as DocumentReference;
      await deleteDoc(userDocRef);
      this.users = this.users.filter(u => u.id !== user.id);
    }
  }

  async addCourse() {
    await addDoc(collection(this.firestore, 'courses'), this.newCourse);
    this.newCourse.name = '';
    this.showAddCourseForm = false;
  }

  async removeCourse(course: Course) {
    if (course.id) {
      const courseDocRef = doc(this.firestore, 'courses', course.id) as DocumentReference;
      await deleteDoc(courseDocRef);
      // Remove associated users
      const usersQuerySnapshot = await getDocs(collection(this.firestore, 'user'));
      const usersToDelete = usersQuerySnapshot.docs.filter(userDoc => userDoc.data()['courseId'] === course.id);
      for (const userDoc of usersToDelete) {
        await deleteDoc(userDoc.ref);
      }
      this.courses = this.courses.filter(c => c.id !== course.id);
    }
  }

  selectCourse(course: Course) {
    this.selectedCourseId = course.id;
    this.showCourseManagement = false;
    this.filterUsersByCourse();
  }

  showCourseManagementView() {
    this.showCourseManagement = true;
  }
}
