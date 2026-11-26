import { defineCard } from "../define.js";

// EDHREC rank 22003. `shuffle-library` of the target player's library (rule
// 701.24).

const TEXT = "{R}, {T}: Target player shuffles their library.";

export default defineCard({
  name: "Soldier of Fortune",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{R}", tap: true },
      targets: ["player"],
      effect: { kind: "shuffle-library", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
