import { Component, OnInit } from '@angular/core';
import {
  AuthenticateResponse,
  SpotifyService,
} from '../../services/spotify/spotify.service';
import { YoutubeService } from '../../services/youtube/youtube.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-started',
  templateUrl: './started.component.html',
  styleUrls: ['./started.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class StartedComponent implements OnInit {
  playlists: any[] = [];
  playlistSelected: any;
  spotifyToken: string = '';
  songsFromPlaylist: any[] = [];

  constructor(
    private spotifyService: SpotifyService,
    private youtubeService: YoutubeService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.handleSpotifyAuth();
    this.handleYouTubeAuth();
  }

  private handleSpotifyAuth(): void {
    this.route.queryParams.subscribe((params) => {
      const code = params['code'];

      if (code) {
        this.exchangeSpotifyCodeForToken(code);
      } else {
        this.initializeSpotifyAuth();
      }
    });
  }

  private exchangeSpotifyCodeForToken(code: string): void {
    this.spotifyService.getAccessToken(code).subscribe({
      next: async (res: AuthenticateResponse) => {
        this.spotifyToken = res.access_token;
        const spotifyUser = await this.spotifyService.fetchProfile(
          this.spotifyToken
        );
        this.loadPlaylists(this.spotifyToken, spotifyUser.id);
      },
      error: (error) => {
        console.error('Failed to get access token:', error);
      },
    });
  }

  private initializeSpotifyAuth(): void {
    this.spotifyService.initialize().subscribe({
      next: (token) => {
        this.spotifyToken = token;
        this.spotifyService.fetchProfile(token).then((spotifyUser) => {
          this.loadPlaylists(token, spotifyUser.id);
        });
      },
      error: (error) => {
        console.error('Authentication failed or redirected:', error);
      },
    });
  }

  private handleYouTubeAuth(): void {
    this.youtubeService.handleAuthCallback();
  }

  private loadPlaylists(token: string, userId: string): void {
    this.spotifyService.getPlaylists(token, userId).subscribe((playlists) => {
      console.log('Playlists:', playlists);
      this.playlists = playlists.items || [];
    });
  }

  selectPlaylist(playlist: any): void {
    this.spotifyService
      .getPlaylist(this.spotifyToken, playlist.id)
      .subscribe((r) => {
        this.playlistSelected = r;

        this.songsFromPlaylist = this.mapTracksToSongs(
          this.playlistSelected.tracks.items
        );

        const youtubeToken = this.youtubeService.getStoredAccessToken();

        if (!youtubeToken) {
          return;
        }

        this.syncPlaylistToYouTube(youtubeToken);
      });
  }

  private mapTracksToSongs(tracks: any[]): any[] {
    return tracks.map((item: any) => ({
      title: item.track.name,
      artist: item.track.artists[0].name,
      album: item.track.album.name,
    }));
  }

  private syncPlaylistToYouTube(youtubeToken: string): void {
    this.youtubeService
      .searchSongs(youtubeToken, this.songsFromPlaylist)
      .subscribe((searchResults) => {
        this.youtubeService
          .createPlaylist(
            youtubeToken,
            this.playlistSelected.name,
            this.playlistSelected.description
          )
          .subscribe((createdPlaylist: any) => {
            if (!createdPlaylist.id) {
              return;
            }

            this.youtubeService
              .addVideosToPlaylist(
                youtubeToken,
                createdPlaylist.id,
                searchResults
              )
              .subscribe((result) => {
                console.warn('Videos added to playlist:', result);
              });
          });
      });
  }

  protected authenticateSpotify(): void {
    this.spotifyService.authenticate();
  }
}
