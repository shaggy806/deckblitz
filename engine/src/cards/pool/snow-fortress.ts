import { defineCard } from "../define.js";

// EDHREC rank 26236.

export default defineCard({
  name: "Snow Fortress",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 4,
  keywords: ["defender"],
  text: "Defender (This creature can't attack.)\n{1}: This creature gets +1/+0 until end of turn.\n{1}: This creature gets +0/+1 until end of turn.\n{3}: This creature deals 1 damage to target creature without flying that's attacking you.",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{1}: This creature gets +1/+0 until end of turn.",
    },
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 0, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{1}: This creature gets +0/+1 until end of turn.",
    },
    {
      cost: { mana: "{3}", tap: false },
      targets: [
        {
          kind: "permanent",
          filter: { type: "creature", notKeyword: "flying", attackingYou: true },
        },
      ],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{3}: This creature deals 1 damage to target creature without flying that's attacking you.",
    },
  ],
});
