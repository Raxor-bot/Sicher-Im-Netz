import { Injectable } from '@angular/core';
import CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class CookieService {

  setCookie(name: string, value: string, days: number) {
    let expires = "";
    if (days > 0) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }

  getCookie(name: string): string {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return "";
  }

  deleteCookie(name: string) {
    document.cookie = name + "=; Max-Age=-99999999;";
  }

  setUserRole(role: 'teacher' | 'student', days: number) {
    this.setCookie('userRole', role, days);
  }
}
