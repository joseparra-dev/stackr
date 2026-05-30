import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { TopBar } from '../top-bar/top-bar';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Sidebar, TopBar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-dvh">
      <app-sidebar />
      <div class="flex flex-1 flex-col">
        <app-top-bar />
        <main class="flex-1 overflow-auto p-4 md:p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class Shell {}
