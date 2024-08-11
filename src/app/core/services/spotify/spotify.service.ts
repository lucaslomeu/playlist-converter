import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpotifyService {
  constructor(private http: HttpClient) {}

  private client_id = import.meta.env.NG_APP_SPOTIFY_CLIENT_ID;
  private client_secret = import.meta.env.NG_APP_SPOTIFY_CLIENT_SECRET;

  private redirect_uri = 'http://localhost:4200/oauth2callback';
  private scope = 'user-read-private user-read-email';

  authenticate() {
    const url = 'https://accounts.spotify.com/authorize';

    const params = new URLSearchParams({
      client_id: this.client_id,
      redirect_uri: this.redirect_uri,
      response_type: 'code', // ou 'code' se você estiver usando um servidor para trocar o código por um token
      scope: this.scope,
    });

    // Redireciona o navegador para a URL de autenticação do Google
    window.location.href = `${url}?${params.toString()}`;
  }

  getAccessToken(authCode: string): Observable<AuthenticateResponse> {
    const url = 'https://accounts.spotify.com/api/token';

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + btoa(this.client_id + ':' + this.client_secret),
    });

    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('code', authCode)
      .set('redirect_uri', this.redirect_uri);

    return this.http.post<AuthenticateResponse>(url, body.toString(), {
      headers,
    });
  }

  getPlaylists(access_token: string) {
    const playlistId = '5iwHCUBKVObBLcrBUwkfP2'; // PEGAR GENERICO QUANDO A PESSOA ESCOLHER A PLAYLIST

    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + access_token,
    });

    return this.http.get(`/api/v1/playlists/${playlistId}`, { headers });
  }
}

export interface AuthenticateResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
