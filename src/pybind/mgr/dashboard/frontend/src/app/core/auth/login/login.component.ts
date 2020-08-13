import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthService } from '../../../shared/api/auth.service';
import { Credentials } from '../../../shared/models/credentials';
import { AuthStorageService } from '../../../shared/services/auth-storage.service';
import { ModalService } from '../../../shared/services/modal.service';

@Component({
  selector: 'cd-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  model = new Credentials();
  isLoginActive = false;
  next: string;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private authStorageService: AuthStorageService,
    private modalService: ModalService,
    private router: Router
  ) {}

  ngOnInit() {
    // console.debug(this.next);
    if (this.authStorageService.isLoggedIn()) {
    this.next = this.route.snapshot.queryParams['next'] || '';
    this.router.navigateByUrl(this.next);
    } else {
      // Make sure all open modal dialogs are closed. This might be
      // necessary when the logged in user is redirected to the login
      // page after a 401.
      this.modalService.dismissAll();

      let token: string = null;
      if (window.location.hash.indexOf('access_token=') !== -1) {
        token = window.location.hash.split('access_token=')[1];
        const uri = window.location.toString();
        window.history.replaceState({}, document.title, uri.split('?')[0]);
      }
      this.authService.check(token).subscribe((login: any) => {
        if (login.login_url) {
          if (login.login_url === '#/login') {
            this.isLoginActive = true;
          } else {
            window.location.replace(login.login_url);
          }
        } else {
          this.authStorageService.set(
            login.username,
            token,
            login.permissions,
            login.sso,
            login.pwdExpirationDate
          );
          this.router.navigateByUrl(this.next);
        }
      });
    }
  }

  login() {
    this.authService.login(this.model).subscribe(() => {
      this.router.navigateByUrl(this.next);
    });
  }
}
