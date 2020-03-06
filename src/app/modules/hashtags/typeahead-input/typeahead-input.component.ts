import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { SuggestedService } from '../service/suggested.service';
import { Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MruService } from '../service/mru.service';

/**
 * Typeahead selector.
 */
@Component({
  selector: 'm-hashtags__typeaheadInput',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'typeahead-input.component.html',
})
export class TypeaheadInputComponent implements OnInit {
  /**
   * MRU history cache key
   */
  @Input() historyKey: string = 'default';

  /**
   * Action event emitter
   */
  @Output('onAction') onActionEmitter: EventEmitter<string> = new EventEmitter<
    string
  >();

  /**
   * Current tag
   */
  tag: string = '';

  /**
   * MRU (most recently used) tags list
   */
  recent: string[] = [];

  /**
   * Is the suggestions dropdown shown?
   */
  isDropdownShown: boolean = false;

  /**
   * Subject for suggestions queries
   */
  readonly typeaheadQuery$: Subject<string>;

  /**
   * Observable for suggestions array
   */
  readonly suggestions$: Observable<string[]>;

  /**
   * Are we showing recent (so we show the header)
   */
  get isShowingSuggestions() {
    return Boolean(this.tag);
  }

  /**
   * Constructor. Initializes query subject and suggestions Observable pipe
   * @param suggested
   * @param mru
   */
  constructor(
    protected suggested: SuggestedService,
    protected mru: MruService
  ) {
    this.typeaheadQuery$ = new Subject<string>();

    this.suggestions$ = this.typeaheadQuery$.pipe(
      debounceTime(150),
      this.suggested.lookupOr(() => this.recent)
    );
  }

  /**
   * Initialization. Fetches MRU items.
   */
  ngOnInit(): void {
    this.fetchMRUItems();
  }

  /**
   * Sets the current tag
   * @param tag
   */
  setTag(tag: string) {
    this.tag = tag || '';
    this.typeaheadQuery$.next(this.tag);
  }

  /**
   * Triggers the action, if there's a tag set
   */
  triggerAction(): void {
    if (this.tag) {
      this.onActionEmitter.emit(this.tag);
    }
  }

  /**
   * Sets a suggestion as the current tag and triggers the action
   * @param tag
   */
  useSuggestion(tag: string) {
    this.setTag(tag);
    this.triggerAction();
  }

  /**
   * Resets the control to its initial state
   */
  reset(): void {
    this.setTag('');
  }

  /**
   * Show dropdown (on focus)
   */
  showDropdown(): void {
    this.isDropdownShown = true;
  }

  /**
   * Hide dropdown (on blur)
   */
  hideDropdown(): void {
    this.isDropdownShown = false;
  }

  /**
   * Clears MRU tags on its service and re-read
   */
  clearMRU(): void {
    this.mru.reset(this.historyKey);
    this.fetchMRUItems();
  }

  /**
   * Pushes MRU tags to its service and re-read
   * @param tags
   */
  pushMRUItems(tags: string[]): void {
    this.mru.push(this.historyKey, tags);
    this.fetchMRUItems();
  }

  /**
   * Fetches latest MRU items
   */
  fetchMRUItems(): void {
    this.recent = this.mru.fetch(this.historyKey);
  }
}
