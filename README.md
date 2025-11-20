# Naija Plate

Naija Plate is a modern, beautiful Nigerian food recipe web app with a smart, persistent shopping list. It is built by [Teda.dev](https://teda.dev), the AI app builder for everyday problems, and focuses on great typography, thoughtful color, and a delightful cooking experience.

## Features
- Editorial landing page with bold typography and engaging storytelling
- Curated Nigerian recipes with images, tags, time, and servings
- Powerful search with tag filters
- Detailed recipe modal with step-by-step guidance
- One-click add of all ingredients to the shopping list
- Shopping list page with categories, merge duplicates, copy, print, and persistence
- Add your own recipes with ingredients and steps
- LocalStorage persistence for recipes, favorites, and shopping list

## Tech Stack
- HTML5 + Tailwind CSS (via CDN)
- jQuery 3.7.x for interactivity
- Modular JavaScript: scripts/helpers.js, scripts/ui.js, scripts/main.js
- CSS3 animations for micro-interactions, hover effects, and entrances

## Getting Started
1. Download or clone this repository.
2. Open `index.html` in your browser to view the landing page.
3. Click "Explore recipes" for the main app, or go directly to `shopping.html` for your list.

No build step is required. Everything runs client-side and saves to your browser.

## Data Persistence
- Recipes: `naijaplate.recipes`
- Favorites: `naijaplate.favorites`
- Shopping list: `naijaplate.shopping`

## Accessibility
- WCAG-conscious color contrast
- Keyboard focus styles and visible buttons
- Touch-friendly targets with generous spacing

## Notes
- You can safely add, edit, and remove recipes. Data is stored locally in your browser.
- Use the Merge button on the shopping list to combine duplicate items and sum quantities.

## Credits
- Photography is loaded from Unsplash URLs at runtime.
- Logo and UI design by Naija Plate.
