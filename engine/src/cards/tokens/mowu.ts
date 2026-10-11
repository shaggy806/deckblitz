import { defineCard } from "../define.js";

/**
 * Jiang Yanggu, Never Alone's token: "Mowu, a legendary 3/3 green Dog
 * creature token". A *named legendary* token (Karox Bladewing's shape), so
 * the legend rule (704.5j) applies to a second one.
 */
export default defineCard({
  name: "Mowu",
  art: "5868190d-18f6-43b6-af83-9e0ef585687d",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 3,
  toughness: 3,
});
