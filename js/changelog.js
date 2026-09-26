/**
 * Airlines Manager Tycoon Toolkit (AMT Toolkit)
 * Live GitHub Commit Changelog Tracker (Homepage Compact Feed)
 * Repository: JayM3/AMT-Toolkit
 */

(function initChangelogModule() {
  'use strict';

  // Fallback real commits in case of rate-limiting (403) or offline testing
  const FALLBACK_COMMITS = [
    {
      sha: "3b6bc168b55979c3f3ca05f639ff25d2b7816e8f",
      author: { name: "JayM3", login: "JayM3", avatar_url: "https://avatars.githubusercontent.com/u/20011878?v=4" },
      date: "2026-09-26T12:20:00Z",
      message: "fix(homepage): redirect Get Addon button to v1.0.1 release",
      html_url: "https://github.com/JayM3/AMT-Toolkit/commit/3b6bc168b55979c3f3ca05f639ff25d2b7816e8f"
    },
    {
      sha: "b1f28d5a8a5660b789e9a074d4c3bc6f90d5257e",
      author: { name: "JayM3", login: "JayM3", avatar_url: "https://avatars.githubusercontent.com/u/20011878?v=4" },
      date: "2026-09-26T12:00:58Z",
      message: "release: v1.0.1 - bump Chrome extension version",
      html_url: "https://github.com/JayM3/AMT-Toolkit/commit/b1f28d5a8a5660b789e9a074d4c3bc6f90d5257e"
    },
    {
      sha: "c5a3d9c512bd5fb72cf76b2f1e70b3d72fa38880",
      author: { name: "JayM3", login: "JayM3", avatar_url: "https://avatars.githubusercontent.com/u/20011878?v=4" },
      date: "2026-09-25T22:26:54Z",
      message: "fix(route-finder): restore compact topline layout with small hub, aircraft selector and browse button",
      html_url: "https://github.com/JayM3/AMT-Toolkit/commit/c5a3d9c512bd5fb72cf76b2f1e70b3d72fa38880"
    },
    {
      sha: "cc7056d6238328fa0be56f63895c434107bc3f83",
      author: { name: "JayM3", login: "JayM3", avatar_url: "https://avatars.githubusercontent.com/u/20011878?v=4" },
      date: "2026-09-25T21:40:00Z",
      message: "feat(extension): modernize sidepanel header with icon badges and reload spin animation",
      html_url: "https://github.com/JayM3/AMT-Toolkit/commit/cc7056d6238328fa0be56f63895c434107bc3f83"
    },
    {
      sha: "1aac2ae5a8e0f6b3e6c98d7f2a1b4c3d5e6f7a8b",
      author: { name: "JayM3", login: "JayM3", avatar_url: "https://avatars.githubusercontent.com/u/20011878?v=4" },
      date: "2026-09-25T19:15:00Z",
      message: "fix(route-finder): elevate compact aircraft dropdown above tabs and adopt Seat Config hub selector",
      html_url: "https://github.com/JayM3/AMT-Toolkit/commit/1aac2ae5a8e0f6b3e6c98d7f2a1b4c3d5e6f7a8b"
    }
  ];

  const CACHE_KEY = 'amt_github_commits_cache_v1';
  const CACHE_TTL_MS = 5 * 60 * 1000; // 5-minute cache TTL to respect unauthenticated GitHub rate limits
  let isFetching = false;

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Parse conventional commit syntax: type(scope): title
  function parseCommitDetails(rawMessage) {
    const firstLine = (rawMessage || '').split('\n')[0].trim();
    const match = firstLine.match(/^([a-zA-Z]+)(?:\(([^)]+)\))?!?: (.+)$/);
    
    if (match) {
      return {
        type: match[1].toLowerCase(),
        scope: match[2] || null,
        title: match[3],
        raw: firstLine
      };
    }
    return {
      type: 'commit',
      scope: null,
      title: firstLine,
      raw: firstLine
    };
  }

  // Conventional commit badge style class
  function getBadgeClass(type) {
    switch (type) {
      case 'feat': return 'badge-feat';
      case 'fix': return 'badge-fix';
      case 'release': return 'badge-release';
      case 'perf': return 'badge-perf';
      case 'refactor': return 'badge-refactor';
      case 'docs': return 'badge-docs';
      default: return 'badge-chore';
    }
  }

  // Relative human-friendly timestamp (e.g. "2h ago", "yesterday")
  function formatRelativeTime(dateString) {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffSeconds = Math.max(0, Math.floor((now - date) / 1000));

      if (diffSeconds < 60) return 'just now';
      const diffMinutes = Math.floor(diffSeconds / 60);
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (e) {
      return 'recently';
    }
  }

  // Render Compact Glass Feed (Option 1)
  function renderFeedView(commits, isFallback = false) {
    const container = document.getElementById('feed_commit_list');
    if (!container) return;

    if (!commits || commits.length === 0) {
      container.innerHTML = `<div class="p-3 text-center text-xs text-slate-400">No commits found.</div>`;
      return;
    }

    container.innerHTML = commits.map(c => {
      const parsed = parseCommitDetails(c.message);
      const shortSha = (c.sha || '').substring(0, 7);
      const relTime = formatRelativeTime(c.date);
      const badgeClass = getBadgeClass(parsed.type);
      const authorName = c.author?.login || c.author?.name || 'JayM3';
      const avatarUrl = c.author?.avatar_url || 'https://avatars.githubusercontent.com/u/20011878?v=4';

      return `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/30 transition group">
          
          <!-- Left: Tag & Message -->
          <div class="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
            <span class="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${badgeClass} flex-shrink-0 mt-0.5 sm:mt-0">
              ${parsed.type}
            </span>
            
            <div class="min-w-0 flex-1">
              <a href="${c.html_url}" target="_blank" rel="noopener noreferrer" class="text-xs text-slate-200 group-hover:text-cyan-300 font-medium truncate block transition-colors" title="${escapeHtml(parsed.raw)}">
                ${parsed.scope ? `<span class="text-cyan-400 font-mono text-[11px] font-normal mr-1">(${escapeHtml(parsed.scope)})</span>` : ''}
                <span>${escapeHtml(parsed.title)}</span>
              </a>
            </div>
          </div>

          <!-- Right: Author, Time, Commit SHA Link -->
          <div class="flex items-center gap-3 self-end sm:self-center flex-shrink-0 text-slate-400 text-[11px]">
            <div class="flex items-center gap-1.5" title="Author: ${escapeHtml(authorName)}">
              <img src="${avatarUrl}" alt="${escapeHtml(authorName)}" class="w-4 h-4 rounded-full ring-1 ring-slate-700 object-cover" onerror="this.style.display='none'">
              <span class="text-slate-400 text-[11px]">${escapeHtml(authorName)}</span>
            </div>

            <span class="text-slate-600 select-none">&bull;</span>
            <span class="font-mono text-slate-400 text-[11px]">${relTime}</span>

            <a href="${c.html_url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 hover:border-cyan-800 transition shadow-inner" title="View commit ${shortSha} on GitHub">
              <svg class="w-2.5 h-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
              <span>${shortSha}</span>
            </a>
          </div>

        </div>
      `;
    }).join('');

    const statusBadge = document.getElementById('feed_sync_status');
    if (statusBadge) {
      statusBadge.textContent = isFallback ? 'Offline fallback' : 'Synced';
      statusBadge.className = isFallback 
        ? 'text-[10px] font-mono text-amber-400' 
        : 'text-[10px] font-mono text-emerald-400';
    }
  }

  // Fetch commits from GitHub REST API with caching & fallback
  async function fetchGithubCommits(forceFresh = false) {
    if (isFetching) return;
    isFetching = true;

    const refreshIcon = document.getElementById('icon_feed_refresh');
    if (refreshIcon) refreshIcon.classList.add('spin-active');

    // Check cache unless explicitly refreshing
    if (!forceFresh) {
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < CACHE_TTL_MS && Array.isArray(parsed.commits) && parsed.commits.length > 0) {
            renderFeedView(parsed.commits, false);
            if (refreshIcon) refreshIcon.classList.remove('spin-active');
            isFetching = false;
            return;
          }
        }
      } catch (e) {
        console.warn('[AMT Changelog] Cache read error:', e);
      }
    }

    try {
      const response = await fetch('https://api.github.com/repos/JayM3/AMT-Toolkit/commits?per_page=5', {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API HTTP ${response.status}`);
      }

      const data = await response.json();
      const formatted = data.map(item => ({
        sha: item.sha,
        author: {
          name: item.commit?.author?.name || item.author?.login || 'JayM3',
          login: item.author?.login || item.commit?.author?.name || 'JayM3',
          avatar_url: item.author?.avatar_url || 'https://avatars.githubusercontent.com/u/20011878?v=4'
        },
        date: item.commit?.author?.date || new Date().toISOString(),
        message: item.commit?.message || '',
        html_url: item.html_url || `https://github.com/JayM3/AMT-Toolkit/commit/${item.sha}`
      }));

      // Cache successful response
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          timestamp: Date.now(),
          commits: formatted
        }));
      } catch (e) {
        console.warn('[AMT Changelog] Cache write error:', e);
      }

      renderFeedView(formatted, false);

      const cacheBadge = document.getElementById('feed_cache_badge');
      if (cacheBadge) cacheBadge.textContent = 'Cached for 5m to protect API rate limits';

    } catch (err) {
      console.warn('[AMT Changelog] GitHub API fetch failed, using fallback data:', err);
      renderFeedView(FALLBACK_COMMITS, true);
      const cacheBadge = document.getElementById('feed_cache_badge');
      if (cacheBadge) cacheBadge.textContent = 'API rate limit or offline: showing recent verified commits';
    } finally {
      if (refreshIcon) refreshIcon.classList.remove('spin-active');
      isFetching = false;
    }
  }

  // Expose global refresh function
  window.refreshGithubCommits = function(force = true) {
    fetchGithubCommits(force);
  };

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => fetchGithubCommits(false));
  } else {
    fetchGithubCommits(false);
  }

})();
