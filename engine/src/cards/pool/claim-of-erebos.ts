import { defineCard } from "../define.js";

// EDHREC rank 26366. Compulsory Rest's granted ability, with Acolyte of
// Xathrid's drain.
const DRAIN_TEXT = "{1}{B}, {T}: Target player loses 2 life.";
const GRANT_TEXT = `Enchanted creature has "${DRAIN_TEXT}"`;

export default defineCard({
  name: "Claim of Erebos",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${GRANT_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: "{1}{B}", tap: true },
          targets: ["player"],
          effect: { kind: "lose-life", amount: 2, target: 0 },
          resolve: null,
          text: DRAIN_TEXT,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
