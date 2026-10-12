import { defineCard } from "../define.js";

export default defineCard({
  name: "Bloodthorn Taunter",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: "Haste\n{T}: Target creature with power 5 or greater gains haste until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 5 } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      resolve: null,
      text: "{T}: Target creature with power 5 or greater gains haste until end of turn.",
    },
  ],
});
