import { Routes } from '@angular/router';
import { IntroductionComponent} from "./course/introduction/introduction.component";
import { HomeComponent} from "./home/home.component";
import { PasswordsComponent} from "./course/passwords/passwords.component";
import { SocialNetworkComponent} from "./course/social-network/social-network.component";
import { CommunicationComponent} from "./course/communication/communication.component";
import {CoursePasswordComponent} from "./course-password/course-password.component";
import {RegisterComponent} from "./register/register.component";
import {LoginComponent} from "./login/login.component";
import {SettingsComponent} from "./settings/settings.component";
import {SmartphoneComponent} from "./course/smartphone/smartphone.component";

export const routes: Routes = [
  { path: '', component: HomeComponent},
  { path: 'password/:course', component: CoursePasswordComponent },
  { path: 'kurs/introduction', component: IntroductionComponent, data: { background: ['rgba(130,207,134,0.78)', 'rgb(196,221,183)'] }},
  { path: 'kurs/passwordSecurity', component: PasswordsComponent, data: { background: ['rgb(253,238,154)', 'rgb(247,241,194)']}},
  { path: 'kurs/socialNetwork', component: SocialNetworkComponent },
  { path: 'kurs/communication', component: CommunicationComponent },
  { path: 'kurs/smartphone', component: SmartphoneComponent, data: { background: ['rgb(253,238,154)', 'rgb(247,241,194)']}},
  { path: 'kurs/register', component: RegisterComponent },
  { path: 'kurs/login', component: LoginComponent },
  { path: 'settings', component: SettingsComponent },
];
