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
    --uuid5-accent: #0f62fe;
    --uuid5-accent-fg: #ffffff;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --uuid5-bg: #1e1f24;
      --uuid5-fg: #f1f3f8;
      --uuid5-border: #505667;
      --uuid5-accent: #7aa2ff;
      --uuid5-accent-fg: #111319;
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
    background: var(--uuid5-bg);
    color: var(--uuid5-fg);
    border: 1px solid var(--uuid5-border);
    border-radius: 6px;
    padding: 10px 14px;
    cursor: pointer;
  }

  #uuid5-generator button.primary-btn {
    background: var(--uuid5-accent);
    border-color: var(--uuid5-accent);
    color: var(--uuid5-accent-fg);
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

  Enter a namespace UUID, add one or more strings, and generate UUIDv5 values.

  <label for="namespace-input"><strong>Namespace UUID</strong></label><br />
  <input id="namespace-input" type="text" placeholder="e.g. 6ba7b810-9dad-11d1-80b4-00c04fd430c8" />

  <div class="uuid5-actions">
    <button id="add-string-btn" type="button">Add String</button>
    <button id="generate-btn" type="button" class="primary-btn">Generate UUIDv5</button>
  </div>

  <p id="error-text" style="color: #b00020; margin-top: 10px; min-height: 1.2em;"></p>

  <div id="string-rows" style="margin-top: 10px;"></div>
</div>

<script src="uuid5-generator.js"></script>
