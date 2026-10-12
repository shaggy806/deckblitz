import { defineCard } from "../define.js";

export default defineCard({
  name: "Samut, Tyrant Smasher",
  manaCost: "{2}{R/G}{R/G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Samut"],
  loyalty: 5,
  text: "Creatures you control have haste.\n−1: Target creature gets +2/+1 and gains haste until end of turn. Scry 1.",
  activated: [
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "sequence",
            effects: [
              { kind: "modify-pt", target: 0, power: 2, toughness: 1, duration: "end-of-turn" },
              { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
            ],
          },
          { kind: "scry", amount: 1 },
        ],
      },
      resolve: null,
      text: "−1: Target creature gets +2/+1 and gains haste until end of turn. Scry 1.",
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantKeywords: ["haste"],
      text: "Creatures you control have haste.",
    },
  ],
});
