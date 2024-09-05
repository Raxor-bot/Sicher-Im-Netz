import { Component, inject } from '@angular/core';
import { Firestore, collection, addDoc, query, where, getDocs, updateDoc, doc, onSnapshot } from '@angular/fire/firestore';
import { NgIf, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomeButtonComponent } from '../../home-button/home-button.component';
import {CookieService} from "../../Services/cookie.service";

@Component({
  selector: 'app-social-network',
  standalone: true,
  imports: [
    FormsModule,
    HomeButtonComponent,
    NgForOf,
    NgIf
  ],
  templateUrl: './social-network.component.html',
  styleUrl: './social-network.component.css'
})
export class SocialNetworkComponent {
  currentStep = 1;
  isTeacher: boolean;
  sessionID: string = '';
  studentName: string = '';
  firestore = inject(Firestore);
  roomId: string = '';
  roomName1: string = '';
  roomName2: string = '';
  students: any[] | undefined;
  unsubscribe: (() => void) | undefined;
  assignedProblem: string = '';



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
    const socialPrpblems = ['Fakenews', 'Sucht', 'Realitaetsvorstellung', 'Cybermobbing', 'Trends'];
    const shuffledProblems = this.shuffleArray(socialPrpblems);
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
            this.currentStep = 4;
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

  ngOnDestroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  goToNext() {
    this.currentStep++;
  }

  goToPrevious() {
    this.currentStep--;
  }
}
