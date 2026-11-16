import { defineCard } from "../define.js";

/**
 * Tolsimir, Midnight's Light's token: "Voja Fenstalker, a legendary 5/5 green
 * and white Wolf creature token with trample". A named legendary token
 * (Angelo's shape), so the legend rule (704.5j) applies to a second one — and
 * not to the other Tolsimirs' Vojas, different names.
 */
export default defineCard({
  name: "Voja Fenstalker",
  art: "2175200f-3ed4-4b39-ac76-a7d25967aa8a",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
});
