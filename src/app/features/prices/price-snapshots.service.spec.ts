import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';

import { PriceSnapshotsService } from './price-snapshots.service';

describe('PriceSnapshotsService', () => {
  let service: PriceSnapshotsService;
  let fromMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fromMock = vi.fn();

    const client = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          in: vi.fn(() => ({
            gte: vi.fn(() => ({
              lte: vi.fn(async () => ({
                data: [
                  {
                    asset_id: 'bitcoin',
                    snapshot_date: '2026-06-01',
                    price_usd: 50_000,
                  },
                ],
                error: null,
              })),
            })),
          })),
        })),
        upsert: vi.fn(async () => ({ error: null })),
      })),
    };

    fromMock = client.from as ReturnType<typeof vi.fn>;

    TestBed.configureTestingModule({
      providers: [PriceSnapshotsService, { provide: SUPABASE_CLIENT, useValue: client }],
    });

    service = TestBed.inject(PriceSnapshotsService);
  });

  it('returns an empty map when no asset ids are requested', async () => {
    await expect(service.getForRange([], '2026-06-01', '2026-06-07')).resolves.toEqual(new Map());
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('maps snapshot rows into a nested price map', async () => {
    const map = await service.getForRange(['bitcoin'], '2026-06-01', '2026-06-07');
    expect(map.get('bitcoin')?.get('2026-06-01')).toBe(50_000);
  });
});
