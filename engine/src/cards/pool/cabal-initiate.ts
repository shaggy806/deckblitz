import { defineCard } from "../define.js";

export default defineCard({
  name: "Cabal Initiate",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 2,
  toughness: 1,
  text: "Discard a card: This creature gains lifelink until end of turn.\nThreshold — This creature gets +1/+2 as long as there are seven or more cards in your graveyard.",
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "lifelink", duration: "end-of-turn" },
      resolve: null,
      text: "Discard a card: This creature gains lifelink until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPt: [1, 2],
      text: "Threshold — This creature gets +1/+2 as long as there are seven or more cards in your graveyard.",
    },
  ],
});
