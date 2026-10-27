import { defineCard } from "../define.js";

// EDHREC rank 28611.
//
// Rulings:
//   [2024-11-08] If you copy a kicked spell on the stack, the copy is also kicked. If the copied
//     spell is a permanent spell, the token the copy of that spell becomes when it enters is also
//     kicked.
//   [2024-11-08] If a card or token enters as a copy of a permanent, the new permanent isn't
//     kicked, even if the original was.
//   [2024-11-08] The kicker ability doesn't let you pay a kicker cost more than once.
//   [2024-11-08] If you put a permanent with a kicker ability onto the battlefield without casting
//     it, you can't kick it.
//   [2024-11-08] To determine a spell's total cost, start with the mana cost (or an alternative
//     cost if another card's effect allows you to pay one instead), add any cost increases (such
//     as kicker), then apply any cost reductions. The spell's mana value remains unchanged, no
//     matter what the total cost to cast it was.
//   [2024-11-08] If a spell's kicker cost was paid, the spell is "kicked."

// Each kicker's rider is a `conditional` on which kicker was paid (rule
// 702.33f); both paid, both happen.
export default defineCard({
  name: "Illuminate",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Kicker {2}{R} and/or {3}{U} (You may pay an additional {2}{R} and/or {3}{U} as you cast this spell.)\nIlluminate deals X damage to target creature. If this spell was kicked with its {2}{R} kicker, it deals X damage to that creature's controller. If this spell was kicked with its {3}{U} kicker, you draw X cards.",
  kicker: { cost: "{2}{R}", second: "{3}{U}" },
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: "x", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "self-kicked", with: "first" },
        then: { kind: "damage", amount: "x", toControllerOfTarget: 0 },
      },
      {
        kind: "conditional",
        condition: { kind: "self-kicked", with: "second" },
        then: { kind: "draw", amount: "x" },
      },
    ],
  },
});
