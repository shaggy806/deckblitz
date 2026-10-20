import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 14207. A d20 results table (rule 706.3a); the roll and its
// result are one ability, so nobody responds between them (the ruling).

const TEXT =
  "Circle of Death — {5}{B}: Roll a d20.\n" +
  "1—9 | Each opponent loses 2 life.\n" +
  "10—19 | Each opponent loses 2 life and you gain 2 life.\n" +
  '20 | Each opponent loses 2 life and you gain 2 life. Create two Treasure tokens. (They\'re artifacts with "{T}, Sacrifice this token: Add one mana of any color.")';

const drain: readonly EffectSpec[] = [
  { kind: "lose-life", amount: 2, who: "each-opponent" },
  { kind: "gain-life", amount: 2 },
];

export default defineCard({
  name: "Herald of Hadar",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 4,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{5}{B}", tap: false },
      targets: [],
      effect: {
        kind: "roll-dice",
        sides: 20,
        table: [
          { min: 1, max: 9, effect: { kind: "lose-life", amount: 2, who: "each-opponent" } },
          { min: 10, max: 19, effect: { kind: "sequence", effects: drain } },
          {
            min: 20,
            effect: {
              kind: "sequence",
              effects: [...drain, { kind: "create-token", token: "Treasure Token", count: 2 }],
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
