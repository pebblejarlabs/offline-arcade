# Offline Arcade

Offline Arcade is a Chrome extension that replaces the classic Dino game with a set of classic Arcade games. The player can choose between multiple games, like:

- Snake
- Flappy Bird

## How It Works

When Chrome reports one of the configured offline navigation failures, the background service worker redirects the tab to the bundled game page. The page opens on a launcher screen and waits for the user to choose a game.

## Project Structure

- `manifest.json`: Extension manifest and web accessible resources
- `background.js`: Redirects supported offline errors to the game page
- `index.html`: Shared extension UI, launcher screen, and canvas container
- `app.js`: Game selection flow and the implementation of the actual games

## Development

1. Open `chrome://extensions`
2. Enable `Developer mode`
3. Click `Load unpacked`
4. Select this project directory
5. After making edits in the game files, reload the extension

After changes, reload the unpacked extension from `chrome://extensions` and test both game flows.

## TODO

- [ ] Add support for more games
- [ ] Add option for Dino game as well
