import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  LucideArrowLeftRight,
  LucideFilterX,
  LucideLayoutDashboard,
  LucideLineChart,
  LucidePieChart,
  LucidePlus,
  LucideWallet,
} from '@lucide/angular';

export type EmptyStateIcon =
  | 'arrow-left-right'
  | 'filter-x'
  | 'wallet'
  | 'layout-dashboard'
  | 'pie-chart'
  | 'line-chart';

export type EmptyStateVariant = 'dashed' | 'bordered' | 'compact';

export type EmptyStateCtaVariant = 'primary' | 'link';

@Component({
  selector: 'app-empty-state',
  imports: [
    LucideArrowLeftRight,
    LucideFilterX,
    LucideLayoutDashboard,
    LucideLineChart,
    LucidePieChart,
    LucidePlus,
    LucideWallet,
  ],
  templateUrl: './empty-state.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyState {
  readonly headingId = input.required<string>();
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly icon = input<EmptyStateIcon | null>(null);
  readonly variant = input<EmptyStateVariant>('dashed');
  readonly live = input<'off' | 'polite'>('off');

  readonly ctaLabel = input<string | null>(null);
  readonly ctaVariant = input<EmptyStateCtaVariant>('primary');
  readonly ctaLeadingIcon = input<'plus' | null>(null);

  readonly ctaClick = output<void>();

  protected readonly sectionClass = computed(() => {
    const base = 'flex flex-col items-center text-center';
    switch (this.variant()) {
      case 'compact':
        return `${base} mt-4 px-2 py-4`;
      case 'bordered':
        return `${base} justify-center rounded-xl border border-(--color-border) bg-(--color-surface) px-6 py-12`;
      case 'dashed':
      default:
        return `${base} justify-center rounded-xl border border-dashed border-(--color-border) bg-(--color-surface) px-6 py-16`;
    }
  });

  protected readonly iconSize = computed(() => (this.variant() === 'compact' ? 24 : 32));

  protected readonly ctaClass = computed(() => {
    if (this.ctaVariant() === 'link') {
      return 'text-brand-600 hover:text-brand-700 mt-4 cursor-pointer text-sm font-medium';
    }
    return 'bg-brand-600 hover:bg-brand-700 focus-visible:outline-brand-500 mt-6 inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2';
  });
}
