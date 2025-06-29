import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedVehiclesComponent } from './featured-vehicles.component';

describe('FeaturedVehiclesComponent', () => {
  let component: FeaturedVehiclesComponent;
  let fixture: ComponentFixture<FeaturedVehiclesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedVehiclesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeaturedVehiclesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
