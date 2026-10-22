import { defineCard } from "../define.js";

// Vraska, Relic Seeker's and Fathom Fleet Captain's Pirate token.

export default defineCard({
  name: "Pirate Token",
  art: "2d7fc721-6b5b-4920-86fa-0fbfd90adaf5",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Pirate"],
  power: 2,
  toughness: 2,
  keywords: ["menace"],
  text: "Menace (This creature can't be blocked except by two or more creatures.)",
});
