import { defineCard } from "../define.js";

// EDHREC rank 17873.
//
// Embrace Oblivion's cost and target, and Nasty End's "if the sacrificed
// permanent was …", read off the sacrificed permanent as it last existed.

export default defineCard({
  name: "Hellish Sideswipe",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text:
    "As an additional cost to cast this spell, sacrifice an artifact or creature.\n" +
    "Destroy target creature or Vehicle. If the sacrificed permanent was a Vehicle, draw a card.",
  additionalCost: { sacrifice: { typesAnyOf: ["artifact", "creature"], controlledBy: "you" } },
  targets: [{ kind: "permanent", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "sacrificed", filter: { subtype: "Vehicle" } },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});
