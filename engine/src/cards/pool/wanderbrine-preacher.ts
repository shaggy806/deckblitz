import { defineCard } from "../define.js";

// EDHREC rank 17839.
const TEXT = "Whenever this creature becomes tapped, you gain 2 life.";

export default defineCard({
  name: "Wanderbrine Preacher",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Merfolk", "Cleric"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
