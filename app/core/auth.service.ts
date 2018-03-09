import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { switchMap } from 'rxjs/operators';
import { User } from './user';
import { NotifyService } from './notify.service';

@Injectable()
export class AuthService {

  user$: Observable<User>;
  constructor(private afAuth: AngularFireAuth,
              private afs: AngularFirestore,
              private router: Router) {
      //// Get auth data, then get firestore user document || null
      this.user$ = this.afAuth.authState
        .switchMap(user => {
          if (user) {
            
            return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
             
          } else {
            return Observable.of(null)
          }
        })
  }


    ///// Login/Signup //////


  emailSignUp(email: string, password: string){
    console.log(email,password);
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
    .then((user) => {
      this.router.navigate(['dashboard']);
      return this.updateUserData(user);
      })
    .catch((error) => this.handleError(error));
  }

  displayName(name: string){
    console.log(name);
    
    
  }

  emailLogin(email: string, password: string){
    return this.afAuth.auth.signInWithEmailAndPassword(email, password)
    .then((user) => {
      this.router.navigate(['dashboard']);
      return this.updateUserData(user);
    })
  }
  
  googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider()
    return this.oAuthLogin(provider);
  }

  private oAuthLogin(provider) {
    return this.afAuth.auth.signInWithPopup(provider)
      .then((credential) => {
        this.router.navigate(['dashboard']);
        this.updateUserData(credential.user)
      })
  }

  signOut() {
    this.afAuth.auth.signOut();
    this.router.navigate(['form']);
  }

  private handleError(error: Error){
    console.error(error);
     // this.notify.update(error.message,'error');
    
  }

  private updateUserData(user) {
    // Sets user data to firestore on login
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
    const data: User = {
      uid: user.uid,
      email: user.email,
      roles: {
        subscriber: true
      }
    }
    return userRef.set(data, { merge: true })
  }

  // private usersId(user){
  //   const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
  //   return user.id;

  // }


  ///// Role-based Authorization //////

  canRead(user: User): boolean {
    const allowed = ['admin', 'editor', 'subscriber']
    return this.checkAuthorization(user, allowed)
  }

  canEdit(user: User): boolean {
    const allowed = ['admin', 'editor']
    return this.checkAuthorization(user, allowed)
  }

  canDelete(user: User): boolean {
    const allowed = ['admin']
    return this.checkAuthorization(user, allowed)
  }



  // determines if user has matching role
  private checkAuthorization(user: User, allowedRoles: string[]): boolean {
    if (!user) return false
    for (const role of allowedRoles) {
      if ( user.roles[role] ) {
        return true
      }
    }
    return false
  }


}
