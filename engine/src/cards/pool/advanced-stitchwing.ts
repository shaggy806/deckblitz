import { defineCard } from "../define.js";

// EDHREC rank 21468.
//
// Activated only while it's in your graveyard (its ruling).

const TEXT = "{2}{U}, Discard two cards: Return this card from your graveyard to the battlefield tapped.";

export default defineCard({
  name: "Advanced Stitchwing",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie", "Horror"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false, discard: { count: 2 } },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", enterTapped: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
