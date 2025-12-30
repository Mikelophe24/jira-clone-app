import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditTask } from './add-edit-task';

describe('AddEditTask', () => {
  let component: AddEditTask;
  let fixture: ComponentFixture<AddEditTask>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditTask]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditTask);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
