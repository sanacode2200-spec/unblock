# Unblock by sanacode — Product / SEO / Build Specification

## 0. One-line concept

**Unblock makes iPhone videos instantly usable on Windows.**

Users should not need to understand MOV, HEVC, H.265, HDR, SDR, codecs, containers, or Windows compatibility.  
sanacode’s brand concept is:

> **Lower the cost of understanding.**

Every product decision should reduce the number of things the user must understand before getting a usable video.

---

## 1. Product name

### App name

**Unblock**

### Full brand name

**Unblock by sanacode**

### Reason

The product promise is not “convert video” in a generic way.  
The promise is:

> Your blocked iPhone video becomes usable on Windows.

“Unblock” is short, English-friendly, easy to spell, and directly tied to the outcome.

---

## 2. Primary user

### Target user

English-speaking iPhone users who want to use iPhone-recorded videos on Windows and are frustrated because the files:

- do not open
- show a codec error
- are MOV files instead of MP4
- use HEVC / H.265
- look washed out because of HDR
- are too large
- fail in PowerPoint
- stutter in Windows Media Player
- cannot be imported into Premiere Pro / DaVinci Resolve
- need to be sent to someone using Windows

### User intent

The user is not searching for a professional transcoder.  
They are searching for a fix.

Examples:

- “iPhone video not playing on Windows”
- “convert iPhone video to MP4 on Windows”
- “iPhone MOV to MP4 Windows”
- “HEVC video won’t play on Windows”
- “iPhone HDR video looks washed out on Windows”
- “how to open iPhone videos on PC”
- “iPhone video codec missing Windows”
- “convert iPhone HEVC to H264”
- “make iPhone video compatible with PowerPoint”

The landing page and app must speak to this frustration directly.

---

## 3. Core positioning

### Category

**iPhone video compatibility converter for Windows**

### Do not position as

- generic video converter
- professional encoder
- editing software
- compression-only app
- cloud upload service

### Positioning sentence

**Unblock converts iPhone MOV, HEVC, HDR, and 4K videos into Windows-friendly MP4 files without confusing codec settings.**

### Emotional promise

“Stop troubleshooting. Drop the video. Get a file that works.”

---

## 4. Current HTML design direction

Use the current HTML direction as the visual base.

### Visual style

- dark clean interface
- near-black background
- subtle grid overlay
- violet / blue glow
- large centered hero
- large file drop zone
- rounded cards
- minimal copy
- futuristic but not noisy
- premium utility feel

### Inspiration from current mock

- black background
- central gradient headline
- violet-blue spotlight
- pill badge above headline
- large upload card
- status badge
- simple nav
- small preset pills
- three explanation cards

### Must preserve

- “Drop videos. Get MP4.”
- “Unblock by sanacode”
- “lower the cost of understanding”
- file drop zone as main CTA
- English-first copy
- simple wording

---

## 5. Information architecture

The product should have two main surfaces:

1. **Landing page**
2. **Converter app screen**

The MVP can combine both into one page if needed, but the code should be structured so they can be separated later.

---

## 6. Landing page requirements

### Hero section

Primary headline:

```txt
Drop videos. Get MP4.
```

Alternative SEO headline for A/B testing:

```txt
Convert iPhone Videos to Windows-Friendly MP4
```

Hero subtitle:

```txt
Unblock converts iPhone MOV, HEVC, HDR, and 4K videos into Windows-friendly MP4 files — without opening a single setting.
```

Primary CTA:

```txt
Choose a file
```

Secondary CTA:

```txt
Download for Windows
```

Trust / utility pills:

- MOV → MP4
- HEVC → H.264
- HDR → SDR
- 4K supported
- Local processing
- Windows 10 / 11

### Problem section

Heading:

```txt
Why iPhone videos break on Windows
```

Explain in plain English:

- iPhones often save videos as MOV
- newer iPhones may record in HEVC / H.265
- some Windows apps expect MP4 / H.264
- HDR videos may look washed out or too bright on SDR displays
- large 4K files may be slow to send or import

Tone: practical, not technical.

### Solution section

Heading:

```txt
Unblock fixes the compatibility automatically
```

Cards:

1. **Converts MOV to MP4**
2. **Changes HEVC to H.264**
3. **Fixes HDR for normal displays**
4. **Optimizes file size**
5. **Keeps the original file untouched**
6. **Works locally on your computer**

### Use-case section

Heading:

```txt
Made for the Windows apps people actually use
```

Cards:

- Windows Media Player
- Photos app
- PowerPoint
- Premiere Pro
- DaVinci Resolve
- Google Drive / email sharing
- Discord / Slack / Teams
- USB transfer / external drive

### Comparison section

Heading:

```txt
No codec hunting. No confusing export menus.
```

Compare:

| Old way | Unblock |
|---|---|
| Search for missing codecs | Drop video |
| Learn MOV vs MP4 | Auto-detect |
| Choose bitrate and codec | Best settings selected |
| Risk overwriting files | Original stays untouched |
| Upload private videos online | Process locally |

### FAQ section

Include FAQ content because it matches long-tail search intent.

Required FAQs:

1. Why won’t my iPhone video play on Windows?
2. How do I convert iPhone MOV to MP4 on Windows?
3. What is HEVC and why does Windows complain about it?
4. Can Unblock convert HEVC to H.264?
5. Why does my iPhone HDR video look washed out on Windows?
6. Does Unblock keep my original video?
7. Does Unblock upload my video to the cloud?
8. Can I batch convert many iPhone videos?
9. Does Unblock work with 4K videos?
10. Is this better than installing a codec?

---

## 7. Converter app UX

### Main screen

The main app should be extremely simple.

User flow:

1. User drops video files
2. App scans files
3. App shows detected issues in plain language
4. App chooses optimal preset automatically
5. User clicks convert
6. App outputs Windows-friendly MP4 files

### Default screen copy

```txt
Drop iPhone videos here
MOV · HEVC · HDR · 4K · local processing
```

### After files are added

Show a compact list.

Each file row:

- thumbnail
- filename
- detected format
- issue summary
- target output
- estimated output size
- status
- progress

Example:

```txt
IMG_4821.MOV
Detected: HEVC + HDR
Output: MP4 · H.264 · SDR
Status: Ready
```

### Plain-language issue labels

Use user-friendly labels, not raw encoder terms.

| Technical issue | User-facing label |
|---|---|
| MOV container | iPhone video format |
| HEVC / H.265 | May not open on Windows |
| HDR / Dolby Vision | May look washed out |
| Large 4K bitrate | Too large to share |
| Variable frame rate | May stutter in editors |
| AAC / spatial audio issue | Audio compatibility check |

### One-click mode

Default mode should require no settings.

Button:

```txt
Convert to MP4
```

Advanced settings can exist but should be hidden under:

```txt
Show advanced
```

---

## 8. Conversion engine design

### Core engine

Use **FFmpeg** under the hood.

Recommended architecture:

```txt
UI layer
  ↓
file scanner
  ↓
compatibility analyzer
  ↓
preset selector
  ↓
FFmpeg job builder
  ↓
conversion queue
  ↓
output manager
```

### File scanner

For every input file, run metadata analysis using `ffprobe`.

Detect:

- container: MOV / MP4 / M4V
- video codec: HEVC, H.264, ProRes, AV1 if present
- profile
- pixel format
- resolution
- frame rate
- variable frame rate
- HDR metadata
- color transfer
- color primaries
- audio codec
- duration
- bitrate
- file size
- rotation metadata
- creation time

### Compatibility analyzer

Classify each file into one of these states:

```txt
READY
NEEDS_REWRAP
NEEDS_TRANSCODE
NEEDS_HDR_TO_SDR
NEEDS_SIZE_OPTIMIZATION
UNSUPPORTED_OR_DAMAGED
```

### Preset selector

Default output target:

```txt
MP4 container
H.264 video
AAC audio
SDR color
faststart enabled
Windows-compatible metadata
```

### Conversion strategy

Use the fastest safe strategy.

#### Case 1: Already compatible

If input is MP4 + H.264 + AAC + SDR:

- do not transcode
- optionally copy file or mark as already ready

FFmpeg strategy:

```bash
-c copy
-movflags +faststart
```

#### Case 2: MOV but already H.264 + AAC + SDR

Use rewrap, not full transcode.

```bash
ffmpeg -i input.mov -c copy -movflags +faststart output.mp4
```

This should be extremely fast.

#### Case 3: HEVC / H.265

Transcode video to H.264.

CPU fallback:

```bash
ffmpeg -i input.mov -c:v libx264 -preset veryfast -crf 20 -c:a aac -b:a 160k -movflags +faststart output.mp4
```

Hardware acceleration preferred where available:

- NVIDIA: `h264_nvenc`
- Intel: `h264_qsv`
- AMD: `h264_amf`
- Windows native where appropriate: Media Foundation encoder, if stable

Strategy:

1. Detect available hardware encoder
2. Prefer hardware encoder for speed
3. Fall back to libx264 if hardware encoding fails
4. Preserve quality target over extreme compression

#### Case 4: HDR / Dolby Vision / HLG

Output should be SDR unless user chooses otherwise.

Goal:

- avoid washed-out playback
- maintain natural colors
- avoid requiring the user to understand HDR

Suggested FFmpeg filter direction:

```bash
-vf zscale=t=linear:npl=100,tonemap=hable,zscale=t=bt709:m=bt709:r=tv,format=yuv420p
```

Implementation should test several tone-mapping options:

- hable
- mobius
- reinhard

Default should prioritize natural skin tones and predictable Windows playback.

#### Case 5: Very large 4K file

Default behavior:

- preserve resolution if reasonable
- reduce bitrate intelligently
- offer “Smaller file” preset

Presets:

| Preset | Video | Use |
|---|---|---|
| Windows MP4 | H.264, original resolution, CRF 20 | default |
| Smaller file | H.264, CRF 24, optional 1080p | sharing |
| PowerPoint | H.264, 1080p, AAC | presentation |
| Editor safe | H.264, constant frame rate | Premiere / Resolve |

### Output naming

Never overwrite originals.

Default:

```txt
Original: IMG_4821.MOV
Output:   IMG_4821_unblock.mp4
```

If duplicate:

```txt
IMG_4821_unblock_2.mp4
```

### Output location

Default:

```txt
Same folder as original
```

Allow:

- choose output folder
- remember last output folder
- open output folder after conversion

---

## 9. Performance requirements

The user asked for “爆速度” output.  
Design for speed without producing broken files.

### Speed principles

1. **Avoid transcoding when copy/rewrap is enough**
2. **Use hardware encoding when available**
3. **Batch process with a queue**
4. **Parallelize metadata scanning**
5. **Limit simultaneous transcodes to avoid thermal throttling**
6. **Stream progress from FFmpeg**
7. **Start next file immediately**
8. **Cache hardware capability detection**

### Performance targets

| Task | Target |
|---|---|
| Metadata scan | under 1 second per common video |
| MOV to MP4 rewrap | 10x–60x realtime depending on disk |
| HEVC to H.264 hardware encode | 2x–10x realtime |
| HEVC to H.264 CPU encode | 0.5x–3x realtime depending on CPU |
| UI response | never block |
| Progress update | every 250–500ms |

### Queue design

Use a job queue.

Each job has:

```ts
type ConversionJob = {
  id: string
  inputPath: string
  outputPath: string
  status: 'queued' | 'analyzing' | 'ready' | 'converting' | 'done' | 'failed'
  detectedIssues: string[]
  selectedPreset: Preset
  progress: number
  speed?: string
  eta?: string
  error?: string
}
```

### Hardware encoder selection

Priority:

1. NVIDIA NVENC if available
2. Intel Quick Sync if available
3. AMD AMF if available
4. CPU libx264 fallback

Provide internal benchmark mode later, but not required for MVP.

---

## 10. MVP feature set

### Must have

- drag and drop video files
- file picker
- batch conversion
- metadata scan
- MOV to MP4 rewrap
- HEVC to H.264 MP4 conversion
- AAC audio output
- HDR to SDR conversion
- progress bar
- output folder open button
- original file protection
- local processing
- Windows 10 / 11 support
- error messages in plain English

### Should have

- hardware acceleration
- PowerPoint preset
- Smaller file preset
- Editor safe preset
- output size estimate
- thumbnails
- conversion history
- dark UI
- auto-update

### Later

- macOS version
- context menu integration
- folder watch mode
- before/after preview
- cloud drive integration
- Japanese localization
- enterprise license

---

## 11. Error handling copy

Errors must lower understanding cost.

Do not say:

```txt
ffmpeg exited with code 1
```

Say:

```txt
This video could not be converted. The file may be damaged or incomplete.
```

Examples:

### Unsupported file

```txt
This file is not a supported iPhone video.
Try MOV, MP4, or M4V files.
```

### No write permission

```txt
Unblock could not save the MP4 in this folder.
Choose another output folder and try again.
```

### Hardware encoder failed

```txt
Fast conversion was not available, so Unblock switched to safe mode.
```

### Disk full

```txt
There is not enough free space to create the MP4.
Free up space or choose another drive.
```

---

## 12. SEO strategy

Follow Google’s general direction: make pages useful for users and easy for search engines to understand. Google’s own SEO starter guide says SEO helps search engines understand content and helps users find a site and decide whether to visit. Technical page experience such as Core Web Vitals should also be treated as part of the user experience, not as a trick.

Official references:

- Google SEO Starter Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Google structured data introduction: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
- Google Video SEO best practices: https://developers.google.com/search/docs/appearance/video
- Google VideoObject structured data: https://developers.google.com/search/docs/appearance/structured-data/video
- Google Core Web Vitals: https://developers.google.com/search/docs/appearance/core-web-vitals

### SEO goal

Become the first result users find when they search for:

> iPhone video does not work on Windows

The site should target problem-aware users first, not only tool-aware users.

### Primary keyword cluster

Main page target:

```txt
convert iPhone video to MP4 on Windows
```

### Secondary keyword clusters

#### Compatibility problems

- iPhone video not playing on Windows
- iPhone videos won’t open on PC
- iPhone MOV not playing Windows
- iPhone video codec missing Windows
- Windows can’t play iPhone video
- iPhone HEVC video not playing Windows

#### Conversion intent

- convert iPhone MOV to MP4
- iPhone MOV to MP4 Windows
- convert iPhone HEVC to H264
- HEVC to MP4 converter for Windows
- H265 to H264 converter Windows
- convert iPhone video to Windows format

#### HDR problem intent

- iPhone HDR video looks washed out on Windows
- iPhone video too bright on Windows
- convert iPhone HDR to SDR
- fix washed out iPhone video Windows

#### App-specific use cases

- iPhone video not working in PowerPoint
- iPhone video not importing Premiere Pro
- iPhone video stutters in DaVinci Resolve
- iPhone 4K video too large to send
- make iPhone video smaller on Windows

### Page title options

Primary:

```txt
Convert iPhone Videos to MP4 on Windows | Unblock
```

A/B option:

```txt
iPhone Video Not Playing on Windows? Convert to MP4 | Unblock
```

### Meta description

```txt
Convert iPhone MOV, HEVC, HDR, and 4K videos into Windows-friendly MP4 files. Unblock fixes codec problems automatically and keeps your original files safe.
```

### H1

```txt
Drop videos. Get MP4.
```

### SEO H1 alternative for content page

```txt
Convert iPhone Videos to MP4 on Windows
```

### Recommended H2 structure

```txt
Why iPhone videos do not play on Windows
How Unblock converts iPhone videos automatically
Convert MOV to MP4 without changing the original
Convert HEVC / H.265 to H.264 for Windows
Fix iPhone HDR videos that look washed out
Make large 4K iPhone videos easier to share
Works with Windows Media Player, PowerPoint, and video editors
Frequently asked questions
```

### URL structure

Core pages:

```txt
/
 /iphone-video-to-mp4-windows
 /iphone-mov-to-mp4
 /hevc-to-h264-windows
 /iphone-hdr-to-sdr
 /iphone-video-not-playing-windows
 /iphone-video-powerpoint
 /iphone-video-premiere-pro
 /download
 /pricing
 /faq
```

Blog / help pages:

```txt
/help/why-iphone-videos-dont-play-on-windows
/help/convert-iphone-mov-to-mp4-on-windows
/help/fix-iphone-hevc-codec-error-windows
/help/fix-washed-out-iphone-hdr-video
/help/make-iphone-video-smaller-without-breaking-quality
/help/best-format-for-iphone-videos-on-windows
```

### Internal linking

Every help article should link to:

- home
- download
- relevant converter page
- FAQ

Anchor examples:

```txt
convert iPhone video to MP4 on Windows
fix iPhone HEVC video on Windows
convert iPhone MOV to MP4
make iPhone videos Windows compatible
```

Avoid spammy repetition. Write naturally.

---

## 13. Landing page SEO copy draft

Use this as the base copy.

### Hero

```txt
Drop videos. Get MP4.

Unblock converts iPhone MOV, HEVC, HDR, and 4K videos into Windows-friendly MP4 files — without opening a single setting.
```

### Problem

```txt
iPhone videos can fail on Windows because newer iPhones often record in formats like MOV, HEVC, H.265, HDR, or Dolby Vision. Some Windows apps expect standard MP4 files with H.264 video and SDR color, so the video may not open, may require a codec, or may look washed out.
```

### Solution

```txt
Unblock detects the problem automatically and creates a clean MP4 that works in common Windows apps. It chooses the right container, codec, audio, and color settings for you.
```

### Privacy

```txt
Your videos stay on your computer. Unblock processes files locally and keeps the original video untouched.
```

### Speed

```txt
Unblock avoids unnecessary conversion. If your iPhone video only needs to be repackaged as MP4, it uses a fast copy process. If the video needs codec conversion, it uses hardware acceleration when available.
```

---

## 14. Structured data

Add JSON-LD to the landing page.

### SoftwareApplication schema

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Unblock",
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "Windows 10, Windows 11",
  "description": "Unblock converts iPhone MOV, HEVC, HDR, and 4K videos into Windows-friendly MP4 files.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "publisher": {
    "@type": "Organization",
    "name": "sanacode"
  }
}
```

### FAQPage schema

Add FAQPage schema for the FAQ section.

Required FAQ entities:

- Why won’t my iPhone video play on Windows?
- How do I convert iPhone MOV to MP4 on Windows?
- Can Unblock convert HEVC to H.264?
- Does Unblock upload my videos?
- Does Unblock keep the original file?

### VideoObject schema

If a demo video is added, use VideoObject structured data on the page where the video is embedded. Include:

- name
- description
- thumbnailUrl
- uploadDate
- duration
- contentUrl or embedUrl

---

## 15. Technical SEO

### Core requirements

- SSR or static HTML for landing pages
- unique title and meta description per page
- canonical URL
- Open Graph tags
- Twitter card tags
- sitemap.xml
- robots.txt
- clean semantic HTML
- one H1 per page
- descriptive alt text
- compressed images
- no layout shift
- fast first paint
- responsive design
- accessible contrast
- keyboard-accessible controls

### Core Web Vitals targets

| Metric | Target |
|---|---|
| LCP | under 2.5s |
| INP | under 200ms |
| CLS | under 0.1 |

### Performance tactics

- inline critical CSS for landing page
- lazy-load non-critical assets
- avoid heavy animation libraries on marketing pages
- use CSS gradients instead of large background images
- preload main font only if self-hosted
- use system font by default
- keep JavaScript minimal on landing pages

---

## 16. Recommended tech stack

### Desktop app options

Best MVP stack:

```txt
Tauri + React + TypeScript + Rust sidecar commands
```

Why:

- smaller app size than Electron
- good Windows packaging
- can call FFmpeg reliably
- modern UI
- safer file system handling

Alternative:

```txt
Electron + React + TypeScript
```

Use Electron only if faster implementation is more important than app size.

### Landing page

Recommended:

```txt
Next.js or Astro
```

If the goal is speed and SEO:

```txt
Astro + static pages
```

If the app dashboard and marketing site share React components:

```txt
Next.js
```

### Conversion binary

Bundle:

- ffmpeg
- ffprobe

Need to comply with FFmpeg licensing depending on build configuration.

---

## 17. Suggested project structure

```txt
unblock/
  apps/
    desktop/
      src/
        components/
        screens/
        hooks/
        lib/
        styles/
      src-tauri/
        src/
        tauri.conf.json
    web/
      src/
        pages/
        components/
        content/
        styles/
  packages/
    core/
      analyzer/
      presets/
      jobs/
      ffmpeg/
      seo/
  docs/
    SPEC.md
```

---

## 18. App states

The UI should support these states:

### Empty

```txt
Drop iPhone videos here
MOV · HEVC · HDR · 4K · local processing
```

### Analyzing

```txt
Checking video compatibility…
```

### Ready

```txt
Ready to convert
```

### Converting

```txt
Creating Windows-friendly MP4…
```

### Done

```txt
Your MP4 is ready
```

### Failed

```txt
This video could not be converted
```

---

## 19. UI component list

### Marketing page

- Header
- BrandLogo
- NavLinks
- StatusPill
- HeroBadge
- GradientHeadline
- DropZonePreview
- PresetPills
- FeatureCards
- FAQAccordion
- Footer

### Desktop app

- AppShell
- Sidebar
- DropZone
- FileQueue
- FileRow
- IssueBadge
- PresetSelector
- ProgressBar
- OutputFolderPicker
- ConvertButton
- HistoryList
- SettingsPanel
- Toast

---

## 20. Accessibility

Requirements:

- all buttons keyboard accessible
- visible focus states
- file input accessible through button
- drag/drop has button fallback
- contrast meets WCAG AA
- progress announced with aria attributes
- errors readable by screen readers
- no essential information conveyed by color alone

---

## 21. Analytics events

Track privacy-safe product events only.  
Do not track filenames or file content.

Events:

```txt
landing_view
download_click
file_picker_opened
files_added_count
analysis_completed
conversion_started
conversion_completed
conversion_failed
preset_changed
output_folder_changed
faq_opened
```

Properties:

- file count
- detected issue types
- selected preset
- conversion duration
- success/failure
- app version

Never send:

- filenames
- file paths
- thumbnails
- video content
- personal metadata

---

## 22. Pricing idea

MVP can start free with paid Pro later.

### Free

- single file conversion
- basic MP4 output
- limited batch size

### Pro

- unlimited batch conversion
- hardware acceleration
- HDR to SDR
- PowerPoint / editor presets
- priority updates

Avoid aggressive paywalls before the core trust is established.

---

## 23. Launch checklist

### Product

- [ ] Drag/drop works
- [ ] File picker works
- [ ] MOV to MP4 rewrap works
- [ ] HEVC to H.264 works
- [ ] HDR to SDR works
- [ ] Batch queue works
- [ ] Output never overwrites originals
- [ ] Hardware acceleration fallback works
- [ ] Plain-English errors
- [ ] Windows installer signed if possible

### SEO

- [ ] Landing page published
- [ ] `/iphone-video-to-mp4-windows` page published
- [ ] `/iphone-video-not-playing-windows` page published
- [ ] FAQ schema added
- [ ] SoftwareApplication schema added
- [ ] sitemap.xml added
- [ ] Search Console connected
- [ ] Core Web Vitals checked
- [ ] Demo video page with VideoObject schema if video exists
- [ ] Help articles internally linked

### Trust

- [ ] Privacy page
- [ ] Local processing explanation
- [ ] Original file safety explanation
- [ ] Changelog
- [ ] Contact email
- [ ] Clear license terms

---

## 24. Codex implementation prompt

Use this prompt when giving the project to Codex.

```txt
Build Unblock by sanacode.

Unblock is a Windows-focused app and SEO landing page for converting iPhone videos into Windows-friendly MP4 files. The concept is “lower the cost of understanding.” Users should not need to understand MOV, HEVC, H.265, HDR, SDR, codecs, containers, or bitrate.

Use the current dark HTML design direction:
- near-black background
- subtle grid
- violet/blue glow
- centered hero
- gradient headline
- large rounded drop zone
- status pill
- minimal nav
- clean cards
- app name: Unblock by sanacode

Core copy:
H1: Drop videos. Get MP4.
Subtitle: Unblock converts iPhone MOV, HEVC, HDR, and 4K videos into Windows-friendly MP4 files — without opening a single setting.

Build the landing page with strong SEO for:
- convert iPhone video to MP4 on Windows
- iPhone video not playing on Windows
- iPhone MOV to MP4 Windows
- HEVC to H.264 converter for Windows
- iPhone HDR video looks washed out on Windows

Include:
- semantic HTML
- title/meta/OG/Twitter tags
- SoftwareApplication JSON-LD
- FAQPage JSON-LD
- fast static rendering
- responsive layout
- accessible controls
- Core Web Vitals friendly CSS

For the app logic, design the conversion architecture:
- ffprobe metadata scan
- classify compatibility issues
- choose fastest safe preset
- rewrap when possible
- transcode HEVC to H.264 when needed
- HDR to SDR when needed
- hardware acceleration when available
- never overwrite original files
- batch queue with progress

Default output:
MP4 container, H.264 video, AAC audio, SDR color, +faststart.

Create clean code with components for:
Header, Hero, DropZone, PresetPills, FeatureCards, FAQ, Footer, FileQueue, ProgressBar, SettingsPanel.

Do not overcomplicate the UX. The main action is:
Drop iPhone video → Convert to MP4 → Use on Windows.
```

---

## 25. Final product principle

Whenever there is a tradeoff, choose the option that makes the user understand less and succeed faster.

**The user should feel:**

> “I don’t know what codec means, but this fixed my iPhone video.”
