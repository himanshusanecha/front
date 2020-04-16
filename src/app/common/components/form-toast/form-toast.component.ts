import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { FormToast, FormToastService } from '../../services/form-toast.service';
import { Subscription } from 'rxjs';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import autobind from '../../../helpers/autobind';

@Component({
  selector: 'm-formToast',
  templateUrl: './form-toast.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    // height shrink/grow
    trigger('height', [
      state(
        'show',
        style({
          minHeight: '56px',
          height: '*',
          marginBottom: '*',
        })
      ),
      state(
        'hide',
        style({
          minHeight: 0,
          height: 'auto',
          marginBottom: 0,
        })
      ),
      transition('* <=> *', [animate('3000ms')]),
      // transition('* => hide', [animate('300ms')]),
    ]),

    // Fade out on dismiss
    trigger('fadeOut', [
      transition('show => hide', [
        style({ opacity: 1 }),
        animate('300ms', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class FormToastComponent implements OnInit, OnDestroy {
  toasts: FormToast[] = [];
  timeoutIds: number[] = [];
  subscription: Subscription;

  constructor(
    private service: FormToastService,
    protected cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.subscription = this.service.onToast().subscribe(toast => {
      // clear toasts when an empty toast is received
      if (!toast.message) {
        this.toasts = [];
        return;
      }
      const toastIndex = this.toasts.push(toast) - 1;
      this.detectChanges();

      const toastTimeout = setTimeout(() => {
        this.dismiss(toastIndex);
        // this.toasts[toastIndex]['dismissed'] = true;

        this.detectChanges();
      }, 2000400); //todoojm 3400

      this.timeoutIds.push(setTimeout(() => toastTimeout));
    });
  }

  dismiss(toastIndex: number) {
    this.toasts[toastIndex]['active'] = false;
    // this.toasts[toastIndex].active = false;

    // Don't display:none until toast has faded out
    const toastTimeout = setTimeout(() => {
      this.toasts[toastIndex]['hidden'] = true;

      this.detectChanges();
    }, 601);

    this.timeoutIds.push(setTimeout(() => toastTimeout));
  }

  detectChanges() {
    this.cd.markForCheck();
    this.cd.detectChanges();
  }

  ngOnDestroy() {
    this.timeoutIds.forEach(id => clearTimeout(id));
    this.subscription.unsubscribe();
  }
}
