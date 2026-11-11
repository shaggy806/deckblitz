import { defineCard } from "../define.js";

// EDHREC rank 9067. The target is chosen as it's cast; the die is rolled as it
// resolves, and a modified result reads its row (the rulings).
export default defineCard({
  name: "Six-Sided Die",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Choose target creature. Roll a six-sided die.\n1 — It has base toughness 1 until end of turn.\n2 — Put two -1/-1 counters on it.\n3 — Six-Sided Die deals 3 damage to it and you gain 3 life.\n4 — It gets -4/-4 until end of turn.\n5 — Destroy it.\n6 — Exile it.",
  targets: ["creature"],
  effect: {
    kind: "roll-dice",
    sides: 6,
    table: [
      { min: 1, max: 1, effect: { kind: "become", target: 0, toughness: 1, duration: "end-of-turn" } },
      { min: 2, max: 2, effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 2 } },
      {
        min: 3,
        max: 3,
        effect: {
          kind: "sequence",
          effects: [
            { kind: "damage", amount: 3, target: 0 },
            { kind: "gain-life", amount: 3 },
          ],
        },
      },
      { min: 4, max: 4, effect: { kind: "modify-pt", target: 0, power: -4, toughness: -4, duration: "end-of-turn" } },
      { min: 5, max: 5, effect: { kind: "destroy", target: 0 } },
      { min: 6, max: 6, effect: { kind: "exile", target: 0 } },
    ],
  },
});
