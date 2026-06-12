/**
 * Client-side static search, backed by the Pagefind index that `pnpm build`
 * generates into /pagefind. Lazy-loaded on first query so no search code runs
 * on reading pages. Used by both the ⌘K overlay and the /search page.
 */

interface PagefindResultData {
  url: string;
  excerpt: string;
  meta: Record<string, string> & { title?: string };
}
interface PagefindModule {
  search: (
    q: string,
    opts?: { filters?: Record<string, string> },
  ) => Promise<{ results: { data: () => Promise<PagefindResultData> }[] }>;
  options?: (o: Record<string, unknown>) => Promise<void>;
}

let pagefind: PagefindModule | null = null;
let loadFailed = false;

async function loadPagefind(): Promise<PagefindModule | null> {
  if (pagefind || loadFailed) return pagefind;
  try {
    // Non-literal path + @vite-ignore so Vite doesn't try to bundle a file
    // that only exists after the post-build Pagefind step.
    const path = "/pagefind/pagefind.js";
    pagefind = (await import(/* @vite-ignore */ path)) as PagefindModule;
    await pagefind.options?.({ excerptLength: 24 });
    return pagefind;
  } catch {
    loadFailed = true;
    return null;
  }
}

const TYPE_LABELS: Record<string, string> = {
  guide: "GUIDE",
  note: "NOTE",
  devlog: "DEVLOG",
  essay: "ESSAY",
  lab: "LAB",
  reference: "REF",
  review: "REVIEW",
};

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"]/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string,
  );
}

export interface SearchHandle {
  focus: () => void;
}

export function initSearch(root: HTMLElement): SearchHandle {
  const input = root.querySelector<HTMLInputElement>("[data-search-input]")!;
  const resultsEl = root.querySelector<HTMLElement>("[data-search-results]")!;
  const countEl = root.querySelector<HTMLElement>("[data-search-count]");
  const filterBtns = [
    ...root.querySelectorAll<HTMLButtonElement>("[data-type]"),
  ];

  let selectedType: string | null = null;
  let token = 0;

  function setActiveFilter() {
    for (const b of filterBtns) {
      const on = (b.dataset.type || "") === (selectedType || "");
      b.setAttribute("aria-pressed", on ? "true" : "false");
    }
  }

  function renderMessage(msg: string) {
    resultsEl.innerHTML = `<div class="search-empty">${escapeHtml(msg)}</div>`;
    if (countEl) countEl.textContent = "00";
  }

  async function run() {
    const q = input.value.trim();
    const mine = ++token;
    if (!q) {
      renderMessage("type to search the index…");
      return;
    }
    const pf = await loadPagefind();
    if (mine !== token) return;
    if (!pf) {
      renderMessage("search index unavailable, run a production build");
      return;
    }
    const search = await pf.search(
      q,
      selectedType ? { filters: { type: selectedType } } : undefined,
    );
    if (mine !== token) return;
    const data = await Promise.all(search.results.slice(0, 30).map((r) => r.data()));
    if (mine !== token) return;

    if (data.length === 0) {
      renderMessage(`no entries match "${q}"`);
      return;
    }
    if (countEl) countEl.textContent = String(data.length).padStart(2, "0");
    resultsEl.innerHTML = data
      .map((d) => {
        const type = d.meta.type || "";
        const badge = type
          ? `<span class="badge" data-type="${escapeHtml(type)}">[ ${TYPE_LABELS[type] ?? type.toUpperCase()} ]</span>`
          : "";
        const date = d.meta.date
          ? `<span class="search-result__date">${escapeHtml(d.meta.date)}</span>`
          : "";
        const topics = (d.meta.topics || "")
          .split(",")
          .filter(Boolean)
          .map((t) => `<span>#${escapeHtml(t)}</span>`)
          .join("");
        return `<a class="search-result" href="${escapeHtml(d.url)}">
          <div class="search-result__head">${badge}
            <span class="search-result__title">${escapeHtml(d.meta.title || d.url)}</span>${date}
          </div>
          <p class="search-result__excerpt">${d.excerpt}</p>
          ${topics ? `<div class="search-result__tags">${topics}</div>` : ""}
        </a>`;
      })
      .join("");
  }

  let debounce: number | undefined;
  input.addEventListener("input", () => {
    window.clearTimeout(debounce);
    debounce = window.setTimeout(run, 140);
  });
  for (const b of filterBtns) {
    b.addEventListener("click", () => {
      const t = b.dataset.type || "";
      // "all" clears; clicking the active type also clears (toggle off).
      selectedType = t === "" ? null : selectedType === t ? null : t;
      setActiveFilter();
      run();
    });
  }
  setActiveFilter();
  renderMessage("type to search the index…");

  return { focus: () => input.focus() };
}
