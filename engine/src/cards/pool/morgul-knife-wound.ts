import { defineCard } from "../define.js";

// EDHREC rank 14344.
//
// Rulings:
//   [2023-06-16] The creature's controller chooses whether or not to pay 2 life as the triggered
//     ability resolves.

export default defineCard({
  name: "Morgul-Knife Wound",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets -3/-0 and has \"At the beginning of your upkeep, exile this creature unless you pay 2 life.\"",
  targets: ["creature"],
  // The granted trigger is the creature's: its controller's upkeep, and its
  // controller decides whether to pay as it resolves (the ruling).
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [-3, 0],
      grantsTriggered: [
        {
          trigger: { on: "step-begins", step: "upkeep", who: "you" },
          targets: [],
          effect: {
            kind: "unless",
            chooser: "you",
            options: [{ payLife: 2, text: "Pay 2 life" }],
            otherwise: { kind: "exile", target: "source" },
          },
          resolve: null,
          text: "At the beginning of your upkeep, exile this creature unless you pay 2 life.",
        },
      ],
      text: 'Enchanted creature gets -3/-0 and has "At the beginning of your upkeep, exile this creature unless you pay 2 life."',
    },
  ],
});
