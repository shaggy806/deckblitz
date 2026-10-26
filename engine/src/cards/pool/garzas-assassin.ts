import { defineCard } from "../define.js";
import { recover } from "../helpers.js";

export default defineCard({
  name: "Garza's Assassin",
  manaCost: "{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 2,
  toughness: 2,
  text: "Sacrifice this creature: Destroy target nonblack creature.\nRecover—Pay half your life, rounded up. (When another creature is put into your graveyard from the battlefield, you may pay half your life, rounded up. If you do, return this card from your graveyard to your hand. Otherwise, exile this card.)",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["nonblack-creature"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "Sacrifice this creature: Destroy target nonblack creature.",
    },
  ],
  triggered: [recover("half-life")],
});
