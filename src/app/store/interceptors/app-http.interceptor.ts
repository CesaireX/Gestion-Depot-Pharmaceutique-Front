import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import {AuthService} from "../services/gestock-service/Auth.service";

@Injectable()
export class AppHttpInterceptor implements HttpInterceptor {

  constructor(private  authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
      if(!request.url.includes("/auth/signin"!)){
          let newReq = request.clone({
              headers: request.headers.set('Authorization', 'Bearer '+this.authService.token)
          })
          return next.handle(newReq).pipe(
            catchError(err => {
                if(err.status===401){
                    this.authService.logout();
                }
                    return throwError(err.message)
            })
          );
      }else {
          return next.handle(request);
      }
  }
}
