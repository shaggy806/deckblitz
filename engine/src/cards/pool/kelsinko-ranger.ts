import { defineCard } from "../define.js";

export default defineCard({
  name: "Kelsinko Ranger",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Ranger"],
  power: 1,
  toughness: 1,
  text: "{1}{W}: Target green creature gains first strike until end of turn.",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [{ kind: "permanent", filter: { colors: ["G"], type: "creature" } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
      resolve: null,
      text: "{1}{W}: Target green creature gains first strike until end of turn.",
    },
  ],
});
