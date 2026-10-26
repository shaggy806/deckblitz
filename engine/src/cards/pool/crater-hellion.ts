import { defineCard } from "../define.js";
import { echo } from "../helpers.js";

// EDHREC rank 19373.

export default defineCard({
  name: "Crater Hellion",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Hellion", "Beast"],
  power: 6,
  toughness: 6,
  text: "Echo {4}{R}{R} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)\nWhen this creature enters, it deals 4 damage to each other creature.",
  triggered: [
    echo("{4}{R}{R}"),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "damage-all", filter: { type: "creature" }, amount: 4, exceptSource: true },
      resolve: null,
      text: "When this creature enters, it deals 4 damage to each other creature.",
    },
  ],
});
