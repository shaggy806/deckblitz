import { defineCard } from "../define.js";

// EDHREC rank 22242.
//
// "Up to five" counters of whatever kinds the caster chooses as it resolves
// (rule 122.1): off a permanent through the `remove-counters` decision, off an
// opponent — poison, energy, experience, rad — kind by kind.

export default defineCard({
  name: "Price of Betrayal",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Remove up to five counters from target artifact, creature, planeswalker, or opponent.",
  targets: [
    { kind: "permanent", filter: { typesAnyOf: ["artifact", "creature", "planeswalker"] }, orPlayer: "opponent" },
  ],
  effect: { kind: "remove-counters", target: 0, counter: "any", count: 5, upTo: true },
});
