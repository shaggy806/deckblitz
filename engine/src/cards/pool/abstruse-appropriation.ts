import { defineCard } from "../define.js";

const TEXT =
  "Devoid (This card has no color.)\nExile target nonland permanent. You may cast that card for as long as it remains exiled, and you may spend colorless mana as though it were mana of any color to cast that spell.";

export default defineCard({
  name: "Abstruse Appropriation",
  manaCost: "{2}{W}{B}",
  colors: [],
  types: ["instant"],
  text: TEXT,
  targets: ["nonland-permanent"],
  effect: {
    kind: "exile",
    target: 0,
    mayPlay: { duration: "while-exiled", spendAs: { unit: "C", as: "any-color" } },
  },
});
