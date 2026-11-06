import { defineCard } from "../define.js";

/** The Eternal Wanderer's 2/2 white Samurai creature token with double strike. */
export default defineCard({
  name: "Samurai Token (The Eternal Wanderer)",
  art: "70750c90-3856-4d6d-923b-2ab91b1d7049",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Samurai"],
  power: 2,
  toughness: 2,
  keywords: ["double-strike"],
  text: "Double strike",
});
