import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RatingRequestDto {
  userId:    string;
  productId: string;
  rating:    number;   // 1–5
  text:      string;   // max 500 chars
}

export interface RatingResponseDto {
  id:        string;
  productId: string;
  userId:    string;
  name:      string;
  rating:    number;
  text:      string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class RatingService {
  private readonly base = environment.ratingApiUrl; // adjust if rating service is on a different port

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): { Authorization: string } {
    const token = localStorage.getItem('gm_token') ?? '';
    return { Authorization: `Bearer ${token}` };
  }

  getRatings(productId: number | string): Observable<RatingResponseDto[]> {
    return this.http.get<RatingResponseDto[]>(
      `${this.base}/get/${productId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  addRating(dto: RatingRequestDto): Observable<RatingResponseDto> {
    return this.http.post<RatingResponseDto>(
      `${this.base}/add`,
      dto,
      { headers: this.getAuthHeaders() }
    );
  }
}