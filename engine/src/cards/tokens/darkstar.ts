import { defineCard } from "../define.js";

/**
 * Rufus Shinra's token: "Darkstar, a legendary 2/2 white and black Dog
 * creature token". A named legendary token (Mowu's shape), so the legend rule
 * (704.5j) applies to a second one.
 */
export default defineCard({
  name: "Darkstar",
  art: "19faca08-0eef-4da4-ab6f-c3aed63ac77b",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 2,
  toughness: 2,
});
