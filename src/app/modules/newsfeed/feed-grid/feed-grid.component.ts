import {
  Component,
  Input,
  Inject,
  PLATFORM_ID,
  ChangeDetectorRef,
} from '@angular/core';
import { isPlatformServer } from '@angular/common';
import {
  Observable,
  Subject,
  combineLatest,
  Subscription,
  fromEvent,
} from 'rxjs';
import { map, debounceTime } from 'rxjs/operators';
import isMobile from '../../../helpers/is-mobile';

const MIN_COLUMN_SIZE: number = 300;

@Component({
  selector: 'm-feedGrid',
  templateUrl: './feed-grid.component.html',
})
export class FeedGridComponent {
  @Input() maxColumns = 3;
  columnCount$: Subject<number> = new Subject();
  @Input('entities') entities$;

  columns$: Observable<any[]>; // TODO: stricter typing
  columns = [];
  columnsSubscription: Subscription;
  windowResizeSubscription: Subscription;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.columns$ = combineLatest(this.entities$, this.columnCount$).pipe(
      map(([entities, columnCount]: [[any], number]) => {
        let cols = [];
        for (let i = 0; i < columnCount; ++i) {
          cols.push([]);
        }

        let currentCol = -1;
        for (let entity of entities) {
          ++currentCol;
          cols[currentCol].push(entity);
          if (currentCol >= columnCount - 1) {
            currentCol = -1;
          }
        }
        return cols;
      })
    );
    this.columnsSubscription = this.columns$.subscribe(entities => {
      this.columns = entities;
      this.cd.markForCheck();
      this.cd.detectChanges();
    });

    this.windowResizeSubscription = fromEvent(window, 'resize')
      .pipe(debounceTime(300))
      .subscribe(event => {
        this.calculateColumnCount();
      });

    this.calculateColumnCount();
  }

  ngOnDestroy() {
    this.columnsSubscription.unsubscribe();
    this.windowResizeSubscription.unsubscribe();
  }

  calculateColumnCount(): void {
    if (isPlatformServer(this.platformId)) {
      this.columnCount$.next(isMobile() ? 1 : this.maxColumns);
    } else {
      let columns: number = this.maxColumns;
      const maxCanFit: number = Math.max(
        1,
        Math.round(window.innerWidth / (MIN_COLUMN_SIZE * 1.25))
      );
      this.columnCount$.next(Math.min(maxCanFit, this.maxColumns));
    }
  }
}
