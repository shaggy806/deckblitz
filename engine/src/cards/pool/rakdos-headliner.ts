import { defineCard } from "../define.js";
import { echo } from "../helpers.js";

// EDHREC rank 23158.

export default defineCard({
  name: "Rakdos Headliner",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Devil"],
  power: 3,
  toughness: 3,
  keywords: ["haste"],
  text: "Haste\nEcho—Discard a card. (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)",
  triggered: [
    echo({ discard: 1, text: "Discard a card" }),
  ],
});
