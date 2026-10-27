import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 24583.
//
// Rulings:
//   [2024-11-08] The kicker ability doesn't let you pay a kicker cost more than once.
//   [2024-11-08] If you copy a kicked spell on the stack, the copy is also kicked.
//
// Kicked, the damage doesn't depend on the creature dying (unlike Kaervek's
// Purge): its power and controller are read as it last existed (rule 608.2h).
export default defineCard({
  name: "Agonizing Demise",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Kicker {1}{R} (You may pay an additional {1}{R} as you cast this spell.)\nDestroy target nonblack creature. It can't be regenerated. If this spell was kicked, Agonizing Demise deals damage equal to that creature's power to the creature's controller.",
  targets: ["nonblack-creature"],
  effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
  kicker: {
    cost: "{1}{R}",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "destroy", target: 0, cantBeRegenerated: true },
        { kind: "damage", amount: { powerOf: 0 }, toControllerOfTarget: 0 },
      ],
    },
  },
});
