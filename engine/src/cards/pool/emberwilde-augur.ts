import { defineCard } from "../define.js";

// EDHREC rank 27967.

const TEXT =
  "Sacrifice this creature: It deals 3 damage to target player or planeswalker. Activate only during your upkeep.";

export default defineCard({
  name: "Emberwilde Augur",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["player-or-planeswalker"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] },
      text: TEXT,
    },
  ],
});
