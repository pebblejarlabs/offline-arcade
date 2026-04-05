# Contributing

## Scope

This project is a small Chrome extension with no build pipeline. Keep changes focused, readable, and easy to verify manually.

## Setup

1. Load the extension as unpacked from `chrome://extensions`
2. Make your changes locally
3. Reload the extension after each change you want to test

## Development Guidelines

- Preserve the offline-first behavior of the extension
- Keep the UI lightweight and self-contained
- Avoid adding unnecessary dependencies or tooling
- Match the existing plain JavaScript style unless a refactor clearly improves maintainability
- Test keyboard controls after changing game or launcher behavior

## Manual Verification

Before submitting changes, verify:

- The extension loads successfully as an unpacked extension
- Offline redirects still open the game page
- The launcher appears first
- Snake starts, scores, and restarts correctly
- Flappy Bird starts, scores, and restarts correctly
- `Esc` returns to the launcher from both games

## Submitting Changes

Include a short summary of:

- What changed
- Why it changed
- How you tested it

If a change affects controls, rendering, or offline redirect behavior, mention that explicitly in the submission notes.
