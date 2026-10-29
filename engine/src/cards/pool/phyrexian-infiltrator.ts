import { defineCard } from "../define.js";

// Rule 701.12b: no effect if one player controls both as it resolves (the
// ruling). The exchange lasts indefinitely.
export default defineCard({
  name: "Phyrexian Infiltrator",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Minion"],
  power: 2,
  toughness: 2,
  text: "{2}{U}{U}: Exchange control of this creature and target creature. (This effect lasts indefinitely.)",
  activated: [
    {
      cost: { mana: "{2}{U}{U}", tap: false },
      targets: ["creature"],
      effect: { kind: "exchange-control", objects: ["source", 0] },
      resolve: null,
      text: "{2}{U}{U}: Exchange control of this creature and target creature.",
    },
  ],
});
