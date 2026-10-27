import { defineCard } from "../define.js";

// Apocalypse (APC). EDHREC rank 9223. Shard Phoenix's shape, for {R} and 1.

const TEXT = "{R}, Sacrifice this creature: It deals 1 damage to each creature without flying.";

export default defineCard({
  name: "Bloodfire Dwarf",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{R}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
