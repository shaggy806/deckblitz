import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 27047.
//
// Rulings:
//   [2006-10-15] Checks only on resolution to see if the land has the supertype snow; it's not
//     part of the targeting condition.
//
// Whether the land is snow is read as the spell resolves, before it's
// destroyed; the damage goes to whoever controlled it (last-known information,
// rule 608.2h).

export default defineCard({
  name: "Icequake",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target land. If that land was a snow land, Icequake deals 1 damage to that land's controller.",
  targets: ["land"],
  effect: {
    kind: "conditional",
    condition: { kind: "target", index: 0, filter: { supertype: "snow" } },
    then: {
      kind: "sequence",
      effects: [
        { kind: "destroy", target: 0 },
        { kind: "damage", amount: 1, toControllerOfTarget: 0 },
      ],
    },
    else: { kind: "destroy", target: 0 },
  },
});
