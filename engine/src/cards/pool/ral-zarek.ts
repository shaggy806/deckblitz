import { defineCard } from "../define.js";

// −7: "no one wins or loses these flips" (the ruling): sides only.
export default defineCard({
  name: "Ral Zarek",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Ral"],
  loyalty: 4,
  text: "+1: Tap target permanent, then untap another target permanent.\n−2: Ral Zarek deals 3 damage to any target.\n−7: Flip five coins. Take an extra turn after this one for each coin that comes up heads.",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: ["permanent", { kind: "other", of: "permanent", than: { slots: [0] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "untap", target: 1 },
        ],
      },
      resolve: null,
      text: "+1: Tap target permanent, then untap another target permanent.",
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: "−2: Ral Zarek deals 3 damage to any target.",
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "flip-coin",
        count: 5,
        sides: true,
        then: { kind: "repeat", times: { thisWay: "coins-heads" }, effect: { kind: "take-extra-turn" } },
      },
      resolve: null,
      text: "−7: Flip five coins. Take an extra turn after this one for each coin that comes up heads.",
    },
  ],
});
