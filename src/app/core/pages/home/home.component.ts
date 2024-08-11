import { Component, OnInit } from '@angular/core';
import {
  AuthenticateResponse,
  SpotifyService,
} from '../../services/spotify/spotify.service';
import { YoutubeService } from '../../services/youtube/youtube.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(
    private spotifyService: SpotifyService,
    private youtubeService: YoutubeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const code = params['code'];
      if (code) {
        this.spotifyService
          .getAccessToken(code)
          .subscribe((res: AuthenticateResponse) => {
            console.warn('RES', res);
            this.spotifyService
              .getPlaylists(res.access_token)
              .subscribe((res) => {
                console.warn('RES', res);
              });
          });
      } else {
        // Lidar com o erro ou redirecionar
      }
    });

    this.route.fragment.subscribe((fragment: string | null) => {
      if (fragment) {
        const params = new URLSearchParams(fragment);
        const accessToken = params.get('access_token');
        const authCode = params.get('code');

        if (accessToken) {
          console.log('Access Token:', accessToken);
          this.youtubeService.getPlaylists(accessToken).subscribe((res) => {
            console.warn('PLAYLISTTTT', res);
          });
          // Aqui você pode armazenar o token e usá-lo para futuras requisições à API do YouTube
        }

        if (authCode) {
          console.log('Authorization Code:', authCode);
          // Aqui você pode enviar o código ao seu servidor para trocá-lo por um token
        }
      }
    });
  }

  protected youtube() {
    this.youtubeService.authenticate();
  }

  protected getStarted() {
    this.router.navigateByUrl('/started');
  }
}
