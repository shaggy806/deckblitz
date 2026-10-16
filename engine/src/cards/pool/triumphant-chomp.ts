import { defineCard } from "../define.js";

// EDHREC rank 14099. The Lost Caverns of Ixalan.
//
// Rulings:
//   [2023-11-10] The amount of damage Triumphant Chomp deals is determined as it resolves. If you
//     don't control any Dinosaurs at that time, or if the Dinosaurs you control are unusually
//     small, Triumphant Chomp will deal 2 damage.
//
// "2 or the greatest power among Dinosaurs you control, whichever is
// greater": Go Ninja Go's greatest power, narrowed to Dinosaurs, when one of
// them has power 3 or more; 2 otherwise. Both read as it resolves.

const DINOSAURS = { type: "creature", subtype: "Dinosaur", controlledBy: "you" } as const;

export default defineCard({
  name: "Triumphant Chomp",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Triumphant Chomp deals damage to target creature equal to 2 or the greatest power among Dinosaurs you control, whichever is greater.",
  targets: ["creature"],
  effect: {
    kind: "damage",
    target: 0,
    amount: {
      ifCondition: {
        kind: "controls",
        filter: { type: "creature", subtype: "Dinosaur", power: { op: "gte", n: 3 } },
        atLeast: 1,
      },
      then: { aggregate: "max", of: "power", filter: DINOSAURS },
      else: 2,
    },
  },
});
