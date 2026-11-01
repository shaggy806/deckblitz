import { defineCard } from "../define.js";

// Blue as it blocked or was blocked; a condition on activating, so it's asked
// each time and the troll must still be the creature that was in that block.

const TEXT = "{U}: Regenerate this creature. Activate only if this creature blocked or was blocked by a blue creature this turn.";

export default defineCard({
  name: "Sea Troll",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Troll"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: [],
      condition: { kind: "source", filter: { blockedThisTurn: { relation: "either", partner: { colors: ["U"] } } } },
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
