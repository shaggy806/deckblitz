import { defineCard } from "../define.js";
import { ripple } from "../helpers.js";

export default defineCard({
  name: "Surging Flame",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Ripple 4 (When you cast this spell, you may reveal the top four cards of your library. You may cast spells with the same name as this spell from among those cards without paying their mana costs. Put the rest on the bottom of your library.)\nSurging Flame deals 2 damage to any target.",
  targets: ["any-target"],
  effect: { kind: "damage", target: 0, amount: 2 },
  triggered: [ripple(4, "Surging Flame")],
});
