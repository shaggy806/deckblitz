import { defineCard } from "../define.js";

// Playtest card. An artifact creature Dog with the Food artifact type; its {T} ability waits out
// summoning sickness (rule 302.6).

export default defineCard({
  name: "Char-Dog",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Dog", "Food"],
  power: 1,
  toughness: 1,
  text: "Protection from red\nWhen this creature enters, it deals 4 damage to any target and 2 damage to you.\n{G}, {T}, Sacrifice this creature: You gain 3 life.",
  activated: [
    {
      cost: { mana: "{G}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: "{G}, {T}, Sacrifice this creature: You gain 3 life.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 4, target: 0 },
          { kind: "damage", amount: 2, who: "you" },
        ],
      },
      resolve: null,
      text: "When this creature enters, it deals 4 damage to any target and 2 damage to you.",
    },
  ],
  static: [{ affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" }],
});
