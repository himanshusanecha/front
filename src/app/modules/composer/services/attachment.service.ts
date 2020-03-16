import { Injectable } from '@angular/core';
import {
  AttachmentApiService,
  UploadEventType,
} from '../../../common/api/attachment-api.service';
import { of, OperatorFunction } from 'rxjs';
import { ResourceGuid } from './composer.service';
import { catchError, last, map, switchAll, tap } from 'rxjs/operators';

@Injectable()
export class AttachmentService {
  constructor(protected attachmentApi: AttachmentApiService) {}

  /**
   * RxJS operator that accepts an Upload Event and maps into a GUID or null
   * @param progressFn
   * @param errorFn
   */
  resolve(
    progressFn?: (inProgress: boolean, progress: number) => void,
    errorFn?: (e) => void
  ): OperatorFunction<File | ResourceGuid | null, string | null> {
    return input$ =>
      // From our input Observable:
      input$.pipe(
        // For every File | ResourceGuid | null input:
        map(file => {
          if (!file) {
            // If falsy, map to a null value
            return of(null);
          } else if (!(file instanceof File)) {
            // If not a file (ResourceGuid)
            return of({
              type: UploadEventType.Success,
              payload: {
                response: {
                  guid: file.getGuid(),
                },
              },
            });
          }

          return this.attachmentApi.upload(file).pipe(
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

            // If instance of ResourceGuid, just passthru the string
          );
        }),

        // Take the last emitted last() HOO from the map above. Doing this will cancel "unused" HTTP requests.
        switchAll(),

        // Map the final response to an upload event, if success emit the guid, else null
        map(uploadEvent =>
          uploadEvent && uploadEvent.type == UploadEventType.Success
            ? uploadEvent.payload.response.guid
            : null
        )
      );
  }

  /**
   * Removes an an attachment
   * @param guid
   */
  prune(guid: string): Promise<boolean> {
    if (!guid) {
      return Promise.resolve(true);
    }

    return this.attachmentApi.remove(guid).toPromise();
  }
}
