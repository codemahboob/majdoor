# मजदूर अड्डा — Top 15 Bhojpuri Hits

Single-page music player. Vanilla HTML/CSS/JS, no build step, no framework, no dependencies. Total page weight (excluding audio) is under ~350KB.

## 1. Add your songs

The `SONGS` array in `script.js` is already filled in with your Top 15 list. Just drop the matching MP3 files into `/audio` named to line up with the ranking:

```
audio/01.mp3   Lollipop Lagelu — Pawan Singh
audio/02.mp3   Raja Raja Kareja Mein Samaja — Manoj Tiwari
audio/03.mp3   Chhalakata Hamro Jawaniya — Pawan Singh
audio/04.mp3   Raate Diya Buta Ke — Pawan Singh, Indu Sonali
audio/05.mp3   Laga Ke Fair Lovely — Khesari Lal Yadav, Khushboo Jain
audio/06.mp3   Lachke Kamariya Tohar — Khesari Lal Yadav, Priyanka Singh
audio/07.mp3   Milte Marad Hamke Bhul Gailu — Pawan Singh
audio/08.mp3   Goriya Chaal Tohar Matwali — Pawan Singh
audio/09.mp3   Pagli Deewani — Khesari Lal Yadav
audio/10.mp3   Marad Abhi Baccha Ba — Khesari Lal Yadav
audio/11.mp3   Jable Jagal Bani — Pawan Singh
audio/12.mp3   Aanganwa Ke Chhathi Maiya — Manoj Tiwari
audio/13.mp3   Saj Ke Sawar Ke — Pawan Singh
audio/14.mp3   Milela Jodi Kahan — Arvind Akela Kallu
audio/15.mp3   Chhath Ghate Chali — Pawan Singh
```

Want a different order or different tracks? Just edit the `SONGS` array at the top of `script.js` — the player, playlist drawer, and everything else reads from that one array.

## 2. Run locally

Any static server works, e.g. from Termux:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## 3. Push to GitHub (Termux)

```bash
cd majdoor-adda
git init
git add .
git commit -m "मजदूर अड्डा — initial build"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

## 4. Deploy on Vercel

- Go to vercel.com → **Add New Project** → import the GitHub repo.
- Framework preset: **Other** (it's static, no build command, no output dir needed).
- Deploy. Done.

Or via CLI:

```bash
npm i -g vercel
vercel --prod
```

## Notes

- Audio files are **not** included in this repo (copyright) — you add your own.
- `assets/hero-desktop.jpg` and `assets/hero-mobile.jpg` are your two illustrations, already optimized (~320KB each, progressive JPEG).
- Fonts load from Google Fonts CDN (Baloo 2 + Hind) — remove the `<link>` tags in `index.html` and self-host if you want zero external requests.
- Share button uses the native Web Share API on mobile, falls back to clipboard copy on desktop.


## YouTube playlist

The custom player now uses the official YouTube IFrame Player API with this playlist:
`PLBEA33fZZwSSA6gaheeQLRkAhg6OPT-p0`

No MP3 files are required in `/audio` for playback. The visible controls remain the site's custom player UI; YouTube supplies the playback stream.


## Dynamic YouTube album artwork

The player no longer uses one fixed album image for every song. Whenever the
YouTube playlist moves to a different video, the player reads that video's
`video_id` and automatically loads its YouTube thumbnail as the album artwork.

While a song is playing, the circular artwork rotates slowly once every 18
seconds. It stops rotating when playback is paused/stopped.


## Desktop player + live title marquee

On desktop the floating player is centered and given a wider layout so the
artwork, title, progress bar, and controls remain inside the viewport. Long
song titles now scroll continuously across the title area instead of being
cut off with an ellipsis.
