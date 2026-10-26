import { defineCard } from "../define.js";
import { echo } from "../helpers.js";

// EDHREC rank 31649.

export default defineCard({
  name: "Vug Lizard",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 3,
  toughness: 4,
  keywords: ["mountainwalk"],
  text: "Mountainwalk (This creature can't be blocked as long as defending player controls a Mountain.)\nEcho {1}{R}{R} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)",
  triggered: [
    echo("{1}{R}{R}"),
  ],
});
