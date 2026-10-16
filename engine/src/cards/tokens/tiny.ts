import { defineCard } from "../define.js";

/**
 * Sophia, Dogged Detective's token: "Tiny, a legendary 2/2 green Dog Detective
 * creature token with trample". A named legendary token (Mowu's shape), so the
 * legend rule (704.5j) applies to a second one.
 */
export default defineCard({
  name: "Tiny",
  art: "3001822e-56ed-4090-b6c1-ca4e2e728bee",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dog", "Detective"],
  power: 2,
  toughness: 2,
  keywords: ["trample"],
  text: "Trample",
});
