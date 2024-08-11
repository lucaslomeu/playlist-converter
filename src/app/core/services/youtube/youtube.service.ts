import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class YoutubeService {
  constructor(private http: HttpClient) {}

  client_id = import.meta.env.NG_APP_GOOGLE_CLIENT_ID;
  redirect_uri = 'http://localhost:4200/oauth2callback';
  response_type = 'code';

  authenticate() {
    const url = 'https://accounts.google.com/o/oauth2/v2/auth';

    const params = new URLSearchParams({
      client_id: this.client_id,
      redirect_uri: this.redirect_uri,
      response_type: 'token', // ou 'code' se você estiver usando um servidor para trocar o código por um token
      scope: 'https://www.googleapis.com/auth/youtube',
      include_granted_scopes: 'true',
      state: 'pass-through value',
    });

    // Redireciona o navegador para a URL de autenticação do Google
    window.location.href = `${url}?${params.toString()}`;
  }

  getPlaylists(access_token: string) {
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + access_token,
    });

    const params = {
      part: 'snippet, contentDetails',
      mine: true,
    };

    return this.http.get(`https://www.googleapis.com/youtube/v3/playlists`, {
      headers,
      params,
    });
  }
}
