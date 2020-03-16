import { Injectable } from '@angular/core';
import { ApiResponse, ApiService } from './api.service';
import {
  catchError,
  concatAll,
  filter,
  map,
  mapTo,
  mergeAll,
} from 'rxjs/operators';
import { Observable, of, OperatorFunction, throwError } from 'rxjs';
import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
} from '@angular/common/http';

/**
 * Upload event type
 */
export enum UploadEventType {
  Progress = 1,
  Success,
  Fail,
}

/**
 * Upload event payload
 */
export type UploadEventPayload = { progress?: number; response?: any };

/**
 * Normalized upload event
 */
export interface UploadEvent {
  type: UploadEventType;
  payload: UploadEventPayload;
}

/**
 * Angular's HTTP event to our Upload Event.
 * Disabling `includeResponse` will also disable Minds API status success check!
 */
export const httpEventToUploadEvent = (
  includeResponse: boolean = true
): OperatorFunction<HttpEvent<ApiResponse>, UploadEvent> => input$ =>
  input$.pipe(
    // White-list the events we need
    filter((event: HttpEvent<ApiResponse>) =>
      [
        HttpEventType.Sent,
        HttpEventType.UploadProgress,
        HttpEventType.ResponseHeader,
        includeResponse && HttpEventType.Response,
      ]
        .filter(_ => typeof _ === 'number')
        .includes(event.type)
    ),

    // Map them onto a normalized UploadEvent our app handles
    map((event: HttpEvent<ApiResponse>) => {
      switch (event.type) {
        case HttpEventType.Sent:
          return {
            type: UploadEventType.Progress,
            payload: { progress: 0 },
          };

        case HttpEventType.UploadProgress:
          return {
            type: UploadEventType.Progress,
            payload: { progress: event.loaded / (event.total || +Infinity) },
          };

        case HttpEventType.ResponseHeader:
          return {
            type: UploadEventType.Progress,
            payload: { progress: 1 },
          };

        case HttpEventType.Response:
          return {
            type: UploadEventType.Success,
            payload: {
              response: event.body,
            },
          };
      }
    }),

    // If something happens during the upload, replace with a static HOO
    catchError(e =>
      of({
        type: UploadEventType.Fail,
        payload: {
          response: (e && e.message) || 'E_CLIENT_ERROR',
        },
      })
    )
  );

/**
 * Service that handle video and image uploads as attachments
 */
@Injectable()
export class AttachmentApiService {
  /**
   * Constructor
   * @param api
   * @param http
   */
  constructor(protected api: ApiService, protected http: HttpClient) {}

  /**
   * Uploads a file using a "smart" strategy.
   * @param file
   */
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

  /**
   * Uploads a file to S3. Used by videos.
   * @param file
   */
  protected uploadToS3(file: File): Observable<UploadEvent> {
    // Setup initial indefinite progress
    const init: Observable<UploadEvent> = of({
      type: UploadEventType.Progress,
      payload: { progress: 100 },
    });

    // Set pre-signed URL observable with the following operations (that depend on the response) as a map pipe
    const upload = this.api
      .put(`api/v2/media/upload/prepare/${file.type.split('/')[0]}`)
      .pipe(
        map(
          (response: ApiResponse): Observable<UploadEvent> => {
            // Get `lease` from response
            const { lease } = response;

            // Setup upload to presigned URL (S3) observable
            const uploadToPresignedUrl: Observable<UploadEvent> = this.http
              .put(lease.presigned_url, file, {
                headers: new HttpHeaders({
                  'Content-Type': file.type,
                }),
                reportProgress: true,
                observe: 'events',
              })
              .pipe(httpEventToUploadEvent(false));

            // Setup complete observable
            const complete = this.api
              .put(
                `api/v2/media/upload/complete/${lease.media_type}/${lease.guid}`
              )
              .pipe(
                map(
                  (): UploadEvent => ({
                    type: UploadEventType.Success,
                    payload: {
                      response: lease,
                    },
                  })
                )
              );

            // Return an concat (one after another) observable of both follow-up operations
            return of(uploadToPresignedUrl, complete).pipe(concatAll());
          }
        ),

        // Flatten and merge all HOO
        mergeAll()
      );

    // Return a concat of all the 3 stages
    return of(init, upload).pipe(concatAll());
  }

  /**
   * Uploads a file to Minds engine. Used by images.
   * @param file
   */
  protected uploadToApi(file: File): Observable<UploadEvent> {
    // Uploads the file using the API service
    return this.api
      .upload(
        `api/v1/media`,
        {
          file,
        },
        { upload: true }
      )
      .pipe(httpEventToUploadEvent());
  }

  /**
   * Deletes an attachment.
   * @param guid
   */
  remove(guid: string): Observable<boolean> {
    return this.api.delete(`api/v1/media/${guid}`).pipe(mapTo(true));
  }
}
