import { defineCard } from "../define.js";


export default defineCard({
  name: "Unwind History",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Return target creature an opponent controls with mana value 3 or less to its owner's hand. Surveil 1.",
  targets: [
    {
      kind: "permanent",
      whose: "opponent",
      filter: { type: "creature", manaValue: { op: "lte", n: 3 } },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [{ kind: "return-to-hand", target: 0 }, { kind: "surveil", amount: 1 }],
  },
  prepareSpellOnly: true,
});
