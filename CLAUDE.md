# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A single-file browser-based Tic Tac Toe game (`tictactoe.html`). No build tools, no dependencies, no server — open directly in a browser.

## Running the Game

```bash
start tictactoe.html   # Windows: opens in default browser
```

## Architecture

Everything lives in `tictactoe.html` — inline CSS in `<style>`, markup in `<body>`, and game logic in `<script>`. No external files.

**Game state** (module-level vars):
- `board` — 9-element array (`null | 'X' | 'O'`)
- `current` — whose turn (`'X'` or `'O'`)
- `gameOver` — boolean
- `scores` — `{ X, O, D }` persisted across restarts

**Key functions:**
- `init()` — resets board/state, rebuilds cell DOM
- `onCell(e)` — handles a move, delegates to `checkWin()`
- `checkWin()` — scans `WINS` (8 winning triplets) and returns the winning triplet or `null`
- `updateScores()` — syncs score counters to DOM

Win detection checks all 8 lines in the `WINS` constant at the top of the script. Cells get CSS classes (`x`/`o`/`taken`/`win`) to drive styling — no JS style manipulation.
