import { defineCard } from "../define.js";

// EDHREC rank 26375.
//
// "Spend only red mana on X" is the cost's `xSpendOnly`: X is paid as that
// many red mana.
const TEXT = "{X}, {T}: This creature deals X damage to target creature. Spend only red mana on X.";

export default defineCard({
  name: "Crimson Hellkite",
  manaCost: "{6}{R}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{X}", tap: true, xSpendOnly: "R" },
      targets: ["creature"],
      effect: { kind: "damage", amount: "x", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
