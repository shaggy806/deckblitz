import { defineCard } from "../define.js";

const RESTRICT_TEXT = "Enchanted creature can't attack or block.";
const GRANT_TEXT = 'Enchanted creature has "{2}, Sacrifice this creature: You gain 2 life."';

export default defineCard({
  name: "Compulsory Rest",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${RESTRICT_TEXT}\n${GRANT_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block"],
      text: RESTRICT_TEXT,
    },
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: "{2}", tap: false, sacrifice: "self" },
          targets: [],
          effect: { kind: "gain-life", amount: 2 },
          resolve: null,
          text: "{2}, Sacrifice this creature: You gain 2 life.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
