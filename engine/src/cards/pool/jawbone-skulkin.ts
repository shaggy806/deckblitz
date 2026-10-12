import { defineCard } from "../define.js";

export default defineCard({
  name: "Jawbone Skulkin",
  manaCost: "{1}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 1,
  toughness: 1,
  text: "{2}: Target red creature gains haste until end of turn.",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "permanent", filter: { colors: ["R"], type: "creature" } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      resolve: null,
      text: "{2}: Target red creature gains haste until end of turn.",
    },
  ],
});
