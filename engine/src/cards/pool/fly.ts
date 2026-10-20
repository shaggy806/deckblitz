import { defineCard } from "../define.js";

// EDHREC rank 9315.
//
// The granted trigger is the enchanted creature's own, so its controller —
// not necessarily Fly's — ventures (rule 113.7a: a granted ability is the
// object's). Curious Inquiry's shape.
const STATIC =
  "Enchanted creature has flying and \"Whenever this creature deals combat damage to a player, venture into the dungeon.\"";
const GRANTED = "Whenever this creature deals combat damage to a player, venture into the dungeon.";

export default defineCard({
  name: "Fly",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC} (Enter the first room or advance to the next room.)`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["flying"],
      grantsTriggered: [
        {
          trigger: { on: "deals-combat-damage-to-player", who: "self" },
          targets: [],
          effect: { kind: "venture" },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: STATIC,
    },
  ],
});
