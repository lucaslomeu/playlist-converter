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

  ngOnInit() {}

  protected getStarted() {
    this.router.navigateByUrl('/started');
  }
}
