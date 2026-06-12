/* meese.rs UI kit — App shell: routing, keyboard */
(function () {
  const { SiteHeader, SiteFooter } = window.KIT_CHROME;
  const { Home } = window.KIT_HOME;
  const { PostView } = window.KIT_POST;
  const { GraphView } = window.KIT_GRAPH;
  const { SearchOverlay } = window.KIT_SEARCH;
  const { ReviewView } = window.KIT_REVIEW;
  const { ReviewsView } = window.KIT_REVIEWS;
  const { ListView } = window.KIT_LIST;
  const { TopicsView } = window.KIT_TOPICS;
  const { REVIEWS } = window.KIT_DATA;

  function App() {
    const [route, setRoute] = React.useState('home'); // home | post | review | reviews | list | topics | graph
    const [slug, setSlug] = React.useState(null);
    const [listSpec, setListSpec] = React.useState({ kind: 'all', title: 'All writing' });
    const [history, setHistory] = React.useState([]); // breadcrumb of prior views
    const [search, setSearch] = React.useState(false);
    const scrollRef = React.useRef(null);

    React.useEffect(() => {
      const onKey = (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearch((s) => !s); }
        if (e.key === 'Escape') setSearch(false);
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, []);

    React.useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [route, slug, listSpec]);

    // push the current view onto the history stack, then apply the next view
    const navTo = (apply) => { setHistory((h) => h.concat([{ route, slug, listSpec }])); apply(); };
    // pop back to the previous view, or home if the stack is empty
    const back = () => {
      if (history.length) {
        const prev = history[history.length - 1];
        setHistory(history.slice(0, -1));
        setRoute(prev.route); setSlug(prev.slug); setListSpec(prev.listSpec); setSearch(false);
      } else { setRoute('home'); setSlug(null); }
    };

    const goHome = () => { setHistory([]); setRoute('home'); setSlug(null); };
    const openPost = (s) => navTo(() => { setSlug(s); setRoute(REVIEWS[s] ? 'review' : 'post'); setSearch(false); });
    const openGraph = () => navTo(() => setRoute('graph'));
    const openReviews = () => navTo(() => { setRoute('reviews'); setSlug(null); });
    const openTopics = () => navTo(() => { setRoute('topics'); setSlug(null); });
    const openList = (spec) => navTo(() => { setListSpec(spec); setRoute('list'); setSearch(false); });

    const onNav = (name) => {
      if (name === 'Graph') openGraph();
      else if (name === 'Reviews') openReviews();
      else if (name === 'Guides') openList({ kind: 'type', value: 'guide', title: 'Guides', subtitle: 'Tactical, practical how-to-do-X writing — updated in place as tooling changes.' });
      else if (name === 'Notes') openList({ kind: 'type', value: 'note', title: 'Notes', subtitle: 'Short observations and two-minute reads, in the main stream.' });
      else if (name === 'Topics') openTopics();
      else goHome();
    };

    const onTopic = (arg) => {
      if (arg === 'all') openList({ kind: 'all', title: 'All writing', subtitle: 'Every guide, note, devlog, essay, lab, and reference — newest first.' });
      else if (arg === 'index') openTopics();
      else if (typeof arg === 'string' && arg) openList({ kind: 'topic', value: arg, title: '#' + arg, subtitle: 'Everything filed under ' + arg + '.' });
      else goHome();
    };

    const navKey =
      route === 'home' ? 'Latest' :
      route === 'graph' ? 'Graph' :
      (route === 'review' || route === 'reviews') ? 'Reviews' :
      route === 'topics' ? 'Topics' :
      route === 'list'
        ? (listSpec.kind === 'type' && listSpec.value === 'guide' ? 'Guides'
          : listSpec.kind === 'type' && listSpec.value === 'note' ? 'Notes'
          : listSpec.kind === 'topic' ? 'Topics' : '')
        : '';

    // label for the back link, based on where it will actually return
    const prevView = history[history.length - 1];
    const backLabel = !prevView ? 'index'
      : prevView.route === 'home' ? 'index'
      : prevView.route === 'topics' ? 'topics'
      : prevView.route === 'reviews' ? 'reviews'
      : prevView.route === 'graph' ? 'graph'
      : prevView.route === 'list' ? (prevView.listSpec && prevView.listSpec.kind === 'topic' ? prevView.listSpec.title : (prevView.listSpec && prevView.listSpec.title ? prevView.listSpec.title.toLowerCase() : 'list'))
      : (prevView.route === 'post' || prevView.route === 'review') ? 'post'
      : 'index';

    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <SiteHeader navKey={navKey} onNav={onNav} onSearch={() => setSearch(true)} onHome={goHome} />
        <main ref={scrollRef} style={{ flex: 1, overflowY: route === 'graph' ? 'hidden' : 'auto' }}>
          {route === 'home' ? <Home onOpenPost={openPost} onOpenGraph={openGraph} onOpenReviews={openReviews} onSearch={() => setSearch(true)} onTopic={onTopic} /> : null}
          {route === 'post' ? <PostView slug={slug} onOpenPost={openPost} onBack={back} backLabel={backLabel} onTopic={onTopic} /> : null}
          {route === 'review' ? <ReviewView slug={slug} onOpenPost={openPost} onBack={back} backLabel={backLabel} /> : null}
          {route === 'reviews' ? <ReviewsView onOpenPost={openPost} onBack={back} backLabel={backLabel} onTopic={onTopic} /> : null}
          {route === 'list' ? <ListView spec={listSpec} onOpenPost={openPost} onBack={back} backLabel={backLabel} onTopic={onTopic} /> : null}
          {route === 'topics' ? <TopicsView onTopic={onTopic} onBack={back} backLabel={backLabel} /> : null}
          {route === 'graph' ? <GraphView onOpenPost={openPost} onTopic={onTopic} /> : null}
          {route !== 'graph' ? <SiteFooter /> : null}
        </main>
        {search ? <SearchOverlay onClose={() => setSearch(false)} onOpenPost={openPost} /> : null}
      </div>
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
})();
