import { defineCard } from "../define.js";

const DAMAGE_TEXT = "Whenever this creature deals combat damage to a player or battle, draw a card.";

export default defineCard({
  name: "Rooftop Saboteurs",
  art: "https://cards.scryfall.io/art_crop/back/3/1/3140320d-b932-441f-bff3-9bdf4419b88a.jpg",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Moonfolk", "Ninja"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self", orBattle: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  faces: ["Invasion of Kamigawa", "Rooftop Saboteurs"],
  transform: true,
});
