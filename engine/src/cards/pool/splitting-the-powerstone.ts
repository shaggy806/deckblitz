import { defineCard } from "../define.js";

// The Brothers' War. "If the sacrificed artifact was legendary" reads the
// artifact sacrificed to cast it, as it last existed (Nasty End's shape).
export default defineCard({
  name: "Splitting the Powerstone",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text:
    "As an additional cost to cast this spell, sacrifice an artifact.\nCreate two tapped Powerstone tokens. " +
    'If the sacrificed artifact was legendary, draw a card. (The tokens are artifacts with "{T}: Add {C}. ' +
    'This mana can\'t be spent to cast a nonartifact spell.")',
  additionalCost: { sacrifice: { type: "artifact", controlledBy: "you" } },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Powerstone Token", count: 2, tapped: true },
      {
        kind: "conditional",
        condition: { kind: "sacrificed", filter: { supertype: "legendary" } },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});
