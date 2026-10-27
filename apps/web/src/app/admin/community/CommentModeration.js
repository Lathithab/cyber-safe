"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";

// Comment moderation lives on the same page as post moderation and reuses its
// styles. "reported" is the default because that is the queue an admin needs.
const FILTERS = ["reported", "hidden", "visible", "removed", "all"];

function formatDate(value) {
  if (!value) return "Date unavailable";
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function CommentModeration({ adminId }) {
  const [comments, setComments] = useState([]);
  const [flagCounts, setFlagCounts] = useState({});
  const [filter, setFilter] = useState("reported");
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadComments = useCallback(async () => {
    if (!supabase) return;
    setIsLoading(true);
    setErrorMessage("");

    const { data: flagRows } = await supabase.from("comment_flags").select("comment_id");
    const counts = {};
    (flagRows || []).forEach((row) => {
      counts[row.comment_id] = (counts[row.comment_id] || 0) + 1;
    });
    setFlagCounts(counts);

    let query = supabase
      .from("comments")
      .select("id, post_id, display_name, content, status, created_at, moderated_at")
      .order("created_at", { ascending: false });

    if (filter === "reported") {
      const reportedIds = Object.keys(counts);
      if (reportedIds.length === 0) {
        setComments([]);
        setIsLoading(false);
        return;
      }
      query = query.in("id", reportedIds);
    } else if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Could not load comments for moderation:", error);
      setErrorMessage("Could not load comments. Confirm the moderated comments migration has been applied.");
      setIsLoading(false);
      return;
    }
    setComments(data || []);
    setIsLoading(false);
  }, [filter]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  async function setCommentStatus(comment, status) {
    if (status === "removed" && !window.confirm("Remove this comment? It will stay in the database for moderation records.")) return;
    setUpdatingId(comment.id);
    setErrorMessage("");
    setSuccessMessage("");
    const { error } = await supabase
      .from("comments")
      .update({ status, moderated_at: new Date().toISOString(), moderated_by: adminId })
      .eq("id", comment.id);

    if (error) {
      console.error("Could not update comment status:", error);
      setErrorMessage("Could not update this comment. Confirm the admin comment moderation policy is installed.");
      setUpdatingId("");
      return;
    }
    setSuccessMessage(status === "visible" ? "Comment restored." : status === "removed" ? "Comment removed." : "Comment hidden.");
    setUpdatingId("");
    await loadComments();
  }

  return (
    <>
      <div className="moderation-note">
        <span>Comments appear straight away. Three reports from different readers hide a comment until you restore or remove it.</span>
      </div>

      <div className="toolbar">
        <div className="filters" role="group" aria-label="Filter comments">
          {FILTERS.map((name) => (
            <button key={name} type="button" className={filter === name ? "filter active" : "filter"} onClick={() => setFilter(name)}>
              {name[0].toUpperCase() + name.slice(1)}
              {name === filter && <span className="sr-only"> selected</span>}
            </button>
          ))}
        </div>
        <button className="refresh-button" type="button" onClick={loadComments} disabled={isLoading}>{isLoading ? "Refreshing…" : "Refresh"}</button>
      </div>

      {errorMessage && <p className="feedback error" role="alert">{errorMessage}</p>}
      {successMessage && <p className="feedback success" role="status">{successMessage}</p>}
      {isLoading && <p className="empty-state">Loading comments…</p>}
      {!isLoading && !errorMessage && comments.length === 0 && (
        <p className="empty-state">No {filter === "all" ? "" : `${filter} `}comments to show.</p>
      )}

      <section className="post-list" aria-label="Comments">
        {!isLoading && comments.map((comment) => (
          <article className="moderation-card" key={comment.id}>
            <div className="post-topline">
              <span className={`status status-${comment.status}`}>{comment.status}</span>
              {flagCounts[comment.id] > 0 && (
                <span className="status status-flagged">⚑ {flagCounts[comment.id]} {flagCounts[comment.id] === 1 ? "report" : "reports"}</span>
              )}
              <time dateTime={comment.created_at}>{formatDate(comment.created_at)}</time>
            </div>
            <h2>{comment.display_name || "CyberSafe member"}</h2>
            <p className="post-description">{comment.content}</p>
            <a className="image-link" href={`/post?id=${encodeURIComponent(comment.post_id)}`} target="_blank" rel="noreferrer">View the post ↗</a>
            {comment.moderated_at && <p className="moderated-at">Last action: {formatDate(comment.moderated_at)}</p>}
            <div className="post-actions">
              {comment.status !== "visible" && (
                <button type="button" className="approve-button" disabled={updatingId === comment.id} onClick={() => setCommentStatus(comment, "visible")}>
                  {updatingId === comment.id ? "Saving…" : "Restore"}
                </button>
              )}
              {comment.status !== "removed" && (
                <button type="button" className="remove-button" disabled={updatingId === comment.id} onClick={() => setCommentStatus(comment, "removed")}>Remove comment</button>
              )}
              {comment.status === "visible" && (
                <button type="button" className="return-button" disabled={updatingId === comment.id} onClick={() => setCommentStatus(comment, "hidden")}>Hide</button>
              )}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
