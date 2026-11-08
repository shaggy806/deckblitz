import { defineCard } from "../define.js";

// EDHREC rank 32124. +2/+0 until end of combat (rule 511.2), not end of turn.
//
// Rulings:
//   An ability that triggers when something "attacks and isn't blocked" triggers in the declare
//     blockers step after blockers are declared if (1) that creature is attacking and (2) no
//     creatures are declared to block it.

const TEXT = "Whenever this creature attacks and isn't blocked, it gets +2/+0 until end of combat.";

export default defineCard({
  name: "Murk Dwellers",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks-unblocked", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "until-end-of-combat" },
      resolve: null,
      text: TEXT,
    },
  ],
});
