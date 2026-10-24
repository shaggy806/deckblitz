import { defineCard } from "../define.js";

export default defineCard({
  name: "Olivia's Dragoon",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Berserker"],
  power: 2,
  toughness: 2,
  text: "Discard a card: This creature gains flying until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "Discard a card: This creature gains flying until end of turn.",
    },
  ],
});
