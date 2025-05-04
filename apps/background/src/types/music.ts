export interface Image {
  size: number;
  url: string;
}

export interface Artist {
  id: number;
  name: string;
  sexCd: string;
  sexCdStr: string;
  artistGroupTypeStr: string;
  actStartYmd: string;
  dimYn: string;
  imgList: Image[];
  memberArtistList: Artist[];
}

export interface Album {
  id: number;
  title: string;
  imgList: Image[];
  releaseYmd: string;
}

export interface Track {
  id: number;
  name: string;
  playTime: string;
  adultAuthYn: string;
  freeYn: string;
  svcFlacYn: string;
  svcStreamingYn: string;
  svcDrmYn: string;
  originTrackYn: string;
  dimYn: string;
  audioContentYn: string;
  agencyId: number;
  artistList: Artist[];
  representationArtist: Artist;
  album: Album;
}

export interface TrackList {
  type: string;
  style: string;
  list: Track[];
}

export interface TasteMix {
  mixYn: string;
  status: string;
  displayMessage: string;
}

export interface SearchResponse {
  code: string;
  data: {
    keyword: string;
    suggestedQuery: string;
    totalCount: number;
    totalPage: number;
    currentPage: number;
    pageSize: number;
    tasteMix: TasteMix;
    list: TrackList[];
  };
}

export interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface YouTubeThumbnails {
  default: YouTubeThumbnail;
  medium: YouTubeThumbnail;
  high: YouTubeThumbnail;
}

export interface YouTubeSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: YouTubeThumbnails;
  channelTitle: string;
  liveBroadcastContent: string;
  publishTime: string;
}

export interface YouTubeVideoId {
  kind: string;
  videoId: string;
}

export interface YouTubeSearchResult {
  kind: string;
  etag: string;
  id: YouTubeVideoId;
  snippet: YouTubeSnippet;
}

export interface YouTubePageInfo {
  totalResults: number;
  resultsPerPage: number;
}

export interface YouTubeSearchResponse {
  kind: string;
  etag: string;
  nextPageToken: string;
  regionCode: string;
  pageInfo: YouTubePageInfo;
  items: YouTubeSearchResult[];
}

export interface Song {
  name: string;
  artist: string;
  playTime: number;
  thumbnail: string;
}
