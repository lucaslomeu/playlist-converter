import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class YoutubeService {
  client_id = import.meta.env.NG_APP_GOOGLE_CLIENT_ID;
  redirect_uri = 'http://localhost:4200/started';
  private readonly YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

  constructor(private http: HttpClient) {}

  private storeAccessToken(token: string): void {
    localStorage.setItem('youtube_access_token', token);
  }

  private getStoredAccessToken(): string | null {
    return localStorage.getItem('youtube_access_token');
  }

  private getHeaders(access_token: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${access_token}`,
    });
  }

  private handleError(error: any): Observable<never> {
    console.error('YouTube API Error:', error);
    return throwError(() => new Error('YouTube API Error'));
  }

  isTokenValid(): boolean {
    const token = this.getStoredAccessToken();
    return !!token;
  }

  authenticate(): void {
    const url = 'https://accounts.google.com/o/oauth2/v2/auth';

    const params = new URLSearchParams({
      client_id: this.client_id,
      redirect_uri: this.redirect_uri,
      response_type: 'token',
      scope: 'https://www.googleapis.com/auth/youtube',
      include_granted_scopes: 'true',
      state: 'pass-through value',
    });

    window.location.href = `${url}?${params.toString()}`;
  }

  handleAuthCallback(): void {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');

      if (accessToken) {
        this.storeAccessToken(accessToken);
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }

  createPlaylist(
    access_token: string,
    title: string,
    description: string
  ): Observable<any> {
    const url = `${this.YOUTUBE_API_BASE}/playlists`;

    const headers = this.getHeaders(access_token);
    const body = {
      snippet: {
        title,
        description,
      },
    };

    const params = new HttpParams().set('part', 'snippet');

    return this.http
      .post(url, body, { headers, params })
      .pipe(catchError(this.handleError));
  }

  getPlaylists(access_token: string): Observable<any> {
    const url = `${this.YOUTUBE_API_BASE}/playlists`;

    const headers = this.getHeaders(access_token);
    const params = new HttpParams()
      .set('part', 'snippet,contentDetails')
      .set('mine', 'true');

    return this.http
      .get(url, { headers, params })
      .pipe(catchError(this.handleError));
  }

  searchSongs(access_token: string, songs: any): Observable<any> {
    const url = `${this.YOUTUBE_API_BASE}/search`;

    const headers = this.getHeaders(access_token);

    const requests = songs.map((song: any) => {
      const query = `${song.title} ${song.artist} ${song.album}`;

      const params = new HttpParams()
        .set('part', 'snippet')
        .set('q', query)
        .set('type', 'video')
        .set('maxResults', '1');

      return this.http.get(url, { headers, params }).pipe(
        map((response: any) => {
          if (response.items && response.items.length) {
            return response.items[0].id.videoId;
          } else {
            return null;
          }
        })
      );
    });

    return forkJoin<any[]>(requests).pipe(
      map((videosIds: any[]) => videosIds.filter((id: string) => id))
    );
  }

  addVideosToPlaylist(
    access_token: string,
    playlistId: string,
    videosIds: string[]
  ): Observable<any> {
    const url = `${this.YOUTUBE_API_BASE}/playlistItems`;

    const headers = this.getHeaders(access_token);
    const requests = videosIds.map((videoId) => {
      const body = {
        snippet: {
          playlistId,
          resourceId: {
            kind: 'youtube#video',
            videoId,
          },
        },
      };

      const params = new HttpParams().set('part', 'snippet');

      return this.http
        .post(url, body, { headers, params })
        .pipe(catchError(this.handleError));
    });

    return forkJoin(requests);
  }
}
