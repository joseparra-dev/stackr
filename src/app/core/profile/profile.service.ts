import { inject, Injectable } from '@angular/core';

import { mapSupabaseError } from '@core/errors/map-supabase-error';
import { isAppLocale, type AppLocale } from '@core/i18n/locale.types';
import { isAppThemePreference, type AppThemePreference } from '@core/theme/theme.types';
import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';

const TABLE = 'profiles';

interface ProfileLocaleRow {
  readonly locale: string;
}

interface ProfileThemeRow {
  readonly theme: string;
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

  async getTheme(userId: string): Promise<AppThemePreference | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select('theme')
      .eq('id', userId)
      .maybeSingle<ProfileThemeRow>();

    if (error) throw mapSupabaseError(error);
    if (!data?.theme || !isAppThemePreference(data.theme)) return null;
    return data.theme;
  }

  async updateTheme(userId: string, theme: AppThemePreference): Promise<void> {
    const { error } = await this.client.from(TABLE).update({ theme }).eq('id', userId);
    if (error) throw mapSupabaseError(error);
  }

  async deleteAccount(): Promise<void> {
    const { error } = await this.client.rpc('delete_own_account');
    if (error) throw mapSupabaseError(error);
  }
}
