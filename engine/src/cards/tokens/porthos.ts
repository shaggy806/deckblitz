import { defineCard } from "../define.js";

/**
 * Captain Jonathan Archer's token: "Porthos, a legendary 1/1 green Dog
 * creature token". A named legendary token (Mowu's shape), so the legend rule
 * (704.5j) applies to a second one.
 */
export default defineCard({
  name: "Porthos",
  art: "edd98ca8-9a23-4fb5-9719-27ac2795bfa3",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 1,
  toughness: 1,
});
