import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerSectionComponent } from './owner-section.component';

describe('OwnerSectionComponent', () => {
  let component: OwnerSectionComponent;
  let fixture: ComponentFixture<OwnerSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
