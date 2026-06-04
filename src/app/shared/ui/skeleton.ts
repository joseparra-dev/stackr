import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type SkeletonVariant = 'summary-cards' | 'table' | 'chart';

@Component({
  selector: 'app-skeleton',
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
