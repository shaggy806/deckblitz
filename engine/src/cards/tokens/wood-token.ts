import { defineCard } from "../define.js";

/** Jungle Patrol's token: a 0/1 green Wall with defender named Wood.
 * Keyed " Token", named by `tokenName`. Scryfall lists no printing of it. */
export default defineCard({
  name: "Wood Token",
  tokenName: "Wood",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 1,
  keywords: ["defender"],
  text: "Defender (This creature can't attack.)",
});
