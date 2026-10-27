"use client";

import { useEffect, useState, Suspense } from "react";
import { isSupabaseConfigured, supabase } from "../../../lib/supabase";
import { useSearchParams, useRouter } from "next/navigation";

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
  const [userId, setUserId] = useState(null);
  const [likeBusy, setLikeBusy] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [toast, setToast] = useState("");
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentBusy, setCommentBusy] = useState(false);
  // Guests and signed-out visitors can read comments but not write them.
  const [canComment, setCanComment] = useState(false);

  useEffect(() => {
    if (!openMenu) return;
    const closeMenu = () => setOpenMenu(false);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, [openMenu]);

  useEffect(() => {
  async function loadPost() {
    if (!id || !isSupabaseConfigured || !supabase) {
      setPost(null);
      return;
    }

    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user || null;
    setUserId(user?.id || null);
    setCanComment(Boolean(user && !user.is_anonymous));

    // Only approved posts have a public page.
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .eq("status", "approved")
      .maybeSingle();

    if (error || !data) {
      if (error) console.error("Error loading post:", error);
      setPost(null);
      return;
    }

    setPost({
      id: data.id,
      name: data.display_name,
      handle: data.handle,
      time: new Date(data.created_at).toLocaleString(),
      text: data.description,
      location: data.location,
      image: data.image_url,
    });

    const { data: countRow } = await supabase
      .from("post_like_counts")
      .select("like_count")
      .eq("post_id", id)
      .maybeSingle();
    setLikeCount(countRow?.like_count ?? 0);

    const { data: commentRows, error: commentError } = await supabase
      .from("comments")
      .select("id, author_id, display_name, content, created_at")
      .eq("post_id", id)
      .eq("status", "visible")
      .order("created_at", { ascending: true });
    if (commentError) {
      console.error("Error loading comments:", commentError);
    } else {
      setComments(commentRows || []);
    }

    if (user) {
      const { data: mine } = await supabase
        .from("likes")
        .select("post_id")
        .eq("post_id", id)
        .eq("user_id", user.id)
        .maybeSingle();
      setLiked(Boolean(mine));
    }
  }

  loadPost();
}, [id]);

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/feed");
    }
  }

  async function handleLike() {
    if (!userId) {
      showToast("Please sign in to mark a post as helpful.");
      return;
    }
    if (likeBusy) return;
    setLikeBusy(true);

    try {
      if (liked) {
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", id)
          .eq("user_id", userId);
        if (error) throw error;
        setLiked(false);
        setLikeCount((count) => Math.max(0, count - 1));
      } else {
        const { error } = await supabase
          .from("likes")
          .insert({ post_id: id, user_id: userId });
        if (error) throw error;
        setLiked(true);
        setLikeCount((count) => count + 1);
      }
    } catch (error) {
      console.error("Error updating helpful mark:", error);
      showToast("Couldn't save that. Please try again.");
    } finally {
      setLikeBusy(false);
    }
  }

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  }

  function copyPostLink() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => showToast("Link copied to clipboard")).catch(() => showToast("Couldn't copy the link"));
    } else {
      showToast("Couldn't copy the link");
    }
    setOpenMenu(false);
  }

  async function reportPost() {
    setOpenMenu(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || user.is_anonymous) {
      showToast("Sign in with an account to report a post.");
      return;
    }

    const { error } = await supabase
      .from("post_flags")
      .insert({ post_id: id, user_id: user.id });

    if (error?.code === "23505") {
      showToast("You have already reported this post.");
    } else if (error) {
      console.error("Could not flag post:", error.message);
      showToast("We could not send your report. Please try again.");
    } else {
      showToast("Post reported. An admin will review it.");
    }
  }

  async function submitComment(event) {
    event.preventDefault();
    const content = commentText.trim();
    if (!content || commentBusy) return;
    if (!canComment || !userId) {
      showToast("Sign in with an account to comment.");
      return;
    }
    if (content.length > 500) {
      showToast("Comments can be up to 500 characters.");
      return;
    }
    setCommentBusy(true);
    const { data, error } = await supabase
      .from("comments")
      .insert({ post_id: id, author_id: userId, content })
      .select("id, author_id, display_name, content, created_at")
      .single();
    setCommentBusy(false);

    if (error) {
      console.error("Could not save comment:", error.message);
      if (error.code === "P0001") {
        showToast("You are commenting too quickly. Please wait a few minutes.");
      } else if (error.code === "23514") {
        showToast("Comments must be between 1 and 500 characters.");
      } else {
        showToast("We could not post your comment. Please try again.");
      }
      return;
    }
    setComments((current) => [...current, data]);
    setCommentText("");
  }

  async function reportComment(comment) {
    if (!canComment || !userId) {
      showToast("Sign in with an account to report a comment.");
      return;
    }
    const { error } = await supabase
      .from("comment_flags")
      .insert({ comment_id: comment.id, user_id: userId });

    if (error?.code === "23505") {
      showToast("You have already reported this comment.");
    } else if (error) {
      console.error("Could not flag comment:", error.message);
      showToast("We could not send your report. Please try again.");
    } else {
      showToast("Comment reported. An admin will review it.");
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: #f7f4ef;
          min-height: 100vh;
          color: #0e1b24;
        }

        .page {
          min-height: 100vh;
          background: #f7f4ef;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .page-column {
          width: 100%;
          max-width: 500px;
          min-height: 100vh;
          background: #f7f4ef;
          position: relative;
          padding-bottom: 88px;
        }

        /* Top nav bar */
        .topbar {
          position: sticky;
          top: 0;
          z-index: 10;
          background: #eb630f;
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
          background: linear-gradient(135deg, #eb630f 0%, #00243a 100%);
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
          color: #eb630f;
          font-size: 13px;
          font-weight: 500;
        }

        .more-btn {
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

        .more-wrap { position: relative; margin-left: auto; flex: none; }
        .more-menu { position: absolute; z-index: 20; top: 38px; right: 0; min-width: 150px; padding: 5px; border-radius: 10px; background: #fff; box-shadow: 0 8px 20px rgba(14,27,36,.16); display: grid; }
        .more-menu button { width: 100%; padding: 9px 10px; border: 0; border-radius: 7px; background: transparent; color: #0e1b24; cursor: pointer; font: inherit; font-size: 13px; font-weight: 700; text-align: left; }
        .more-menu button:hover { background: #f5f7fa; }

        .post-toast { position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%); z-index: 40; padding: 12px 22px; border-radius: 999px; background: #0e1b24; color: #fff; font-size: 13px; font-weight: 700; box-shadow: 0 10px 30px rgba(0,0,0,.25); }
        .more-btn:hover { background: rgba(235, 99, 15, 0.1); color: #eb630f; }

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
          color: #eb630f;
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
          background: linear-gradient(135deg, #00243a 0%, #eb630f 100%);
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

        .comments-section { margin: 4px 0 0; }
        .comments-empty, .comments-note { margin: 0 18px 10px; font-size: 12.5px; color: #6b7c86; line-height: 1.45; }
        .comment-login { background: none; border: 0; padding: 0; font: inherit; color: #c24f0c; font-weight: 700; cursor: pointer; text-decoration: underline; }
        .comment-report { margin-left: 10px; background: none; border: 0; color: #6b7c86; font: inherit; font-size: 11.5px; cursor: pointer; text-decoration: underline; padding: 2px 4px; }
        .comment-form { margin: 8px 14px 0; padding: 12px; border-radius: 14px; background: #fff; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        .comment-form textarea { width: 100%; resize: vertical; border: 1px solid #dce5ef; border-radius: 10px; padding: 10px; font: inherit; font-size: 14px; color: #0e1b24; }
        .comment-form-row { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
        .comment-form-row small { color: #9aa7b0; }
        .comment-form-row button { background: #eb630f; border: 0; color: #fff; padding: 9px 18px; border-radius: 999px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13.5px; cursor: pointer; }
        .comment-form-row button:disabled { opacity: 0.4; cursor: not-allowed; }
        .comment-form .comments-note { margin: 8px 0 0; }
        .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

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
          background: linear-gradient(135deg, #00243a 0%, #eb630f 100%);
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
          background: #eb630f;
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
          background: #eb630f;
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
              <div className="empty-title">We couldn&apos;t find that post</div>
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

                  <div className="more-wrap">
                    <button className="more-btn" aria-label="More options" onClick={() => setOpenMenu((current) => !current)}>
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <circle cx="5" cy="12" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="19" cy="12" r="1.5" />
                      </svg>
                    </button>
                    {openMenu && (
                      <div className="more-menu">
                        <button type="button" onClick={copyPostLink}>Copy link</button>
                        <button type="button" onClick={reportPost}>Report post</button>
                      </div>
                    )}
                  </div>
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
                </div>
              </div>

              {/* Comments */}
              <section className="comments-section" aria-label="Comments">
                <h2 className="comments-heading">Comments ({comments.length})</h2>

                {comments.length === 0 && (
                  <p className="comments-empty">No comments yet. Add useful advice, not personal details.</p>
                )}

                {comments.map((comment) => (
                  <div className="comment-row" key={comment.id}>
                    <div className="comment-avatar">{initials(comment.display_name)}</div>
                    <div className="comment-body">
                      <div className="comment-name">{comment.display_name || "CyberSafe member"}</div>
                      <p className="comment-text">{comment.content}</p>
                      <div className="comment-time">
                        {new Date(comment.created_at).toLocaleString()}
                        {comment.author_id !== userId && (
                          <button type="button" className="comment-report" onClick={() => reportComment(comment)}>
                            Report
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {canComment ? (
                  <form className="comment-form" onSubmit={submitComment}>
                    <label className="sr-only" htmlFor="comment-input">Add a comment</label>
                    <textarea
                      id="comment-input"
                      value={commentText}
                      onChange={(event) => setCommentText(event.target.value)}
                      maxLength={500}
                      rows={3}
                      placeholder="Add a comment"
                    />
                    <div className="comment-form-row">
                      <small>{commentText.length}/500</small>
                      <button type="submit" disabled={commentBusy || !commentText.trim()}>
                        {commentBusy ? "Posting…" : "Comment"}
                      </button>
                    </div>
                    <p className="comments-note">Comments appear straight away. Readers can report them, and an admin can remove them.</p>
                  </form>
                ) : (
                  <p className="comments-note comments-signin">
                    <button type="button" className="comment-login" onClick={() => router.push("/login")}>Log in with an account</button> to comment. Guests can read comments only.
                  </p>
                )}
              </section>

              {/* CTA to post your own report */}
              <button
                type="button"
                className="report-cta"
                onClick={() => router.push("/postReport")}
              >
                Seen something similar? Share your own report →
              </button>
            </>
          )}
        </div>
      </div>

      {toast && <div className="post-toast">{toast}</div>}
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
