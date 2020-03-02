import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ACCESS, LICENSES } from '../../../../services/list-options';
import {
  AccessIdSubjectValue,
  ComposerService,
  LicenseSubjectValue,
} from '../../composer.service';
import { BehaviorSubject } from 'rxjs';

/**
 * Composer title bar component. It features a label and a dropdown menu
 * with not-that-important options.
 */
@Component({
  selector: 'm-composer__titleBar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'title-bar.component.html',
})
export class TitleBarComponent {
  /**
   * Composer textarea ID
   */
  @Input() id: string;

  /**
   * Visibility items list
   */
  visibilityItems: Array<{ text: string; value: string }> = ACCESS.map(
    ({ text, value }) => ({
      text,
      value: `${value}`,
    })
  );

  /**
   * License items list
   */
  licenseItems: Array<{ text: string; value: string }> = LICENSES;

  constructor(protected service: ComposerService) {}

  /**
   * Access ID subject from service
   */
  get accessId$(): BehaviorSubject<AccessIdSubjectValue> {
    return this.service.accessId$;
  }

  /**
   * License subject from service
   */
  get license$(): BehaviorSubject<LicenseSubjectValue> {
    return this.service.license$;
  }

  /**
   * Can the actor change visibility? (disabled when there's a container)
   */
  get canChangeVisibility(): boolean {
    return !this.service.getContainerGuid();
  }

  /**
   * Emits the new visibility (access ID)
   * @param $event
   */
  onVisibilityClick($event) {
    if (!this.canChangeVisibility) {
      return;
    }

    this.accessId$.next($event);
  }

  /**
   * Emits the new license
   * @param $event
   */
  onLicenseClick($event) {
    this.license$.next($event);
  }
}
