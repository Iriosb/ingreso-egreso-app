import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import Swal from 'sweetalert2';
import * as firebase from 'firebase';
import { User } from './user.model';
import { AppState } from '../app.reducer';
import { ActivarLoadingAction, DesactivarLoadingAction } from '../shared/ui.actions';
import { Observable, Subscription } from 'rxjs';
import { SetUserAction, UnsetUserAction } from './auth.actions';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  usersCollection: AngularFirestoreCollection<User>;
  items: Observable<User[]>;
  usuario: User;

  private userSubscription: Subscription = new Subscription();

  constructor(private afAuth: AngularFireAuth, private router: Router, private store: Store<AppState>, private afDB: AngularFirestore) { 
    this.usersCollection = this.afDB.collection('usuarios');
    this.items = this.usersCollection.valueChanges();
  }

  initAuthListener() {
    this.afAuth.authState.subscribe( (fbUser: firebase.User) => {
      if(fbUser) {
        this.userSubscription = this.afDB.doc<User>(`usuarios/${ fbUser.uid}`).valueChanges()
        .subscribe(usuarioObj => {
          const newUser = new User(usuarioObj);
          this.store.dispatch(new SetUserAction(newUser));
          this.usuario = newUser;
        });
      } else {
        this.usuario = null;
        this.userSubscription.unsubscribe();
      }
    });
  }

  crearUsuario( nombre: string, email: string, password: string) {

    this.store.dispatch(new ActivarLoadingAction());
    
    this.afAuth.auth.createUserWithEmailAndPassword(email, password)
    .then(resp => {

      console.log("crearUsuario", resp.user.uid, nombre, resp.user.email);
      const user: User = {
        uid: resp.user.uid,
        nombre: nombre,
        email: resp.user.email
      };

      this.usersCollection.doc(`${ user.uid }`).set(user)
      .then(() => {
        this.router.navigate(['/']);
        this.store.dispatch(new DesactivarLoadingAction());
      }).catch ( error => {
        console.error(error);
        Swal.fire('Error en el registro', error.message, 'error');
        this.store.dispatch(new DesactivarLoadingAction());
      });
      
    }).catch ( error => {
      console.error(error);
      Swal.fire('Error en el register', error.message, 'error');
      this.store.dispatch(new DesactivarLoadingAction());
    })

  }

  login(email: string, password: string) {

    this.store.dispatch(new ActivarLoadingAction());
    this.afAuth.auth.signInWithEmailAndPassword(email, password)
    .then(resp => {
      this.router.navigate(['/']);
      this.store.dispatch(new DesactivarLoadingAction());
      
    }).catch ( error => {
      console.error(error);
      Swal.fire('Error en el login', error.message, 'error');
      this.store.dispatch(new DesactivarLoadingAction());
    })
  }

  logout() {
    this.router.navigate(['/login']);
    this.afAuth.auth.signOut();

    this.store.dispatch(new UnsetUserAction());
  }

  isAuth() {
    return this.afAuth.authState.pipe(
      map(fbUser => {
        if(fbUser == null){
          this.router.navigate(['/login']);
        }
        return fbUser != null 
      })
    );
  }

  
  getUsuario() {
    return {...this.usuario}
  }
}
