import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BlockchainEthModalComponent } from './eth-modal.component';
import { MockService, MockComponent } from '../../../utils/mock';
import { Web3WalletService } from '../web3-wallet.service';
import { ChangeDetectorRef } from '@angular/core';
import { SendWyreService } from '../sendwyre/sendwyre.service';

fdescribe('BlockchainEthModalComponent', () => {
  let comp: BlockchainEthModalComponent;
  let fixture: ComponentFixture<BlockchainEthModalComponent>;
  let sendWyreMock: any = MockService(SendWyreService);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        BlockchainEthModalComponent,
        MockComponent({
          selector: 'm-modal',
          inputs: [],
        }),
        MockComponent({
          selector: 'input',
          inputs: ['ngModel'],
        }),
      ],
      providers: [
        {
          provide: Web3WalletService,
          useValue: MockService(Web3WalletService),
        },
        {
          provide: ChangeDetectorRef,
          useValue: MockService(ChangeDetectorRef),
        },
        {
          provide: SendWyreService,
          useValue: sendWyreMock,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(done => {
    jasmine.MAX_PRETTY_PRINT_DEPTH = 2;

    fixture = TestBed.createComponent(BlockchainEthModalComponent);

    comp = fixture.componentInstance;

    this.hasMetamask = true;

    fixture.detectChanges();
    if (fixture.isStable()) {
      done();
    } else {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        done();
      });
    }
  });

  it('should instantiate modal', () => {
    expect(comp).toBeTruthy();
  });

  it('should redirect when buy clicked', () => {
    comp.usd = 40;
    comp.buy();
    expect(sendWyreMock.redirect).toHaveBeenCalledWith(40);
  });
});
