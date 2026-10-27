import { defineCard } from "../define.js";

// EDHREC rank 29506.

export default defineCard({
  name: "Hallowed Healer",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: "{T}: Prevent the next 2 damage that would be dealt to any target this turn.\nThreshold — {T}: Prevent the next 4 damage that would be dealt to any target this turn. Activate only if there are seven or more cards in your graveyard.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: { kind: "prevent-damage", target: 0, amount: 2 },
      resolve: null,
      text: "{T}: Prevent the next 2 damage that would be dealt to any target this turn.",
    },
    {
      cost: { mana: null, tap: true },
      condition: { kind: "threshold" },
      targets: ["any-target"],
      effect: { kind: "prevent-damage", target: 0, amount: 4 },
      resolve: null,
      text: "Threshold — {T}: Prevent the next 4 damage that would be dealt to any target this turn. Activate only if there are seven or more cards in your graveyard.",
    },
  ],
});
