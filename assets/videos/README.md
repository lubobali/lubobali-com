# Videos (sources, not served)

`scripts/build-videos.mjs` copies these to `public/video/` with a content
hash in the name (cached for a year) and checks the size budget (1.5 MB).

## lubot-demo-loop.mp4

LuBot answering "make a chart: where are my visitors from?" — chart,
reasoning and raw SQL. From Lubo's `Website_final-demo.mp4` (0:31–0:41.5),
approved by Lubo 2026-10-17 (Phase 3, decision D7).

- Cropped to the LuBot window (no desktop wallpaper), captions kept and
  moved onto a dark strip, Lubo's e-mail address in the top bar covered.
- 1024×768, 24 fps, H.264, no audio, `+faststart`, CRF 28 (~375 KB).
- Poster = frame at 0.5 s, WebP q80.

```sh
# from the 1920x1080 original (window at 372,102 size 1170x878)
ffmpeg -ss 31 -t 10.5 -i Website_final-demo.mp4 -an -filter_complex \
 "[0:v]split[a][b];[a]crop=1170:878:372:102,drawbox=x=0:y=790:w=iw:h=88:color=0x111626:t=fill,drawbox=x=918:y=64:w=134:h=26:color=0x12162d:t=fill[win];[b]crop=1760:84:80:893,format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(gt(r(X,Y)+g(X,Y)+b(X,Y),560)+gt(b(X,Y)-r(X,Y),110)*gt(b(X,Y),150),255,0)',scale=1110:-1[cap];[win][cap]overlay=x=30:y=800,scale=1024:-2,fps=24,format=yuv420p" \
 -c:v libx264 -crf 28 -preset slow -movflags +faststart lubot-demo-loop.mp4
ffmpeg -ss 0.5 -i lubot-demo-loop.mp4 -frames:v 1 -c:v libwebp -quality 80 lubot-demo-loop-poster.webp
```

Check every new video for private info (e-mails, keys, customer data)
before adding it: this folder is in the public GitHub mirror.

## lubo-intro.mp4 (+ poster, captions)

Lubo's 2:20 intro (Phase 3 H9b), recorded 2026-10-19 on a plain wall
(OBS + GoPro + Rode), approved by Lubo. Click to play, so it has its own
budget (12 MB); nothing downloads before the click.

- Background removed offline (Robust Video Matting at 1080p, 2 px matte
  choke against the GoPro's sharpening halo, clean-plate edge cleanup),
  site navy + blue glow + the site's own data-rain tiles. Master + work
  files stay on the server, not in git.
- 1280×720, 30 fps, H.264 CRF 27 `-preset veryslow -tune film`, AAC 96k,
  loudness -16 LUFS, `+faststart` (~10.5 MB).
- Poster = frame at 1:02.3, WebP q78. Captions = `lubo-intro.en.vtt`
  (Whisper timings, words checked by hand); same text as `src/lib/intro.ts`.

```sh
ffmpeg -i intro-v4.mp4 -map 0:v -map 0:a -c:v libx264 -preset veryslow -crf 27 \
 -profile:v high -tune film -g 60 -movflags +faststart -c:a aac -b:a 96k -ac 2 lubo-intro.mp4
ffmpeg -ss 62.3 -i lubo-intro.mp4 -frames:v 1 -c:v libwebp -quality 78 lubo-intro-poster.webp
```
