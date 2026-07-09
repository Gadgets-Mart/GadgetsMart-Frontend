import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { take } from 'rxjs';
import { CartItem } from '../../core/models';
import { selectCartItems, selectCartTotal, selectCartCount } from '../../store/cart/cart.selectors';
import { CartActions } from '../../store/cart/cart.actions';
import { QuantityInputComponent } from '../../shared/components/quantity-input/quantity-input.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, AsyncPipe, CurrencyPipe, FormsModule, QuantityInputComponent, EmptyStateComponent, MatProgressSpinnerModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  items$;
  total$;
  count$;
  checkingOut = false;

  // ── Payment modal ──────────────────────────────
  showPayment = false;
  payTab: 'card' | 'upi' = 'card';
  payError = '';
  card = { name: '', number: '', expiry: '', cvv: '' };
  upiId = '';
  // ──────────────────────────────────────────────

  constructor(
    private store: Store,
    private snack: MatSnackBar,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {
    this.items$ = store.select(selectCartItems);
    this.total$ = store.select(selectCartTotal);
    this.count$ = store.select(selectCartCount);
  }

  ngOnInit(): void {
    this.store.dispatch(CartActions.loadCart());
  }

  updateQty(item: CartItem, qty: number): void {
    this.store.dispatch(CartActions.updateQuantity({ productId: item.productId, selectedColor: item.selectedColor, quantity: qty }));
  }

  removeItem(item: CartItem): void {
    this.store.dispatch(CartActions.removeItem({ productId: item.productId, selectedColor: item.selectedColor }));
    const ref = this.snack.open(`${item.product.name} removed`, 'Undo', { duration: 4000 });
    ref.onAction().subscribe(() => {
      this.store.dispatch(CartActions.addItem({ product: item.product, quantity: item.quantity, selectedColor: item.selectedColor }));
    });
  }

  clearCart(): void {
    this.store.dispatch(CartActions.clearCart());
  }

  getLineTotal(item: CartItem): number {
    return (item.product.discountPrice ?? item.product.price) * item.quantity;
  }

  getTax(subtotal: number): number { return +(subtotal * 0.18).toFixed(2); }
  getShipping(): number { return 40; }
  getOrderTotal(subtotal: number): number { return +(subtotal + this.getTax(subtotal) + this.getShipping()).toFixed(2); }

  // ── Opens the payment modal (replaces direct checkout call) ──
  openPayment(): void {
    const user = this.authService.currentUser;
    if (!user) {
      this.snack.open('Please log in to place an order.', 'Login', { duration: 4000 })
        .onAction().subscribe(() => this.router.navigate(['/login']));
      return;
    }
    if (!user.addressLine || !user.city || !user.state || !user.pincode) {
      this.snack.open('Please complete your address in your account profile before ordering.', 'Go to Profile', { duration: 5000 })
        .onAction().subscribe(() => this.router.navigate(['/account']));
      return;
    }
    // Reset modal state and open
    this.card     = { name: '', number: '', expiry: '', cvv: '' };
    this.upiId    = '';
    this.payError = '';
    this.payTab   = 'card';
    this.showPayment = true;
  }

  clearPayError(): void { this.payError = ''; }

  fmtCardNumber(event: Event): void {
    const el = event.target as HTMLInputElement;
    const v = el.value.replace(/\D/g, '').slice(0, 16);
    this.card.number = v.match(/.{1,4}/g)?.join(' ') ?? v;
  }

  fmtExpiry(event: Event): void {
    const el = event.target as HTMLInputElement;
    const v = el.value.replace(/\D/g, '').slice(0, 4);
    this.card.expiry = v.length >= 3 ? v.slice(0, 2) + ' / ' + v.slice(2) : v;
  }

  // Validates payment fields then calls the real checkout
  submitPayment(): void {
    this.payError = '';

    if (this.payTab === 'card') {
      const num = this.card.number.replace(/\s/g, '');
      if (!this.card.name.trim())      { this.payError = 'Please enter the cardholder name.'; return; }
      if (num.length !== 16)           { this.payError = 'Please enter a valid 16-digit card number.'; return; }
      if (this.card.expiry.length < 7) { this.payError = 'Please enter a valid expiry date.'; return; }
      if (this.card.cvv.length < 3)    { this.payError = 'Please enter a valid CVV.'; return; }
    } else {
      if (!this.upiId.trim().includes('@')) { this.payError = 'Please enter a valid UPI ID (e.g. name@upi).'; return; }
    }

    this.showPayment = false;
    this.checkout();
  }

  // ── Original checkout logic (unchanged) ──────────────────────
  checkout(): void {
    const user = this.authService.currentUser;
    if (!user) {
      this.snack.open('Please log in to place an order.', 'Login', { duration: 4000 })
        .onAction().subscribe(() => this.router.navigate(['/login']));
      return;
    }
    if (!user.addressLine || !user.city || !user.state || !user.pincode) {
      this.snack.open('Please complete your address in your account profile before ordering.', 'Go to Profile', { duration: 5000 })
        .onAction().subscribe(() => this.router.navigate(['/account']));
      return;
    }

    this.items$.pipe(take(1)).subscribe(items => {
      if (!items.length) return;

      this.checkingOut = true;
      const request = {
        userId:  user.id || user.email,
        name:    user.name,
        phone:   user.phone,
        address: user.addressLine,
        city:    user.city,
        state:   user.state,
        pincode: user.pincode,
        items:   items.map(i => ({ productId: i.productId, quantity: i.quantity }))
      };

      this.orderService.placeOrder(request).subscribe({
        next: (order) => {
          this.checkingOut = false;
          this.store.dispatch(CartActions.clearCart());
          this.snack.open(`Order #${order.id} placed successfully!`, 'View Orders', { duration: 6000 })
            .onAction().subscribe(() => this.router.navigate(['/account']));
          this.router.navigate(['/account']);
        },
        error: (err) => {
          this.checkingOut = false;
          const msg = err?.error?.message ?? 'Failed to place order. Please try again.';
          this.snack.open(msg, 'Close', { duration: 5000 });
        }
      });
    });
  }
}