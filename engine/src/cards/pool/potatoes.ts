import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). A Food artifact with no Food ability of
// its own: the subtype alone (rule 205.3g), the only ability its sacrifice.
// The Boil mode's damage comes from Potatoes as it last existed (rule 608.2h).

const TEXT =
  "{2}, {T}, Sacrifice Potatoes: Choose one —\n• Boil — Potatoes deals 1 damage to any target.\n• Mash — Create two Food tokens.\n• Stew — Gain 3 life. Draw a card.";

export default defineCard({
  name: "Potatoes",
  manaCost: "{0}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Food"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Boil — Potatoes deals 1 damage to any target.",
            targets: ["any-target"],
            effect: { kind: "damage", amount: 1, target: 0 },
          },
          {
            text: "Mash — Create two Food tokens.",
            effect: { kind: "create-token", token: "Food Token", count: 2 },
          },
          {
            text: "Stew — Gain 3 life. Draw a card.",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "gain-life", amount: 3 },
                { kind: "draw", amount: 1 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
