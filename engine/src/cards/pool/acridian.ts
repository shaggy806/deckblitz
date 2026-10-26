import { defineCard } from "../define.js";
import { echo } from "../helpers.js";

// EDHREC rank 29181.

export default defineCard({
  name: "Acridian",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 2,
  toughness: 4,
  text: "Echo {1}{G} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)",
  triggered: [
    echo("{1}{G}"),
  ],
});
