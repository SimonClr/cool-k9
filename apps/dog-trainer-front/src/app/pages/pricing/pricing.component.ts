import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TuiTitle } from '@taiga-ui/core';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [TuiTitle],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricingComponent {}