import { defineCard } from "../define.js";

export default defineCard({
  name: "Lambholt Raconteur",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Werewolf"],
  power: 2,
  toughness: 4,
  keywords: ["daybound"],
  text: "Whenever you cast a noncreature spell, this creature deals 1 damage to each opponent.\nDaybound (If a player casts no spells during their own turn, it becomes night next turn.)",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "each-opponent" },
      resolve: null,
      text: "Whenever you cast a noncreature spell, this creature deals 1 damage to each opponent.",
    },
  ],
  faces: ["Lambholt Raconteur", "Lambholt Ravager"],
  transform: true,
});
