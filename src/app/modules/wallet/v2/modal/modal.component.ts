import {
  Component,
  Output,
  Input,
  EventEmitter,
  OnDestroy,
  HostListener,
} from '@angular/core';

@Component({
  selector: 'm-walletModal',
  templateUrl: './modal.component.html',
})
export class WalletModalComponent implements OnDestroy {
  showModalTimeout: any = null;
  justOpened = true;
  public _showModal = false;
  @Input()
  public set showModal(val: boolean) {
    this._showModal = val;
    val ? this.show() : this.close();
  }
  @Output() closeModal: EventEmitter<any> = new EventEmitter();

  constructor() {}

  show() {
    if (document && document.body) {
      this.justOpened = true;
      document.body.classList.add('m-overlay-modal--shown--no-scroll');
      // Prevent dismissal of modal when it's just been opened
      this.showModalTimeout = setTimeout(() => {
        this.justOpened = false;
      }, 20);
    }
  }

  // * MODAL DISMISSAL * --------------------------------------------------------------------------
  // Dismiss modal when backdrop is clicked and modal is open
  @HostListener('document:click', ['$event'])
  clickedBackdrop($event) {
    if (this._showModal && !this.justOpened) {
      $event.preventDefault();
      $event.stopPropagation();
      this.close();
    }
  }

  // Don't dismiss modal if click somewhere other than backdrop
  clickedModal($event) {
    $event.stopPropagation();
  }

  close() {
    document.body.classList.remove('m-overlay-modal--shown--no-scroll');
    this.closeModal.emit();
  }
  ngOnDestroy() {
    if (this.showModalTimeout) {
      clearTimeout(this.showModalTimeout);
    }
    this.close();
  }
}