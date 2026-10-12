import { defineCard } from "../define.js";

export default defineCard({
  name: "Infested Werewolf",
  art: "https://cards.scryfall.io/art_crop/back/0/9/0936761c-7cdc-49ef-8a0d-ed79219f1056.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 4,
  toughness: 5,
  keywords: ["nightbound"],
  text: "Whenever this creature enters or attacks, create two 1/1 green Insect creature tokens.\nNightbound (If a player casts at least two spells during their own turn, it becomes day next turn.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Insect Token", count: 2 },
      resolve: null,
      text: "Whenever this creature enters or attacks, create two 1/1 green Insect creature tokens.",
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Insect Token", count: 2 },
      resolve: null,
      text: "Whenever this creature enters or attacks, create two 1/1 green Insect creature tokens.",
    },
  ],
  faces: ["Infestation Expert", "Infested Werewolf"],
  transform: true,
});
