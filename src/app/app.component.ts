import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import {
  AuthenticateResponse,
  SpotifyService,
} from './core/services/spotify/spotify.service';
import { YoutubeService } from './core/services/youtube/youtube.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'playlistConverter';

  playlistsInput: any;

  headphoneImage = 'public/images/headphone.png';

  constructor(
    private spotifyService: SpotifyService,
    private youtubeService: YoutubeService,
    private route: ActivatedRoute
  ) {}
  ngOnInit() {
    //  this.spotify()
    // this.youtube();

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

  protected authenticateSpotify() {
    // this.spotifyService.authenticate().subscribe((data) => {
    //   this.spotifyService.getPlaylists(data).subscribe((res) => {
    //     console.warn('RES', res);
    //   });
    // });

    this.spotifyService.authenticate();
  }

  protected youtube() {
    this.youtubeService.authenticate();
  }
}
