import { defineCard } from "../define.js";

const TREASURE_TEXT = "{T}: Create a Treasure token. Activate only if a creature died this turn.";

export default defineCard({
  name: "Undercity Scrounger",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Rogue"],
  power: 1,
  toughness: 4,
  text: `${TREASURE_TEXT} (It's an artifact with "{T}, Sacrifice this token: Add one mana of any color.")`,
  activated: [
    {
      cost: { mana: null, tap: true },
      condition: { kind: "creature-died-this-turn" },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: TREASURE_TEXT,
    },
  ],
});
