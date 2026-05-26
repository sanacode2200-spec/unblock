
# Unblock by sanacode — Web App Specification for Codex

## Product Concept

Unblock fixes iPhone videos that do not work on Windows.

The user should not need to understand:
- MOV
- MP4
- HEVC
- H.265
- HDR
- SDR
- codecs
- bitrate
- transcoding

Core philosophy:

> lower the cost of understanding

---

# Product Positioning

## Product name

Unblock by sanacode

## Positioning

SEO-first browser-based compatibility fixer for iPhone videos.

Not:
- generic converter
- editing suite
- upload-heavy cloud service

Promise:

> Drop the video. Get a file that works.

---

# Core User Problem

Users search because:

- iPhone videos do not play on Windows
- MOV files fail
- HEVC codec missing
- HDR looks washed out
- PowerPoint cannot play video
- Premiere cannot import iPhone MOV

Users are searching for a fix, not a transcoder.

---

# Main UX Flow

Google Search
↓
Open Unblock
↓
Drop video
↓
Automatic analysis
↓
Convert
↓
Download MP4

No installation.
No account.
No codec knowledge.

---

# Visual Design

Use the provided HTML mock.

Direction:
- dark UI
- near-black background
- purple / blue glow
- spotlight headline
- centered layout
- huge rounded dropzone
- premium utility feel
- minimal wording

Must preserve:
- Unblock by sanacode
- Drop videos. Get MP4.
- lower the cost of understanding

---

# Recommended Stack

## Frontend

- Astro
- React
- TypeScript

## Hosting

Cloudflare Pages

## Conversion

- ffmpeg.wasm
- WebCodecs fallback

Run conversion in Web Workers.

---

# ffmpeg.wasm Requirements

Required headers:

Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp

Avoid transcoding when possible.

---

# Conversion Strategy

## MOV only

If:
- MOV
- H264
- AAC
- SDR

Then:
- rewrap only
- no re-encode

## HEVC

Convert:
- HEVC → H264

## HDR

Convert:
- HDR → SDR

## Large files

Provide:
- Smaller file preset

---

# SEO Strategy

Main keyword:

convert iPhone video to MP4 on Windows

Secondary:
- iPhone video not playing on Windows
- iPhone MOV to MP4
- HEVC to H264 converter
- fix washed out HDR video
- PowerPoint iPhone video fix

---

# Required Pages

/
 /iphone-video-not-playing-windows
 /convert-iphone-video-to-mp4-windows
 /iphone-mov-to-mp4
 /hevc-to-h264-windows
 /iphone-hdr-to-sdr
 /iphone-video-powerpoint
 /iphone-video-premiere-pro
 /faq

---

# Landing Page Structure

## Hero

H1:
Drop videos. Get MP4.

Subtitle:
Unblock converts iPhone MOV, HEVC, HDR, and 4K videos into Windows-friendly MP4 files — without opening a single setting.

CTA:
Choose a file

---

# Structured Data

Use:
- SoftwareApplication JSON-LD
- FAQPage JSON-LD

---

# Technical SEO

Must-have:
- semantic HTML
- static rendering
- fast loading
- responsive layout
- Open Graph tags
- Twitter cards
- sitemap.xml
- robots.txt
- canonical URLs

Core Web Vitals:
- LCP under 2.5s
- CLS under 0.1
- INP under 200ms

---

# Conversion UX

Empty state:

Drop iPhone videos here
MOV · HEVC · HDR · 4K · local processing

After upload:
- thumbnail
- filename
- issue summary
- output type
- progress

Example:

IMG_4821.MOV
Detected: HEVC + HDR
Output: MP4 · H264 · SDR

---

# Human-Friendly Labels

HEVC → May not open on Windows
HDR → May look washed out
MOV → iPhone video format

---

# Presets

- Windows MP4
- Smaller file
- PowerPoint
- Editor safe

---

# Performance Goals

- avoid transcoding when possible
- use WebCodecs when available
- run conversion in workers
- keep UI responsive
- lazy-load heavy modules

---

# Error Handling

Bad:
ffmpeg exited with code 1

Good:
This video could not be converted.
The file may be damaged or unsupported.

---

# Accessibility

- keyboard navigation
- visible focus states
- accessible upload button
- ARIA progress
- drag/drop fallback

---

# Final Product Principle

Whenever there is a tradeoff:

choose the option that makes the user understand less
and succeed faster

Target feeling:

I don't know what codecs are,
but now my iPhone video works.
