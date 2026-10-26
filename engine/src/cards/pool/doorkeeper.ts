import { defineCard } from "../define.js";

const TEXT = "{2}{U}, {T}: Target player mills X cards, where X is the number of creatures you control with defender.";

export default defineCard({
  name: "Doorkeeper",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Homunculus"],
  power: 0,
  toughness: 4,
  keywords: ["defender"],
  text: `Defender\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{U}", tap: true },
      targets: ["player"],
      effect: {
        kind: "mill",
        target: 0,
        amount: { countOf: { type: "creature", controlledBy: "you", keyword: "defender" } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
