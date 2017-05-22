import { Injectable } from '@angular/core';
import { AngularFireModule } from 'angularfire2';
import {
  AngularFireDatabase,
  AngularFireDatabaseModule,
  FirebaseListObservable,
  FirebaseObjectObservable
} from 'angularfire2/database';
import { AngularFireAuthModule, AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';
import { Observable, Subject, BehaviorSubject, ReplaySubject } from 'rxjs/Rx';

@Injectable()
export class NgFire {
  public auth: any;
  public messages: FirebaseListObservable<any>;
  public users: FirebaseListObservable<any>;
  public displayName: string;
  public email: string;
  public imageUrl: string;
  public user: FirebaseObjectObservable<any>;

  constructor(public afAuth: AngularFireAuth, public db: AngularFireDatabase) {
    this.afAuth.authState.subscribe(
      (auth) => {
        if (auth != null) {
          this.user = this.db.object('users/' + auth.uid);
        }
    });

    this.messages = this.db.list('messages');
    this.users = this.db.list('users');
  }

  // Register
  registerUser(email, password) {
    console.log(email);
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password);
  }

  // Save information to display on chat screen
  saveUserInfo(id, name, email) {
    return this.db.object('users/' + id).set({
      email: email,
      displayName: name
    });
  }

  // Login
  loginWithEmail(email, password) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password);
  }
  loginWithFacebook() {
    return this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider());
  }
  addUserInfo() {
    this.users.push({
      email: this.email,
      displayName: this.displayName,
    });
  }

  // Logout the current user
  logout() {
    return this.afAuth.auth.signOut();
  }

  sendMessage(text) {
    const message = {
      message: text,
      displayName: this.displayName,
      email: this.email,
      timestamp: Date.now(),
    };
    this.messages.push(message);
  }

  sendImage(file: File) {
    const storageRef = firebase.storage().ref();
    let uploadTask: firebase.storage.UploadTask;
    uploadTask = storageRef.child('images/' + this.afAuth.auth.currentUser.uid + '/' + Date.now() + '/' + file.name).put(file);

    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, null, (error) => {
      console.error('There was an error uploading file to Firebase Storage: ', error);
    }, () => {
      const url = uploadTask.snapshot.downloadURL;
      this.saveFile({
        displayName: this.displayName,
        email: this.email,
        imageUrl: url,
        timestamp: Date.now(),
      });
    });
  }

  sendFile(file: File) {
    const storageRef = firebase.storage().ref();
    let uploadTask: firebase.storage.UploadTask;
    uploadTask = storageRef.child('files/' + this.afAuth.auth.currentUser.uid + '/' + Date.now() + '/' + file.name).put(file);

    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, null, (error) => {
      console.error('There was an error uploading file to Firebase Storage: ', error);
    }, () => {
      const url = uploadTask.snapshot.downloadURL;
      this.saveFile({
        displayName: this.displayName,
        email: this.email,
        fileName: file.name,
        fileUrl: url,
        timestamp: Date.now(),
      });
    });
  }

  saveFile(file: any) {
    this.messages.push(file);
  }
}
