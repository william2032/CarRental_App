import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiclesAdminComponent } from './vehicles-admin.component';

describe('VehiclesAdminComponent', () => {
  let component: VehiclesAdminComponent;
  let fixture: ComponentFixture<VehiclesAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiclesAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehiclesAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
