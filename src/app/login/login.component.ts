import {Component, inject} from '@angular/core';
import crypto from 'crypto-js';
import {Router} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";
import {collection, doc, Firestore, getDocs, query, updateDoc, where} from "@angular/fire/firestore";
import {CookieService} from "../Services/cookie.service";
import {HomeButtonComponent} from "../home-button/home-button.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    HomeButtonComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  rememberMe = false;
  firestore = inject(Firestore);
  cookieService = inject(CookieService);
  hasError: boolean = false;
  userRole: string = '';

  constructor(private router: Router) {
  }

  async login(event: Event) {
    event.preventDefault();


    const coll = collection(this.firestore, 'user');
    const hashedPassword = crypto.SHA256(this.password).toString();
    const q = query(coll, where('username', '==', this.username), where('password', '==', hashedPassword));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const sessionID = crypto.lib.WordArray.random(128 / 8).toString();
      await updateDoc(doc(this.firestore, 'user', userDoc.id), { sessionID });

      const expireDays = this.rememberMe ? 7 : 0;

      console.log(expireDays)

      this.cookieService.setCookie('sessionID', sessionID, expireDays);



      await this.router.navigate(['/']);
    } else {
      if (!this.hasError){
        const error = document.getElementById("error");
        const p = document.createElement("p");
        p.textContent = "Anmeldung nicht erfolgreich, Passwort richtig ?";
        error?.appendChild(p)
        this.hasError = true;
        this.username = "";
        this.password = "";
      }
      else{
        this.username = "";
        this.password = "";
      }
    }
  }
}
