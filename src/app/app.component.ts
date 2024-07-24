import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SpotifyService } from './core/services/spotify/spotify.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'playlistConverter';

  constructor(private spotifyService: SpotifyService) {}
  ngOnInit() {
    this.spotifyService
      .authenticate()
      .subscribe((data) =>
        this.spotifyService
          .getPlaylists()
          .subscribe((res) => console.warn('RES', res))
      );
  }
}
