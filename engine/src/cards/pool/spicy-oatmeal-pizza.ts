import { defineCard } from "../define.js";

// EDHREC rank 19760.
//
// The damage to you is part of the targeted ability: with its target illegal
// the ability doesn't resolve and you take none (the ruling).

const ENTERS_TEXT = "When this artifact enters, it deals 4 damage to any target and 3 damage to you.";

export default defineCard({
  name: "Spicy Oatmeal Pizza",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Food"],
  text: `${ENTERS_TEXT}\n{2}, {T}, Sacrifice this artifact: You gain 3 life.`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 4, target: 0 },
          { kind: "damage", amount: 3, who: "you" },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: "{2}, {T}, Sacrifice this artifact: You gain 3 life.",
    },
  ],
});
