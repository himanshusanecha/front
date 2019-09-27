import { Injectable, isDevMode } from '@angular/core';
import { Session } from './session';
import { Router } from '@angular/router';
import { Cookie } from '../services/cookie';
import { includes } from 'lodash';

@Injectable()
export class FeaturesService {
  private overrides = [];
  protected _features: any;
  protected _warnedCache: { [key: string]: number } = {};
  private cookie: Cookie = new Cookie();

  constructor(private session: Session, private router: Router) {
    this._features = window.Minds.features || {};
  }

  has(feature: string) {
    if (!feature) {
      throw new Error('Invalid feature ID');
    }
    if (feature.indexOf('!') === 0) {
      // Inverted check. Useful for *mIfFeature
      return !this.has(feature.substring(1));
    }
    if (this.cookie.get('staging-features')) {
      try {
        this.overrides = JSON.parse(atob(this.cookie.get('staging-features')));
      } catch (e) {
        // Do nothing
      }
    }
    if (feature in this.overrides) {
      return this.overrides[feature];
    }

    if (typeof this._features[feature] === 'undefined') {
      if (isDevMode() && !this._hasWarned(feature)) {
        console.warn(
          `[FeaturedService] Feature '${feature}' is not declared. Assuming false.`
        );
        this._warnedCache[feature] = Date.now();
      }

      return false;
    }

    if (this._features[feature] === 'admin' && this.session.isAdmin()) {
      return true;
    }

    if (
      this._features[feature] === 'canary' &&
      this.session.getLoggedInUser().canary
    ) {
      return true;
    }

    return this._features[feature] === true;
  }

  check(feature: string, { redirectTo }: { redirectTo?: any[] } = {}) {
    if (feature.indexOf('!') === 0) {
      throw new Error('Cannot negate feature when using check()');
    }

    const has = this.has(feature);

    if (!has && redirectTo) {
      this.router.navigate(redirectTo, { replaceUrl: true });
    }

    return has;
  }

  protected _hasWarned(feature: string) {
    if (!this._warnedCache[feature]) {
      return false;
    }

    // Once every 5s
    return this._warnedCache[feature] + 5000 < Date.now();
  }

  static _(session: Session, router: Router, cookie: Cookie) {
    return new FeaturesService(session, router);
  }
}
