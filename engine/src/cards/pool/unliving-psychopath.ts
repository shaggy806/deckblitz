import { defineCard } from "../define.js";

// Rulings:
//   [2006-05-01] The creature must have less power than Unliving Psychopath both when the ability
//     is activated and when it resolves.

export default defineCard({
  name: "Unliving Psychopath",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Assassin"],
  power: 0,
  toughness: 4,
  text: "{B}: This creature gets +1/-1 until end of turn.\n{B}, {T}: Destroy target creature with power less than this creature's power.",
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: "{B}: This creature gets +1/-1 until end of turn.",
    },
    {
      cost: { mana: "{B}", tap: true },
      targets: [
        { kind: "permanent", filter: { type: "creature", power: { op: "lt", n: { amount: { powerOf: "source" } } } } },
      ],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{B}, {T}: Destroy target creature with power less than this creature's power.",
    },
  ],
});
