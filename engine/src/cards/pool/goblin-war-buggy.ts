import { defineCard } from "../define.js";
import { echo } from "../helpers.js";

// EDHREC rank 29426.

export default defineCard({
  name: "Goblin War Buggy",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
  text: "Haste\nEcho {1}{R} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)",
  triggered: [
    echo("{1}{R}"),
  ],
});
