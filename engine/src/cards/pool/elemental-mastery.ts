import { defineCard } from "../define.js";

// Rulings: X is the creature's power as the ability resolves (last known if it has left); the
// tokens are exiled at the next end step even if the Aura or the creature has left by then.

const GRANTED =
  "{T}: Create X 1/1 red Elemental creature tokens with haste, where X is this creature's power. Exile them at the beginning of the next end step.";

export default defineCard({
  name: "Elemental Mastery",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature has "${GRANTED}"`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: {
            kind: "create-token",
            token: "Elemental Token",
            count: { powerOf: "source" },
            exileAtEndStep: true,
          },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: `Enchanted creature has "${GRANTED}"`,
    },
  ],
});
