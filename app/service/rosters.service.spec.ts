import { TestBed, inject } from '@angular/core/testing';

import { RostersService } from './rosters.service';

describe('RostersService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RostersService]
    });
  });

  it('should be created', inject([RostersService], (service: RostersService) => {
    expect(service).toBeTruthy();
  }));
});
