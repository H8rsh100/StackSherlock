import { useEffect, useRef } from 'react';
import { Cpu, Terminal } from 'lucide-react';

const typeClass = {
  investigating: 'feed-tag sky',
  reasoning: 'feed-tag amber',
  resolved: 'feed-tag emerald',
  alert: 'feed-tag rose',
};

export default function FeedPanel({ feed, loading }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [feed]);

  return (
    <aside className="feed-panel">
      <div className="panel-head">
        <h2>
          <Terminal className="w-4 h-4" />
          Live agent feed
        </h2>
        <span className="live-tag">
          <span className="status-dot" />
          Live
        </span>
      </div>

      <div className="feed-body">
        {loading && feed.length === 0 ? (
          <div className="feed-empty">
            <Cpu className="w-4 h-4 spin" />
            <span>Connecting to agent stream...</span>
          </div>
        ) : null}

        {feed.map((item, idx) => (
          <article key={`${item.timestamp}-${idx}`} className="feed-item">
            <div className="feed-meta">
              <span>{item.timestamp}</span>
              <span className={typeClass[item.type] || 'feed-tag'}>{item.type}</span>
            </div>
            <p>{item.message}</p>
          </article>
        ))}
        <div ref={endRef} />
      </div>
    </aside>
  );
}
