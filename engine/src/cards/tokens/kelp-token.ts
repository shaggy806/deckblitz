import { defineCard } from "../define.js";

/** Wall of Kelp's token: a 0/1 blue Plant Wall with defender named Kelp.
 * Keyed " Token", named by `tokenName`. Scryfall lists no printing of it. */
export default defineCard({
  name: "Kelp Token",
  tokenName: "Kelp",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Plant", "Wall"],
  power: 0,
  toughness: 1,
  keywords: ["defender"],
  text: "Defender (This creature can't attack.)",
});
