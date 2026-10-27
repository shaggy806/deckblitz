import { defineCard } from "../define.js";

// EDHREC rank 31469.
//
// Rulings:
//   [2007-02-01] The second triggered ability targets an untapped creature. If there are no other
//     untapped creatures when Ana Battlemage enters, it must target Ana Battlemage. If the target
//     becomes tapped by the time the ability tries to resolve, the ability won't resolve.
//   [2024-11-08] If you put a permanent with a kicker ability onto the battlefield without casting
//     it, you can't kick it.
//   [2024-11-08] To determine a spell's total cost, start with the mana cost (or an alternative
//     cost if another card's effect allows you to pay one instead), add any cost increases (such
//     as kicker), then apply any cost reductions. The spell's mana value remains unchanged, no
//     matter what the total cost to cast it was.
//   [2024-11-08] If a spell's kicker cost was paid, the spell is "kicked."
//   [2024-11-08] The kicker ability doesn't let you pay a kicker cost more than once.
//   [2024-11-08] If a card or token enters as a copy of a permanent, the new permanent isn't
//     kicked, even if the original was.
//   [2024-11-08] If you copy a kicked spell on the stack, the copy is also kicked. If the copied
//     spell is a permanent spell, the token the copy of that spell becomes when it enters is also
//     kicked.

export default defineCard({
  name: "Ana Battlemage",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: "Kicker {2}{U} and/or {1}{B} (You may pay an additional {2}{U} and/or {1}{B} as you cast this spell.)\nWhen this creature enters, if it was kicked with its {2}{U} kicker, target player discards three cards.\nWhen this creature enters, if it was kicked with its {1}{B} kicker, tap target untapped creature and that creature deals damage equal to its power to its controller.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: { kind: "discard", target: 0, amount: 3 },
      resolve: null,
      text: "When this creature enters, if it was kicked with its {2}{U} kicker, target player discards three cards.",
      condition: { kind: "self-kicked", with: "first" },
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", tapped: false } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "damage", amount: { powerOf: 0 }, toControllerOfTarget: 0, from: { target: 0 } },
        ],
      },
      resolve: null,
      text: "When this creature enters, if it was kicked with its {1}{B} kicker, tap target untapped creature and that creature deals damage equal to its power to its controller.",
      condition: { kind: "self-kicked", with: "second" },
    },
  ],
  kicker: { cost: "{2}{U}", second: "{1}{B}" },
});
