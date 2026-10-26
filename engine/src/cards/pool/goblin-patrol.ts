import { defineCard } from "../define.js";
import { echo } from "../helpers.js";

// EDHREC rank 30444.

export default defineCard({
  name: "Goblin Patrol",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 2,
  toughness: 1,
  text: "Echo {R} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)",
  triggered: [
    echo("{R}"),
  ],
});
