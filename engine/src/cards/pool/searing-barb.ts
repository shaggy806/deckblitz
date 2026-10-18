import { defineCard } from "../define.js";

// EDHREC rank 26996.
//
// "If it's a creature" is checked as the spell resolves (Provoke the Trolls'
// target condition); a player or a noncreature planeswalker gets no
// restriction. Incubate 1 happens either way.

export default defineCard({
  name: "Searing Barb",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Searing Barb deals 2 damage to any target. If it's a creature, it can't block this turn. Incubate 1. (Create an Incubator token with a +1/+1 counter on it and \"{2}: Transform this token.\" It transforms into a 0/0 Phyrexian artifact creature.)",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 2, target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { type: "creature" } },
        then: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      },
      { kind: "incubate", amount: 1 },
    ],
  },
});
