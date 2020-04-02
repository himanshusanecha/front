import { Pipe, PipeTransform } from '@angular/core';
import { isObservable, Observable, of } from 'rxjs';
import { map, startWith, catchError } from 'rxjs/operators';

export interface AsyncState<T> {
  pending: boolean;
  value?: T;
  error?: any;
}

@Pipe({
  name: 'asyncState',
})
export class AsyncStatePipe implements PipeTransform {
  transform<T>(
    value: Observable<T> | T,
    pendingIf: T = null
  ): Observable<AsyncState<T>> {
    if (!isObservable(value)) {
      return of({
        pending: false,
        value,
      });
    }

    return value.pipe(
      // Map value changes to AsyncState
      map(
        (value: T): AsyncState<T> => ({
          pending: typeof value === 'undefined' || value === pendingIf,
          value,
        })
      ),

      // Initial AsyncState emission
      startWith({
        pending: true,
      }),

      // Catch errors and transform onto AsyncState
      catchError(error =>
        of({
          pending: false,
          error,
        })
      )
    );
  }
}
