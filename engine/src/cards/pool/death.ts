import { defineCard } from "../define.js";

const FACES = ["Life // Death", "Life", "Death"];

// The right half of Life // Death (see life-death.ts).
export default defineCard({
  name: "Death",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Return target creature card from your graveyard to the battlefield. You lose life equal to its mana value.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      { kind: "lose-life", amount: { manaValueOf: 0 } },
    ],
  },
  faces: FACES,
  split: true,
});
