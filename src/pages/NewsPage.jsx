import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { mockAnalyticsSummary, mockNewsItems } from "../data/presentationData";
import { db } from "../lib/firebase";

function NewsPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const postsQuery = query(collection(db, "news"), orderBy("createdAt", "desc"));
    return onSnapshot(postsQuery, (snapshot) => {
      const live = snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
      setPosts(live.length ? live : mockNewsItems);
    });
  }, []);

  return (
    <div className="v2-news-page">
      <section className="v2-news-hero">
        <p className="v2-kicker">Proof of impact</p>
        <h1>See how the platform is being used on the ground.</h1>
        <div className="v2-stat-strip">
          <div>
            <strong>{mockAnalyticsSummary.requestsThisMonth}</strong>
            <span>requests solved</span>
          </div>
          <div>
            <strong>{mockAnalyticsSummary.resourcesAllocated.toLocaleString()}</strong>
            <span>resources allocated</span>
          </div>
          <div>
            <strong>{mockAnalyticsSummary.averageResponseTime}</strong>
            <span>avg response</span>
          </div>
        </div>
      </section>

      <section className="v2-news-stack">
        {posts.map((post) => (
          <article className="v2-news-card" key={post.id}>
            <span className="v2-news-emoji">{post.emoji || "•"}</span>
            <div>
              <div className="v2-news-top">
                <strong>{post.title}</strong>
                <span>{post.date || "latest"}</span>
              </div>
              <p>{post.excerpt || post.summary || post.body || "No content yet."}</p>
              <small>{post.ngo || "NGO update"}</small>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export default NewsPage;
