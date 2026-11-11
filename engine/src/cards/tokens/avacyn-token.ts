import { defineCard } from "../define.js";

/** Avacyn, a legendary 8/8 white Angel (Battle at the Helvault). */
export default defineCard({
  name: "Avacyn Token",
  tokenName: "Avacyn",
  art: "2c8730fb-59ca-4cf7-96a4-d6ba3f6f2fbe",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 8,
  toughness: 8,
  keywords: ["flying", "vigilance", "indestructible"],
  text: "Flying, vigilance, indestructible",
});
