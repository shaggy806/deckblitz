import { defineCard } from "../define.js";

/** Yotia Declares War's token: "a 0/2 colorless Thopter artifact creature
 * token with flying named Ornithopter". "Ornithopter" is already the real
 * card, so it's keyed " Token" and named by `tokenName`. */
export default defineCard({
  name: "Ornithopter Token",
  tokenName: "Ornithopter",
  art: "a63d3174-75af-4dfa-b2f9-c4330c755af1",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Thopter"],
  power: 0,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying",
});
