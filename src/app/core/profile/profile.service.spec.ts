import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';

import { ProfileService } from './profile.service';

function makeClientMock() {
  const chain = {
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
  };

  return {
    from: vi.fn(() => chain),
    rpc: vi.fn(),
    chain,
  };
}

describe('ProfileService', () => {
  let service: ProfileService;
  let mock: ReturnType<typeof makeClientMock>;

  beforeEach(() => {
    mock = makeClientMock();
    TestBed.configureTestingModule({
      providers: [
        ProfileService,
        { provide: SUPABASE_CLIENT, useValue: mock },
      ],
    });
    service = TestBed.inject(ProfileService);
  });

  it('getTheme returns null for unknown values', async () => {
    mock.chain.maybeSingle.mockResolvedValueOnce({ data: { theme: 'neon' }, error: null });

    await expect(service.getTheme('user-1')).resolves.toBeNull();
  });

  it('updateTheme writes the preference', async () => {
    mock.chain.eq.mockResolvedValueOnce({ error: null });

    await service.updateTheme('user-1', 'system');

    expect(mock.from).toHaveBeenCalledWith('profiles');
    expect(mock.chain.update).toHaveBeenCalledWith({ theme: 'system' });
  });

  it('deleteAccount calls delete_own_account rpc', async () => {
    mock.rpc.mockResolvedValueOnce({ error: null });

    await service.deleteAccount();

    expect(mock.rpc).toHaveBeenCalledWith('delete_own_account');
  });
});
