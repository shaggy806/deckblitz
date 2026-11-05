import { defineCard } from "../define.js";

const TEXT = "At the beginning of each opponent's upkeep, if that player has two or fewer cards in hand, this creature deals 2 damage to them.";

export default defineCard({
  name: "Prickle Faeries",
  art: "https://cards.scryfall.io/art_crop/back/9/2/92f5b177-b0c6-4573-b860-f75dad1941bd.jpg",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Faerie"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      condition: { kind: "of-player", player: "active-player", condition: { kind: "hand-size", atMost: 2 } },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "active-player" },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Invasion of Eldraine", "Prickle Faeries"],
  transform: true,
});
