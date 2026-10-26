import { defineCard } from "../define.js";
import { echo } from "../helpers.js";

// EDHREC rank 29730.

export default defineCard({
  name: "Pouncing Jaguar",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 2,
  toughness: 2,
  text: "Echo {G} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)",
  triggered: [
    echo("{G}"),
  ],
});
