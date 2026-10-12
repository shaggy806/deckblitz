import { defineCard } from "../define.js";

export default defineCard({
  name: "Dire-Strain Demolisher",
  art: "https://cards.scryfall.io/art_crop/back/3/8/3849ad37-f80d-4ffc-9240-25a63326b3dd.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 8,
  toughness: 7,
  keywords: ["nightbound"],
  text: "Ward {3} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {3}.)\nNightbound (If a player casts at least two spells during their own turn, it becomes day next turn.)",
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{3}" } },
      resolve: null,
      text: "Ward {3}",
    },
  ],
  faces: ["Burly Breaker", "Dire-Strain Demolisher"],
  transform: true,
});
