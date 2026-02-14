---
title: "UUIDv5 Generator"
date: 2026-02-07T12:00:00+05:30
draft: false
type: "page"
description: Generate UUIDv5 values from a namespace UUID and one or more strings.
---

<style>
  :root {
    --uuid5-bg: #ffffff;
    --uuid5-fg: #1b1b1f;
    --uuid5-border: #b8bcc5;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --uuid5-bg: #1e1f24;
      --uuid5-fg: #f1f3f8;
      --uuid5-border: #505667;
    }
  }

  #uuid5-generator input {
    box-sizing: border-box;
    background: var(--uuid5-bg);
    color: var(--uuid5-fg);
    border: 1px solid var(--uuid5-border);
    border-radius: 6px;
    padding: 10px 12px;
  }

  #uuid5-generator button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: var(--uuid5-bg);
    color: var(--uuid5-fg);
    border: 1px solid var(--uuid5-border);
    border-radius: 6px;
    padding: 10px 14px;
    cursor: pointer;
  }

  #random-uuid-input {
    width: 100%;
    max-width: 760px;
    min-width: 0;
    margin-top: 8px;
    font-size: clamp(1rem, 3.2vw, 1.45rem);
    font-weight: 700;
    letter-spacing: 0.01em;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }

  #namespace-input {
    width: 100%;
    max-width: 760px;
    margin-top: 8px;
  }

  .uuid5-actions {
    margin-top: 14px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .uuid5-row {
    margin-top: 10px;
  }

  .uuid5-row.is-entering {
    animation: uuid5FadeIn 180ms ease-out;
  }

  .uuid5-row.is-removing {
    animation: uuid5FadeOut 180ms ease-in forwards;
    pointer-events: none;
  }

  .uuid5-row-controls {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .uuid5-value-input {
    width: 100%;
    max-width: 760px;
    flex: 1;
  }

  .uuid5-output-wrap {
    margin-top: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .uuid5-output-wrap[hidden] {
    display: none;
  }

  .uuid5-copy-output-btn {
    padding: 4px 8px !important;
    font-size: 0.85rem;
    line-height: 1;
  }

  .uuid5-copy-output-btn i {
    width: 1em;
    text-align: center;
  }

  .uuid5-copy-feedback {
    font-size: 0.85rem;
    color: #1f7a1f;
  }

  #lock-fields-btn i {
    width: 1em;
    text-align: center;
  }

  #uuid5-generator.is-locked input:not(#random-uuid-input) {
    background: #d9d9d9;
    color: #555555;
    border-color: #a9a9a9;
  }

  #uuid5-generator.is-locked .uuid5-output {
    opacity: 0.7;
  }

  #uuid5-generator button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @keyframes uuid5FadeIn {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes uuid5FadeOut {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-4px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .uuid5-row.is-entering,
    .uuid5-row.is-removing {
      animation: none;
    }
  }
</style>

<div id="uuid5-generator">
  <label for="random-uuid-input"><strong>Random UUID</strong></label><br />
  <input id="random-uuid-input" type="text" readonly />

  <div class="uuid5-actions">
    <button id="new-random-btn" type="button">New Random UUID</button>
    <button id="copy-random-btn" type="button">Copy</button>
  </div>

  <hr />

  Enter a namespace UUID and add one or more strings. UUIDv5 values update automatically as you type.

  <label for="namespace-input"><strong>Namespace UUID</strong></label><br />
  <input id="namespace-input" type="text" placeholder="e.g. 6ba7b810-9dad-11d1-80b4-00c04fd430c8" />

  <p id="error-text" style="color: #b00020; margin-top: 10px; min-height: 1.2em;"></p>

  <div id="string-rows" style="margin-top: 10px;"></div>

  <div class="uuid5-actions">
    <button id="add-string-btn" type="button">Add String</button>
    <button id="lock-fields-btn" type="button"><i class="fas fa-solid fa-lock" aria-hidden="true"></i><span>Lock</span></button>
  </div>
</div>

<script src="uuid5-generator.js"></script>
