import { defineCard } from "../define.js";

const TEXT = "Whenever this creature attacks, it deals 2 damage to any target.";

export default defineCard({
  name: "Erupting Dreadwolf",
  art: "https://cards.scryfall.io/art_crop/back/e/7/e724d16c-d44b-4b8f-9616-64923e2cdeb2.jpg",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Werewolf"],
  power: 6,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Smoldering Werewolf", "Erupting Dreadwolf"],
  transform: true,
});
