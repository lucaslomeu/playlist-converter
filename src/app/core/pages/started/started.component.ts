import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../../services/spotify/spotify.service';

@Component({
  selector: 'app-started',
  templateUrl: './started.component.html',
  styleUrls: ['./started.component.scss'],
})
export class StartedComponent implements OnInit {
  constructor(private spotifyService: SpotifyService) {}

  ngOnInit() {}

  protected authenticateSpotify() {
    this.spotifyService.authenticate();
  }
}
