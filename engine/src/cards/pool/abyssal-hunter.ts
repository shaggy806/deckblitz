import { defineCard } from "../define.js";

// Mirage. EDHREC rank 25548.
//
// Rulings:
//   [2004-10-04] The ability can target an already tapped creature.

export default defineCard({
  name: "Abyssal Hunter",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 1,
  toughness: 1,
  text: "{B}, {T}: Tap target creature. This creature deals damage equal to its power to that creature.",
  activated: [
    {
      cost: { mana: "{B}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "damage", amount: { powerOf: "source" }, target: 0 },
        ],
      },
      resolve: null,
      text: "{B}, {T}: Tap target creature. This creature deals damage equal to its power to that creature.",
    },
  ],
});
