import { Component } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HomeButtonComponent} from "../../home-button/home-button.component";
import {NgForOf, NgIf} from "@angular/common";
import {CookieService} from "../../Services/cookie.service";
import {Firestore, getDocs, query, where} from "@angular/fire/firestore";
import {Router} from "@angular/router";
import {collection} from "firebase/firestore";

@Component({
  selector: 'app-smartphone',
  standalone: true,
  imports: [
    FormsModule,
    HomeButtonComponent,
    NgForOf,
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './smartphone.component.html',
  styleUrl: './smartphone.component.css'
})
export class SmartphoneComponent {
  currentStep: number = 1;
  sessionID: string = '';
  isTeacher: boolean = false;
  isCorrect: boolean = this.isTeacher;
  quizResult: boolean = false;
  quizResultMessage: string = '';
  quizExplanation: string = '';
  correctAnswers: { [key: string]: string } = {
    q1: 'b',
    q2: 'b',
    q3: 'a'
  };

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
    this.isCorrect = this.isTeacher;
  }

  goToPrevious(): void {
    this.currentStep--;
    this.isCorrect = this.isTeacher;
  }

  checkQuiz(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    let score = 3;
    let allCorrect = true;

    for (let i = 1; i <= 3; i++) {
      const questionName = `q${i}`;
      const selectedAnswer = (form.elements.namedItem(questionName) as RadioNodeList).value;

      if (selectedAnswer !== this.correctAnswers[questionName]) {
        allCorrect = false;
        score--;
      }
    }

    this.quizResult = true;
    this.quizResultMessage = score === 3 ? 'Super, alle Antworten sind richtig!' : `Du hast ${score} von 3 Fragen richtig beantwortet.`;
    this.quizExplanation = score === 3 ? 'Du hast ein sehr gutes Verständnis von Smartphone-Sicherheit!' : 'Überlege, welche Fragen du falsch beantwortet hast, und schau dir die richtigen Antworten noch einmal an.';
    this.isCorrect = allCorrect;
  }
}
