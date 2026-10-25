import { defineCard } from "../define.js";

const TEXT =
  "{1}{R}, {T}: This creature deals damage to target player or planeswalker equal to the number of creatures you control with defender.";

export default defineCard({
  name: "Vent Sentinel",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 4,
  keywords: ["defender"],
  text: `Defender\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: true },
      targets: ["player-or-planeswalker"],
      effect: {
        kind: "damage",
        amount: { countOf: { type: "creature", controlledBy: "you", keyword: "defender" } },
        target: 0,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
