import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CourseAuthService {

  private passwords : { [key: string]: string } = {
    register : 'Sicher-Im-Netz',
  };

  constructor() { }

  validatePassword(course: string, password: string): boolean {
    return password === this.passwords[course];
  }
}
