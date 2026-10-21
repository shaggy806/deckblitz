import { defineCard } from "../define.js";

// EDHREC rank 7976.

export default defineCard({
  name: "Torch Courier",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: "Haste\nSacrifice this creature: Another target creature gains haste until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [{ kind: "other", of: "creature" }],
      effect: { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      resolve: null,
      text: "Sacrifice this creature: Another target creature gains haste until end of turn.",
    },
  ],
});
