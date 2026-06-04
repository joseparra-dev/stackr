import { inject, Injectable } from '@angular/core';

import { mapSupabaseError } from '@core/errors/map-supabase-error';
import { isAppLocale, type AppLocale } from '@core/i18n/locale.types';
import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';

const TABLE = 'profiles';

interface ProfileLocaleRow {
  readonly locale: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly client = inject(SUPABASE_CLIENT);

  async getLocale(userId: string): Promise<AppLocale | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select('locale')
      .eq('id', userId)
      .maybeSingle<ProfileLocaleRow>();

    if (error) throw mapSupabaseError(error);
    if (!data?.locale || !isAppLocale(data.locale)) return null;
    return data.locale;
  }

  async updateLocale(userId: string, locale: AppLocale): Promise<void> {
    const { error } = await this.client.from(TABLE).update({ locale }).eq('id', userId);
    if (error) throw mapSupabaseError(error);
  }
}
