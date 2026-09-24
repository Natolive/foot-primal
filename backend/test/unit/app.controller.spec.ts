import { AppController } from '@src/app.controller.js';
import { AppService } from '@src/app.service.js';

describe('AppController', () => {
  it('returns "Hello World!"', () => {
    expect(new AppController(new AppService()).getHello()).toBe('Hello World!');
  });
});
