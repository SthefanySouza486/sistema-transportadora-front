import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
   menuAberto = false; 
   isLogin = false;

   constructor(public router: Router, public authService: AuthService) {  }

   ngOnInit() {
     this.router.events.subscribe(event => {
       if (event instanceof NavigationEnd) {
         this.isLogin = this.router.url.includes('/login') || this.router.url === '/';
       }
     });
     this.isLogin = this.router.url.includes('/login') || this.router.url === '/';
   }

   sair(): void {
     this.authService.sair(); 
     this.router.navigate(['/login']); 
   }
}
