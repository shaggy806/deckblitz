import { defineCard } from "../define.js";

// EDHREC rank 16643.
//
// One feeding counter per life-gaining event (the rulings). The attack
// trigger is Guiding Hydra's "you may remove … If you do": asked only while
// Nazar is still on the battlefield with three feeding counters (the ruling —
// gone, none can be removed and nothing happens).

const LIFE_TEXT = "Whenever you gain life, put a feeding counter on Nazar.";
const ATTACK_TEXT =
  "Whenever Nazar attacks, you may remove three feeding counters from it. If you do, you draw three cards and you lose 3 life.";

export default defineCard({
  name: "Nazar, the Velvet Fang",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Warlock"],
  power: 3,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${LIFE_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "feeding", amount: 1 },
      resolve: null,
      text: LIFE_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "source-on-battlefield" },
            { kind: "self-counters", counter: "feeding", compare: { op: "gte", n: 3 } },
          ],
        },
        then: {
          kind: "may",
          prompt: "Remove three feeding counters from Nazar to draw three cards and lose 3 life?",
          effect: { kind: "remove-counter", target: "source", counter: "feeding", amount: 3 },
          then: {
            kind: "sequence",
            effects: [
              { kind: "draw", amount: 3 },
              { kind: "lose-life", amount: 3 },
            ],
          },
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
