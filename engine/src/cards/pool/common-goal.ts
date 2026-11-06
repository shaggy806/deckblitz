import { defineCard } from "../define.js";

export default defineCard({
  name: "Common Goal",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "One or two target creatures you control each deal damage equal to their power to target creature an opponent controls.",
  targets: [
    "creature-you-control",
    { kind: "optional", of: { kind: "other", of: "creature-you-control", than: { slots: [0] } } },
    "creature-an-opponent-controls",
  ],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "fight", a: 0, b: 2, oneSided: true },
      { kind: "fight", a: 1, b: 2, oneSided: true },
    ],
  },
});
