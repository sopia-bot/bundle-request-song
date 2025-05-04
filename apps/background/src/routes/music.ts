import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { SearchResponse, YouTubeSearchResponse, Song } from '../types/music';

const router = Router();

// GET /settings
router.get(
  '/:search',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1차 FLO 검색
      const keyword = req.params['search'];
      const result = await axios<SearchResponse>({
        url: 'https://www.music-flo.com/api/search/v2/search',
        params: {
          keyword,
          searchType: 'TRACK',
          sortType: 'ACCURACY',
          size: 50,
          page: 1,
          queryType: 'system',
        },
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
      const { data: apiList } = result.data;

      let song: Song | null = null;
      if (apiList.list.length > 0) {
        const track = apiList.list[0];
        const playTime =
          parseInt(track.list[0].playTime.split(':')[0]) * 60 +
          parseInt(track.list[0].playTime.split(':')[1]);
        song = {
          name: track.list[0].name,
          artist: track.list[0].representationArtist.name,
          playTime,
          thumbnail:
            track.list[0].album.imgList.length > 0
              ? track.list[0].album.imgList.sort((a, b) => b.size - a.size)[0]
                  .url
              : track.list[0].representationArtist.imgList.sort(
                  (a, b) => b.size - a.size
                )[0].url,
        };
      }

      if (!song) {
        // 2차 유튜브 검색
        const result = await axios<YouTubeSearchResponse>({
          url: 'https://www.googleapis.com/youtube/v3/search',
          params: {
            q: keyword,
            part: 'snippet',
            maxResults: 1,
            key: Buffer.from(
              'QUl6YVN5Q0NUTmFaQ2JKenJpVnVmV1dSNDlldU85QU9ZODVaajFj',
              'base64'
            ).toString('utf-8'),
          },
        });
        if (result.data.items.length > 0) {
          const item = result.data.items[0];
          const { data: video } = await axios({
            url: 'https://www.googleapis.com/youtube/v3/videos',
            params: {
              id: item.id.videoId,
              part: 'contentDetails',
              key: Buffer.from(
                'QUl6YVN5Q0NUTmFaQ2JKenJpVnVmV1dSNDlldU85QU9ZODVaajFj',
                'base64'
              ).toString('utf-8'),
            },
          });
          if (video.items.length > 0) {
            const videoItem = video.items[0];

            // duration to number
            const duration = videoItem.contentDetails.duration;
            const hours = duration.match(/(\d+)H/)?.[1];
            const minutes = duration.match(/(\d+)M/)?.[1];
            const seconds = duration.match(/(\d+)S/)?.[1];
            const playTime =
              (hours ? parseInt(hours) * 3600 : 0) +
              (minutes ? parseInt(minutes) * 60 : 0) +
              (seconds ? parseInt(seconds) : 0);
            song = {
              name: item.snippet.title,
              artist: item.snippet.channelTitle,
              playTime,
              thumbnail:
                item.snippet.thumbnails?.high?.url ||
                item.snippet.thumbnails?.medium?.url ||
                item.snippet.thumbnails?.default?.url,
            };
          }
        }
      }

      res.json(song);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
