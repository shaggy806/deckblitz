import { defineCard } from "../define.js";

// EDHREC rank 29381.
//
// Rulings:
//   [2012-05-01] Once a creature has been declared as a blocking creature, making it unable to
//     block will have no effect.
const GRANTED = "{T}: Target creature can't block this turn.";
const TEXT = `Enchanted creature has "${GRANTED}"`;

export default defineCard({
  name: "Malicious Intent",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["creature"],
          effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
});
