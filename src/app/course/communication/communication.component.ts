import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeButtonComponent } from '../../home-button/home-button.component';
import { NgForOf, NgIf } from '@angular/common';
import { collection } from 'firebase/firestore';
import { Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { CookieService } from '../../Services/cookie.service';

@Component({
  selector: 'app-communication',
  standalone: true,
  imports: [
    FormsModule,
    HomeButtonComponent,
    NgForOf,
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './communication.component.html',
  styleUrl: './communication.component.css'
})
export class CommunicationComponent {
  currentStep = 1;
  decryptedMessage = '';
  decryptionFeedback = '';
  decryptionCorrect = false;
  sessionID: string = '';
  isTeacher: boolean = false;

  constructor(private cookieService: CookieService, private firestore: Firestore) {}

  /**
   * Initialisiert die Komponente und überprüft, ob der Benutzer ein Lehrer ist basierend auf der Session-ID.
   */
  async ngOnInit() {
    this.sessionID = this.cookieService.getCookie('sessionID') || '';

    if (this.sessionID) {
      const coll = collection(this.firestore, 'user');
      const q = query(coll, where('sessionID', '==', this.sessionID));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        this.isTeacher = userData['isTeacher'];
      }
    }
  }

  /**
   * Geht zum nächsten Schritt und setzt relevante Variablen zurück.
   */
  goToNext() {
    this.currentStep++;
    this.resetDecryption();
  }

  /**
   * Geht zum vorherigen Schritt und setzt relevante Variablen zurück.
   */
  goToPrevious() {
    this.currentStep--;
    this.resetDecryption();
  }

  /**
   * Überprüft die Eingabe des Benutzers für die Caesar-Entschlüsselungsübung.
   */
  checkCaesarDecryption() {
    if (this.decryptedMessage.toLowerCase() === 'ich kam, ich sah, ich siegte') {
      this.decryptionFeedback = 'Richtig!';
      this.decryptionCorrect = true;
    } else {
      this.decryptionFeedback = 'Versuche es nochmal.';
    }
  }

  /**
   * Überprüft die Eingabe des Benutzers für die Vigenère-Entschlüsselungsübung.
   */
  checkVingreDecryption() {
    if (this.decryptedMessage.toLowerCase() === 'das ist ein langer satz, das nervt, oder?!') {
      this.decryptionFeedback = 'Richtig!';
      this.decryptionCorrect = true;
    } else {
      this.decryptionFeedback = 'Versuche es nochmal.';
    }
  }

  /**
   * Setzt die Variablen, die mit der Entschlüsselung zusammenhängen, zurück.
   */
  private resetDecryption() {
    this.decryptionFeedback = '';
    this.decryptionCorrect = this.isTeacher;
    this.decryptedMessage = '';
  }
}
