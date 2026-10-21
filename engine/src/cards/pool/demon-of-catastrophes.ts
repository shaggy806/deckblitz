import { defineCard } from "../define.js";

export default defineCard({
  name: "Demon of Catastrophes",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "trample"],
  text: "As an additional cost to cast this spell, sacrifice a creature.\nFlying, trample",
  additionalCost: { sacrifice: { type: "creature" } },
});
