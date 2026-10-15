import { defineCard } from "../define.js";

/**
 * Rinoa Heartilly's token: "Angelo, a legendary 1/1 green and white Dog
 * creature token". A named legendary token (Mowu's shape), so the legend rule
 * (704.5j) applies to a second one.
 */
export default defineCard({
  name: "Angelo",
  art: "54347961-0a41-4f62-b47e-2afa0ca07b21",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 1,
  toughness: 1,
});
