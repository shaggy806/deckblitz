import { defineCard } from "../define.js";

const LOOT = "{2}{R}, Discard a card: Draw a card.";

export default defineCard({
  name: "Merchant of the Vale",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Peasant"],
  power: 2,
  toughness: 3,
  text: LOOT,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: LOOT,
    },
  ],
  faces: ["Merchant of the Vale", "Haggle"],
  adventure: true,
});
