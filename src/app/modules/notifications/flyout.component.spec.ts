///<reference path="../../../../node_modules/@types/jasmine/index.d.ts"/>
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { DebugElement } from '@angular/core';

import { Client } from '../../services/api/client';
import { By } from '@angular/platform-browser';
import { clientMock } from '../../../tests/client-mock.spec';
import { MaterialMock } from '../../../tests/material-mock.spec';
import { NotificationsFlyoutComponent } from './flyout.component';

import { Mock, MockComponent } from '../../utils/mock';
import { RouterTestingModule } from '@angular/router/testing';

describe('NotificationsFlyoutComponent', () => {

  let comp: NotificationsFlyoutComponent;
  let fixture: ComponentFixture<NotificationsFlyoutComponent>;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [
        MaterialMock, 
        NotificationsFlyoutComponent,
        MockComponent({ 
          selector: 'minds-notifications',
          inputs: [ 'loadOnDemand', 'hidden', 'visible' ],
        }),],
      imports: [RouterTestingModule],
      providers: [
        { provide: Client, useValue: clientMock },
      ]
    })
      .compileComponents();  // compile template and css
  }));

  // synchronous beforeEach
  beforeEach((done) => {

    jasmine.MAX_PRETTY_PRINT_DEPTH = 10;
    jasmine.clock().uninstall();
    jasmine.clock().install();
    fixture = TestBed.createComponent(NotificationsFlyoutComponent);
    clientMock.response = {};

    comp = fixture.componentInstance;

    fixture.detectChanges();

    if (fixture.isStable()) {
      done();
    } else {
      fixture.whenStable().then(() => {
        done();
      });
    }
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('Should use the onvisible method', () => {
    const notifications = fixture.debugElement.query(By.css('minds-notifications'));
    expect(notifications).not.toBeNull();
  });

  it('Should emit close evt', () => {
    spyOn(comp.closeEvt, 'emit').and.callThrough();
    comp.close();
    
    expect(comp.closeEvt.emit).toHaveBeenCalled();
  });

  it('Should call onVisible', () => {
    spyOn(comp.notificationList, 'onVisible').and.callThrough();
    comp.toggleLoad();
    expect(comp.notificationList.onVisible).toHaveBeenCalled();
  });

});
