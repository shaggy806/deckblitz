import { defineCard } from "../define.js";
import { echo } from "../helpers.js";

// EDHREC rank 32055.

export default defineCard({
  name: "Winding Wurm",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 6,
  toughness: 6,
  text: "Echo {4}{G} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)",
  triggered: [
    echo("{4}{G}"),
  ],
});
