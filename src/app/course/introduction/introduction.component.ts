import { Component, inject, Renderer2 } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  onSnapshot,
  getDoc
} from '@angular/fire/firestore';
import { NgClass, NgForOf, NgIf, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomeButtonComponent } from '../../home-button/home-button.component';
import {CookieService} from "../../Services/cookie.service";

interface Url {
  address: string;
  checked: boolean;
  correct: boolean;
  checkedCorrectly?: boolean;
}

@Component({
  selector: 'app-introduction',
  standalone: true,
  imports: [
    NgIf,
    NgStyle,
    FormsModule,
    NgForOf,
    HomeButtonComponent,
    NgClass
  ],
  templateUrl: './introduction.component.html',
  styleUrls: ['./introduction.component.css']
})
export class IntroductionComponent {
  currentStep: number = 1;
  roomName1: string = '';
  roomName2: string = '';
  roomId: string = '';
  studentName: string = '';
  students: any[] | undefined;
  firestore = inject(Firestore);
  isTeacher: boolean = false;
  assignedProblem: string = '';
  unsubscribe: (() => void) | undefined;

  urls: Url[] = [
    { address: 'http://www.Adresse1.com', checked: false, correct: false },
    { address: 'https://www.Adresse2.com', checked: false, correct: true },
    { address: 'https://www.google.com', checked: false, correct: true },
    { address: 'https://www.google.de', checked: false, correct: true },
    { address: 'http://www.google.com', checked: false, correct: false },
    { address: 'https://www.g00gle.com', checked: false, correct: false },
    { address: 'https://www.instagram.com', checked: false, correct: true },
    { address: 'https://www.1stagram.com', checked: false, correct: false }
  ];
  feedback: string = '';
  allCorrect: boolean = false;
  userSolution: string = "";
  showExplanationText = false;
  userRole: string = '';
  sessionID: string = '';

  cookieQuizAnswers: { text: string, correct: boolean, selected: boolean }[] = [
    { text: 'Cookies können dir helfen, dich auf einer Website schneller einzuloggen.', correct: true, selected: false },
    { text: 'Cookies können deine persönlichen Daten ohne deine Zustimmung sammeln.', correct: true, selected: false },
    { text: 'Alle Cookies sind schlecht und sollten immer blockiert werden.', correct: false, selected: false }
  ];
  cookieQuizFeedback: string = '';

  constructor(private cookieService: CookieService) {
    this.isTeacher = this.cookieService.getCookie('userRole') === 'teacher';
  }

  async ngOnInit(){
    this.sessionID = this.cookieService.getCookie('sessionID') || '';

    if (this.sessionID) {

      const coll = collection(this.firestore, 'user');
      const q = query(coll, where('sessionID', '==', this.sessionID));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        this.studentName = userData['username'];
        this.isTeacher = userData['isTeacher'];
      }
    }
  }

  ngOnDestroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  showExplanation() {
    this.showExplanationText = !this.showExplanationText;
  }

  goToNext(): void {
    this.currentStep++;
    this.userSolution = "";
    this.allCorrect = this.isTeacher;

  }

  goToPrevious(): void {
    this.currentStep--;
    this.userSolution = "";
    this.allCorrect = this.isTeacher;
  }

  async createRoom(event: Event) {
    event.preventDefault();
    const coll = collection(this.firestore, 'rooms');
    try {
      const docRef = await addDoc(coll, { name: this.roomName1 });
      console.log('Raum erstellt mit ID:', docRef.id);
      this.roomId = docRef.id;
      this.isTeacher = true;
      this.subscribeToRoom();
    } catch (error) {
      console.error('Fehler beim Erstellen des Raums:', error);
    }
  }

  async joinRoom(event: Event) {
    event.preventDefault();
    const coll = collection(this.firestore, 'rooms');
    const q = query(coll, where('name', '==', this.roomName2));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const roomDoc = querySnapshot.docs[0];
      this.roomId = roomDoc.id;
      this.students = roomDoc.data()['students'] || [];
      // @ts-ignore
      this.students.push(this.studentName);
      const roomRef = doc(this.firestore, 'rooms', this.roomId);
      await updateDoc(roomRef, { students: this.students });
      console.log('Raum gefunden und beigetreten:', this.roomId);
      this.subscribeToRoom();
    } else {
      console.log('Raum nicht gefunden.');
    }
  }

  async startSession() {
    const roomRef = doc(this.firestore, 'rooms', this.roomId);
    const cyberProblems = ['Malware', 'Phishing', 'Ransomware', 'Spyware', 'Adware'];
    const shuffledProblems = this.shuffleArray(cyberProblems);
    const groups = {};
    // @ts-ignore
    for (let i = 0; i < this.students.length; i++) {
      const problem = shuffledProblems[i % shuffledProblems.length];
      // @ts-ignore
      if (!groups[problem]) {
        // @ts-ignore
        groups[problem] = [];
      }
      // @ts-ignore
      groups[problem].push(this.students[i]);
    }
    await updateDoc(roomRef, { groups: groups });
    console.log('Session gestartet:', groups);
  }

  shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  print(){
   let popup = window.open("assets/kreuzwort.png");
   // @ts-ignore
    popup.window.print();
  }

  subscribeToRoom() {
    const roomRef = doc(this.firestore, 'rooms', this.roomId);
    this.unsubscribe = onSnapshot(roomRef, (doc) => {
      if (doc.exists()) {
        console.log('Dokumentdaten:', doc.data());
        this.students = doc.data()['students'] || [];
        const groups = doc.data()['groups'] || {};
        console.log('Aktuelle students:', this.students);
        console.log('Aktuelle groups:', groups);
        if (this.studentName) {
          console.log('studentName ist gesetzt:', this.studentName);
          this.assignedProblem = Object.keys(groups).find(key => groups[key].includes(this.studentName)) || '';
          if (this.assignedProblem) {
            console.log('Zugewiesenes Problem:', this.assignedProblem);
            this.currentStep = 5;
          } else {
            console.log('Kein Problem zugewiesen.');
          }
        } else {
          console.log('studentName ist nicht gesetzt.');
        }
      } else {
        console.log('Dokument existiert nicht.');
      }
    });
  }

  checkAnswers(): void {
    let correctCount = 0;
    this.urls.forEach((url) => {
      url.checkedCorrectly = url.checked === url.correct;
      if (url.checkedCorrectly) correctCount++;
    });
    this.feedback = `${correctCount} von ${this.urls.length} korrekt`;
    this.allCorrect = correctCount === this.urls.length;
  }

  checkSolution() {
    const solution = 'CYBERSICHERHEIT';

    if (this.userSolution.trim().toUpperCase() === solution) {
      this.allCorrect = true;
      this.feedback = 'Richtig! Gut gemacht!';
    } else {
      this.feedback = 'Falsch, Frage deine .';
    }
  }

  checkCookieQuizAnswers(): void {
    let correctAnswers = 0;
    this.cookieQuizAnswers.forEach(answer => {
      if (answer.selected === answer.correct) {
        correctAnswers++;
      }
    });

    if (correctAnswers === this.cookieQuizAnswers.length) {
      this.cookieQuizFeedback = "Super! Du hast alle Fragen richtig beantwortet.";
      this.allCorrect = true;
    } else {
      this.cookieQuizFeedback = `Du hast ${correctAnswers} von ${this.cookieQuizAnswers.length} richtig beantwortet. Überprüfe deine Antworten nochmal!`;
    }
  }

}
