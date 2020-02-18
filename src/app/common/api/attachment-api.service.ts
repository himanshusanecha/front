import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { catchError, filter, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
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

  upload(file: File | null): Observable<UploadEvent | null> {
    if (!file) {
      return of(null);
    }

    return this.uploadToApi(file);
  }

  protected uploadToS3(file: File) {
    throw new Error('Not implemented');
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
