import { defineCard } from "../define.js";
import { echo } from "../helpers.js";

// EDHREC rank 32192.

export default defineCard({
  name: "Viashino Outrider",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 4,
  toughness: 3,
  text: "Echo {2}{R} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)",
  triggered: [
    echo("{2}{R}"),
  ],
});
