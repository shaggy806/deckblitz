import { defineCard } from "../define.js";
import { echo } from "../helpers.js";

// EDHREC rank 31343.

export default defineCard({
  name: "Shivan Raptor",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 3,
  toughness: 1,
  keywords: ["first-strike", "haste"],
  text: "First strike, haste\nEcho {2}{R} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)",
  triggered: [
    echo("{2}{R}"),
  ],
});
