import { Injectable } from '@angular/core';
import { ApiResponse, ApiService } from './api.service';
import {
  catchError,
  concatAll,
  filter,
  last,
  map,
  mapTo,
  mergeAll,
  switchAll,
  tap,
} from 'rxjs/operators';
import {
  MonoTypeOperatorFunction,
  Observable,
  of,
  OperatorFunction,
  throwError,
} from 'rxjs';
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
 * Angular's HTTP event to our Upload Event. `payloadPassthru` will disabled status === success check!
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
 * RxJS operator that accepts an Upload Event and maps into a GUID or null
 * @param uploadEventFn
 * @param progressFn
 * @param errorFn
 */
export const fileToGuid = (
  uploadEventFn: (file: File) => Observable<UploadEvent>,
  progressFn?: (inProgress: boolean, progress: number) => void,
  errorFn?: (e) => void
): OperatorFunction<File | null, string | null> => input$ =>
  // From our input Observable:
  input$.pipe(
    // For every File | null input:
    map(file =>
      // Upload the file to either Minds engine or S3
      uploadEventFn(file).pipe(
        // On every HTTP event:
        tap(uploadEvent => {
          // If no progress callback, do nothing
          if (!progressFn) {
            return;
          }

          // If no event, disable progress
          if (!uploadEvent) {
            progressFn(false, 0);
            return;
          }

          // Check the type and send the progress state accordingly
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

        // If something fails during upload:
        catchError(e => {
          // Pass the errors through the error callback
          if (errorFn) {
            errorFn(e);
          }

          // Replace with a complete `null` observable
          return of(null);
        }),

        // Take the last item emitted as an HOO (check below)
        last()
      )
    ),

    // Take the last emitted last() HOO from the map above. Doing this will cancel "unused" HTTP requests.
    switchAll(),

    // Map the final response to an upload event, if success emit the guid, else null
    map(uploadEvent =>
      uploadEvent && uploadEvent.type == UploadEventType.Success
        ? uploadEvent.payload.response.guid
        : null
    )
  );

@Injectable()
export class AttachmentApiService {
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
        mergeAll()
      );

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
