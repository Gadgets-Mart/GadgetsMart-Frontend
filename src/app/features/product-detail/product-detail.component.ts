import { Component, OnInit, OnDestroy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { type Observable, Subject, takeUntil, combineLatest } from 'rxjs';
import { AsyncPipe, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product } from '../../core/models';
import { ProductActions } from '../../store/product/product.actions';
import { selectSelectedProduct, selectProductDetailLoading, selectRelatedProducts } from '../../store/product/product.selectors';
import { CartActions } from '../../store/cart/cart.actions';
import { StarRatingComponent } from '../../shared/components/star-rating/star-rating.component';
import { QuantityInputComponent } from '../../shared/components/quantity-input/quantity-input.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { RatingService, RatingResponseDto } from '../../core/services/rating.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-product-detail',
  imports: [
    RouterLink, AsyncPipe, CurrencyPipe, DatePipe, DecimalPipe, FormsModule,
    MatTabsModule, StarRatingComponent, QuantityInputComponent, ProductCardComponent
  ],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product$: Observable<Product | null>;
  loading$: Observable<boolean>;
  related$: Observable<Product[]>;

  selectedImage = 0;
  selectedColor = '';
  quantity = 1;
  skeletons = Array(4).fill(0);

  // ── Reviews state ─────────────────────────────────────────────
  reviews: RatingResponseDto[] = [];
  reviewsLoading = false;
  currentProductId: number | null = null;

  // My review
  myReview: RatingResponseDto | null = null;
  showReviewForm = false;
  reviewForm = { rating: 5, text: '' };
  hoverStar = 0;
  submittingReview = false;
  reviewError = '';
  // ─────────────────────────────────────────────────────────────

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    private ratingService: RatingService,
    private authService: AuthService,
    private snack: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.product$ = store.select(selectSelectedProduct);
    this.loading$ = store.select(selectProductDetailLoading);
    this.related$ = store.select(selectRelatedProducts);
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(p => {
      const id = +p['id'];
      this.currentProductId = id;
      this.store.dispatch(ProductActions.clearSelectedProduct());
      this.store.dispatch(ProductActions.loadProductById({ id }));
      this.selectedImage = 0;
      this.quantity = 1;
      this.loadReviews(id);
    });

    this.product$.pipe(takeUntil(this.destroy$)).subscribe((product: Product | null) => {
      if (product) {
        this.selectedColor = product.colors[0];
        this.store.dispatch(ProductActions.loadRelatedProducts({ product }));
      }
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  // ── Reviews ──────────────────────────────────────────────────

  loadReviews(productId: number): void {
    this.reviewsLoading = true;
    this.reviews = [];
    this.myReview = null;

    this.ratingService.getRatings(productId).subscribe({
      next: list => {
        this.reviews = list;
        const userId = localStorage.getItem('gm_email');
        if (userId) {
          this.myReview = list.find(r => r.userId === userId) ?? null;
        }
        this.reviewsLoading = false;
      },
      error: () => { this.reviewsLoading = false; }
    });
  }

  get isLoggedIn(): boolean { return !!localStorage.getItem('gm_token'); }

  get averageRating(): number {
    if (!this.reviews.length) return 0;
    return this.reviews.reduce((s, r) => s + r.rating, 0) / this.reviews.length;
  }

  getRatingBars(): { stars: number; count: number; pct: number }[] {
    const total = this.reviews.length;
    return [5, 4, 3, 2, 1].map(stars => {
      const count = this.reviews.filter(r => r.rating === stars).length;
      return { stars, count, pct: total ? Math.round((count / total) * 100) : 0 };
    });
  }

  openReviewForm(): void {
    if (this.myReview) return;
    this.reviewForm = { rating: 5, text: '' };
    this.reviewError = '';
    this.showReviewForm = true;
  }

  setReviewStar(n: number): void { this.reviewForm.rating = n; }

  submitReview(): void {
    if (!this.reviewForm.text.trim()) { this.reviewError = 'Please write your review.'; return; }
    if (!this.currentProductId) return;

    const userId = localStorage.getItem('gm_email');
    if (!userId) return;

    this.submittingReview = true;
    this.reviewError = '';

    this.ratingService.addRating({
      productId: String(this.currentProductId),
      userId,
      rating:    this.reviewForm.rating,
      text:      this.reviewForm.text.trim()
    }).subscribe({
      next: saved => {
        this.reviews = [saved, ...this.reviews];
        this.myReview = saved;
        this.showReviewForm = false;
        this.submittingReview = false;
        this.snack.open('Review submitted!', 'OK', { duration: 3000 });
        this.cdr.detectChanges();
      },
      error: err => {
        this.reviewError = err?.error?.message ?? 'Failed to submit review. Please try again.';
        this.submittingReview = false;
      }
    });
  }

  // ── Helpers ──────────────────────────────────────────────────

  selectImage(index: number): void { this.selectedImage = index; }
  selectColor(color: string): void { this.selectedColor = color; }

  addToCart(product: Product): void {
    this.store.dispatch(CartActions.addItem({
      product,
      quantity: this.quantity,
      selectedColor: this.selectedColor || product.colors[0]
    }));
  }

  onRelatedAddToCart(product: Product): void {
    this.store.dispatch(CartActions.addItem({
      product,
      quantity: 1,
      selectedColor: product.colors[0]
    }));
  }

  getSpecEntries(specs: { [key: string]: string }): { key: string; value: string }[] {
    return Object.entries(specs ?? {}).map(([key, value]) => ({ key, value }));
  }
}