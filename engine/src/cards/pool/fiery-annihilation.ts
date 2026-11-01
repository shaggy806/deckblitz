import { defineCard } from "../define.js";

// "Up to one target Equipment attached to that creature": an `other` slot
// `attachedToThan` the creature's. As it resolves, the Equipment no longer
// attached to it — or the creature illegal — leaves the Equipment illegal
// too (the rulings; rule 608.2b); one with nothing attached is fine to target.
export default defineCard({
  name: "Fiery Annihilation",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Fiery Annihilation deals 5 damage to target creature. Exile up to one target Equipment attached to that creature. If that creature would die this turn, exile it instead.",
  targets: [
    "creature",
    {
      kind: "optional",
      of: { kind: "other", of: { kind: "permanent", filter: { subtype: "Equipment" } }, than: { slot: 0 }, attachedToThan: true },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 5, target: 0 },
      { kind: "exile", target: 1 },
      { kind: "exile-if-dies-this-turn", target: 0 },
    ],
  },
});
