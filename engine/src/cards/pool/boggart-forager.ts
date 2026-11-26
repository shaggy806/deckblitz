import { defineCard } from "../define.js";

// EDHREC rank 23265. Soldier of Fortune's `shuffle-library` of the target
// player's library, for a sacrifice.

const TEXT = "{R}, Sacrifice this creature: Target player shuffles their library.";

export default defineCard({
  name: "Boggart Forager",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{R}", tap: false, sacrifice: "self" },
      targets: ["player"],
      effect: { kind: "shuffle-library", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
