import { defineCard } from "../define.js";
import { ripple } from "../helpers.js";

export default defineCard({
  name: "Surging Sentinels",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 1,
  keywords: ["first-strike"],
  text: "First strike\nRipple 4 (When you cast this spell, you may reveal the top four cards of your library. You may cast spells with the same name as this spell from among those cards without paying their mana costs. Put the rest on the bottom of your library.)",
  triggered: [ripple(4, "Surging Sentinels")],
});
