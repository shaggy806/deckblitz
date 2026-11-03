import { defineCard } from "../define.js";

const TEXT = "{2}{R}: This creature deals 1 damage to target creature token, player, or planeswalker.";

export default defineCard({
  name: "Coalborn Entity",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false },
      targets: [
        {
          kind: "permanent",
          filter: { anyOf: [{ type: "creature", token: true }, { type: "planeswalker" }] },
          orPlayer: "any",
        },
      ],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
