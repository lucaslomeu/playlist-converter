import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
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
  playlistsInput: any;

  headphoneImage = 'public/images/headphone.png';

  constructor() {}

  ngOnInit() {}
}
