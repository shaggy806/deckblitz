import { defineCard } from "../define.js";

export default defineCard({
  name: "Lambholt Ravager",
  art: "https://cards.scryfall.io/art_crop/back/0/c/0cbee24c-9147-46cb-a5f9-8d919c021aa4.jpg",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 4,
  toughness: 4,
  keywords: ["nightbound"],
  text: "Whenever you cast a noncreature spell, this creature deals 2 damage to each opponent.\nNightbound (If a player casts at least two spells during their own turn, it becomes day next turn.)",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "each-opponent" },
      resolve: null,
      text: "Whenever you cast a noncreature spell, this creature deals 2 damage to each opponent.",
    },
  ],
  faces: ["Lambholt Raconteur", "Lambholt Ravager"],
  transform: true,
});
