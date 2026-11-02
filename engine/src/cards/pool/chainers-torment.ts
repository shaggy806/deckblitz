import { defineCard } from "../define.js";

const DRAIN = "I, II — This Saga deals 2 damage to each opponent and you gain 2 life.";
const HORROR =
  "III — Create an X/X black Nightmare Horror creature token, where X is half your life total, rounded up. It deals X damage to you.";
const HALF_LIFE = { half: { lifeTotal: "you" }, round: "up" } as const;

// X is read once, so the damage is still X whatever else changes the token's
// power, and each token an Anointed Procession doubles deals it (its rulings).
export default defineCard({
  name: "Chainer's Torment",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${DRAIN}\n${HORROR}`,
  chapters: [
    {
      at: [1, 2],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 2, who: "each-opponent" },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: DRAIN,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Nightmare Horror Token", count: 1, basePt: { power: HALF_LIFE, toughness: HALF_LIFE } },
          { kind: "each-deals-damage", filter: { thisWay: "created" }, amount: HALF_LIFE, to: { who: "you" } },
        ],
      },
      resolve: null,
      text: HORROR,
    },
  ],
});
