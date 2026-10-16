import { defineCard } from "../define.js";

// EDHREC rank 15393.
//
// Rulings:
//   [2023-11-10] You can tap any three untapped artifacts and/or creatures you control, including
//     Warden of the Inner Sky itself and other creatures you haven't controlled continuously since
//     the beginning of your most recent turn, to pay the cost of Warden of the Inner Sky's
//     activated ability.

export default defineCard({
  name: "Warden of the Inner Sky",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 2,
  text: "As long as this creature has three or more counters on it, it has flying and vigilance.\nTap three untapped artifacts and/or creatures you control: Put a +1/+1 counter on this creature. Scry 1. Activate only as a sorcery.",
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: {
          count: 3,
          filter: { typesAnyOf: ["artifact", "creature"], controlledBy: "you" },
          includeSelf: true,
        },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "scry", amount: 1 },
        ],
      },
      resolve: null,
      text: "Tap three untapped artifacts and/or creatures you control: Put a +1/+1 counter on this creature. Scry 1. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      // Counters of any kind, all of them together.
      affects: { scope: "self" },
      condition: { kind: "self-counters", compare: { op: "gte", n: 3 } },
      grantKeywords: ["flying", "vigilance"],
      text: "As long as this creature has three or more counters on it, it has flying and vigilance.",
    },
  ],
});
