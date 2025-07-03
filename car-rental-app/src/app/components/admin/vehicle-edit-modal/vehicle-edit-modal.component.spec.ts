import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleEditModalComponent } from './vehicle-edit-modal.component';

describe('VehicleEditModalComponent', () => {
  let component: VehicleEditModalComponent;
  let fixture: ComponentFixture<VehicleEditModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleEditModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
