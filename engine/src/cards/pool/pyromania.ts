import { defineCard } from "../define.js";

// Torment. EDHREC rank 30477.

const PING_TEXT = "{1}{R}, Discard a card at random: This enchantment deals 1 damage to any target.";
const SAC_TEXT = "{1}{R}, Sacrifice this enchantment: It deals 1 damage to any target.";

export default defineCard({
  name: "Pyromania",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${PING_TEXT}\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false, discard: { count: 1, random: true } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: PING_TEXT,
    },
    {
      cost: { mana: "{1}{R}", tap: false, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
