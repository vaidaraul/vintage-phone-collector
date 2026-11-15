(function () {
  "use strict";

  var state = {
    tab: "today",
    news: [],
    scores: [],
    leagueFilter: null,
    loaded: false,
    updated: null
  };

  var app = document.getElementById("app");
  var pivot = document.getElementById("pivot");
  var drawer = document.getElementById("drawer");
  var backdrop = document.getElementById("drawerBackdrop");
  var refreshBtn = document.getElementById("refreshBtn");
  var menuBtn = document.getElementById("menuBtn");
  var pageTitle = document.getElementById("pageTitle");

  var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function bg(url) {
    return "background-image:url('" + String(url || "").replace(/'/g, "%27").replace(/"/g, "%22") + "')";
  }

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function parseDate(value) {
    var d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  function timeAgo(value) {
    var d = parseDate(value);
    if (!d) return "";
    var seconds = Math.max(1, Math.round((Date.now() - d.getTime()) / 1000));
    if (seconds < 60) return seconds + "s ago";
    var minutes = Math.round(seconds / 60);
    if (minutes < 60) return minutes + "m ago";
    var hours = Math.round(minutes / 60);
    if (hours < 24) return hours + "h ago";
    var days = Math.round(hours / 24);
    if (days < 7) return days + "d ago";
    return d.getDate() + " " + MONTHS[d.getMonth()];
  }

  function formatKickoff(value) {
    var d = parseDate(value);
    if (!d) return "";
    return DAYS[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()] + " · " + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  function statusText(event) {
    var status = String(event.status || "");
    if (/in progress|halftime|half time|1st half|2nd half|live/i.test(status)) {
      return { text: status || "Live", cls: "live" };
    }
    if (/final|full time|completed|ft/i.test(status) || event.completed) {
      return { text: status || "Final", cls: "final" };
    }
    return { text: status ? status + " · " + formatKickoff(event.date) : formatKickoff(event.date), cls: "" };
  }

  function storyMeta(article) {
    var provider = article.Provider && (article.Provider.DisplayName || article.Provider.Name);
    var bits = [];
    if (provider) bits.push(provider);
    var ago = timeAgo(article.PublishedDateTime);
    if (ago) bits.push(ago);
    return bits.join(" · ");
  }

  function kicker(article) {
    return (article.Categories && article.Categories[0]) || article.Sport || "Sport";
  }

  function imageOf(article) {
    return (article.Images && article.Images[0] && article.Images[0].Url) || "";
  }

  function heroHtml(article) {
    if (!article) return "";
    var image = imageOf(article);
    return (
      '<div class="hero tap" data-url="' + esc(article.Url) + '">' +
      '<div class="hero-img"' + (image ? ' style="' + bg(image) + '"' : "") + "></div>" +
      '<div class="hero-grad"></div>' +
      '<div class="hero-content">' +
      '<div class="kicker">' + esc(kicker(article)) + "</div>" +
      '<div class="hero-title">' + esc(article.Title) + "</div>" +
      '<div class="hero-meta">' + esc(storyMeta(article)) + "</div>" +
      "</div></div>"
    );
  }

  function storyHtml(article) {
    var image = imageOf(article);
    return (
      '<div class="story tap" data-url="' + esc(article.Url) + '">' +
      '<div class="story-thumb' + (image ? "" : " no-img") + '"' + (image ? ' style="' + bg(image) + '"' : "") + "></div>" +
      '<div class="story-body">' +
      '<div class="story-title">' + esc(article.Title) + "</div>" +
      '<div class="story-meta">' + esc(storyMeta(article)) + "</div>" +
      "</div></div>"
    );
  }

  function teamRow(team, league) {
    var logo = team.logo || (league && league.logo) || "assets/sports-logo.png";
    var cls = "team-row";
    if (team.winner) cls += " winner";
    else if (team.score !== "" && team.score != null && team.score !== "0") cls += "";
    return (
      '<div class="' + cls + '">' +
      '<img class="team-logo" src="' + esc(logo) + '" alt="" onerror="this.style.visibility=\'hidden\'">' +
      '<span class="team-name">' + esc(team.short || team.name || team.abbreviation) + "</span>" +
      '<span class="team-score">' + esc(team.score == null ? "" : team.score) + "</span>" +
      "</div>"
    );
  }

  function raceCardHtml(league, event, showLeague, compact) {
    var status = statusText(event);
    var drivers = event.drivers || [];
    var constructors = compact ? [] : (event.constructors || []);
    var driverRows = drivers.slice(0, 3).map(function (d) {
      return (
        '<div class="race-driver">' +
        '<span class="race-pos">' + esc(d.rank || "") + "</span>" +
        (d.flag ? '<img class="driver-flag" src="' + esc(d.flag) + '" alt="" onerror="this.style.visibility=\'hidden\'">' : "") +
        '<span class="driver-name">' + esc(d.name || d.short) + "</span>" +
        '<span class="driver-pts">' + esc(d.points || "") + "</span>" +
        "</div>"
      );
    }).join("");
    var teamRows = constructors.slice(0, 3).map(function (t) {
      return (
        '<div class="race-driver">' +
        '<span class="race-pos">' + esc(t.rank || "") + "</span>" +
        (t.color ? '<span class="team-color" style="background:' + esc(t.color) + '"></span>' : "") +
        '<span class="driver-name">' + esc(t.name || t.short) + "</span>" +
        '<span class="driver-pts">' + esc(t.points || "") + "</span>" +
        "</div>"
      );
    }).join("");
    return (
      '<div class="score-card race-card' + (event.url ? " tap" : "") + '"' + (event.url ? ' data-url="' + esc(event.url) + '"' : "") + ">" +
      (showLeague ? '<div class="score-league">Formula 1</div>' : "") +
      '<div class="score-status ' + status.cls + '">' + esc(status.text) + "</div>" +
      '<div class="race-name">' + esc(event.name) + "</div>" +
      (event.circuit ? '<div class="race-circuit">' + esc(event.circuit) + "</div>" : "") +
      (driverRows ? '<div class="race-block"><div class="race-block-title">Drivers</div>' + driverRows + "</div>" : "") +
      (teamRows ? '<div class="race-block"><div class="race-block-title">Constructors</div>' + teamRows + "</div>" : "") +
      "</div>"
    );
  }

  function scoreCardHtml(league, event, showLeague, compact) {
    if (event.kind === "race" || league.kind === "race") {
      return raceCardHtml(league, event, showLeague, compact);
    }
    var status = statusText(event);
    return (
      '<div class="score-card">' +
      (showLeague ? '<div class="score-league">' + esc(league.name) + "</div>" : "") +
      '<div class="score-status ' + status.cls + '">' + esc(status.text) + "</div>" +
      teamRow(event.home, league) +
      teamRow(event.away, league) +
      "</div>"
    );
  }

  function leagueHeadHtml(league) {
    var sub = league.kind === "race"
      ? "Next race"
      : league.events.length + (league.events.length === 1 ? " game" : " games");
    return (
      '<div class="league-head">' +
      (league.logo ? '<img src="' + esc(league.logo) + '" alt="" onerror="this.style.visibility=\'hidden\'">' : "") +
      "<h3>" + esc(league.name) + "</h3>" +
      '<span class="count">' + sub + "</span>" +
      "</div>"
    );
  }

  function activeLeagues() {
    return state.scores.filter(function (league) {
      return league && league.events && league.events.length;
    });
  }

  function allEvents() {
    var out = [];
    activeLeagues().forEach(function (league) {
      league.events.forEach(function (event) {
        out.push({ league: league, event: event });
      });
    });
    return out;
  }

  function renderToday() {
    var html = "";
    var news = state.news;
    if (news.length) {
      var heroIndex = 0;
      for (var hi = 0; hi < news.length; hi++) {
        if (imageOf(news[hi])) {
          heroIndex = hi;
          break;
        }
      }
      html += heroHtml(news[heroIndex]);
      var stories = news.filter(function (_, idx) { return idx !== heroIndex; }).slice(0, 7);
      if (stories.length) {
        html += '<div class="section-head"><h2>Top Stories</h2><button class="more" type="button" data-tab="news">See all</button></div>';
        html += '<div class="story-list">' + stories.map(storyHtml).join("") + "</div>";
      }
    }

    var f1 = state.scores.filter(function (league) {
      return league.id === "f1" && league.events && league.events.length;
    })[0];
    if (f1) {
      html += '<div class="section-head"><h2>Formula 1</h2><button class="more" type="button" data-tab="scores">See all</button></div>';
      html += '<div class="score-grid">' + raceCardHtml(f1, f1.events[0], true) + "</div>";
    }

    var events = allEvents();
    if (events.length) {
      html += '<div class="section-head"><h2>Scores</h2><button class="more" type="button" data-tab="scores">See all</button></div>';
      html += '<div class="score-strip">' + events.slice(0, 8).map(function (item) {
        return scoreCardHtml(item.league, item.event, true, true);
      }).join("") + "</div>";
    }

    if (!html) html = '<div class="empty">Nothing to show yet. Pull refresh to try again.</div>';
    app.innerHTML = html;
  }

  function renderScores() {
    var leagues = activeLeagues();
    if (state.leagueFilter) {
      leagues = leagues.filter(function (league) {
        return league.id === state.leagueFilter;
      });
    }
    if (!leagues.length) {
      app.innerHTML = '<div class="empty">No games today. Check back later.</div>';
      return;
    }
    var html = "";
    leagues.forEach(function (league) {
      html += leagueHeadHtml(league);
      html += '<div class="score-grid">' + league.events.map(function (event) {
        return scoreCardHtml(league, event, false);
      }).join("") + "</div>";
    });
    app.innerHTML = html;
  }

  function renderNews() {
    if (!state.news.length) {
      app.innerHTML = '<div class="empty">No sports stories right now.</div>';
      return;
    }
    app.innerHTML = '<div class="story-list">' + state.news.map(storyHtml).join("") + "</div>";
  }

  function renderLeagues() {
    if (!state.scores.length) {
      app.innerHTML = '<div class="empty">No leagues available.</div>';
      return;
    }
    var html = '<div class="league-grid">' + state.scores.map(function (league) {
      var count = league.events ? league.events.length : 0;
      var sub = league.kind === "race" ? "Next race" : (count ? count + (count === 1 ? " game" : " games") : "No games");
      return (
        '<button class="league-tile" type="button" data-league="' + esc(league.id) + '">' +
        (league.logo ? '<img src="' + esc(league.logo) + '" alt="" onerror="this.style.visibility=\'hidden\'">' : "") +
        '<span class="name">' + esc(league.name) + "</span>" +
        '<span class="sub">' + sub + "</span>" +
        "</button>"
      );
    }).join("") + "</div>";
    app.innerHTML = html;
  }

  function render() {
    if (!state.loaded) return;
    if (state.tab === "scores") renderScores();
    else if (state.tab === "news") renderNews();
    else if (state.tab === "leagues") renderLeagues();
    else renderToday();
  }

  function setTab(tab) {
    state.tab = tab;
    if (tab !== "scores") state.leagueFilter = null;
    var labels = { today: "Today", scores: "Scores", news: "News", leagues: "Leagues" };
    if (pageTitle) pageTitle.textContent = labels[tab] || "Sports";
    var buttons = document.querySelectorAll("[data-tab]");
    for (var i = 0; i < buttons.length; i++) {
      var b = buttons[i];
      if (b.parentNode === pivot || b.parentNode === drawer) {
        b.className = b.getAttribute("data-tab") === tab ? "active" : "";
      }
    }
    closeDrawer();
    render();
    window.scrollTo(0, 0);
  }

  function openDrawer() {
    drawer.className = "drawer open";
    backdrop.className = "drawer-backdrop open";
  }

  function closeDrawer() {
    drawer.className = "drawer";
    backdrop.className = "drawer-backdrop";
  }

  function saveCache(key, data) {
    try {
      localStorage.setItem("sports_" + key, JSON.stringify({ t: Date.now(), d: data }));
    } catch (e) { /* ignore quota errors */ }
  }

  function readCache(key) {
    try {
      var raw = localStorage.getItem("sports_" + key);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      return parsed && parsed.d ? parsed.d : null;
    } catch (e) {
      return null;
    }
  }

  function getJson(url, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url + (url.indexOf("?") < 0 ? "?" : "&") + "v=" + Date.now(), true);
    xhr.timeout = 20000;
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          cb(null, JSON.parse(xhr.responseText));
        } catch (e) {
          cb(e);
        }
      } else {
        cb(new Error("HTTP " + xhr.status));
      }
    };
    xhr.ontimeout = function () { cb(new Error("timeout")); };
    xhr.onerror = function () { cb(new Error("network")); };
    xhr.send();
  }

  function load() {
    refreshBtn.className = "icon-btn spinning";
    var pending = 2;
    var newsOk = false;
    var scoresOk = false;

    function done() {
      pending--;
      if (pending > 0) return;
      refreshBtn.className = "icon-btn";
      state.loaded = true;
      if (!newsOk && !state.news.length) state.news = readCache("news") || [];
      if (!scoresOk && !state.scores.length) state.scores = readCache("scores") || [];
      render();
    }

    getJson("data/news.json", function (err, data) {
      if (!err && data && data.Value) {
        state.news = data.Value;
        state.updated = data.Updated || state.updated;
        newsOk = true;
        saveCache("news", state.news);
      }
      done();
    });

    getJson("data/scores.json", function (err, data) {
      if (!err && data && data.Leagues) {
        state.scores = data.Leagues;
        state.updated = data.Updated || state.updated;
        scoresOk = true;
        saveCache("scores", state.scores);
      }
      done();
    });

    setTimeout(function () {
      if (!state.loaded) {
        state.loaded = true;
        state.news = readCache("news") || [];
        state.scores = readCache("scores") || [];
        refreshBtn.className = "icon-btn";
        if (!state.news.length && !state.scores.length) {
          app.innerHTML = '<div class="error">Could not load Sports.<br><button type="button" id="retryBtn">Retry</button></div>';
          var retry = document.getElementById("retryBtn");
          if (retry) retry.onclick = load;
        } else {
          render();
        }
      }
    }, 21000);
  }

  app.addEventListener("click", function (event) {
    var node = event.target;
    while (node && node !== app) {
      if (node.getAttribute && node.getAttribute("data-url")) {
        window.open(node.getAttribute("data-url"), "_blank");
        return;
      }
      if (node.getAttribute && node.getAttribute("data-league")) {
        state.leagueFilter = node.getAttribute("data-league");
        setTab("scores");
        return;
      }
      if (node.getAttribute && node.getAttribute("data-tab")) {
        setTab(node.getAttribute("data-tab"));
        return;
      }
      node = node.parentNode;
    }
  });

  pivot.addEventListener("click", function (event) {
    var tab = event.target.getAttribute && event.target.getAttribute("data-tab");
    if (tab) setTab(tab);
  });

  menuBtn.onclick = openDrawer;
  backdrop.onclick = closeDrawer;
  refreshBtn.onclick = load;

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeDrawer();
  });

  setInterval(function () {
    if (!document.hidden) load();
  }, 300000);

  load();
})();
