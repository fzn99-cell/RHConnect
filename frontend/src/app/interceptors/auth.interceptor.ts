import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Clone request to include credentials
  const updatedReq = req.clone({
    withCredentials: true, // Send cookies with every request
  });

  return next(updatedReq);
};
