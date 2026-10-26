import { defineCard } from "../define.js";

// Future Sight (FUT). EDHREC rank 12648.
//
// Burning Anger's granted-ability shape: the ability belongs to the enchanted
// creature, so "this creature" is it.

const GRANTED = "Discard a card: This creature gets +1/+1 until end of turn.";
const TEXT = `Enchanted creature has "${GRANTED}"`;

export default defineCard({
  name: "Oblivion Crown",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash (You may cast this spell any time you could cast an instant.)\nEnchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: false, discard: { count: 1 } },
          targets: [],
          effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
});
