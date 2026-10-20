import { defineCard } from "../define.js";

const TEXT = "{2}{B}: Return this card from your graveyard to the battlefield tapped.";

export default defineCard({
  name: "Persistent Specimen",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", enterTapped: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
