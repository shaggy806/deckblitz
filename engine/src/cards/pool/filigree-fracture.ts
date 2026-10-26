import { defineCard } from "../define.js";

// Conflux (CON).
//
// "If that permanent was blue or black" reads the target as it last existed
// on the battlefield once destroyed (rule 608.2h) — Budding Insurgent's shape.

const TEXT = "Destroy target artifact or enchantment. If that permanent was blue or black, draw a card.";

export default defineCard({
  name: "Filigree Fracture",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: TEXT,
  targets: ["artifact-or-enchantment"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { anyOf: [{ colors: ["U"] }, { colors: ["B"] }] } },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});
