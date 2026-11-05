import { defineCard } from "../define.js";

// Ruling: the draw is the creature's own ability, so whoever controls it
// draws.

const GRANTED = "Whenever this creature deals combat damage to a player, draw a card.";
const LEGENDARY_TEXT =
  "As long as enchanted creature is legendary, it gets +1/+1 and has ward {1}. (Whenever enchanted creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {1}.)";

export default defineCard({
  name: "Combat Research",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  targets: ["creature"],
  text: `Enchant creature\nEnchanted creature has "${GRANTED}"\n${LEGENDARY_TEXT}`,
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [
        {
          trigger: { on: "deals-combat-damage-to-player", who: "self" },
          targets: [],
          effect: { kind: "draw", amount: 1 },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: `Enchanted creature has "${GRANTED}"`,
    },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { supertype: "legendary" } } },
      grantPt: [1, 1],
      grantsTriggered: [
        {
          trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
          targets: [],
          effect: { kind: "ward", cost: { mana: "{1}" } },
          resolve: null,
          text: "Ward {1}",
        },
      ],
      text: LEGENDARY_TEXT,
    },
  ],
});
