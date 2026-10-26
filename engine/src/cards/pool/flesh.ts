import { defineCard } from "../define.js";

const FACES = ["Flesh // Blood", "Flesh", "Blood"];

// The left half of Flesh // Blood (see flesh-blood.ts).
export default defineCard({
  name: "Flesh",
  manaCost: "{3}{B}{G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  text: "Exile target creature card from a graveyard. Put X +1/+1 counters on target creature, where X is the power of the card you exiled.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: [
    { kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } },
    "creature",
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "add-counter", target: 1, counter: "+1/+1", amount: { powerOf: 0 } },
    ],
  },
  faces: FACES,
  split: true,
});
