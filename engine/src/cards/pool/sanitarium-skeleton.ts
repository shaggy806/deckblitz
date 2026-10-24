import { defineCard } from "../define.js";

const TEXT = "{2}{B}: Return this card from your graveyard to your hand.";

export default defineCard({
  name: "Sanitarium Skeleton",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: TEXT,
    },
  ],
});
