import {Component, inject, Renderer2} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {filter} from "rxjs";
import {collection, Firestore, getDocs} from "@angular/fire/firestore";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})

export class AppComponent {
  title = 'Sicher-Im-Netz';
  testData: any;
  firestore = inject(Firestore);

  constructor(private renderer: Renderer2, private router: Router) { }

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const currentRoute = this.router.routerState.root.snapshot.firstChild;
      if (currentRoute && currentRoute.data['background']) {
        const colors = currentRoute.data['background'];
        document.body.style.background = `linear-gradient(to bottom right, ${colors[0]}, ${colors[1]})`;
      } else {
        document.body.style.background = 'linear-gradient(to bottom right, #e0f7fa, rgba(0, 161, 142, 0.56))'; // Standardfarbe
      }
    });

    getDocs(collection(this.firestore, "testPath")).then((response) => {
      console.log(response.docs)
    });

    this.createBinaryAnimation();
  }

  createBinaryAnimation() {
    const animationContainer = document.querySelector('.background-animation');
    setInterval(() => {
      const binaryElement = this.renderer.createElement('div');
      this.renderer.addClass(binaryElement, 'binary-animation');
      this.renderer.setProperty(binaryElement, 'innerText', this.generateRandomBinaryString());
      this.renderer.setStyle(binaryElement, 'left', `${Math.random() * 100}%`);
      this.renderer.setStyle(binaryElement, 'animationDuration', `${5 + Math.random() * 5}s`);
      this.renderer.appendChild(animationContainer, binaryElement);

      // Entferne das Element nach der Animation
      setTimeout(() => {
        this.renderer.removeChild(animationContainer, binaryElement);
      }, 10000);
    }, 1000);
  }

  generateRandomBinaryString(): string {
    const length = Math.floor(Math.random() * 5) + 3; // Zufällige Länge zwischen 3 und 7
    let binaryString = '';
    for (let i = 0; i < length; i++) {
      binaryString += Math.random() < 0.5 ? '0' : '1';
    }
    return binaryString;
  }
}
