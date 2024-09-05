import {Component, inject} from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {NgForOf, NgIf} from "@angular/common";
import {CookieService} from "../Services/cookie.service";
import {collection, Firestore, getDocs, query, where} from "@angular/fire/firestore";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    NgForOf,
    NgIf
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  courses = [
    { title: 'Internetsicherheit', description: 'Grundlagen der Internetsicherheit', route: 'kurs/introduction' },
    { title:  'Passwörter', description: 'Passwortsicherheit einfach gemacht', route: 'kurs/passwordSecurity' },
    { title: 'Soziale Medien', description: 'Soziale Netzwerke und ihre Risiken', route: 'kurs/socialNetwork' },
    { title: 'Verschlüsslungen', description: 'Sichere Kommunikation im Netz', route: 'kurs/communication'},
    { title: 'Smartphone', description: 'Dein digitaler mobiler Computer', route: 'kurs/smartphone'}
  ];

  username: string = '';
  isLogin: boolean = false;
  isTeacher: boolean = false;
  firestore = inject(Firestore);
  cookieService = inject(CookieService);
  router = inject(Router);

  constructor() {
  }

  ngOnInit() {
    this.checkLogin();
  }

  async checkLogin() {
    const sessionID = this.cookieService.getCookie('sessionID');
    console.log(sessionID)

    if (sessionID) {

      const coll = collection(this.firestore, 'user');
      const q = query(coll, where('sessionID', '==', sessionID));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        this.username = userData['username'];
        this.isTeacher = userData['isTeacher'];
        this.isLogin = true;
      } else {
        this.logout();
      }
    }
  }

  logout() {
    this.cookieService.deleteCookie('sessionID');
    this.isLogin = false;
    this.username = '';
    this.isTeacher = false;
  }

  navigateToSettings() {
    this.router.navigate(['/settings']);
  }
}
