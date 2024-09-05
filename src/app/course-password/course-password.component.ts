import {Component, Input, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";
import {CourseAuthService} from "../Services/course-auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {CookieService} from "../Services/cookie.service";

@Component({
  selector: 'app-course-password',
  standalone: true,
  imports: [
    FormsModule,
    NgIf
  ],
  templateUrl: './course-password.component.html',
  styleUrl: './course-password.component.css'
})
export class CoursePasswordComponent implements OnInit{
  course: string = '';
  password: string = '';
  errorMessage: string = ''
  courseDisplayName: string = '';

  constructor(
    private courseAuthService: CourseAuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cookieService: CookieService,

  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.course = params.get('course') || '';
      const courseName = this.course.split('/').pop()!;
      this.courseDisplayName = this.capitalizeFirstLetter(courseName)

      const savedPassword = this.cookieService.getCookie(courseName);
      if (savedPassword && this.courseAuthService.validatePassword(courseName, savedPassword)) {
        this.router.navigate([`/kurs/${courseName}`]);
      }
    });
  }

  onSubmit(): void {
    const courseName = this.course.split('/').pop()!;
    if (this.courseAuthService.validatePassword(courseName, this.password)) {
      this.router.navigate([`/${this.course}`]);
      this.cookieService.setCookie(courseName, this.password, 7);
    } else {
      this.errorMessage = 'Falsches Passwort. Bitte versuche es erneut.';
    }
  }

  capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}
