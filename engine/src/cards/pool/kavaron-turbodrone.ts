import { defineCard } from "../define.js";

export default defineCard({
  name: "Kavaron Turbodrone",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Scout"],
  power: 2,
  toughness: 3,
  text: "{T}: Target creature you control gets +1/+1 and gains haste until end of turn. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "{T}: Target creature you control gets +1/+1 and gains haste until end of turn. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
});
