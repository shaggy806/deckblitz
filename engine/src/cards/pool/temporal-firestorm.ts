import { defineCard } from "../define.js";

// EDHREC rank 26315.
//
// Rulings:
//   [2022-09-09] You may kick Temporal Firestorm only once for its {1}{W} cost and only once for
//     its {1}{U} cost. You can kick it twice by paying {2}{W}{U}, but you can't kick it twice by
//     paying {2}{W}{W} or {2}{U}{U}. You can't kick it more than twice. Notably, this means that X
//     will always be either one or two if Temporal Firestorm was kicked.
//   [2024-11-08] If you copy a kicked spell on the stack, the copy is also kicked. If the copied
//     spell is a permanent spell, the token the copy of that spell becomes when it enters is also
//     kicked.
//   [2024-11-08] If a card or token enters as a copy of a permanent, the new permanent isn't
//     kicked, even if the original was.
//   [2024-11-08] If a spell's kicker cost was paid, the spell is "kicked."
//   [2024-11-08] The kicker ability doesn't let you pay a kicker cost more than once.
//   [2024-11-08] To determine a spell's total cost, start with the mana cost (or an alternative
//     cost if another card's effect allows you to pay one instead), add any cost increases (such
//     as kicker), then apply any cost reductions. The spell's mana value remains unchanged, no
//     matter what the total cost to cast it was.
//   [2024-11-08] If you put a permanent with a kicker ability onto the battlefield without casting
//     it, you can't kick it.

export default defineCard({
  name: "Temporal Firestorm",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Kicker {1}{W} and/or {1}{U} (You may pay an additional {1}{W} and/or {1}{U} as you cast this spell.)\nChoose up to X creatures and/or planeswalkers you control, where X is the number of times this spell was kicked. Those permanents phase out.\nTemporal Firestorm deals 5 damage to each creature and each planeswalker.",
  kicker: { cost: "{1}{W}", second: "{1}{U}" },
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "choose-permanents",
        filter: { controlledBy: "you", typesAnyOf: ["creature", "planeswalker"] },
        upTo: { timesKicked: "source" },
        then: { kind: "phase-out", target: 0 },
        prompt: "Choose creatures and/or planeswalkers you control to phase out",
      },
      { kind: "damage-all", filter: { typesAnyOf: ["creature", "planeswalker"] }, amount: 5 },
    ],
  },
});
