import { defineCard } from "../define.js";
import { investigate } from "../helpers.js";

// EDHREC rank 12338. Staggering Insight's shape: the granted trigger is the
// enchanted creature's, and its controller investigates.
const GRANTED = "Whenever this creature deals combat damage to a player, investigate.";
const STATIC = `Enchanted creature gets +1/+1 and has "${GRANTED}"`;

export default defineCard({
  name: "Curious Inquiry",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC} (Create a Clue token. It's an artifact with "{2}, Sacrifice this token: Draw a card.")`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantsTriggered: [
        {
          trigger: { on: "deals-combat-damage-to-player", who: "self" },
          targets: [],
          effect: investigate(),
          resolve: null,
          text: GRANTED,
        },
      ],
      text: STATIC,
    },
  ],
});
