import { defineCard } from "../define.js";

// EDHREC rank 31341.
//
// Rulings:
//   [2004-12-01] Unforge deals damage only to the creature that the Equipment was attached to when
//     the Equipment was destroyed. It doesn’t deal damage to creatures that the Equipment had
//     previously equipped.

export default defineCard({
  name: "Unforge",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Destroy target Equipment. If that Equipment was attached to a creature, Unforge deals 2 damage to that creature.",
  targets: [{ kind: "permanent", filter: { type: "artifact", subtype: "Equipment" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "conditional", condition: { kind: "object-matches", object: { hostOf: 0 }, filter: { type: "creature" } }, then: { kind: "damage", amount: 2, target: { hostOf: 0 } } },
    ],
  },
});
