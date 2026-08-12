/* =========================================================
   मजदूर अड्डा — Tumsa Koi Pya / custom YouTube playlist player
   Uses the official YouTube IFrame Player API.
   ========================================================= */
(() => {
  "use strict";

  const PLAYLIST_ID = "PLBEA33fZZwSSA6gaheeQLRkAhg6OPT-p0";

  const $ = (id) => document.getElementById(id);

  const player      = $("player");
  const trackTitle  = $("trackTitle");
  const trackTitleTrack = trackTitle?.querySelector(".track-title-track");
  const trackTitleSpans = trackTitleTrack ? trackTitleTrack.querySelectorAll("span") : [];
  const trackSinger = $("trackSinger");
  const curTimeEl   = $("curTime");
  const durTimeEl   = $("durTime");
  const seek        = $("seek");
  const prevBtn     = $("prevBtn");
  const playBtn     = $("playBtn");
  const playVisual  = $("playVisual");
  const pauseVisual = $("pauseVisual");
  const nextBtn     = $("nextBtn");
  const toastEl     = $("toast");
  const onlineCountEl = $("onlineCount");
  const playerArtImg = $("playerArt")?.querySelector("img");

  let ytPlayer = null;
  let ready = false;
  let isSeeking = false;
  let toastTimer = null;
  let progressTimer = null;

  function fmtTime(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2400);
  }

  function updateSeekVisual() {
    const max = Number(seek.max) || 100;
    const value = Number(seek.value) || 0;
    const pct = Math.max(0, Math.min(100, (value / max) * 100));
    seek.style.setProperty("--seek-progress", pct + "%");
  }

  function setPlayingUI(playing) {
    playVisual.style.display = playing ? "none" : "block";
    pauseVisual.style.display = playing ? "flex" : "none";
    playBtn.setAttribute("aria-label", playing ? "Pause" : "Play");
    player.classList.toggle("is-playing", playing);
  }

  function setTrackTitle(title) {
    const text = title || "YouTube song";
    if (trackTitleSpans.length) {
      trackTitleSpans.forEach((span) => {
        span.textContent = text;
      });
      trackTitle.classList.remove("is-marquee");
      requestAnimationFrame(() => {
        // Only animate when the complete title cannot fit in the desktop/mobile
        // player. Short titles remain still and fully visible.
        const needsScroll = trackTitleTrack.scrollWidth > trackTitle.clientWidth + 4;
        trackTitle.classList.toggle("is-marquee", needsScroll);
      });
    } else {
      trackTitle.textContent = text;
    }
  }

  function updateTrackTitleMarquee() {
    if (!trackTitle || !trackTitleTrack) return;
    trackTitle.classList.remove("is-marquee");
    requestAnimationFrame(() => {
      trackTitle.classList.toggle(
        "is-marquee",
        trackTitleTrack.scrollWidth > trackTitle.clientWidth + 4
      );
    });
  }

  function updateTrackInfo() {
    if (!ytPlayer || !ready) return;

    const data = ytPlayer.getVideoData ? ytPlayer.getVideoData() : null;
    if (data) {
      setTrackTitle(data.title || "YouTube song");
      trackSinger.textContent = data.author || "YouTube";

      // Every YouTube playlist item has its own videoId. Use that ID to
      // automatically load the matching YouTube thumbnail as the album art.
      if (playerArtImg && data.video_id) {
        const videoId = data.video_id;
        const thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
        playerArtImg.dataset.videoId = videoId;
        if (playerArtImg.src !== thumbnail) {
          playerArtImg.src = thumbnail;
          playerArtImg.alt = `${data.title || "Song"} album artwork`;
        }
      }
    }

    const duration = ytPlayer.getDuration ? ytPlayer.getDuration() : 0;
    if (duration > 0) {
      durTimeEl.textContent = fmtTime(duration);
      seek.max = Math.max(1, duration);
    }

    seek.value = 0;
    curTimeEl.textContent = "0:00";
    updateSeekVisual();
  }

  function syncProgress() {
    if (!ytPlayer || !ready || isSeeking) return;

    const current = ytPlayer.getCurrentTime ? ytPlayer.getCurrentTime() : 0;
    const duration = ytPlayer.getDuration ? ytPlayer.getDuration() : 0;

    curTimeEl.textContent = fmtTime(current);
    if (duration > 0) {
      durTimeEl.textContent = fmtTime(duration);
      seek.max = duration;
      seek.value = current;
      updateSeekVisual();
    }
  }

  function startProgressLoop() {
    clearInterval(progressTimer);
    progressTimer = setInterval(syncProgress, 250);
  }

  function stopProgressLoop() {
    clearInterval(progressTimer);
    progressTimer = null;
  }

  function playCurrent() {
    if (!ready) {
      showToast("YouTube player अभी load हो रहा है…");
      return;
    }
    ytPlayer.playVideo();
  }

  function onPlayerReady() {
    ready = true;
    ytPlayer.cuePlaylist({
      listType: "playlist",
      list: PLAYLIST_ID,
      index: 0
    });
    updateTrackInfo();
    setPlayingUI(false);
  }

  function onPlayerStateChange(event) {
    switch (event.data) {
      case YT.PlayerState.PLAYING:
        setPlayingUI(true);
        updateTrackInfo();
        startProgressLoop();
        break;

      case YT.PlayerState.PAUSED:
        setPlayingUI(false);
        syncProgress();
        stopProgressLoop();
        break;

      case YT.PlayerState.ENDED:
        setPlayingUI(false);
        syncProgress();
        stopProgressLoop();
        // YouTube advances the playlist itself when playlist playback is used.
        setTimeout(updateTrackInfo, 250);
        break;

      case YT.PlayerState.CUED:
        updateTrackInfo();
        setPlayingUI(false);
        break;
    }
  }

  // Required global callback for the YouTube IFrame API.
  window.onYouTubeIframeAPIReady = function () {
    ytPlayer = new YT.Player("youtubePlayer", {
      width: "200",
      height: "200",
      playerVars: {
        playsinline: 1,
        controls: 0,
        rel: 0,
        modestbranding: 1,
        iv_load_policy: 3
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: () => showToast("यह YouTube वीडियो इस साइट पर नहीं चल सकता।")
      }
    });
  };

  playBtn.addEventListener("click", () => {
    if (!ready) {
      showToast("YouTube player अभी load हो रहा है…");
      return;
    }

    const state = ytPlayer.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
      ytPlayer.pauseVideo();
    } else {
      ytPlayer.playVideo();
    }
  });

  prevBtn.addEventListener("click", () => {
    if (!ready) return;
    ytPlayer.previousVideo();
    setTimeout(updateTrackInfo, 350);
  });

  nextBtn.addEventListener("click", () => {
    if (!ready) return;
    ytPlayer.nextVideo();
    setTimeout(updateTrackInfo, 350);
  });

  seek.addEventListener("input", () => {
    isSeeking = true;
    const value = Number(seek.value) || 0;
    curTimeEl.textContent = fmtTime(value);
    updateSeekVisual();
  });

  seek.addEventListener("change", () => {
    if (ready && ytPlayer && ytPlayer.getDuration()) {
      ytPlayer.seekTo(Number(seek.value) || 0, true);
    }
    isSeeking = false;
  });

  function tickOnline() {
    const base = 28;
    const wobble = Math.floor(Math.random() * 7) - 3;
    onlineCountEl.textContent = Math.max(9, base + wobble);
  }
  setInterval(tickOnline, 4000);

  setPlayingUI(false);

  // Load the official YouTube IFrame API asynchronously.
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  tag.async = true;
  document.head.appendChild(tag);
  window.addEventListener("resize", updateTrackTitleMarquee);

})();
