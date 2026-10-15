import { defineCard } from "../define.js";

/** Fire Navy Trebuchet's token: "a 2/1 colorless Construct artifact creature
 * token with flying named Ballistic Boulder". Keyed " Token", named by
 * `tokenName` (Sword's shape). */
export default defineCard({
  name: "Ballistic Boulder Token",
  tokenName: "Ballistic Boulder",
  art: "0b1b8ff0-0b1e-4a55-a937-fde7ec15c41a",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying",
});
