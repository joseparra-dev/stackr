import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-transactions-page',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transactions.page.html',
})
export class TransactionsPage {}
