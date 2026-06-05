import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { TranslatePipe } from '../pipes/translate.pipe';

export type SkeletonVariant = 'summary-cards' | 'table' | 'chart' | 'history-chart';

@Component({
  selector: 'app-skeleton',
  imports: [TranslatePipe],
  templateUrl: './skeleton.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Skeleton {
  readonly variant = input.required<SkeletonVariant>();
  readonly rows = input(3);

  protected readonly rowIndices = computed(() =>
    Array.from({ length: this.rows() }, (_, index) => index),
  );
}
