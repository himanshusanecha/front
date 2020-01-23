import { Component, ElementRef, ViewChild } from '@angular/core';
import { UserAvatarService } from '../../../../common/services/user-avatar.service';
import { Router } from '@angular/router';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { Upload } from '../../../../services/api/upload';

@Component({
  selector: 'm-onboarding--avatarStep',
  templateUrl: 'avatar.component.html',
})
export class AvatarStepComponent {
  readonly cdnAssetsUrl: string = window.Minds.cdn_assets_url;

  cropping: boolean = false;
  file: any;
  imageChangedEvent: any;
  imageLoaded: boolean = false;
  src: string = '';
  waitForDoneSignal: boolean = true;
  croppedImage: any = '';

  @ViewChild('file', { static: false }) fileInput: ElementRef;

  constructor(
    protected upload: Upload,
    protected userAvatarService: UserAvatarService,
    protected router: Router
  ) {}

  uploadPhoto() {
    this.fileInput.nativeElement.click();
  }

  loadImageFailed() {
    console.log('Load failed');
  }

  add(e) {
    this.imageChangedEvent = e;
    if (e) {
      this.cropping = true;
    }
    // const element: any = e.target ? e.target : e.srcElement;
    // this.file = element ? element.files[0] : null;
    //
    // /**
    //  * Set a live preview
    //  */
    // const reader = new FileReader();
    // reader.onloadend = () => {
    //   this.src =
    //     typeof reader.result === 'string'
    //       ? reader.result
    //       : reader.result.toString();
    //   if (this.object.type === 'user' && this.isOwnerAvatar()) {
    //     this.userAvatarService.src$.next(this.src);
    //   }
    // };
    // reader.readAsDataURL(this.file);
    //
    // element.value = '';
    //
    // console.log(this.waitForDoneSignal);
    // if (this.waitForDoneSignal !== true) this.done();
  }

  async save() {
    if (!this.croppedImage) {
      return;
    }

    this.userAvatarService.src$.next(this.croppedImage);

    fetch(this.croppedImage)
      .then(res => res.blob())
      .then(async blob => {
        const imageFile = new File([blob], Date.now() + '', {
          type: 'image/png',
        });

        try {
          const response: any = await this.upload.post(
            'api/v1/channel/avatar',
            [imageFile],
            { filekey: 'file' }
          );

          if (window.Minds.user) {
            window.Minds.user.icontime = Date.now();
          }
        } catch (e) {
          console.error(e);
        }
      });
  }

  onImageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  onImageLoaded() {
    this.imageLoaded = true;
  }

  cancel() {
    this.fileInput.nativeElement.value = null;
    this.imageChangedEvent = null;
    this.cropping = false;
  }

  skip() {
    this.router.navigate(['/onboarding', 'groups']);
  }

  async continue() {
    await this.save();
    this.router.navigate(['/onboarding', 'groups']);
  }

  private dataURItoBlob(dataURI) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/jpeg' });
    return blob;
  }
}
