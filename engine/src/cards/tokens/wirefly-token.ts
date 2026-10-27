import { defineCard } from "../define.js";

/** "A 2/2 colorless Insect artifact creature token with flying named
 * Wirefly" (Wirefly Hive). Keyed " Token", named by `tokenName`, so "all
 * permanents named Wirefly" finds it. Scryfall lists no printing of it. */
export default defineCard({
  name: "Wirefly Token",
  tokenName: "Wirefly",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Insect"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying",
});
