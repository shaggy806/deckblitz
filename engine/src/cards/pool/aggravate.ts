import { defineCard } from "../define.js";

// "Dealt damage this way" is each creature's own 1 damage, after prevention
// (rule 615.1): a creature whose damage was prevented isn't made to attack.

export default defineCard({
  name: "Aggravate",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Aggravate deals 1 damage to each creature target player controls. Each creature dealt damage this way attacks this turn if able.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-all", filter: { type: "creature" }, controlledByTarget: 0, amount: 1 },
      {
        kind: "for-each-permanent",
        filter: { type: "creature", controlledBy: "you" },
        controlledByTarget: 0,
        as: 1,
        effect: {
          kind: "conditional",
          condition: { kind: "damage-dealt-this-way", to: 1 },
          then: { kind: "attack-requirement", target: 1, duration: "end-of-turn" },
        },
      },
    ],
  },
});
