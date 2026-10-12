import { defineCard } from "../define.js";

export default defineCard({
  name: "Spearbreaker Behemoth",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 5,
  toughness: 5,
  keywords: ["indestructible"],
  text: "Indestructible\n{1}: Target creature with power 5 or greater gains indestructible until end of turn.",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 5 } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
      resolve: null,
      text: "{1}: Target creature with power 5 or greater gains indestructible until end of turn.",
    },
  ],
});
