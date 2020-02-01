import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import {FirebaseAuth} from '@angular/fire';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userData: Observable<firebase.User>;

  constructor(private auth: AngularFireAuth, private router: Router) {
    this.userData = auth.authState;
  }

  signIn(email: string, password: string) {
    this.auth
      .auth.signInWithEmailAndPassword(email, password).then(res => {
        console.log('OK!');
        this.router.navigate(['admin']);
    }).catch(err => {
      console.log('KO!');
      this.router.navigate(['/']);
    });
  }

  signOut() {
    this.auth.auth.signOut();
    this.router.navigate(['/']);
  }
}
