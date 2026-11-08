import { defineCard } from "../define.js";

export default defineCard({
  name: "Ribbons of Night",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Ribbons of Night deals 4 damage to target creature and you gain 4 life. If {U} was spent to cast this spell, draw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 4, target: 0 },
      { kind: "gain-life", amount: 4 },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpent: [{ type: "U", amount: { op: "gte", n: 1 } }] } },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});
