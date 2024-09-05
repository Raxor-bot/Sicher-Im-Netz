import {Component, inject} from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import { SHA256 } from 'crypto-js';
import {FormsModule} from "@angular/forms";
import {addDoc, collection, Firestore} from "@angular/fire/firestore";
import {NgIf} from "@angular/common";
import {HomeButtonComponent} from "../home-button/home-button.component";
import {CookieService} from "../Services/cookie.service";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    HomeButtonComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  teacherName = '';
  teacherPassword = '';
  firestore = inject(Firestore);
  isRegistered = false;
  cookieService = inject(CookieService);

  constructor() {}

  async registerTeacher(event: Event) {
    event.preventDefault();

    const coll = collection(this.firestore, 'user');
    try{
      const hashedPassword = SHA256(this.teacherPassword).toString();

      const docRef = await addDoc(coll, {username: this.teacherName, password: hashedPassword, isTeacher: true});
      this.isRegistered = true;
      this.cookieService.setUserRole('teacher', 1);
    } catch (e) {
      alert("Fehler bei der Regestrierung");
    }
  }
}
