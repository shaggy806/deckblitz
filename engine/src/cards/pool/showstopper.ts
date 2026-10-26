import { defineCard } from "../define.js";

// EDHREC rank 21821.
//
// Rulings:
//   [2013-04-15] Creatures that come under your control after Showstopper resolves won't have the
//     ability.
//   [2013-04-15] If another player gains control of a creature you control after Showstopper
//     resolves, and then later that turn that creature dies, the creature's controller when it
//     died controls the triggered ability. That player chooses a creature that one of their
//     opponents controls as a target.
//
// `grant-triggered-all` fixes its matches as it resolves (rule 611.2c — the first ruling); the
// granted ability is Bogardan Firefiend's, aimed at an opponent's creature.

export default defineCard({
  name: "Showstopper",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["instant"],
  text: "Until end of turn, creatures you control gain \"When this creature dies, it deals 2 damage to target creature an opponent controls.\"",
  targets: [],
  effect: {
    kind: "grant-triggered-all",
    filter: { type: "creature", controlledBy: "you" },
    duration: "end-of-turn",
    ability: {
      trigger: { on: "dies", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "When this creature dies, it deals 2 damage to target creature an opponent controls.",
    },
  },
});
