import { defineCard } from "../define.js";
import { melee } from "../helpers.js";

// EDHREC rank 31647.

export default defineCard({
  name: "Ferocious Colonist",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Klingon", "Citizen"],
  power: 0,
  toughness: 1,
  keywords: ["double-strike"],
  text:
    "Double strike\nMelee (Whenever this creature attacks, it gets +1/+1 until end of turn for each opponent you " +
    "attacked this combat.)",
  triggered: [melee()],
});
