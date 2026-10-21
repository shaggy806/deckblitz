import { defineCard } from "../define.js";

/** "A 1/1 colorless Insect artifact creature token with flying named Wasp"
 * (The Hive). Keyed " Token", named by `tokenName`. */
export default defineCard({
  name: "Wasp Token",
  tokenName: "Wasp",
  art: "c75b81b5-5c84-45d4-832a-20c038372bc6",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Insect"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying",
});
