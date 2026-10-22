import { defineCard } from "../define.js";

// EDHREC rank 28351.
//
// Exert as it attacks (rule 701.43d — Rohirrim Chargers' shape), and "whenever you exert a
// creature" — this one or any other creature you control.

export default defineCard({
  name: "Resolute Survivors",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 3,
  text: "You may exert this creature as it attacks. (It won't untap during your next untap step.)\nWhenever you exert a creature, this creature deals 1 damage to each opponent and you gain 1 life.",
  static: [
    {
      affects: { scope: "self" },
      exertAsItAttacks: {},
      text: "You may exert this creature as it attacks.",
    },
  ],
  triggered: [
    {
      trigger: { on: "exerted", who: "you-control" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: "Whenever you exert a creature, this creature deals 1 damage to each opponent and you gain 1 life.",
    },
  ],
});
