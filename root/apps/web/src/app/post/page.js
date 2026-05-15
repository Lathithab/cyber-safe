"use client";

import { useState } from "react";

const POST_DATA = {
  user: {
    name: "Amara Osei",
    handle: "@amara_osei",
    avatar: "AO",
  },
  content:
    "Cape Town at golden hour never gets old. Table Mountain wrapped in clouds, the ocean turning copper — moments like these remind me why I never want to leave. 🌅",
  location: "Cape Town, South Africa",
  timestamp: "4:22 PM · May 15, 2026",
  likes: 284,
  comments: 37,
  reposts: 61,
};

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

const RepostIcon = () => (
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
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
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

export default function PostPage() {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(POST_DATA.likes);
  const [reposted, setReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(POST_DATA.reposts);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentCount, setCommentCount] = useState(POST_DATA.comments);
  const [submittedComment, setSubmittedComment] = useState(null);

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleRepost = () => {
    setReposted((prev) => !prev);
    setRepostCount((prev) => (reposted ? prev - 1 : prev + 1));
  };

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;
    setSubmittedComment(commentText);
    setCommentText("");
    setCommentCount((prev) => prev + 1);
    setShowCommentBox(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: #0a0a0f;
          min-height: 100vh;
          color: #e8e8f0;
        }

        .page {
          min-height: 100vh;
          background: #0a0a0f;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0;
          position: relative;
          overflow: hidden;
        }

        .bg-glow {
          position: fixed;
          top: -120px;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(29,155,240,0.08) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .feed-column {
          width: 100%;
          max-width: 598px;
          min-height: 100vh;
          border-left: 1px solid #1e1e2e;
          border-right: 1px solid #1e1e2e;
          position: relative;
          z-index: 1;
        }

        /* Top nav bar */
        .topbar {
          position: sticky;
          top: 0;
          z-index: 10;
          background: rgba(10,10,15,0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid #1e1e2e;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .back-btn {
          background: none;
          border: none;
          color: #e8e8f0;
          cursor: pointer;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
        }
        .back-btn:hover { background: rgba(255,255,255,0.06); }

        .topbar-title {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 18px;
          letter-spacing: -0.3px;
          color: #fff;
        }

        /* Post card */
        .post-card {
          padding: 16px 16px 0;
          border-bottom: 1px solid #1e1e2e;
        }

        .post-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }

        .avatar-wrap {
          position: relative;
          flex-shrink: 0;
        }

        .avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1d9bf0 0%, #7856ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 16px;
          color: #fff;
          letter-spacing: 0.5px;
          flex-shrink: 0;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
          flex: 1;
          min-width: 0;
        }

        .name-row {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-wrap: wrap;
        }

        .display-name {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 15px;
          color: #fff;
          white-space: nowrap;
        }

        .handle {
          font-size: 14px;
          color: #6b7280;
          font-weight: 400;
        }

        .more-btn {
          margin-left: auto;
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s, color 0.15s;
        }
        .more-btn:hover { background: rgba(29,155,240,0.1); color: #1d9bf0; }

        /* Post body */
        .post-content {
          font-size: 17px;
          line-height: 1.55;
          color: #e8e8f0;
          font-weight: 400;
          margin-bottom: 14px;
          word-break: break-word;
        }

        /* Metadata row */
        .meta-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }

        .meta-text {
          font-size: 13px;
          color: #6b7280;
        }

        .meta-dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #4b5563;
        }

        .location-badge {
          display: flex;
          align-items: center;
          gap: 3px;
          color: #1d9bf0;
          font-size: 13px;
          font-weight: 500;
        }

        /* Divider */
        .divider {
          height: 1px;
          background: #1e1e2e;
          margin: 0 -16px;
        }

        /* Stats row */
        .stats-row {
          display: flex;
          gap: 20px;
          padding: 14px 0;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .stat-num {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 15px;
          color: #fff;
        }

        .stat-label {
          font-size: 14px;
          color: #6b7280;
        }

        /* Action row */
        .action-row {
          display: flex;
          justify-content: space-around;
          padding: 4px 0 14px;
          border-top: 1px solid #1e1e2e;
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
          color: #6b7280;
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

        .action-btn.liked:hover {
          color: #f91880;
          background: rgba(249,24,128,0.08);
        }

        .action-btn.reposted {
          color: #00ba7c;
        }

        .action-btn.reposted:hover {
          color: #00ba7c;
          background: rgba(0,186,124,0.08);
        }

        .like-icon {
          transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1);
        }

        .action-btn.liked .like-icon {
          transform: scale(1.25);
          color: #f91880;
        }

        .action-count {
          font-weight: 500;
          font-size: 13px;
        }

        /* Comment box */
        .comment-section {
          border-top: 1px solid #1e1e2e;
          padding: 16px;
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .comment-inner {
          display: flex;
          gap: 10px;
        }

        .comment-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7856ff 0%, #1d9bf0 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 12px;
          color: #fff;
          flex-shrink: 0;
        }

        .comment-input-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .comment-textarea {
          background: transparent;
          border: none;
          outline: none;
          color: #e8e8f0;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          resize: none;
          width: 100%;
          min-height: 70px;
          placeholder-color: #4b5563;
          line-height: 1.5;
        }

        .comment-textarea::placeholder { color: #4b5563; }

        .comment-footer {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .cancel-btn {
          background: transparent;
          border: 1px solid #374151;
          color: #9ca3af;
          padding: 6px 16px;
          border-radius: 999px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }
        .cancel-btn:hover { background: rgba(255,255,255,0.05); }

        .submit-btn {
          background: #1d9bf0;
          border: none;
          color: #fff;
          padding: 6px 18px;
          border-radius: 999px;
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
        }
        .submit-btn:hover { background: #1a8cd8; }
        .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        /* Replied comment display */
        .submitted-comment {
          border-top: 1px solid #1e1e2e;
          padding: 16px;
          display: flex;
          gap: 10px;
          animation: slideDown 0.25s ease;
        }

        .sc-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7856ff 0%, #1d9bf0 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 12px;
          color: #fff;
          flex-shrink: 0;
        }

        .sc-body {
          flex: 1;
        }

        .sc-name {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 14px;
          color: #fff;
          margin-bottom: 2px;
        }

        .sc-text {
          font-size: 14px;
          color: #d1d5db;
          line-height: 1.5;
        }

        .sc-time {
          font-size: 12px;
          color: #4b5563;
          margin-top: 4px;
        }

        /* Toast */
        .toast {
          position: fixed;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%) translateY(0);
          background: #1d9bf0;
          color: #fff;
          padding: 10px 20px;
          border-radius: 999px;
          font-family: 'Syne', sans-serif;
          font-weight: 600;
          font-size: 13px;
          z-index: 100;
          animation: toastIn 0.25s ease;
          white-space: nowrap;
        }

        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        /* Responsive tweaks */
        @media (max-width: 600px) {
          .feed-column { border-left: none; border-right: none; }
          .post-content { font-size: 16px; }
          .stats-row { gap: 14px; }
        }
      `}</style>

      <div className="page">
        <div className="bg-glow" />

        <div className="feed-column">
          {/* Top bar */}
          <div className="topbar">
            <button className="back-btn" aria-label="Go back">
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

          {/* Post card */}
          <div className="post-card">
            {/* Header */}
            <div className="post-header">
              <div className="avatar-wrap">
                <div className="avatar">{POST_DATA.user.avatar}</div>
              </div>

              <div className="user-info">
                <div className="name-row">
                  <span className="display-name">{POST_DATA.user.name}</span>
                </div>
                <span className="handle">{POST_DATA.user.handle}</span>
              </div>

              <button className="more-btn" aria-label="More options">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="currentColor"
                >
                  <circle cx="5" cy="12" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="19" cy="12" r="1.5" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <p className="post-content">{POST_DATA.content}</p>

            {/* Meta */}
            <div className="meta-row">
              <span className="meta-text">{POST_DATA.timestamp}</span>
              <div className="meta-dot" />
              <span className="location-badge">
                <PinIcon />
                {POST_DATA.location}
              </span>
            </div>

            <div className="divider" />

            {/* Stats */}
            <div className="stats-row">
              <div className="stat-item">
                <span className="stat-num">{repostCount}</span>
                <span className="stat-label">Reposts</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">{likeCount}</span>
                <span className="stat-label">Likes</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">{commentCount}</span>
                <span className="stat-label">Replies</span>
              </div>
            </div>

            <div className="divider" />

            {/* Actions */}
            <div className="action-row">
              <button
                className="action-btn"
                onClick={() => setShowCommentBox((v) => !v)}
                aria-label="Reply"
              >
                <CommentIcon />
                <span className="action-count">{commentCount}</span>
              </button>

              <button
                className={`action-btn ${reposted ? "reposted" : ""}`}
                onClick={handleRepost}
                aria-label="Repost"
              >
                <RepostIcon />
                <span className="action-count">{repostCount}</span>
              </button>

              <button
                className={`action-btn ${liked ? "liked" : ""}`}
                onClick={handleLike}
                aria-label={liked ? "Unlike" : "Like"}
              >
                <span className="like-icon">
                  <HeartIcon filled={liked} />
                </span>
                <span className="action-count">{likeCount}</span>
              </button>
            </div>
          </div>

          {/* Comment box */}
          {showCommentBox && (
            <div className="comment-section">
              <div className="comment-inner">
                <div className="comment-avatar">YO</div>
                <div className="comment-input-wrap">
                  <textarea
                    className="comment-textarea"
                    placeholder="Post your reply"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                    autoFocus
                  />
                  <div className="comment-footer">
                    <button
                      className="cancel-btn"
                      onClick={() => {
                        setShowCommentBox(false);
                        setCommentText("");
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="submit-btn"
                      onClick={handleCommentSubmit}
                      disabled={!commentText.trim()}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submitted comment */}
          {submittedComment && (
            <div className="submitted-comment">
              <div className="sc-avatar">YO</div>
              <div className="sc-body">
                <div className="sc-name">You</div>
                <div className="sc-text">{submittedComment}</div>
                <div className="sc-time">Just now</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
