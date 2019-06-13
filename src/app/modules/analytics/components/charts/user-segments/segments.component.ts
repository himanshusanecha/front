import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Client } from "../../../../../services/api/client";
import { timespanOption } from "../timespanOption";

@Component({
  selector: 'm-analyticscharts__usersegments',
  template: `
    <div class="m-chart" #chartContainer>
      <div class="mdl-spinner mdl-js-spinner is-active" [mdl] *ngIf="inProgress"></div>

      <m-graph
        [data]="data"
        [layout]="layout"
        *ngIf="!inProgress && !!data"
      ></m-graph>
    </div>
  `
})

export class UserSegmentsChartComponent implements OnInit {
  @ViewChild('chartContainer') chartContainer: ElementRef;

  timespan: timespanOption;
  inProgress: boolean = false;
  init: boolean = false;
  data: any = null;

  layout: any = {
    width: 0,
    height: 0,
    title: '',
    font: {
      family: 'Roboto'
    },
    titlefont: {
      family: 'Roboto',
      size: 24,
      weight: 'bold'
    },
    xaxis: {
      type: '-',
    },
    yaxis: {
      type: 'log',
      dtick: 1,
    },
    margin: {
      t: 16,
      b: 32,
      l: 32,
    },
  };

  @Input('timespan') set _timespan(value: timespanOption) {
    this.timespan = value;
    if (this.init) {
      this.getData();
    }
  }

  constructor(private client: Client) {
  }

  ngOnInit() {
    this.applyDimensions();
    this.getData();
    this.init = true;
  }

  async getData() {
    let url = 'api/v2/analytics/usersegments';

    let opts = { timespan: this.timespan };

    this.inProgress = true;

    try {
      const response: any = await this.client.get(url, opts);
      this.data = response.data;
      this.data[0].type = 'lines';
    } catch (e) {
      console.error(e);
    }

    this.inProgress = false;
  }

  @HostListener('window:resize')
  applyDimensions() {
    this.layout = {
      ...this.layout,
      width: this.chartContainer.nativeElement.clientWidth,
      height: this.chartContainer.nativeElement.clientHeight - 35,
    };
  }
}
