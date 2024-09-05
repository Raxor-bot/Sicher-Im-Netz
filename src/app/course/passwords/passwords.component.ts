import { Component } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {HomeButtonComponent} from "../../home-button/home-button.component";
import {NgForOf, NgIf} from "@angular/common";
import {CookieService} from "../../Services/cookie.service";
import {Firestore, getDocs, query, updateDoc, where} from "@angular/fire/firestore";
import crypto from 'crypto-js';
import {collection} from "firebase/firestore";
import {Router} from "@angular/router";

@Component({
  selector: 'app-passwords',
  standalone: true,
  imports: [
    FormsModule,
    HomeButtonComponent,
    NgForOf,
    NgIf
  ],
  templateUrl: './passwords.component.html',
  styleUrl: './passwords.component.css'
})
export class PasswordsComponent {
  currentStep: number = 1;
  isAnswerCorrect: boolean = false;
  passwordCorrect: boolean = false;
  displayedTips: string[] = [];
  enteredPassword: string = '';
  insecurePassword: string = '1234';
  passwordFeedback: string = '';
  sessionID: string = "";


  canRequestTip: boolean = true;
  tipTimer: any;
  timeLeft: number = 0;

  passwordInput: string = '';

  tips: string[] = [
    'Das Passwort enthält das Geburtsjahr.',
    'Das Passwort endet mit einem Sonderzeichen.',
    'Das Passwort enthält die Lieblingsfarbe.',
    'Die Groß- und Kleinschreibung ist wichtig!',
    'Das Passwort enthält den Namen des Haustiers.'
  ];
  quizResult: boolean = false;
  quizResultMessage: string = '';
  quizExplanation: string = '';

  correctAnswers: { [key: string]: string } = {
    q1: 'c',
    q2: 'b',
    q3: 'a',
    q4: 'b'
  };
  finalPassword: string = '';
  correctPasswordParts: string[] = ['Bello', '1990', 'Blau', '!'];
  isTeacher: boolean = false;



  constructor(private cookieService: CookieService, private firestore: Firestore, private router: Router) {}

  async ngOnInit(){
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
    console.log(this.isTeacher)
  }

  goToNext(): void {
    this.currentStep++;
    this.resetFlags();
  }

  goToPrevious(): void {
    this.currentStep--;
    this.resetFlags();
  }

  resetFlags(): void {
    this.passwordCorrect = this.isTeacher;
    this.quizResult = this.isTeacher;
    this.isAnswerCorrect = this.isTeacher;
  }

  checkPassword(): void {
    let correctPartsCount = 0;

    this.correctPasswordParts.forEach(part => {
      if (this.enteredPassword.includes(part)) {
        correctPartsCount++;
      }
    });

    if (correctPartsCount === this.correctPasswordParts.length && this.enteredPassword === this.correctPasswordParts.join('')) {
      this.passwordFeedback = 'Richtig! Das Passwort lautet Bello1990Blau!. Dieses Passwort ist unsicher, weil es persönliche Informationen und leicht erratbare Muster verwendet.';
      this.passwordCorrect = true;
    } else if (correctPartsCount > 0) {
      this.passwordFeedback = `${correctPartsCount} Teile deines Passworts sind korrekt. Aber Achtung, eventuell nicht die Position. Versuche es weiter!`;
    } else {
      this.passwordFeedback = 'Falsch. Versuche es noch einmal oder fordere einen Tipp an.';
    }
  }

  getTip(): void {
    if (this.canRequestTip) {
      if (this.displayedTips.length < this.tips.length) {
        this.displayedTips.push(this.tips[this.displayedTips.length]);
        this.startTipTimer();
      } else {
        this.passwordFeedback = 'Es gibt keine weiteren Tipps mehr.';
      }
    }
  }

  startTipTimer(): void {
    this.canRequestTip = false;
    this.timeLeft = 120; // 2 Minuten in Sekunden
    this.tipTimer = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.canRequestTip = true;
        clearInterval(this.tipTimer);
      }
    }, 1000); // Countdown in Sekunden
  }

  validatePassword(): void {
    const password = this.passwordInput;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    this.passwordCorrect = hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && isLongEnough;
  }

  checkQuiz(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    let score = 4;
    let allCorrect = true;

    for (let i = 1; i <= 4; i++) {
      const questionName = `q${i}`;
      const selectedAnswer = (form.elements.namedItem(questionName) as RadioNodeList).value;

      if (selectedAnswer !== this.correctAnswers[questionName]) {
        allCorrect = false;
        score--;
      }
    }

    this.quizResult = true;
    this.quizResultMessage = score === 4 ? 'Super, alle Antworten sind richtig!' : `Du hast ${score} von 4 Fragen richtig beantwortet.`;
    this.quizExplanation = score === 4 ? 'Du hast ein sehr gutes Verständnis von Passwortsicherheit!' : 'Überlege, welche Fragen du falsch beantwortet hast, und schau dir die richtigen Antworten noch einmal an.';
    this.isAnswerCorrect = allCorrect;
  }

  async setPassword() {
    const sessionID = this.cookieService.getCookie('sessionID');

    if (this.finalPassword && sessionID) {
      try {
        const userCollection = collection(this.firestore, 'user');
        const q = query(userCollection, where('sessionID', '==', sessionID));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const hashedPassword = crypto.SHA256(this.finalPassword).toString();

          await updateDoc(userDoc.ref, { password: hashedPassword });

          this.passwordFeedback = 'Passwort erfolgreich aktualisiert. Du wirst in 10 Sekunden abgemeldet.';
          setTimeout(() => {
            this.logout();
          }, 10000);
        } else {
          this.passwordFeedback = 'Kein Benutzer mit dieser Session-ID gefunden.';
        }
      } catch (error) {
        this.passwordFeedback = 'Fehler beim Aktualisieren des Passworts.';
      }
    } else {
      this.passwordFeedback = 'Passwort oder Session-ID fehlt.';
    }
  }

  logout() {
    this.cookieService.deleteCookie('sessionID');
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    clearTimeout(this.tipTimer);
  }
}
