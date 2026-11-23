import { defineCard } from "../define.js";

/**
 * Then, Dreadmaws Ate Everyone's token: a 6/6 green Dinosaur with trample
 * *named* Colossal Dreadmaw. That's a real card's name, so it's keyed " Token"
 * and named by `tokenName` (as Ajani's Pridemate Token). No token printing of
 * it exists; its art is the card Colossal Dreadmaw's, the same 6/6 green
 * trampling Dinosaur.
 */
export default defineCard({
  name: "Colossal Dreadmaw Token",
  tokenName: "Colossal Dreadmaw",
  art: "bee08d2f-e875-473c-adc6-8dc286792ab5",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: "Trample",
});
