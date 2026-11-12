import { defineCard } from "../define.js";

// EDHREC rank 12894.

const GRANTED =
  "Whenever this creature deals combat damage to a player, target instant or sorcery card in your graveyard gains flashback until end of turn. The flashback cost is equal to its mana cost.";

export default defineCard({
  name: "Lost in Memories",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash\nEnchant creature you control\nEnchanted creature gets +1/+1 and has "${GRANTED}" (You may cast that card from your graveyard for its flashback cost. Then exile it.)`,
  targets: ["creature-you-control"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantsTriggered: [
        {
          trigger: { on: "deals-combat-damage-to-player", who: "self" },
          targets: ["instant-or-sorcery-in-your-graveyard"],
          effect: { kind: "grant-flashback", target: 0 },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: `Enchanted creature gets +1/+1 and has "${GRANTED}"`,
    },
  ],
});
