import { YouTube } from 'youtube-sr';
import { QueryType } from '../types/types';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { validateURL as SoundcloudValidateURL } from 'soundcloud-scraper';

// #region scary things below *sigh*
const spotifySongRegex = /^https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:track\/|\?uri=spotify:track:)((\w|-){22})(\?si=.+)?$/;
const spotifyPlaylistRegex = /^https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:playlist\/|\?uri=spotify:playlist:)((\w|-){22})(\?si=.+)?$/;
const spotifyAlbumRegex = /^https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:album\/|\?uri=spotify:album:)((\w|-){22})(\?si=.+)?$/;
const vimeoRegex = /^(http|https)?:\/\/(www\.|player\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|video\/|)(\d+)(?:|\/\?)$/;
const reverbnationRegex = /^https:\/\/(www.)?reverbnation.com\/(.+)\/song\/(.+)$/;
const attachmentRegex = /^https?:\/\/.+$/;
const appleMusicSongRegex = /^https?:\/\/music\.apple\.com\/.+?\/(song|album)\/.+?(\/.+?\?i=|\/)([0-9]+)$/;
const appleMusicPlaylistRegex = /^https?:\/\/music\.apple\.com\/.+?\/playlist\/.+\/pl\.(u-)?[a-z0-9]+$/i;
const appleMusicAlbumRegex = /^https?:\/\/music\.apple\.com\/.+?\/album\/.+\/([0-9]+)$/;
// #endregion scary things above *sigh*

class QueryResolver {
    /**
     * Query resolver
     */
    private constructor() {} // eslint-disable-line @typescript-eslint/no-empty-function

    static get regex() {
        return {
            spotifyAlbumRegex,
            spotifyPlaylistRegex,
            spotifySongRegex,
            vimeoRegex,
            reverbnationRegex,
            attachmentRegex,
            appleMusicAlbumRegex,
            appleMusicPlaylistRegex,
            appleMusicSongRegex
        };
    }

    /**
     * Resolves the given search query
     * @param {string} query The query
     * @returns {QueryType}
     */
    static resolve(query: string): (typeof QueryType)[keyof typeof QueryType] {
        query = query.trim();
        if (SoundcloudValidateURL(query, 'track')) return QueryType.SOUNDCLOUD_TRACK;
        if (SoundcloudValidateURL(query, 'playlist') || query.includes('/sets/')) return QueryType.SOUNDCLOUD_PLAYLIST;
        if (YouTube.isPlaylist(query)) return QueryType.YOUTUBE_PLAYLIST;
        if (QueryResolver.validateId(query) || QueryResolver.validateURL(query)) return QueryType.YOUTUBE_VIDEO;
        if (spotifySongRegex.test(query)) return QueryType.SPOTIFY_SONG;
        if (spotifyPlaylistRegex.test(query)) return QueryType.SPOTIFY_PLAYLIST;
        if (spotifyAlbumRegex.test(query)) return QueryType.SPOTIFY_ALBUM;
        if (vimeoRegex.test(query)) return QueryType.VIMEO;
        if (reverbnationRegex.test(query)) return QueryType.REVERBNATION;
        if (appleMusicAlbumRegex.test(query)) return QueryType.APPLE_MUSIC_ALBUM;
        if (appleMusicPlaylistRegex.test(query)) return QueryType.APPLE_MUSIC_PLAYLIST;
        if (appleMusicSongRegex.test(query)) return QueryType.APPLE_MUSIC_SONG;
        if (attachmentRegex.test(query)) return QueryType.ARBITRARY;

        return QueryType.YOUTUBE_SEARCH;
    }

    /**
     * Parses vimeo id from url
     * @param {string} query The query
     * @returns {string}
     */
    static getVimeoID(query: string): string | null | undefined {
        return QueryResolver.resolve(query) === QueryType.VIMEO
            ? query
                  .split('/')
                  .filter((x) => !!x)
                  .pop()
            : null;
    }

    static validateId(q: string) {
        return YouTube.Regex.VIDEO_ID.test(q);
    }

    static validateURL(q: string) {
        return YouTube.Regex.VIDEO_URL.test(q);
    }
}

export { QueryResolver };
