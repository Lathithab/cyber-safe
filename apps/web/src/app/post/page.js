"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  findSeedPost,
  loadReportById,
  loadStoredComments,
  appendStoredComment,
} from "../feed/posts";

function initials(name) {
  return (name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const HeartIcon = ({ filled }) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CommentIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const PinIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

function PostPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const [post, setPost] = useState(undefined); // undefined = loading, null = not found
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    if (!id) {
      setPost(null);
      return;
    }
    const found = findSeedPost(id) || loadReportById(id);
    setPost(found);
    if (found) {
      setLikeCount(found.likes || 0);
      setComments(loadStoredComments(id));
    }
  }, [id]);

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/feed");
    }
  }

  function handleLike() {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  }

  function handleCommentSubmit(e) {
    e.preventDefault();
    const text = commentText.trim();
    if (!text || !id) return;

    const comment = { name: "You", text, time: "Just now" };
    const updated = appendStoredComment(id, comment);
    setComments(updated || [...comments, comment]);
    setCommentText("");
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: #f5f7fa;
          min-height: 100vh;
          color: #0e1b24;
        }

        .page {
          min-height: 100vh;
          background: #f5f7fa;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .page-column {
          width: 100%;
          max-width: 500px;
          min-height: 100vh;
          background: #f5f7fa;
          position: relative;
          padding-bottom: 88px;
        }

        /* Top nav bar */
        .topbar {
          position: sticky;
          top: 0;
          z-index: 10;
          background: #30C9E8;
          color: #fff;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .back-btn {
          background: rgba(255,255,255,0.18);
          border: none;
          color: #fff;
          cursor: pointer;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
          flex: none;
        }
        .back-btn:hover { background: rgba(255,255,255,0.3); }

        .topbar-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 18px;
          color: #fff;
        }

        /* Post card */
        .post-card {
          margin: 14px;
          padding: 16px;
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }

        .post-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }

        .avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #30C9E8 0%, #7856ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 16px;
          color: #fff;
          flex-shrink: 0;
          object-fit: cover;
        }

        .avatar-img {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
          flex: 1;
          min-width: 0;
        }

        .display-name {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 15px;
          color: #0e1b24;
        }

        .handle-row {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .handle {
          font-size: 13px;
          color: #6b7c86;
        }

        .location-badge {
          display: flex;
          align-items: center;
          gap: 3px;
          color: #1d9bf0;
          font-size: 13px;
          font-weight: 500;
        }

        .more-btn {
          margin-left: auto;
          background: none;
          border: none;
          color: #6b7c86;
          cursor: pointer;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: none;
        }
        .more-btn:hover { background: rgba(48,201,232,0.1); color: #1d9bf0; }

        /* Post body */
        .post-content {
          font-size: 16px;
          line-height: 1.55;
          color: #0e1b24;
          margin-bottom: 12px;
          word-break: break-word;
        }

        .post-image {
          width: 100%;
          max-height: 320px;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 12px;
        }

        .meta-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .meta-text {
          font-size: 13px;
          color: #6b7c86;
        }

        /* Action row */
        .action-row {
          display: flex;
          gap: 6px;
          padding-top: 10px;
          border-top: 1px solid #eef1f4;
        }

        .action-btn {
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 999px;
          transition: all 0.15s;
          color: #6b7c86;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
        }

        .action-btn:hover {
          color: #1d9bf0;
          background: rgba(29,155,240,0.08);
        }

        .action-btn.liked {
          color: #f91880;
        }

        .action-count {
          font-weight: 600;
          font-size: 13px;
        }

        /* Comments */
        .comments-heading {
          padding: 4px 18px 8px;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 14px;
          color: #0e1b24;
        }

        .comment-row {
          display: flex;
          gap: 10px;
          padding: 10px 14px;
        }

        .comment-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7856ff 0%, #30C9E8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 12px;
          color: #fff;
          flex-shrink: 0;
        }

        .comment-body { flex: 1; min-width: 0; }

        .comment-name {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 13.5px;
          color: #0e1b24;
        }

        .comment-text {
          font-size: 14px;
          color: #3d4c55;
          line-height: 1.5;
          word-break: break-word;
        }

        .comment-time {
          font-size: 11.5px;
          color: #9aa7b0;
          margin-top: 3px;
        }

        .report-cta {
          margin: 18px 14px 0;
          display: block;
          text-align: center;
          background: #eafaff;
          border: 1px solid #bfeaf5;
          color: #0e8fb0;
          border-radius: 12px;
          padding: 12px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 13.5px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .report-cta:hover { background: #d9f4fb; }

        /* Composer */
        .composer {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 20;
          background: #fff;
          border-top: 1px solid #e3e9ed;
          padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
        }

        .composer-inner {
          max-width: 500px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .composer-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7856ff 0%, #30C9E8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 12px;
          color: #fff;
          flex-shrink: 0;
        }

        .composer-input {
          flex: 1;
          min-width: 0;
          background: #f0f3f5;
          border: none;
          outline: none;
          border-radius: 999px;
          padding: 10px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #0e1b24;
        }
        .composer-input::placeholder { color: #9aa7b0; }

        .composer-submit {
          background: #30C9E8;
          border: none;
          color: #fff;
          padding: 9px 16px;
          border-radius: 999px;
          font-family: 'Syne', sans-serif;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          flex: none;
          transition: opacity 0.15s;
        }
        .composer-submit:disabled { opacity: 0.4; cursor: not-allowed; }

        .empty-state {
          padding: 60px 24px;
          text-align: center;
        }

        .empty-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 18px;
          margin-bottom: 8px;
          color: #0e1b24;
        }

        .empty-sub {
          font-size: 14px;
          color: #6b7c86;
          margin-bottom: 18px;
        }

        .empty-btn {
          background: #30C9E8;
          border: none;
          color: #fff;
          padding: 11px 22px;
          border-radius: 999px;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
        }
      `}</style>

      <div className="page">
        <div className="page-column">
          {/* Top bar */}
          <div className="topbar">
            <button className="back-btn" onClick={goBack} aria-label="Go back">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span className="topbar-title">Post</span>
          </div>

          {post === undefined && <div className="empty-state" />}

          {post === null && (
            <div className="empty-state">
              <div className="empty-title">We couldn't find that post</div>
              <p className="empty-sub">
                It may have been removed, or the link is out of date.
              </p>
              <button className="empty-btn" onClick={() => router.push("/feed")}>
                Back to feed
              </button>
            </div>
          )}

          {post && (
            <>
              {/* Post card */}
              <div className="post-card">
                <div className="post-header">
                  {post.profile ? (
                    <img className="avatar-img" src={post.profile} alt="" />
                  ) : (
                    <div className="avatar">{initials(post.name)}</div>
                  )}

                  <div className="user-info">
                    <span className="display-name">{post.name}</span>
                    <div className="handle-row">
                      {post.handle && <span className="handle">{post.handle}</span>}
                      <span className="handle">· {post.time}</span>
                    </div>
                    {post.location && (
                      <span className="location-badge">
                        <PinIcon />
                        {post.location}
                      </span>
                    )}
                  </div>

                  <button className="more-btn" aria-label="More options">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <circle cx="5" cy="12" r="1.5" />
                      <circle cx="12" cy="12" r="1.5" />
                      <circle cx="19" cy="12" r="1.5" />
                    </svg>
                  </button>
                </div>

                <p className="post-content">{post.text}</p>

                {post.incidentDate && (
                  <div className="meta-row">
                    <span className="meta-text">Incident date: {post.incidentDate}</span>
                  </div>
                )}

                {post.image && <img className="post-image" src={post.image} alt="" />}

                <div className="action-row">
                  <button
                    className={`action-btn ${liked ? "liked" : ""}`}
                    onClick={handleLike}
                    aria-label={liked ? "Unlike" : "Like"}
                  >
                    <HeartIcon filled={liked} />
                    <span className="action-count">{likeCount}</span>
                  </button>

                  <button className="action-btn" aria-label="Comments">
                    <CommentIcon />
                    <span className="action-count">
                      {(post.comments || 0) + comments.length}
                    </span>
                  </button>
                </div>
              </div>

              {/* CTA to post your own report */}
              <button
                type="button"
                className="report-cta"
                onClick={() => router.push("/postReport")}
              >
                Seen something similar? Share your own report →
              </button>

              {/* Comments */}
              <div className="comments-heading">Comments</div>

              {[...(post.topComments || []), ...comments].map((c, idx) => (
                <div className="comment-row" key={idx}>
                  <div className="comment-avatar">{initials(c.name)}</div>
                  <div className="comment-body">
                    <div className="comment-name">{c.name}</div>
                    <div className="comment-text">{c.text}</div>
                    <div className="comment-time">{c.time}</div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {post && (
        <form className="composer" onSubmit={handleCommentSubmit}>
          <div className="composer-inner">
            <div className="composer-avatar">YO</div>
            <input
              className="composer-input"
              placeholder="Add a comment…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button
              type="submit"
              className="composer-submit"
              disabled={!commentText.trim()}
            >
              Post
            </button>
          </div>
        </form>
      )}
    </>
  );
}

export default function PostPageWrapper() {
  return (
    <Suspense fallback={null}>
      <PostPage />
    </Suspense>
  );
}
