import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { catchError, filter, last, map, switchAll, tap } from 'rxjs/operators';
import { MonoTypeOperatorFunction, Observable, of, throwError } from 'rxjs';
import { HttpEvent, HttpEventType } from '@angular/common/http';

export enum UploadEventType {
  Progress = 1000,
  Success,
  Fail,
}

export type UploadEventPayload = { progress?: number; response?: any };

export interface UploadEvent {
  type: UploadEventType;
  payload: UploadEventPayload;
}

@Injectable()
export class AttachmentApiService {
  constructor(protected api: ApiService) {}

  fileToGuid = (
    progressFn?: (inProgress: boolean, progress: number) => void,
    errorFn?: (e) => void
  ): MonoTypeOperatorFunction<File | null> => input$ =>
    input$.pipe(
      map(file =>
        this.upload(file).pipe(
          tap(uploadEvent => {
            if (!progressFn) {
              return;
            }

            if (!uploadEvent) {
              progressFn(false, 0);
              return;
            }

            switch (uploadEvent.type) {
              case UploadEventType.Progress:
                progressFn(true, uploadEvent.payload.progress);
                break;

              case UploadEventType.Success:
              case UploadEventType.Fail:
              default:
                progressFn(false, 0);
                break;
            }
          }),
          catchError(e => {
            if (errorFn) {
              errorFn(e);
            }

            return of(null);
          }),
          last()
        )
      ),
      switchAll(),
      map(uploadEvent =>
        uploadEvent && uploadEvent.type == UploadEventType.Success
          ? uploadEvent.payload.response.guid
          : null
      )
    );

  upload(file: File | null): Observable<UploadEvent | null> {
    if (!file) {
      return of(null);
    }

    if (/image\/.+/.test(file.type)) {
      return this.uploadToApi(file);
    } else if (/video\/.+/.test(file.type)) {
      return this.uploadToS3(file);
    }

    return throwError(new Error(`You cannot attach a ${file.type} file`));
  }

  protected uploadToS3(file: File): Observable<UploadEvent> {
    return throwError(new Error(`Not Implemented`));
  }

  protected uploadToApi(file: File): Observable<UploadEvent> {
    return this.api
      .post(
        `api/v1/media`,
        {
          'file[]': file,
        },
        { upload: true }
      )
      .pipe(
        filter((event: HttpEvent<any>) =>
          [
            // White-list the events here...

            HttpEventType.Sent,
            HttpEventType.UploadProgress,
            HttpEventType.Response,
          ].includes(event.type)
        ),
        map((event: HttpEvent<any>) => {
          // ... and normalize the payload here.

          switch (event.type) {
            case HttpEventType.Sent:
              return this.event(UploadEventType.Progress, {
                progress: 0,
              });

            case HttpEventType.UploadProgress:
              return this.event(UploadEventType.Progress, {
                progress: event.loaded / (event.total || +Infinity),
              });

            case HttpEventType.Response:
              const type =
                event.body && event.body.status === 'success'
                  ? UploadEventType.Success
                  : UploadEventType.Fail;

              return this.event(type, {
                response: event.body,
              });
          }
        }),
        catchError(e =>
          of({
            type: UploadEventType.Fail,
            payload: {
              response: (e && e.message) || 'E_CLIENT_ERROR',
            },
          })
        )
      );
  }

  protected event(
    type: UploadEventType,
    payload: UploadEventPayload
  ): UploadEvent {
    return { type, payload };
  }
}
