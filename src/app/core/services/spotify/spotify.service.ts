import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpotifyService {
  private client_id = import.meta.env.NG_APP_SPOTIFY_CLIENT_ID;
  private client_secret = import.meta.env.NG_APP_SPOTIFY_CLIENT_SECRET;
  private redirect_uri = 'http://localhost:4200/started';
  private scope = 'user-read-private user-read-email playlist-read-private';

  constructor(private http: HttpClient) {}

  initialize(): Observable<string> {
    if (this.isTokenValid()) {
      return of(this.getStoredAccessToken() as string);
    }

    const refreshToken = this.getRefreshToken();

    if (refreshToken) {
      return this.refreshAccessToken().pipe(
        map((response) => response.access_token),
        catchError(() => {
          this.authenticate();
          throw new Error('Failed to refresh token, redirected to login');
        })
      );
    }

    this.authenticate();
    throw new Error('No token available, redirected to login');
  }

  authenticate(): void {
    const url = 'https://accounts.spotify.com/authorize';

    const params = new URLSearchParams({
      client_id: this.client_id,
      redirect_uri: this.redirect_uri,
      response_type: 'code',
      scope: this.scope,
      show_dialog: 'true',
    });

    window.location.href = `${url}?${params.toString()}`;
  }

  getAccessToken(authCode: string): Observable<AuthenticateResponse> {
    const url = 'https://accounts.spotify.com/api/token';

    const headers = this.getAuthHeaders();
    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('code', authCode)
      .set('redirect_uri', this.redirect_uri);

    return this.http
      .post<AuthenticateResponse>(url, body.toString(), { headers })
      .pipe(
        tap((response) => this.storeTokens(response)),
        catchError((error) => this.handleError(error))
      );
  }

  refreshAccessToken(): Observable<AuthenticateResponse> {
    const url = 'https://accounts.spotify.com/api/token';
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const headers = this.getAuthHeaders();
    const body = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('refresh_token', refreshToken);

    return this.http
      .post<AuthenticateResponse>(url, body.toString(), { headers })
      .pipe(
        tap((response) => this.storeTokens(response)),
        catchError((error) => this.handleError(error))
      );
  }

  getPlaylists(access_token: string, userId: string): Observable<any> {
    const headers = this.getBearerHeaders(access_token);

    return this.http.get(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      { headers }
    );
  }

  getPlaylist(access_token: string, playlistId: string): Observable<any> {
    const headers = this.getBearerHeaders(access_token);

    return this.http.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      headers,
    });
  }

  async fetchProfile(token: string): Promise<any> {
    const result = await fetch('https://api.spotify.com/v1/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    return await result.json();
  }

  private isTokenValid(): boolean {
    const expiry = localStorage.getItem('spotify_token_expiry');
    return expiry ? Date.now() < parseInt(expiry, 10) : false;
  }

  private getStoredAccessToken(): string | null {
    return localStorage.getItem('spotify_access_token');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('spotify_refresh_token');
  }

  private storeTokens(response: AuthenticateResponse): void {
    localStorage.setItem('spotify_access_token', response.access_token);
    localStorage.setItem('spotify_refresh_token', response.refresh_token || '');
    localStorage.setItem(
      'spotify_token_expiry',
      (Date.now() + response.expires_in * 1000).toString()
    );
  }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + btoa(`${this.client_id}:${this.client_secret}`),
    });
  }

  private getBearerHeaders(accessToken: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });
  }

  private handleError(error: any): Observable<never> {
    console.error('Spotify API Error:', error);
    return of();
  }
}

export interface AuthenticateResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}
