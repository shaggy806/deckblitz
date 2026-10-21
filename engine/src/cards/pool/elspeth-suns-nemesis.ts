import { defineCard } from "../define.js";

export default defineCard({
  name: "Elspeth, Sun's Nemesis",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Elspeth"],
  loyalty: 5,
  text: "−1: Up to two target creatures you control each get +2/+1 until end of turn.\n−2: Create two 1/1 white Human Soldier creature tokens.\n−3: You gain 5 life.\nEscape—{4}{W}{W}, Exile four other cards from your graveyard. (You may cast this card from your graveyard for its escape cost.)",
  escape: { cost: "{4}{W}{W}", exileCount: 4 },
  activated: [
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: [
        { kind: "optional", of: "creature-you-control" },
        { kind: "optional", of: { kind: "other", of: "creature-you-control", than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 1, duration: "end-of-turn" },
          { kind: "modify-pt", target: 1, power: 2, toughness: 1, duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "−1: Up to two target creatures you control each get +2/+1 until end of turn.",
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Human Soldier Token", count: 2 },
      resolve: null,
      text: "−2: Create two 1/1 white Human Soldier creature tokens.",
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "gain-life", amount: 5 },
      resolve: null,
      text: "−3: You gain 5 life.",
    },
  ],
});
