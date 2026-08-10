"use client";

import { useState } from "react";

const posts = [
  {
    name: "Sarah",
    time: "2m ago",
    text: "I almost got scammed by a fake banking SMS asking for my account verification details.",
    image:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1200&auto=format&fit=crop",
    likes: 1400,
    comments: 128,
    profile: "https://i.pravatar.cc/150?img=47",
  },

  {
    name: "Edward Chen",
    time: "5m ago",
    text: "Fake job offer emails are increasing. Never pay upfront fees for training.",
    image:
      "https://images.unsplash.com/photo-1556740749-887f6717d7e4?q=80&w=1200&auto=format&fit=crop",
    likes: 2100,
    comments: 302,
    profile: "https://i.pravatar.cc/150?img=12",
  },

  {
    name: "Lerato",
    time: "10m ago",
    text: "Someone cloned my WhatsApp profile and tried scamming my family pretending to be me.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",
    likes: 980,
    comments: 84,
    profile: "https://i.pravatar.cc/150?img=32",
  },

  {
    name: "James",
    time: "18m ago",
    text: "Be careful of fake WiFi networks in malls and airports. Hackers can steal login details through unsecured connections.",
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
    likes: 760,
    comments: 49,
    profile: "https://i.pravatar.cc/150?img=22",
  },

  {
    name: "Aisha Khan",
    time: "30m ago",
    text: "Received a phishing email pretending to be from Netflix asking me to update payment information immediately.",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
    likes: 1200,
    comments: 175,
    profile: "https://i.pravatar.cc/150?img=48",
  },

  {
    name: "Michael",
    time: "1h ago",
    text: "Scammers are now using AI-generated voice calls pretending to be family members asking for urgent money transfers.",
    image:
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1200&auto=format&fit=crop",
    likes: 3400,
    comments: 601,
    profile: "https://i.pravatar.cc/150?img=18",
  },

  {
    name: "Nomvula",
    time: "2h ago",
    text: "Always enable two-factor authentication. My email account was protected even after my password got leaked.",
    image:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop",
    likes: 1800,
    comments: 233,
    profile: "https://i.pravatar.cc/150?img=25",
  },
];

// Feed Container

const feed = document.querySelector(".feed");

// Display Post

function displayPosts(postArray) {
  // Clear Feed
  feed.innerHTML = "";

  // Post
  postArray.forEach((post, index) => {
    // Create Card
    const card = document.createElement("div");

    card.classList.add("post-card");

    // Card Content
    card.innerHTML = `

      <div class="post-header">

        <div class="user-info">

          <img
            class="profile-pic"
            src="${post.profile}"
          >

          <div class="user-details">
            <h2>${post.name}</h2>
            <p>${post.time}</p>
          </div>

        </div>

        <div class="menu">•••</div>

      </div>

      <div class="post-content">
        ${post.text}
      </div>

      <img
        class="post-image"
        src="${post.image}"
      >

      <div class="post-actions">

        <div class="left-actions">

          <div class="action like-btn" data-index="${index}">
            <span class="gem">💎</span>
            <span>${post.likes}</span>
          </div>

          <div class="action">
            💬 ${post.comments}
          </div>

        </div>

        <div class="save">
          🔖
        </div>

      </div>

    `;

    // Add Feed Card
    feed.appendChild(card);
  });

  // Enable
  activateLikeButtons();
}

// LIKE FUNCTION

function activateLikeButtons() {
  const likeButtons = document.querySelectorAll(".like-btn");

  likeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // get index
      const index = button.dataset.index;

      // ADD LIKE
      posts[index].likes++;

      // Refresh Posts
      displayPosts(posts);
    });
  });
}

// Search

const searchInput = document.querySelector(".search-box input");

searchInput.addEventListener("keyup", () => {
  const value = searchInput.value.toLowerCase();

  // Filter Posts
  const filteredPosts = posts.filter((post) => {
    return (
      post.name.toLowerCase().includes(value) ||
      post.text.toLowerCase().includes(value)
    );
  });

  // Display Filtered
  displayPosts(filteredPosts);
});

// add post

const addPostButton = document.querySelector(".add-post");

addPostButton.addEventListener("click", () => {
  const userPost = prompt("Write your cybersecurity awareness post:");

  // Check if user entered something
  if (userPost) {
    // New post object
    const newPost = {
      name: "You",

      time: "Just now",

      text: userPost,

      image:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",

      likes: 0,

      comments: 0,

      profile: "https://i.pravatar.cc/150?img=15",
    };

    // Add to Front
    posts.unshift(newPost);

    // REFRESH POSTS
    displayPosts(posts);
  }
});

// Initial Display

displayPosts(posts);
