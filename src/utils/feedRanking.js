// Score = engagement + recency, with a small random jitter each call so a reload
// doesn't produce the exact same order every time — similar to how real feeds
// never look identical twice, without needing genuine tracking/personalization.
export function scorePost(post) {
  const likeCount = Object.values(post.likes || {}).filter(Boolean).length;
  const commentCount = (post.comments || []).length;
  const ageHours = post.createdAt?.toMillis ? (Date.now() - post.createdAt.toMillis()) / 3600000 : 0;
  const jitter = Math.random() * 4; // small enough to reshuffle close-scoring posts, not flip the whole order

  return likeCount * 3 + commentCount * 2 - ageHours * 0.4 + jitter;
}

export function sortForYou(posts) {
  return [...posts].sort((a, b) => {
    if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
    if (!!b.isAnnouncement !== !!a.isAnnouncement) return b.isAnnouncement ? 1 : -1;
    return scorePost(b) - scorePost(a);
  });
}