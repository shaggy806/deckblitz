import { defineCard } from "../define.js";

// Prophecy. EDHREC rank 20203.

const TEXT = "Sacrifice a land: This creature deals 1 damage to each creature with flying.";

export default defineCard({
  name: "Spitting Spider",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 3,
  toughness: 5,
  keywords: ["reach"],
  text: `Reach (This creature can block creatures with flying.)\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { type: "land" } } },
      targets: [],
      effect: { kind: "damage-all", amount: 1, filter: { type: "creature", keyword: "flying" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
