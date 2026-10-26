import { defineCard } from "../define.js";

/** "A 1/1 colorless Insect artifact creature token with flying and haste
 * named Hornet" (Hornet Cannon). Keyed " Token", named by `tokenName`.
 * Distinct from `tokens/hornet-token.ts`, which is the green flying,
 * deathtouch Insect. */
export default defineCard({
  name: "Hornet Token",
  tokenName: "Hornet",
  art: "54ec2cd6-51f6-4e12-af90-fa254f14ad32",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Insect"],
  power: 1,
  toughness: 1,
  keywords: ["flying", "haste"],
  text: "Flying, haste",
});
