import { defineCard } from "../define.js";

export default defineCard({
  name: "Counterintelligence",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Return one or two target creatures to their owners' hands.",
  targets: ["creature", { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } }],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "return-to-hand", target: 1 },
    ],
  },
});
