import { RequireApiKeyGuard } from './require-api-key.guard';

describe('RequireApiKeyGuard', () => {
  it('should be defined', () => {
    expect(new RequireApiKeyGuard()).toBeDefined();
  });
});
