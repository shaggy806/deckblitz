import { defineCard } from "../define.js";

// EDHREC rank 11952.
// With both targets illegal the spell doesn't resolve and the Ring doesn't tempt you (the ruling).

export default defineCard({
  name: "Breaking of the Fellowship",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Target creature an opponent controls deals damage equal to its power to another target creature that player controls. The Ring tempts you.",
  targets: [
    "creature-an-opponent-controls",
    { kind: "other", of: "creature", than: { slot: 0 }, sameController: true },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "fight", a: 0, b: 1, oneSided: true },
      { kind: "the-ring-tempts-you" },
    ],
  },
});
