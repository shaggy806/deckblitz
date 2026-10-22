import { defineCard } from "../define.js";

// The half of Grind // Dust cast from the hand.
const FACES = ["Grind // Dust", "Grind", "Dust"];

export default defineCard({
  name: "Grind",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Put a -1/-1 counter on each of up to two target creatures.",
  // Two different creatures, one counter each (the ruling).
  targets: [{ kind: "optional", of: "creature" }, { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
      { kind: "add-counter", target: 1, counter: "-1/-1", amount: 1 },
    ],
  },
  faces: FACES,
  split: true,
});
