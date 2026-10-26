import { defineCard } from "../define.js";
import { echo } from "../helpers.js";

// EDHREC rank 31220.

export default defineCard({
  name: "Citanul Centaurs",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Centaur"],
  power: 6,
  toughness: 3,
  keywords: ["shroud"],
  text: "Shroud (This creature can't be the target of spells or abilities.)\nEcho {3}{G} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)",
  triggered: [
    echo("{3}{G}"),
  ],
});
